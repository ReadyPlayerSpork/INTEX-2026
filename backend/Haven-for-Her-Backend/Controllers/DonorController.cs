using Haven_for_Her_Backend.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Haven_for_Her_Backend.Controllers;

/// <summary>
/// Donor-facing endpoints for viewing personal donation history.
/// </summary>
[ApiController]
[Route("api/donor")]
[Authorize(Roles = AuthRoles.Donor)]
public class DonorController(
    HavenForHerBackendDbContext db,
    UserManager<ApplicationUser> userManager) : ControllerBase
{
    /// <summary>
    /// Get the current user's donation summary scoped to their supporter record.
    /// </summary>
    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard()
    {
        var user = await userManager.GetUserAsync(User);
        if (user is null)
            return Unauthorized();

        var email = user.Email ?? "";
        var supporter = await db.Supporters.FirstOrDefaultAsync(s => s.Email == email);

        if (supporter is null)
        {
            return Ok(new
            {
                totalDonations = 0,
                totalMonetaryPhp = 0m,
                recurringDonations = 0,
                recentDonations = Array.Empty<object>(),
            });
        }

        var myDonations = db.Donations.Where(d => d.SupporterId == supporter.SupporterId);

        var totalDonations = await myDonations.CountAsync();
        var totalMonetary = await myDonations
            .Where(d => d.DonationType == "Monetary" && d.Amount.HasValue)
            .SumAsync(d => d.Amount!.Value);
        var recurringCount = await myDonations.CountAsync(d => d.IsRecurring);

        var recentDonations = await myDonations
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
