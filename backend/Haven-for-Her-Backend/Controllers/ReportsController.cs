using Haven_for_Her_Backend.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Haven_for_Her_Backend.Controllers;

[ApiController]
[Route("api/reports")]
[Authorize(Roles = "Admin,Financial")]
public class ReportsController(HavenForHerBackendDbContext db) : ControllerBase
{
    /// <summary>
    /// Monthly aggregated donation totals over a configurable period.
    /// </summary>
    [HttpGet("donation-trends")]
    public async Task<IActionResult> GetDonationTrends([FromQuery] int months = 12)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var startDate = today.AddMonths(-months);

        var trends = await db.Donations
            .Where(d => d.DonationDate >= startDate)
            .GroupBy(d => new { d.DonationDate.Year, d.DonationDate.Month })
            .Select(g => new
            {
                year = g.Key.Year,
                month = g.Key.Month,
                monetaryTotal = g.Where(d => d.DonationType == "Monetary" && d.Amount.HasValue).Sum(d => d.Amount!.Value),
                inKindTotal = g.Where(d => d.DonationType == "InKind" && d.EstimatedValue.HasValue).Sum(d => d.EstimatedValue!.Value),
                count = g.Count(),
            })
            .OrderBy(g => g.year)
            .ThenBy(g => g.month)
            .ToListAsync();

        return Ok(trends);
    }

    /// <summary>
    /// Aggregate education progress and health scores across residents, grouped by safehouse.
    /// </summary>
    [HttpGet("resident-outcomes")]
    public async Task<IActionResult> GetResidentOutcomes()
    {
        var educationBySafehouse = await db.EducationRecords
            .Include(e => e.Resident)
            .GroupBy(e => new { e.Resident.SafehouseId, e.Resident.Safehouse.Name })
            .Select(g => new
            {
                safehouseId = g.Key.SafehouseId,
                safehouseName = g.Key.Name,
                avgProgressPercent = g.Average(e => e.ProgressPercent),
                avgAttendanceRate = g.Average(e => e.AttendanceRate),
                totalRecords = g.Count(),
            })
            .ToListAsync();

        var healthBySafehouse = await db.HealthWellbeingRecords
            .Include(h => h.Resident)
            .GroupBy(h => new { h.Resident.SafehouseId, h.Resident.Safehouse.Name })
            .Select(g => new
            {
                safehouseId = g.Key.SafehouseId,
                safehouseName = g.Key.Name,
                avgGeneralHealthScore = g.Average(h => h.GeneralHealthScore),
                avgNutritionScore = g.Average(h => h.NutritionScore),
                avgSleepQualityScore = g.Average(h => h.SleepQualityScore),
                totalRecords = g.Count(),
            })
            .ToListAsync();

        return Ok(new { educationBySafehouse, healthBySafehouse });
    }

    /// <summary>
    /// Side-by-side SafehouseMonthlyMetric comparison for all active safehouses.
    /// </summary>
    [HttpGet("safehouse-comparison")]
    public async Task<IActionResult> GetSafehouseComparison([FromQuery] int months = 6)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var startDate = today.AddMonths(-months);

        var metrics = await db.SafehouseMonthlyMetrics
            .Include(m => m.Safehouse)
            .Where(m => m.MonthStart >= startDate)
            .OrderBy(m => m.Safehouse.Name)
            .ThenBy(m => m.MonthStart)
            .Select(m => new
            {
                m.MetricId,
                m.SafehouseId,
                safehouseName = m.Safehouse.Name,
                m.MonthStart,
                m.MonthEnd,
                m.ActiveResidents,
                m.AvgEducationProgress,
                m.AvgHealthScore,
                m.ProcessRecordingCount,
                m.HomeVisitationCount,
                m.IncidentCount,
            })
            .ToListAsync();

        return Ok(metrics);
    }

    /// <summary>
    /// Reintegration success rates by type and status.
    /// </summary>
    [HttpGet("reintegration")]
    public async Task<IActionResult> GetReintegration()
    {
        var byType = await db.Residents
            .Where(r => r.ReintegrationType != null)
            .GroupBy(r => r.ReintegrationType!)
            .Select(g => new
            {
                reintegrationType = g.Key,
                total = g.Count(),
                successful = g.Count(r => r.ReintegrationStatus == "Successful"),
                inProgress = g.Count(r => r.ReintegrationStatus == "In Progress"),
                pending = g.Count(r => r.ReintegrationStatus == "Pending"),
            })
            .ToListAsync();

        var byStatus = await db.Residents
            .Where(r => r.ReintegrationStatus != null)
            .GroupBy(r => r.ReintegrationStatus!)
            .Select(g => new
            {
                status = g.Key,
                count = g.Count(),
            })
            .OrderByDescending(g => g.count)
            .ToListAsync();

        return Ok(new { byType, byStatus });
    }

    /// <summary>
    /// Annual accomplishment report: service counts, beneficiary counts, program outcomes.
    /// Aligned with the Philippine social welfare Annual Accomplishment Report format.
    /// </summary>
    [HttpGet("accomplishment")]
    public async Task<IActionResult> GetAccomplishment([FromQuery] int? year)
    {
        var reportYear = year ?? DateTime.UtcNow.Year;
        var yearStart = new DateOnly(reportYear, 1, 1);
        var yearEnd = new DateOnly(reportYear, 12, 31);

        // Services provided counts
        var counselingSessions = await db.ProcessRecordings
            .CountAsync(pr => pr.SessionDate >= yearStart && pr.SessionDate <= yearEnd);
        var individualSessions = await db.ProcessRecordings
            .CountAsync(pr => pr.SessionDate >= yearStart && pr.SessionDate <= yearEnd && pr.SessionType == "Individual");
        var groupSessions = await db.ProcessRecordings
            .CountAsync(pr => pr.SessionDate >= yearStart && pr.SessionDate <= yearEnd && pr.SessionType == "Group");

        var homeVisitations = await db.HomeVisitations
            .CountAsync(hv => hv.VisitDate >= yearStart && hv.VisitDate <= yearEnd);

        var interventions = await db.InterventionPlans
            .CountAsync(ip => ip.CreatedAt.Year == reportYear);
        var interventionsByCategory = await db.InterventionPlans
            .Where(ip => ip.CreatedAt.Year == reportYear)
            .GroupBy(ip => ip.PlanCategory)
            .Select(g => new { category = g.Key, count = g.Count() })
            .ToListAsync();

        var incidents = await db.IncidentReports
            .CountAsync(ir => ir.IncidentDate >= yearStart && ir.IncidentDate <= yearEnd);
        var resolvedIncidents = await db.IncidentReports
            .CountAsync(ir => ir.IncidentDate >= yearStart && ir.IncidentDate <= yearEnd && ir.Resolved);

        // Beneficiary counts
        var totalResidents = await db.Residents
            .CountAsync(r => r.DateOfAdmission <= yearEnd && (r.DateClosed == null || r.DateClosed >= yearStart));
        var newAdmissions = await db.Residents
            .CountAsync(r => r.DateOfAdmission >= yearStart && r.DateOfAdmission <= yearEnd);
        var discharges = await db.Residents
            .CountAsync(r => r.DateClosed.HasValue && r.DateClosed >= yearStart && r.DateClosed <= yearEnd);

        // Reintegration outcomes
        var reintegrationCompleted = await db.Residents
            .CountAsync(r => r.ReintegrationStatus == "Successful" &&
                r.DateClosed.HasValue && r.DateClosed >= yearStart && r.DateClosed <= yearEnd);

        // Donation summary
        var totalDonations = await db.Donations
            .Where(d => d.DonationDate >= yearStart && d.DonationDate <= yearEnd)
            .CountAsync();
        var totalMonetaryValue = await db.Donations
            .Where(d => d.DonationDate >= yearStart && d.DonationDate <= yearEnd && d.DonationType == "Monetary" && d.Amount.HasValue)
            .SumAsync(d => d.Amount!.Value);

        // Case categories
        var byCaseCategory = await db.Residents
            .Where(r => r.DateOfAdmission <= yearEnd && (r.DateClosed == null || r.DateClosed >= yearStart))
            .GroupBy(r => r.CaseCategory)
            .Select(g => new { category = g.Key, count = g.Count() })
            .ToListAsync();

        return Ok(new
        {
            year = reportYear,
            services = new
            {
                counselingSessions,
                individualSessions,
                groupSessions,
                homeVisitations,
                interventions,
                interventionsByCategory,
                incidents,
                resolvedIncidents,
            },
            beneficiaries = new
            {
                totalResidents,
                newAdmissions,
                discharges,
                reintegrationCompleted,
                byCaseCategory,
            },
            donations = new
            {
                totalDonations,
                totalMonetaryValue,
            },
        });
    }
}
