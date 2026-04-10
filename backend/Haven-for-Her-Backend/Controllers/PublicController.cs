using System.Globalization;
using System.Text.Json;
using Haven_for_Her_Backend.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Haven_for_Her_Backend.Controllers;

/// <summary>
/// Public endpoints that don't require authentication.
/// </summary>
[ApiController]
[Route("api/public")]
public class PublicController(HavenForHerBackendDbContext db) : ControllerBase
{
    /// <summary>
    /// Aggregate impact stats for the public dashboard.
    /// </summary>
    [HttpGet("impact")]
    public async Task<IActionResult> GetImpactStats()
    {
        var totalResidents = await db.Residents.AsNoTracking().CountAsync();
        var activeResidents = await db.Residents.AsNoTracking().CountAsync(r => r.CaseStatus == "Active");
        var activeSafehouses = await db.Safehouses.AsNoTracking().CountAsync(s => s.Status == "Active");
        var activePartners = await db.Partners.AsNoTracking().CountAsync(p => p.Status == "Active");
        var totalDonations = await db.Donations.AsNoTracking().CountAsync();
        var totalDonationValueUsd = await db.Donations.AsNoTracking()
            .Where(d => d.DonationType == "Monetary" && d.Amount != null)
            .SumAsync(d => d.Amount!.Value);

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var latestSnapshot = await db.PublicImpactSnapshots.AsNoTracking()
            .Where(s => s.IsPublished && s.PublishedAt != null && s.PublishedAt <= today)
            .OrderByDescending(s => s.PublishedAt)
            .FirstOrDefaultAsync();

        var latestHealthScores = await (
            from h in db.HealthWellbeingRecords.AsNoTracking()
            join r in db.Residents.AsNoTracking() on h.ResidentId equals r.ResidentId
            where r.CaseStatus == "Active"
            join agg in (
                from h2 in db.HealthWellbeingRecords.AsNoTracking()
                join r2 in db.Residents.AsNoTracking() on h2.ResidentId equals r2.ResidentId
                where r2.CaseStatus == "Active"
                group h2 by h2.ResidentId into g
                select new { ResidentId = g.Key, MaxDate = g.Max(x => x.RecordDate) }
            ) on new { h.ResidentId, h.RecordDate } equals new { agg.ResidentId, RecordDate = agg.MaxDate }
            select h.GeneralHealthScore
        ).ToListAsync();

        var latestEducationProgress = await (
            from e in db.EducationRecords.AsNoTracking()
            join r in db.Residents.AsNoTracking() on e.ResidentId equals r.ResidentId
            where r.CaseStatus == "Active"
            join agg in (
                from e2 in db.EducationRecords.AsNoTracking()
                join r2 in db.Residents.AsNoTracking() on e2.ResidentId equals r2.ResidentId
                where r2.CaseStatus == "Active"
                group e2 by e2.ResidentId into g
                select new { ResidentId = g.Key, MaxDate = g.Max(x => x.RecordDate) }
            ) on new { e.ResidentId, e.RecordDate } equals new { agg.ResidentId, RecordDate = agg.MaxDate }
            select e.ProgressPercent
        ).ToListAsync();

        decimal? avgHealth = latestHealthScores.Count > 0 ? latestHealthScores.Average() : null;
        decimal? avgEdu = latestEducationProgress.Count > 0 ? latestEducationProgress.Average() : null;

        var yearAgo = DateOnly.FromDateTime(DateTime.UtcNow.Date.AddYears(-1));
        var recentUsd = await db.Donations.AsNoTracking()
            .Where(d => d.DonationType == "Monetary" && d.Amount != null && d.DonationDate >= yearAgo)
            .Where(d => d.CurrencyCode != null && d.CurrencyCode.ToUpper() == "USD")
            .SumAsync(d => (decimal?)d.Amount) ?? 0m;

        var allTimeUsd = await db.Donations.AsNoTracking()
            .Where(d => d.DonationType == "Monetary" && d.Amount != null)
            .Where(d => d.CurrencyCode != null && d.CurrencyCode.ToUpper() == "USD")
            .SumAsync(d => (decimal?)d.Amount) ?? 0m;

        var poolUsd = recentUsd > 0 ? recentUsd : allTimeUsd;
        var weeklyTotalUsd = poolUsd / 52m;
        decimal? perResidentWeek = activeResidents > 0 ? weeklyTotalUsd / activeResidents : null;

        const decimal sampleGift = 15m;
        decimal? samplePct = perResidentWeek is > 0
            ? Math.Min(100m, decimal.Round(sampleGift / perResidentWeek.Value * 100m, 1))
            : null;

        var displaySummary = BuildDisplaySummary(
            avgHealth,
            avgEdu,
            latestHealthScores.Count,
            latestEducationProgress.Count,
            latestSnapshot?.SummaryText);

        string? liveMetricJson = null;
        if (avgHealth is not null || avgEdu is not null)
        {
            liveMetricJson = JsonSerializer.Serialize(new Dictionary<string, object?>
            {
                ["avg_health_score"] = avgHealth,
                ["avg_education_progress"] = avgEdu,
                ["based_on_health_records"] = latestHealthScores.Count,
                ["based_on_education_records"] = latestEducationProgress.Count,
                ["source"] = "live_database_aggregate",
            });
        }

        return Ok(new
        {
            totalResidentsServed = totalResidents,
            activeResidents,
            activeSafehouses,
            activePartners,
            totalDonations,
            totalDonationValueUsd,
            liveProgramOutcomes = new
            {
                avgGeneralHealthScore = avgHealth,
                avgEducationProgressPercent = avgEdu,
                residentsInHealthSample = latestHealthScores.Count,
                residentsInEducationSample = latestEducationProgress.Count,
            },
            donationImpact = new
            {
                estimatedWeeklySupportPerResidentUsd = perResidentWeek,
                basedOnTrailingTwelveMonths = recentUsd > 0,
                sampleGiftUsd = sampleGift,
                sampleGiftWeekCoveragePercent = samplePct,
            },
            latestSnapshot = latestSnapshot is null
                ? null
                : new
                {
                    latestSnapshot.Headline,
                    latestSnapshot.SummaryText,
                    displaySummaryText = displaySummary,
                    metricPayloadJson = liveMetricJson ?? latestSnapshot.MetricPayloadJson,
                    latestSnapshot.PublishedAt,
                },
        });
    }

    private static string? BuildDisplaySummary(
        decimal? avgHealth,
        decimal? avgEdu,
        int healthN,
        int eduN,
        string? fallbackSummary)
    {
        if (avgHealth is null && avgEdu is null)
            return fallbackSummary;

        var parts = new List<string>();
        if (avgHealth is not null && healthN > 0)
        {
            parts.Add(
                string.Format(
                    CultureInfo.InvariantCulture,
                    "Recent wellbeing check-ins average {0:0.##} on our general health scale for residents currently in care (latest record per person; same signals used in our resident-outcome models).",
                    avgHealth.Value));
        }

        if (avgEdu is not null && eduN > 0)
        {
            parts.Add(
                string.Format(
                    CultureInfo.InvariantCulture,
                    "Education records currently average about {0:0.#}% progress toward program goals.",
                    avgEdu.Value));
        }

        if (parts.Count == 0)
            return fallbackSummary;

        return string.Join(" ", parts);
    }

    [HttpGet("impact-trends")]
    public async Task<IActionResult> GetImpactTrends()
    {
        var cutoff = DateOnly.FromDateTime(DateTime.UtcNow.AddMonths(-12));

        var monthlyDonations = await db.Donations.AsNoTracking()
            .Where(d => d.DonationDate >= cutoff && d.DonationType == "Monetary" && d.Amount != null)
            .GroupBy(d => new { d.DonationDate.Year, d.DonationDate.Month })
            .Select(g => new
            {
                Year = g.Key.Year,
                Month = g.Key.Month,
                TotalAmount = g.Sum(d => d.Amount)
            })
            .ToListAsync();

        var monthlyMetrics = await db.SafehouseMonthlyMetrics.AsNoTracking()
            .Where(m => m.MonthStart >= cutoff)
            .GroupBy(m => new { m.MonthStart.Year, m.MonthStart.Month })
            .Select(g => new
            {
                Year = g.Key.Year,
                Month = g.Key.Month,
                AvgHealth = g.Average(m => (decimal?)m.AvgHealthScore),
                AvgEducation = g.Average(m => (decimal?)m.AvgEducationProgress)
            })
            .ToListAsync();

        var months = Enumerable.Range(0, 12)
            .Select(i => DateTime.UtcNow.AddMonths(-11 + i))
            .Select(d => new { d.Year, d.Month })
            .ToList();

        var trends = months.Select(m =>
        {
            var d = monthlyDonations.FirstOrDefault(x => x.Year == m.Year && x.Month == m.Month);
            var me = monthlyMetrics.FirstOrDefault(x => x.Year == m.Year && x.Month == m.Month);
            return new
            {
                month = new DateTime(m.Year, m.Month, 1).ToString("MMM yyyy"),
                totalDonations = d?.TotalAmount ?? 0,
                avgHealthScore = me?.AvgHealth ?? 0,
                avgEducationProgress = me?.AvgEducation ?? 0
            };
        });

        return Ok(trends);
    }

    /// <summary>
    /// Active safehouses for the resources/find-home page.
    /// Only returns non-sensitive info.
    /// </summary>
    [HttpGet("safehouses")]
    public async Task<IActionResult> GetActiveSafehouses()
    {
        var safehouses = await db.Safehouses
            .Where(s => s.Status == "Active")
            .Select(s => new
            {
                s.SafehouseId,
                s.Name,
                s.Region,
                s.City,
                s.Province,
                s.Country,
            })
            .OrderBy(s => s.Region)
            .ThenBy(s => s.Name)
            .ToListAsync();

        return Ok(safehouses);
    }
}
