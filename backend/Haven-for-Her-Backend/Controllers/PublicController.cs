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
        var totalResidents = await db.Residents.CountAsync();
        var activeResidents = await db.Residents.CountAsync(r => r.CaseStatus == "Active");
        var totalDonations = await db.Donations.CountAsync();
        var totalDonationValue = await db.Donations
            .Where(d => d.Amount.HasValue)
            .SumAsync(d => d.Amount!.Value);
        var activeSafehouses = await db.Safehouses.CountAsync(s => s.Status == "Active");
        var activePartners = await db.Partners.CountAsync(p => p.Status == "Active");

        // Latest published snapshot
        var latestSnapshot = await db.PublicImpactSnapshots
            .Where(s => s.IsPublished)
            .OrderByDescending(s => s.PublishedAt)
            .FirstOrDefaultAsync();

        return Ok(new
        {
            totalResidentsServed = totalResidents,
            activeResidents,
            totalDonations,
            totalDonationValuePhp = totalDonationValue,
            activeSafehouses,
            activePartners,
            latestSnapshot = latestSnapshot is null ? null : new
            {
                latestSnapshot.Headline,
                latestSnapshot.SummaryText,
                latestSnapshot.MetricPayloadJson,
                latestSnapshot.PublishedAt,
            }
        });
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
