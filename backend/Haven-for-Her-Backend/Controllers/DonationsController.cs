using Haven_for_Her_Backend.Data;
using Haven_for_Her_Backend.Dtos;
using Haven_for_Her_Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Haven_for_Her_Backend.Controllers;

[ApiController]
[Route("api/donations")]
public class DonationsController(HavenForHerBackendDbContext db) : ControllerBase
{
    private static readonly HashSet<string> ValidDonationTypes =
        ["Monetary", "InKind", "Time", "Skills", "SocialMedia"];

    /// <summary>
    /// Submit a donation. Requires authentication unless using the anonymous endpoint.
    /// </summary>
    [HttpPost]
    [Authorize]
    public async Task<IActionResult> CreateDonation([FromBody] DonationRequest request)
    {
        if (!ValidDonationTypes.Contains(request.DonationType))
            return BadRequest(new ErrorResponse("Invalid donation type."));

        var donation = new Donation
        {
            DonationType = request.DonationType,
            DonationDate = DateOnly.FromDateTime(DateTime.UtcNow),
            Amount = request.Amount,
            CurrencyCode = request.CurrencyCode ?? "PHP",
            CampaignName = request.CampaignName,
            Notes = request.Notes,
            ChannelSource = "Website",
        };

        db.Donations.Add(donation);
        await db.SaveChangesAsync();

        return Ok(new { message = "Thank you for your donation!", donationId = donation.DonationId });
    }

    /// <summary>
    /// Anonymous donation — no authentication required.
    /// </summary>
    [HttpPost("anonymous")]
    [AllowAnonymous]
    public async Task<IActionResult> CreateAnonymousDonation([FromBody] DonationRequest request)
    {
        if (!ValidDonationTypes.Contains(request.DonationType))
            return BadRequest(new ErrorResponse("Invalid donation type."));

        var donation = new Donation
        {
            DonationType = request.DonationType,
            DonationDate = DateOnly.FromDateTime(DateTime.UtcNow),
            Amount = request.Amount,
            CurrencyCode = request.CurrencyCode ?? "PHP",
            CampaignName = request.CampaignName,
            Notes = request.Notes,
            ChannelSource = "Website-Anonymous",
        };

        db.Donations.Add(donation);
        await db.SaveChangesAsync();

        return Ok(new { message = "Thank you for your generous donation!", donationId = donation.DonationId });
    }
}
