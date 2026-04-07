using Haven_for_Her_Backend.Data;
using Haven_for_Her_Backend.Dtos;
using Haven_for_Her_Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Haven_for_Her_Backend.Controllers;

[ApiController]
[Route("api/donations")]
public class DonationsController(
    HavenForHerBackendDbContext db,
    UserManager<ApplicationUser> userManager) : ControllerBase
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

        var user = await userManager.GetUserAsync(User);
        if (user is null)
            return Unauthorized();

        var supporter = await FindOrCreateSupporterForUser(user);

        var donation = new Donation
        {
            SupporterId = supporter.SupporterId,
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

        var supporter = await FindOrCreateAnonymousSupporter(request.DonorName, request.DonorEmail);

        var donation = new Donation
        {
            SupporterId = supporter.SupporterId,
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

    private async Task<Supporter> FindOrCreateSupporterForUser(ApplicationUser user)
    {
        var email = user.Email ?? "";
        var existing = await db.Supporters.FirstOrDefaultAsync(s => s.Email == email);
        if (existing is not null)
            return existing;

        var supporter = new Supporter
        {
            SupporterType = "Individual",
            DisplayName = user.UserName ?? email,
            Email = email,
            Phone = "",
            RelationshipType = "Local",
            Region = "Unknown",
            Country = "PH",
            Status = "Active",
            AcquisitionChannel = "Website",
            FirstDonationDate = DateOnly.FromDateTime(DateTime.UtcNow),
            CreatedAt = DateTime.UtcNow,
        };

        db.Supporters.Add(supporter);
        await db.SaveChangesAsync();
        return supporter;
    }

    private async Task<Supporter> FindOrCreateAnonymousSupporter(string? donorName, string? donorEmail)
    {
        if (!string.IsNullOrWhiteSpace(donorEmail))
        {
            var existing = await db.Supporters.FirstOrDefaultAsync(s => s.Email == donorEmail);
            if (existing is not null)
                return existing;
        }

        var supporter = new Supporter
        {
            SupporterType = "Anonymous",
            DisplayName = donorName ?? "Anonymous Donor",
            Email = donorEmail ?? "",
            Phone = "",
            RelationshipType = "Local",
            Region = "Unknown",
            Country = "PH",
            Status = "Active",
            AcquisitionChannel = "Website-Anonymous",
            FirstDonationDate = DateOnly.FromDateTime(DateTime.UtcNow),
            CreatedAt = DateTime.UtcNow,
        };

        db.Supporters.Add(supporter);
        await db.SaveChangesAsync();
        return supporter;
    }
}
