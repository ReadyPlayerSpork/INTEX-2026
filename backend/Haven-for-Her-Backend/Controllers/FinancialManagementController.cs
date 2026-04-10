using Haven_for_Her_Backend.Data;
using Haven_for_Her_Backend.Dtos;
using Haven_for_Her_Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Haven_for_Her_Backend.Controllers;

[ApiController]
[Route("api/financial/management")]
[Authorize(Roles = "Financial,Admin")]
public class FinancialManagementController(HavenForHerBackendDbContext db) : ControllerBase
{
    private const int CascadePreviewLimit = 5;

    /// <summary>
    /// Get a single supporter with their donation history.
    /// </summary>
    [HttpGet("donors/{id:int}")]
    public async Task<IActionResult> GetSupporter(int id)
    {
        var supporter = await db.Supporters
            .Include(s => s.Donations.OrderByDescending(d => d.DonationDate))
                .ThenInclude(d => d.Allocations)
                    .ThenInclude(a => a.Safehouse)
            .FirstOrDefaultAsync(s => s.SupporterId == id);

        if (supporter is null) return NotFound();

        return Ok(new
        {
            supporter.SupporterId,
            supporter.SupporterType,
            supporter.DisplayName,
            supporter.OrganizationName,
            supporter.FirstName,
            supporter.LastName,
            supporter.RelationshipType,
            supporter.Region,
            supporter.Country,
            supporter.Email,
            supporter.Phone,
            supporter.Status,
            supporter.FirstDonationDate,
            supporter.AcquisitionChannel,
            supporter.CreatedAt,
            donations = supporter.Donations.Select(d => new
            {
                d.DonationId,
                d.DonationType,
                d.DonationDate,
                d.Amount,
                d.EstimatedValue,
                d.CurrencyCode,
                d.CampaignName,
                d.ChannelSource,
                d.IsRecurring,
                d.Notes,
                allocations = d.Allocations.Select(a => new
                {
                    a.AllocationId,
                    a.SafehouseId,
                    safehouseName = a.Safehouse.Name,
                    a.ProgramArea,
                    a.AmountAllocated,
                    a.AllocationDate,
                }),
            }),
        });
    }

    /// <summary>
    /// Create a new supporter profile.
    /// </summary>
    [HttpPost("donors")]
    public async Task<IActionResult> CreateSupporter([FromBody] Supporter supporter)
    {
        if (!ModelState.IsValid) return ValidationProblem();

        supporter.SupporterId = 0;
        supporter.CreatedAt = DateTime.UtcNow;

        db.Supporters.Add(supporter);
        await db.SaveChangesAsync();

        return Ok(new { message = "Supporter created.", supporterId = supporter.SupporterId });
    }

    /// <summary>
    /// Update a supporter profile.
    /// </summary>
    [HttpPut("donors/{id:int}")]
    public async Task<IActionResult> UpdateSupporter(int id, [FromBody] Supporter updated)
    {
        if (!ModelState.IsValid) return ValidationProblem();

        var existing = await db.Supporters.FindAsync(id);
        if (existing is null) return NotFound();

        existing.SupporterType = updated.SupporterType;
        existing.DisplayName = updated.DisplayName;
        existing.OrganizationName = updated.OrganizationName;
        existing.FirstName = updated.FirstName;
        existing.LastName = updated.LastName;
        existing.RelationshipType = updated.RelationshipType;
        existing.Region = updated.Region;
        existing.Country = updated.Country;
        existing.Email = updated.Email;
        existing.Phone = updated.Phone;
        existing.Status = updated.Status;
        existing.AcquisitionChannel = updated.AcquisitionChannel;

        await db.SaveChangesAsync();

        return Ok(new { message = "Supporter updated." });
    }

    /// <summary>
    /// Record a donation from the staff side.
    /// </summary>
    [HttpPost("donations")]
    public async Task<IActionResult> RecordDonation([FromBody] Donation donation)
    {
        if (!ModelState.IsValid) return ValidationProblem();

        donation.DonationId = 0;
        if (string.IsNullOrWhiteSpace(donation.CurrencyCode))
            donation.CurrencyCode = "USD";
        if (string.IsNullOrWhiteSpace(donation.DonationType))
            donation.DonationType = "Monetary";

        db.Donations.Add(donation);
        await db.SaveChangesAsync();

        return Ok(new { message = "Donation recorded.", donationId = donation.DonationId });
    }

    /// <summary>
    /// Update a donation record (Admin/Financial only).
    /// </summary>
    [HttpPut("donations/{id:int}")]
    public async Task<IActionResult> UpdateDonation(int id, [FromBody] Donation updated)
    {
        if (!ModelState.IsValid) return ValidationProblem();

        var existing = await db.Donations.FindAsync(id);
        if (existing is null) return NotFound();

        existing.DonationType = updated.DonationType ?? "Monetary";
        existing.DonationDate = updated.DonationDate;
        existing.Amount = updated.Amount;
        existing.EstimatedValue = updated.EstimatedValue;
        existing.CurrencyCode = updated.CurrencyCode ?? "USD";
        existing.CampaignName = updated.CampaignName;
        existing.ChannelSource = updated.ChannelSource ?? "Unknown";
        existing.IsRecurring = updated.IsRecurring;
        existing.Notes = updated.Notes;

        await db.SaveChangesAsync();

        return Ok(new { message = "Donation updated." });
    }

    /// <summary>
    /// List donation allocations with safehouse/program area grouping.
    /// </summary>
    [HttpGet("allocations")]
    public async Task<IActionResult> GetAllocations(
        [FromQuery] int? safehouseId,
        [FromQuery] string? programArea,
        [FromQuery] DateOnly? from,
        [FromQuery] DateOnly? to,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 25)
    {
        var query = db.DonationAllocations
            .Include(a => a.Safehouse)
            .Include(a => a.Donation)
            .AsQueryable();

        if (safehouseId.HasValue)
            query = query.Where(a => a.SafehouseId == safehouseId.Value);
        if (!string.IsNullOrWhiteSpace(programArea))
            query = query.Where(a => a.ProgramArea == programArea);
        if (from.HasValue)
            query = query.Where(a => a.AllocationDate >= from.Value);
        if (to.HasValue)
            query = query.Where(a => a.AllocationDate <= to.Value);

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(a => a.AllocationDate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(a => new
            {
                a.AllocationId,
                a.DonationId,
                a.SafehouseId,
                safehouseName = a.Safehouse.Name,
                a.ProgramArea,
                a.AmountAllocated,
                a.AllocationDate,
                a.AllocationNotes,
                donationType = a.Donation.DonationType,
                donorId = a.Donation.SupporterId,
            })
            .ToListAsync();

        // Summary by safehouse
        var bySafehouse = await db.DonationAllocations
            .Where(a => !safehouseId.HasValue || a.SafehouseId == safehouseId.Value)
            .Where(a => !from.HasValue || a.AllocationDate >= from.Value)
            .Where(a => !to.HasValue || a.AllocationDate <= to.Value)
            .GroupBy(a => new { a.SafehouseId, a.Safehouse.Name })
            .Select(g => new { safehouseId = g.Key.SafehouseId, safehouseName = g.Key.Name, total = g.Sum(a => a.AmountAllocated), count = g.Count() })
            .OrderByDescending(g => g.total)
            .ToListAsync();

        // Summary by program area
        var byProgramArea = await db.DonationAllocations
            .Where(a => !safehouseId.HasValue || a.SafehouseId == safehouseId.Value)
            .Where(a => !from.HasValue || a.AllocationDate >= from.Value)
            .Where(a => !to.HasValue || a.AllocationDate <= to.Value)
            .GroupBy(a => a.ProgramArea)
            .Select(g => new { programArea = g.Key, total = g.Sum(a => a.AmountAllocated), count = g.Count() })
            .OrderByDescending(g => g.total)
            .ToListAsync();

        return Ok(new { totalCount, page, pageSize, items, bySafehouse, byProgramArea });
    }

    /// <summary>
    /// Get counts of related records that would be deleted with a supporter.
    /// </summary>
    [HttpGet("donors/{id:int}/cascade-info")]
    public async Task<IActionResult> GetSupporterCascadeInfo(int id)
    {
        var exists = await db.Supporters.AnyAsync(s => s.SupporterId == id);
        if (!exists) return NotFound();

        var donationCount = await db.Donations.CountAsync(d => d.SupporterId == id);
        var donationRecords = await db.Donations
            .Where(d => d.SupporterId == id)
            .OrderByDescending(d => d.DonationDate)
            .Select(d => new
            {
                d.DonationType,
                d.DonationDate,
                d.Amount,
                d.EstimatedValue,
                d.CurrencyCode,
                d.CampaignName,
            })
            .Take(CascadePreviewLimit)
            .ToListAsync();

        var allocationCount = await db.DonationAllocations.CountAsync(a => a.Donation.SupporterId == id);
        var allocationRecords = await db.DonationAllocations
            .Where(a => a.Donation.SupporterId == id)
            .OrderByDescending(a => a.AllocationDate)
            .Select(a => new
            {
                a.ProgramArea,
                a.AllocationDate,
                a.AmountAllocated,
                SafehouseName = a.Safehouse.Name,
            })
            .Take(CascadePreviewLimit)
            .ToListAsync();

        return Ok(new List<CascadeImpactDto>
        {
            BuildImpact(
                "donations",
                "delete",
                donationCount,
                donationRecords.Select(d => FormatDonation(d.DonationType, d.DonationDate, d.Amount, d.EstimatedValue, d.CurrencyCode, d.CampaignName)).ToList()),
            BuildImpact(
                "donation allocations",
                "delete",
                allocationCount,
                allocationRecords.Select(a => $"{a.ProgramArea} allocation to {a.SafehouseName} on {FormatDate(a.AllocationDate)} ({a.AmountAllocated:N2})").ToList()),
        });
    }

    /// <summary>
    /// Delete a supporter and all their donations (Admin only).
    /// </summary>
    [HttpDelete("donors/{id:int}")]
    [Authorize(Roles = AuthRoles.Admin)]
    public async Task<IActionResult> DeleteSupporter(int id)
    {
        var supporter = await db.Supporters.FindAsync(id);
        if (supporter is null) return NotFound();

        // EF cascade deletes handle donations → allocations
        db.Supporters.Remove(supporter);
        await db.SaveChangesAsync();

        return Ok(new { message = "Supporter deleted." });
    }

    /// <summary>
    /// Delete a donation and its allocations (Admin only).
    /// </summary>
    [HttpDelete("donations/{id:int}")]
    [Authorize(Roles = AuthRoles.Admin)]
    public async Task<IActionResult> DeleteDonation(int id)
    {
        var donation = await db.Donations.FindAsync(id);
        if (donation is null) return NotFound();

        db.Donations.Remove(donation);
        await db.SaveChangesAsync();

        return Ok(new { message = "Donation deleted." });
    }

    /// <summary>
    /// Get counts of related records that would be deleted with a donation.
    /// </summary>
    [HttpGet("donations/{id:int}/cascade-info")]
    public async Task<IActionResult> GetDonationCascadeInfo(int id)
    {
        var exists = await db.Donations.AnyAsync(d => d.DonationId == id);
        if (!exists) return NotFound();

        var allocationCount = await db.DonationAllocations.CountAsync(a => a.DonationId == id);
        var allocationRecords = await db.DonationAllocations
            .Where(a => a.DonationId == id)
            .OrderByDescending(a => a.AllocationDate)
            .Select(a => new
            {
                a.ProgramArea,
                a.AllocationDate,
                a.AmountAllocated,
                SafehouseName = a.Safehouse.Name,
            })
            .Take(CascadePreviewLimit)
            .ToListAsync();

        var inKindCount = await db.InKindDonationItems.CountAsync(i => i.DonationId == id);
        var inKindRecords = await db.InKindDonationItems
            .Where(i => i.DonationId == id)
            .OrderBy(i => i.ItemName)
            .Select(i => new
            {
                i.ItemName,
                i.Quantity,
                i.UnitOfMeasure,
            })
            .Take(CascadePreviewLimit)
            .ToListAsync();

        return Ok(new List<CascadeImpactDto>
        {
            BuildImpact(
                "donation allocations",
                "delete",
                allocationCount,
                allocationRecords.Select(a => $"{a.ProgramArea} allocation to {a.SafehouseName} on {FormatDate(a.AllocationDate)} ({a.AmountAllocated:N2})").ToList()),
            BuildImpact(
                "in-kind items",
                "delete",
                inKindCount,
                inKindRecords.Select(i => $"{i.ItemName} ({i.Quantity} {i.UnitOfMeasure})").ToList()),
        });
    }

    /// <summary>
    /// Monthly donation totals for the last N months (for charting).
    /// </summary>
    [HttpGet("trends")]
    public async Task<IActionResult> GetTrends([FromQuery] int months = 12)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var startDate = today.AddMonths(-months);

        var monthlyTotals = await db.Donations
            .Where(d => d.DonationDate >= startDate)
            .GroupBy(d => new { d.DonationDate.Year, d.DonationDate.Month })
            .Select(g => new
            {
                year = g.Key.Year,
                month = g.Key.Month,
                monetaryTotal = g.Where(d => d.DonationType == "Monetary" && d.Amount.HasValue).Sum(d => d.Amount!.Value),
                inKindTotal = g.Where(d => d.DonationType == "InKind" && d.EstimatedValue.HasValue).Sum(d => d.EstimatedValue!.Value),
                donationCount = g.Count(),
                uniqueDonors = g.Select(d => d.SupporterId).Distinct().Count(),
            })
            .OrderBy(g => g.year)
            .ThenBy(g => g.month)
            .ToListAsync();

        return Ok(monthlyTotals);
    }

    private static CascadeImpactDto BuildImpact(string label, string action, int count, IReadOnlyList<string> records) =>
        new()
        {
            Label = label,
            Action = action,
            Count = count,
            Records = records,
        };

    private static string FormatDate(DateOnly date) => date.ToString("MMM d, yyyy");

    private static string FormatDonation(
        string donationType,
        DateOnly donationDate,
        decimal? amount,
        decimal? estimatedValue,
        string? currencyCode,
        string? campaignName)
    {
        var valueText = amount.HasValue
            ? $"{currencyCode ?? "USD"} {amount.Value:N2}"
            : estimatedValue.HasValue
                ? $"estimated {currencyCode ?? "USD"} {estimatedValue.Value:N2}"
                : null;

        var campaignText = string.IsNullOrWhiteSpace(campaignName)
            ? string.Empty
            : $" - {campaignName}";

        return valueText is null
            ? $"{donationType} donation on {FormatDate(donationDate)}{campaignText}"
            : $"{donationType} donation on {FormatDate(donationDate)} ({valueText}){campaignText}";
    }
}
