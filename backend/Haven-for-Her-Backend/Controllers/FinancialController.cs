using Haven_for_Her_Backend.Data;
using Haven_for_Her_Backend.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Haven_for_Her_Backend.Controllers;

[ApiController]
[Route("api/financial")]
[Authorize(Roles = $"{AuthRoles.Financial},{AuthRoles.Admin}")]
public class FinancialController(HavenForHerBackendDbContext db) : ControllerBase
{
    /// <summary>
    /// Financial dashboard overview — aggregate donation metrics.
    /// </summary>
    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard()
    {
        var totalMonetary = await db.Donations
            .Where(d => d.DonationType == "Monetary" && d.Amount.HasValue)
            .SumAsync(d => d.Amount!.Value);
        var totalInKindValue = await db.Donations
            .Where(d => d.DonationType == "InKind" && d.EstimatedValue.HasValue)
            .SumAsync(d => d.EstimatedValue!.Value);
        var recurringCount = await db.Donations.CountAsync(d => d.IsRecurring);
        var oneTimeCount = await db.Donations.CountAsync(d => !d.IsRecurring);
        var totalDonors = await db.Supporters.CountAsync();

        var byCampaign = await db.Donations
            .Where(d => d.CampaignName != null)
            .GroupBy(d => d.CampaignName!)
            .Select(g => new { campaign = g.Key, total = g.Sum(d => d.Amount ?? 0), count = g.Count() })
            .OrderByDescending(g => g.total)
            .Take(10)
            .ToListAsync();

        var byType = await db.Donations
            .GroupBy(d => d.DonationType)
            .Select(g => new { type = g.Key, count = g.Count(), total = g.Sum(d => d.Amount ?? d.EstimatedValue ?? 0) })
            .ToListAsync();

        return Ok(new
        {
            totalMonetaryPhp = totalMonetary,
            totalInKindValuePhp = totalInKindValue,
            recurringDonations = recurringCount,
            oneTimeDonations = oneTimeCount,
            totalDonors,
            topCampaigns = byCampaign,
            donationsByType = byType,
        });
    }

    /// <summary>
    /// List all supporters with search and pagination.
    /// </summary>
    [HttpGet("donors")]
    public async Task<IActionResult> ListDonors(
        [FromQuery] string? search,
        [FromQuery] string? supporterType,
        [FromQuery] string? status,
        [FromQuery] string? sort,
        [FromQuery] string? direction,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 25)
    {
        var query = db.Supporters.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(s =>
                (s.DisplayName != null && s.DisplayName.ToLower().Contains(term)) ||
                (s.Email != null && s.Email.ToLower().Contains(term)) ||
                (s.FirstName != null && s.FirstName.ToLower().Contains(term)) ||
                (s.LastName != null && s.LastName.ToLower().Contains(term)));
        }

        if (!string.IsNullOrWhiteSpace(supporterType))
            query = query.Where(s => s.SupporterType == supporterType);

        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(s => s.Status == status);

        var totalCount = await query.CountAsync();

        var desc = string.Equals(direction, "desc", StringComparison.OrdinalIgnoreCase);
        query = sort?.ToLower() switch
        {
            "displayname" => desc ? query.OrderByDescending(s => s.DisplayName) : query.OrderBy(s => s.DisplayName),
            "email" => desc ? query.OrderByDescending(s => s.Email) : query.OrderBy(s => s.Email),
            "supportertype" => desc ? query.OrderByDescending(s => s.SupporterType) : query.OrderBy(s => s.SupporterType),
            "status" => desc ? query.OrderByDescending(s => s.Status) : query.OrderBy(s => s.Status),
            "region" => desc ? query.OrderByDescending(s => s.Region) : query.OrderBy(s => s.Region),
            "firstdonationdate" => desc ? query.OrderByDescending(s => s.FirstDonationDate) : query.OrderBy(s => s.FirstDonationDate),
            _ => query.OrderBy(s => s.DisplayName ?? s.Email),
        };

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(s => new
            {
                s.SupporterId,
                s.DisplayName,
                s.FirstName,
                s.LastName,
                s.Email,
                s.SupporterType,
                s.RelationshipType,
                s.Region,
                s.Country,
                s.Status,
                s.AcquisitionChannel,
                s.FirstDonationDate,
            })
            .ToListAsync();

        return Ok(new PaginatedResponse<object>(items.Cast<object>().ToList(), page, pageSize, totalCount));
    }

    /// <summary>
    /// List all donations with filtering and pagination.
    /// </summary>
    [HttpGet("donations")]
    public async Task<IActionResult> ListDonations(
        [FromQuery] string? type,
        [FromQuery] string? campaign,
        [FromQuery] DateOnly? from,
        [FromQuery] DateOnly? to,
        [FromQuery] string? search,
        [FromQuery] string? sort,
        [FromQuery] string? direction,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 25)
    {
        var query = db.Donations.AsQueryable();

        if (!string.IsNullOrWhiteSpace(type))
            query = query.Where(d => d.DonationType == type);
        if (!string.IsNullOrWhiteSpace(campaign))
        {
            var c = campaign.Trim().ToLower();
            query = query.Where(d => d.CampaignName != null && d.CampaignName.ToLower().Contains(c));
        }
        if (from.HasValue)
            query = query.Where(d => d.DonationDate >= from.Value);
        if (to.HasValue)
            query = query.Where(d => d.DonationDate <= to.Value);
        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(d =>
                (d.CampaignName != null && d.CampaignName.ToLower().Contains(term)) ||
                d.DonationType.ToLower().Contains(term) ||
                (d.ChannelSource != null && d.ChannelSource.ToLower().Contains(term)));
        }

        var totalCount = await query.CountAsync();

        var isDesc = string.Equals(direction, "desc", StringComparison.OrdinalIgnoreCase);
        query = sort?.ToLower() switch
        {
            "donationdate" => isDesc ? query.OrderByDescending(d => d.DonationDate) : query.OrderBy(d => d.DonationDate),
            "donationtype" => isDesc ? query.OrderByDescending(d => d.DonationType) : query.OrderBy(d => d.DonationType),
            "amount" => isDesc ? query.OrderByDescending(d => d.Amount) : query.OrderBy(d => d.Amount),
            "campaignname" => isDesc ? query.OrderByDescending(d => d.CampaignName) : query.OrderBy(d => d.CampaignName),
            "channelsource" => isDesc ? query.OrderByDescending(d => d.ChannelSource) : query.OrderBy(d => d.ChannelSource),
            _ => query.OrderByDescending(d => d.DonationDate),
        };

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(d => new
            {
                d.DonationId,
                d.SupporterId,
                d.DonationType,
                d.DonationDate,
                d.Amount,
                d.EstimatedValue,
                d.CurrencyCode,
                d.CampaignName,
                d.ChannelSource,
                d.IsRecurring,
            })
            .ToListAsync();

        return Ok(new PaginatedResponse<object>(items.Cast<object>().ToList(), page, pageSize, totalCount));
    }

    /// <summary>
    /// Donor retention insights — lapsed, active, top donors.
    /// </summary>
    [HttpGet("insights")]
    public async Task<IActionResult> GetInsights()
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var sixMonthsAgo = today.AddMonths(-6);
        var twelveMonthsAgo = today.AddMonths(-12);

        // Active: donated in last 6 months
        var activeDonorIds = await db.Donations
            .Where(d => d.DonationDate >= sixMonthsAgo && d.SupporterId != 0)
            .Select(d => d.SupporterId)
            .Distinct()
            .CountAsync();

        // Lapsed: last donation 6-12 months ago
        var allDonorIdsLast12 = await db.Donations
            .Where(d => d.DonationDate >= twelveMonthsAgo && d.SupporterId != 0)
            .Select(d => d.SupporterId)
            .Distinct()
            .ToListAsync();

        var activeDonorIdSet = await db.Donations
            .Where(d => d.DonationDate >= sixMonthsAgo && d.SupporterId != 0)
            .Select(d => d.SupporterId)
            .Distinct()
            .ToListAsync();

        var lapsedCount = allDonorIdsLast12.Except(activeDonorIdSet).Count();

        // Top donors by total
        var topDonors = await db.Donations
            .Where(d => d.SupporterId != 0 && d.Amount.HasValue)
            .GroupBy(d => d.SupporterId)
            .Select(g => new { supporterId = g.Key, total = g.Sum(d => d.Amount!.Value), count = g.Count() })
            .OrderByDescending(g => g.total)
            .Take(10)
            .ToListAsync();

        return Ok(new
        {
            activeDonors = activeDonorIds,
            lapsedDonors = lapsedCount,
            topDonors,
        });
    }

    /// <summary>
    /// Export donations as CSV for a date range.
    /// </summary>
    [HttpGet("export/csv")]
    public async Task<IActionResult> ExportCsv(
        [FromQuery] DateOnly? from,
        [FromQuery] DateOnly? to)
    {
        var query = db.Donations.AsQueryable();
        if (from.HasValue) query = query.Where(d => d.DonationDate >= from.Value);
        if (to.HasValue) query = query.Where(d => d.DonationDate <= to.Value);

        var donations = await query
            .OrderByDescending(d => d.DonationDate)
            .Select(d => new
            {
                d.DonationId,
                d.SupporterId,
                d.DonationType,
                d.DonationDate,
                d.Amount,
                d.CurrencyCode,
                d.CampaignName,
                d.ChannelSource,
                d.IsRecurring,
            })
            .ToListAsync();

        var csv = "DonationId,SupporterId,Type,Date,Amount,Currency,Campaign,Channel,IsRecurring\n" +
                  string.Join('\n', donations.Select(d =>
                      $"{d.DonationId},{d.SupporterId},{d.DonationType},{d.DonationDate},{d.Amount},{d.CurrencyCode},{Escape(d.CampaignName)},{d.ChannelSource},{d.IsRecurring}"));

        return File(System.Text.Encoding.UTF8.GetBytes(csv), "text/csv", "donations-export.csv");
    }

    private static string Escape(string? value) =>
        value == null ? "" : $"\"{value.Replace("\"", "\"\"")}\"";
}
