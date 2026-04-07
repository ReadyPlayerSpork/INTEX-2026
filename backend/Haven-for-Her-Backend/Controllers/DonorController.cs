using Haven_for_Her_Backend.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Haven_for_Her_Backend.Controllers;

/// <summary>
/// Donor-facing endpoints for viewing personal donation history.
/// </summary>
[ApiController]
[Route("api/donor")]
[Authorize(Roles = AuthRoles.Donor)]
public class DonorController(HavenForHerBackendDbContext db) : ControllerBase
{
    /// <summary>
    /// Get the current user's donation summary.
    /// In the future this will link to a supporter record; for now, returns all donations.
    /// </summary>
    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard()
    {
        var totalDonations = await db.Donations.CountAsync();
        var totalMonetary = await db.Donations
            .Where(d => d.DonationType == "Monetary" && d.Amount.HasValue)
            .SumAsync(d => d.Amount!.Value);
        var recurringCount = await db.Donations.CountAsync(d => d.IsRecurring);

        var recentDonations = await db.Donations
            .OrderByDescending(d => d.DonationDate)
            .Take(10)
            .Select(d => new
            {
                d.DonationId,
                d.DonationType,
                d.DonationDate,
                d.Amount,
                d.CurrencyCode,
                d.CampaignName,
                d.IsRecurring,
            })
            .ToListAsync();

        return Ok(new
        {
            totalDonations,
            totalMonetaryPhp = totalMonetary,
            recurringDonations = recurringCount,
            recentDonations,
        });
    }
}
