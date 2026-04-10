using Haven_for_Her_Backend.Data;
using Haven_for_Her_Backend.Dtos;
using Haven_for_Her_Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace Haven_for_Her_Backend.Controllers;

[ApiController]
[Route("api/donations")]
public class DonationsController(
    HavenForHerBackendDbContext db,
    UserManager<ApplicationUser> userManager,
    ILogger<DonationsController> logger) : ControllerBase
{
    private static readonly HashSet<string> ValidDonationTypes =
        ["Monetary", "InKind", "Time", "Skills", "SocialMedia"];

    private static string? ResolveDonationType(string? requested)
    {
        var type = string.IsNullOrWhiteSpace(requested) ? "Monetary" : requested.Trim();
        return ValidDonationTypes.Contains(type) ? type : null;
    }

    private static string? TrimToNull(string? value)
    {
        var trimmed = value?.Trim();
        return string.IsNullOrWhiteSpace(trimmed) ? null : trimmed;
    }

    private static string NormalizeCurrencyCode(string? requested)
    {
        var trimmed = TrimToNull(requested);
        return trimmed?.ToUpperInvariant() ?? "USD";
    }

    private static ErrorResponse? ValidateDonationRequest(DonationRequest request, string? donationType)
    {
        if (donationType is null)
            return new ErrorResponse("Invalid donation type.");

        if (request.Amount is null || request.Amount <= 0)
            return new ErrorResponse("Donation amount must be greater than 0.");

        return null;
    }

    private static Donation BuildDonation(DonationRequest request, string donationType, int supporterId, string channelSource)
    {
        var amount = request.Amount;
        return new Donation
        {
            SupporterId = supporterId,
            DonationType = donationType,
            DonationDate = DateOnly.FromDateTime(DateTime.UtcNow),
            Amount = amount,
            CurrencyCode = NormalizeCurrencyCode(request.CurrencyCode),
            CampaignName = TrimToNull(request.CampaignName),
            Notes = TrimToNull(request.Notes),
            ChannelSource = channelSource,
            IsRecurring = request.IsRecurring,
            // Align with seeded rows / reporting; avoids edge cases where Monetary gifts omit optional fields.
            EstimatedValue = donationType == "Monetary" ? amount : null,
            ImpactUnit = donationType == "Monetary" ? "dollars" : null,
        };
    }

    private async Task<IActionResult> SaveDonation(Donation donation, string thankYouMessage)
    {
        db.Donations.Add(donation);
        await db.SaveChangesAsync();
        return Ok(new { message = thankYouMessage, donationId = donation.DonationId });
    }

    /// <summary>
    /// Submit a donation. Requires authentication unless using the anonymous endpoint.
    /// </summary>
    [HttpPost]
    [Authorize]
    public async Task<IActionResult> CreateDonation([FromBody] DonationRequest request)
    {
        try
        {
            var donationType = ResolveDonationType(request.DonationType);
            var validationError = ValidateDonationRequest(request, donationType);
            if (validationError is not null)
                return BadRequest(validationError);
            var validatedDonationType = donationType!;

            var user = await userManager.GetUserAsync(User);
            if (user is null)
                return Unauthorized();

            var supporter = await FindOrCreateSupporterForUser(user);
            var donation = BuildDonation(request, validatedDonationType, supporter.SupporterId, "Website");
            return await SaveDonation(donation, "Thank you for your donation!");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to create authenticated donation.");
            return Problem(
                detail: "Unable to save donation. Please try again or contact support.",
                statusCode: StatusCodes.Status500InternalServerError);
        }
    }

    /// <summary>
    /// Anonymous donation — no authentication required.
    /// </summary>
    [HttpPost("anonymous")]
    [AllowAnonymous]
    public async Task<IActionResult> CreateAnonymousDonation([FromBody] DonationRequest request)
    {
        try
        {
            var donationType = ResolveDonationType(request.DonationType);
            var validationError = ValidateDonationRequest(request, donationType);
            if (validationError is not null)
                return BadRequest(validationError);
            var validatedDonationType = donationType!;

            var donorName = TrimToNull(request.DonorName);
            var donorEmail = TrimToNull(request.DonorEmail);

            var supporter = await FindOrCreateAnonymousSupporter(donorName, donorEmail);
            var donation = BuildDonation(request, validatedDonationType, supporter.SupporterId, "Website-Anonymous");
            return await SaveDonation(donation, "Thank you for your generous donation!");
        }
        catch (Exception ex)
        {
            LogDonationPersistenceFailure(ex, "Failed to create anonymous donation");
            return Problem(
                detail: "Unable to save donation. Please try again or contact support.",
                statusCode: StatusCodes.Status500InternalServerError);
        }
    }

    private void LogDonationPersistenceFailure(Exception ex, string context)
    {
        if (ex is DbUpdateException dbEx && dbEx.InnerException is PostgresException pg)
        {
            logger.LogError(dbEx,
                "{Context}: Postgres {SqlState} — {MessageText}. Detail: {Detail}",
                context, pg.SqlState, pg.MessageText, pg.Detail);
            return;
        }

        logger.LogError(ex, "{Context}", context);
    }

    private async Task<Supporter> FindOrCreateSupporterForUser(ApplicationUser user)
    {
        var email = (user.Email ?? "").Trim();
        if (string.IsNullOrEmpty(email))
        {
            // Google/external accounts can lack an email claim; still need a unique-ish row for FK.
            email = $"user-{user.Id}@account.havenforher.local";
        }

        var existing = await db.Supporters.FirstOrDefaultAsync(s => s.Email == email);
        if (existing is not null)
            return existing;

        var display = (user.UserName ?? user.Email ?? email).Trim();
        if (string.IsNullOrEmpty(display))
            display = "Donor";

        var supporter = new Supporter
        {
            SupporterType = "Individual",
            DisplayName = display,
            Email = email,
            Phone = "",
            RelationshipType = "Local",
            Region = "Unknown",
            Country = "US",
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
        if (donorEmail is not null)
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
            Country = "US",
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
