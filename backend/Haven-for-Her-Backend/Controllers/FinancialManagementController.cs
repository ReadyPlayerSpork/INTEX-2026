using Haven_for_Her_Backend.Data;
using Haven_for_Her_Backend.Dtos;
using Haven_for_Her_Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Haven_for_Her_Backend.Controllers;

[ApiController]
[Route("api/financial/management")]
[Authorize(Roles = AuthRoles.Financial)]
public class FinancialManagementController(HavenForHerBackendDbContext db) : ControllerBase
{
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
}
