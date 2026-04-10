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
                supporterType = (string?)null,
                supporterStatus = (string?)null,
                acquisitionChannel = (string?)null,
                totalDonations = 0,
                givingTotalsByCurrency = Array.Empty<object>(),
                recurringDonations = 0,
                recentDonations = Array.Empty<object>(),
            });
        }

        var myDonations = db.Donations.Where(d => d.SupporterId == supporter.SupporterId);

        var totalDonations = await myDonations.CountAsync();
        var recurringCount = await myDonations.CountAsync(d => d.IsRecurring);

        var amountRows = await myDonations
            .Where(d => d.Amount.HasValue)
            .Select(d => new { d.Amount, d.CurrencyCode })
            .ToListAsync();

        static string NormalizeCurrency(string? code) =>
            string.IsNullOrWhiteSpace(code) ? "USD" : code.Trim().ToUpperInvariant();

        var givingTotalsByCurrency = amountRows
            .GroupBy(r => NormalizeCurrency(r.CurrencyCode))
            .Select(g => new { currencyCode = g.Key, total = g.Sum(r => r.Amount!.Value) })
            .OrderBy(x => x.currencyCode)
            .ToList();

        var recentDonations = await myDonations
            .OrderByDescending(d => d.DonationDate)
            .Take(10)
            .Select(d => new
            {
                d.DonationId,
                d.DonationDate,
                d.DonationType,
                d.Amount,
                d.CurrencyCode,
                d.CampaignName,
                d.IsRecurring,
            })
            .ToListAsync();

        return Ok(new
        {
            supporterType = supporter.SupporterType,
            supporterStatus = supporter.Status,
            acquisitionChannel = supporter.AcquisitionChannel,
            totalDonations,
            givingTotalsByCurrency,
            recurringDonations = recurringCount,
            recentDonations,
        });
    }
}
