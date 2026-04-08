using System.Globalization;
using Haven_for_Her_Backend.Data;
using Haven_for_Her_Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Haven_for_Her_Backend.Controllers;

[ApiController]
[Route("api/admin/dashboard")]
[Authorize(Roles = AuthRoles.Admin)]
public class AdminDashboardController(HavenForHerBackendDbContext db) : ControllerBase
{
    private static readonly Dictionary<string, int> RiskOrder = new()
    {
        ["Low"] = 0,
        ["Medium"] = 1,
        ["High"] = 2,
        ["Critical"] = 3,
    };

    [HttpGet]
    public async Task<IActionResult> GetDashboard()
    {
        var now = DateTime.UtcNow;
        var today = DateOnly.FromDateTime(now);
        var startOfMonth = new DateOnly(today.Year, today.Month, 1);
        var startOfLastMonth = startOfMonth.AddMonths(-1);
        var thirtyDaysAgo = today.AddDays(-30);
        var sevenDaysAgo = today.AddDays(-7);
        var sixtyDaysAgo = today.AddDays(-60);

        // ── Financial ──────────────────────────────────────────────────
        var donations = await db.Donations.ToListAsync();

        var thisMonthDonations = donations
            .Where(d => d.DonationDate >= startOfMonth)
            .ToList();

        var lastMonthDonations = donations
            .Where(d => d.DonationDate >= startOfLastMonth && d.DonationDate < startOfMonth)
            .ToList();

        var totalThisMonth = thisMonthDonations.Sum(d => d.Amount ?? 0m);
        var totalLastMonth = lastMonthDonations.Sum(d => d.Amount ?? 0m);
        var percentChange = totalLastMonth == 0
            ? (totalThisMonth > 0 ? 100m : 0m)
            : Math.Round((totalThisMonth - totalLastMonth) / totalLastMonth * 100, 1);

        var donationsByType = thisMonthDonations
            .GroupBy(d => d.DonationType)
            .Select(g => new { type = g.Key, total = g.Sum(d => d.Amount ?? 0m), count = g.Count() })
            .OrderByDescending(x => x.total)
            .ToList();

        var topCampaigns = thisMonthDonations
            .Where(d => d.CampaignName != null)
            .GroupBy(d => d.CampaignName!)
            .Select(g => new { campaign = g.Key, total = g.Sum(d => d.Amount ?? 0m), count = g.Count() })
            .OrderByDescending(x => x.total)
            .Take(5)
            .ToList();

        var recurringCount = thisMonthDonations.Count(d => d.IsRecurring);
        var oneTimeCount = thisMonthDonations.Count(d => !d.IsRecurring);

        // Donor health: active (donated in last 90 days), lapsed (91-365), churned (>365)
        var donorLastDonation = donations
            .GroupBy(d => d.SupporterId)
            .Select(g => new { SupporterId = g.Key, LastDate = g.Max(d => d.DonationDate) })
            .ToList();

        var ninetyDaysAgo = today.AddDays(-90);
        var oneYearAgo = today.AddDays(-365);
        var activeDonors = donorLastDonation.Count(d => d.LastDate >= ninetyDaysAgo);
        var lapsedDonors = donorLastDonation.Count(d => d.LastDate < ninetyDaysAgo && d.LastDate >= oneYearAgo);
        var churnedDonors = donorLastDonation.Count(d => d.LastDate < oneYearAgo);

        // ── Residents ──────────────────────────────────────────────────
        var residents = await db.Residents
            .Include(r => r.Safehouse)
            .ToListAsync();

        var activeResidents = residents.Where(r => r.CaseStatus == "Active").ToList();

        var safehouses = await db.Safehouses.ToListAsync();
        var bySafehouse = safehouses.Select(s => new
        {
            safehouseName = s.Name,
            activeCount = activeResidents.Count(r => r.SafehouseId == s.SafehouseId),
            capacity = s.CapacityGirls,
        }).ToList();

        var riskDistribution = activeResidents
            .GroupBy(r => r.CurrentRiskLevel)
            .Select(g => new { level = g.Key, count = g.Count() })
            .ToList();

        // Alerts: escalating risk
        var escalatingRisk = activeResidents
            .Where(r =>
                RiskOrder.TryGetValue(r.CurrentRiskLevel, out var current) &&
                RiskOrder.TryGetValue(r.InitialRiskLevel, out var initial) &&
                current > initial)
            .Select(r => new
            {
                r.ResidentId,
                r.CaseControlNo,
                r.CurrentRiskLevel,
                r.InitialRiskLevel,
                safehouse = r.Safehouse.Name,
                referenceAt = DateTime.SpecifyKind(r.CreatedAt, DateTimeKind.Utc),
            })
            .ToList();

        // Recent concerns from ProcessRecordings with ConcernsFlagged in last 30 days
        var recentConcerns = await db.ProcessRecordings
            .Where(p => p.ConcernsFlagged && p.SessionDate >= thirtyDaysAgo)
            .Include(p => p.Resident)
            .Select(p => new
            {
                p.RecordingId,
                p.ResidentId,
                p.SessionDate,
                caseControlNo = p.Resident.CaseControlNo,
                referenceAt = DateTime.SpecifyKind(p.SessionDate.ToDateTime(TimeOnly.MinValue), DateTimeKind.Utc),
            })
            .ToListAsync();

        // Unresolved incidents older than 7 days
        var unresolvedIncidents = await db.IncidentReports
            .Where(i => !i.Resolved && i.IncidentDate <= sevenDaysAgo)
            .Include(i => i.Resident)
            .Include(i => i.Safehouse)
            .Select(i => new
            {
                i.IncidentId,
                i.ResidentId,
                i.SafehouseId,
                i.IncidentDate,
                i.Severity,
                caseControlNo = i.Resident.CaseControlNo,
                safehouseName = i.Safehouse.Name,
                referenceAt = DateTime.SpecifyKind(i.IncidentDate.ToDateTime(TimeOnly.MinValue), DateTimeKind.Utc),
            })
            .ToListAsync();

        // Missed sessions: active residents with no ProcessRecording in 30 days
        var recentSessionResidentIds = await db.ProcessRecordings
            .Where(p => p.SessionDate >= thirtyDaysAgo)
            .Select(p => p.ResidentId)
            .Distinct()
            .ToListAsync();

        var missedSessions = activeResidents
            .Where(r => !recentSessionResidentIds.Contains(r.ResidentId))
            .Select(r => new
            {
                r.ResidentId,
                r.CaseControlNo,
                safehouse = r.Safehouse.Name,
                referenceAt = DateTime.SpecifyKind(now.AddDays(-2), DateTimeKind.Utc),
            })
            .ToList();

        // Follow-up needed: closed residents with ReintegrationStatus "In Progress" and no HomeVisitation in 60 days
        var recentVisitResidentIds = await db.HomeVisitations
            .Where(v => v.VisitDate >= sixtyDaysAgo)
            .Select(v => v.ResidentId)
            .Distinct()
            .ToListAsync();

        var followUpNeeded = residents
            .Where(r =>
                r.CaseStatus != "Active" &&
                r.ReintegrationStatus == "In Progress" &&
                !recentVisitResidentIds.Contains(r.ResidentId))
            .Select(r => new
            {
                r.ResidentId,
                r.CaseControlNo,
                r.ReintegrationStatus,
                r.DateClosed,
                referenceAt = r.DateClosed.HasValue
                    ? DateTime.SpecifyKind(r.DateClosed.Value.ToDateTime(TimeOnly.MinValue), DateTimeKind.Utc)
                    : DateTime.SpecifyKind(now, DateTimeKind.Utc),
            })
            .ToList();

        // ── Social ─────────────────────────────────────────────────────
        var postsThisMonth = await db.SocialMediaPosts
            .Where(p => p.CreatedAt >= startOfMonth.ToDateTime(TimeOnly.MinValue))
            .ToListAsync();

        var totalImpressions = postsThisMonth.Sum(p => p.Impressions);
        var totalReach = postsThisMonth.Sum(p => p.Reach);
        var avgEngagementRate = postsThisMonth.Count > 0
            ? Math.Round(postsThisMonth.Average(p => p.EngagementRate), 4)
            : 0m;

        var topPost = postsThisMonth
            .OrderByDescending(p => p.EngagementRate)
            .Select(p => new { p.PostId, p.Platform, p.ContentTopic, p.EngagementRate, p.Impressions })
            .FirstOrDefault();

        var thirtyDaysAgoDateTime = now.AddDays(-30);
        var activeCampaigns = await db.SocialMediaPosts
            .Where(p => p.IsBoosted && p.CreatedAt >= thirtyDaysAgoDateTime)
            .Where(p => p.CampaignName != null)
            .Select(p => p.CampaignName!)
            .Distinct()
            .ToListAsync();

        // ── Dashboard extras (mockup parity, SQLite-backed) ────────────
        var criticalRiskResidents = activeResidents.Count(r => r.CurrentRiskLevel == "Critical");
        var highRiskCases = activeResidents.Count(r =>
            r.CurrentRiskLevel == "High" || r.CurrentRiskLevel == "Critical");

        var visitWeekEnd = today.AddDays(7);
        var upcomingVisitationsNext7Days = await db.HomeVisitations
            .CountAsync(v => v.VisitDate >= today && v.VisitDate <= visitWeekEnd);

        var donationsByMonth = new List<object>();
        for (var i = 5; i >= 0; i--)
        {
            var mStart = new DateOnly(today.Year, today.Month, 1).AddMonths(-i);
            var mEnd = mStart.AddMonths(1);
            var monthTotal = donations
                .Where(d =>
                    string.Equals(d.DonationType, "Monetary", StringComparison.OrdinalIgnoreCase) &&
                    d.Amount.HasValue &&
                    d.DonationDate >= mStart &&
                    d.DonationDate < mEnd)
                .Sum(d => d.Amount ?? 0m);
            donationsByMonth.Add(new
            {
                label = mStart.ToString("MMM", CultureInfo.InvariantCulture),
                year = mStart.Year,
                month = mStart.Month,
                total = monthTotal,
            });
        }

        var caseloadPreviewSource = await db.Residents
            .Include(r => r.Safehouse)
            .Where(r => r.CaseStatus == "Active")
            .OrderByDescending(r => r.DateOfAdmission)
            .Take(25)
            .ToListAsync();

        var previewIds = caseloadPreviewSource.Select(r => r.ResidentId).ToList();

        var lastSessionRows = await db.ProcessRecordings
            .Where(p => previewIds.Contains(p.ResidentId))
            .GroupBy(p => p.ResidentId)
            .Select(g => new { ResidentId = g.Key, LastSession = g.Max(x => x.SessionDate) })
            .ToListAsync();

        var lastSessionDict = lastSessionRows.ToDictionary(x => x.ResidentId, x => x.LastSession);
        var flaggedConcernIds = await db.ProcessRecordings
            .Where(p =>
                previewIds.Contains(p.ResidentId) &&
                p.ConcernsFlagged &&
                p.SessionDate >= thirtyDaysAgo)
            .Select(p => p.ResidentId)
            .Distinct()
            .ToListAsync();
        var flaggedSet = flaggedConcernIds.ToHashSet();

        var caseloadPreview = caseloadPreviewSource.Select(r => new
        {
            r.ResidentId,
            r.CaseControlNo,
            safehouseName = r.Safehouse.Name,
            r.CaseStatus,
            r.CurrentRiskLevel,
            r.AssignedSocialWorker,
            dateOfAdmission = r.DateOfAdmission,
            lastSessionDate = lastSessionDict.TryGetValue(r.ResidentId, out var ls) ? ls : (DateOnly?)null,
            flaggedConcerns = flaggedSet.Contains(r.ResidentId),
        }).ToList();

        // ── Quick Stats ────────────────────────────────────────────────
        var totalUnresolvedIncidents = await db.IncidentReports.CountAsync(i => !i.Resolved);
        var activeSafehouseCount = safehouses.Count(s => s.Status == "Active");

        return Ok(new
        {
            financial = new
            {
                totalDonationsThisMonth = totalThisMonth,
                totalDonationsLastMonth = totalLastMonth,
                percentChange,
                donationsByType,
                topCampaigns,
                recurringVsOneTime = new { recurring = recurringCount, oneTime = oneTimeCount },
                donorHealth = new { active = activeDonors, lapsed = lapsedDonors, churned = churnedDonors },
                donationsByMonth,
            },
            residents = new
            {
                totalActive = activeResidents.Count,
                bySafehouse,
                riskDistribution,
                caseloadPreview,
                alerts = new
                {
                    escalatingRisk,
                    recentConcerns,
                    unresolvedIncidents,
                    missedSessions,
                    followUpNeeded,
                },
            },
            social = new
            {
                totalImpressions,
                totalReach = totalReach,
                avgEngagementRate,
                topPost,
                activeCampaigns,
            },
            quickStats = new
            {
                totalActiveResidents = activeResidents.Count,
                activeSafehouses = activeSafehouseCount,
                donationsThisMonth = totalThisMonth,
                activeDonors,
                unresolvedIncidents = totalUnresolvedIncidents,
                engagementRateThisMonth = avgEngagementRate,
                criticalRiskResidents,
                highRiskCases,
                upcomingVisitationsNext7Days,
            },
        });
    }
}
