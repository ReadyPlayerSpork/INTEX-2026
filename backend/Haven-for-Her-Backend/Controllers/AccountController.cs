using Haven_for_Her_Backend.Data;
using Haven_for_Her_Backend.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace Haven_for_Her_Backend.Controllers;

[ApiController]
[Route("api/account")]
public class AccountController(
    UserManager<ApplicationUser> userManager,
    SignInManager<ApplicationUser> signInManager) : ControllerBase
{
    private static readonly HashSet<string> ValidPersonas = ["Donor", "Volunteer", "Survivor"];
    private static readonly HashSet<string> ValidSources =
        ["SocialMedia", "SearchEngine", "WordOfMouth", "Event", "Partner", "News", "Other"];

    /// <summary>
    /// Register a new user with persona selection and acquisition source.
    /// Every user gets the Donor role by default. Survivors also get Survivor.
    /// Employee is admin-granted only.
    /// </summary>
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        if (!ModelState.IsValid)
            return ValidationProblem();

        if (!ValidPersonas.Contains(request.Persona))
            return BadRequest(new ErrorResponse("Invalid persona. Allowed: Donor, Volunteer, Survivor"));

        if (!ValidSources.Contains(request.AcquisitionSource))
            return BadRequest(new ErrorResponse("Invalid acquisition source. Allowed: SocialMedia, SearchEngine, WordOfMouth, Event, Partner, News, Other"));

        var user = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
            Persona = request.Persona,
            AcquisitionSource = request.AcquisitionSource,
            AcquisitionDetail = request.AcquisitionDetail,
            CreatedAtUtc = DateTime.UtcNow,
        };

        var result = await userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            return BadRequest(new ErrorResponse(
                "Registration failed.",
                result.Errors.GroupBy(e => e.Code)
                    .ToDictionary(g => g.Key, g => g.Select(e => e.Description).ToArray())
            ));
        }

        // Every user gets Donor by default
        await userManager.AddToRoleAsync(user, AuthRoles.Donor);

        // Additive role based on persona (Employee is admin-granted only)
        if (request.Persona == "Survivor")
            await userManager.AddToRoleAsync(user, AuthRoles.Survivor);

        // Sign in immediately
        await signInManager.SignInAsync(user, isPersistent: false);

        return Ok(new { message = "Registration successful." });
    }

    [HttpGet("profile")]
    [Authorize]
    public async Task<IActionResult> GetProfile()
    {
        var user = await userManager.GetUserAsync(User);
        if (user is null) return Unauthorized();

        var roles = await userManager.GetRolesAsync(user);
        var has2Fa = await userManager.GetTwoFactorEnabledAsync(user);

        return Ok(new
        {
            email = user.Email,
            userName = user.UserName,
            phoneNumber = user.PhoneNumber,
            persona = user.Persona,
            twoFactorEnabled = has2Fa,
            roles,
            createdAt = user.CreatedAtUtc,
        });
    }

    [HttpPut("profile")]
    [Authorize]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        var user = await userManager.GetUserAsync(User);
        if (user is null) return Unauthorized();

        var changed = false;

        if (request.UserName is not null && request.UserName != user.UserName)
        {
            var setResult = await userManager.SetUserNameAsync(user, request.UserName);
            if (!setResult.Succeeded)
                return BadRequest(new ErrorResponse(
                    "Failed to update username.",
                    setResult.Errors.GroupBy(e => e.Code)
                        .ToDictionary(g => g.Key, g => g.Select(e => e.Description).ToArray())
                ));
            changed = true;
        }

        if (request.Email is not null && request.Email != user.Email)
        {
            var token = await userManager.GenerateChangeEmailTokenAsync(user, request.Email);
            var setResult = await userManager.ChangeEmailAsync(user, request.Email, token);
            if (!setResult.Succeeded)
                return BadRequest(new ErrorResponse(
                    "Failed to update email.",
                    setResult.Errors.GroupBy(e => e.Code)
                        .ToDictionary(g => g.Key, g => g.Select(e => e.Description).ToArray())
                ));
            changed = true;
        }

        if (request.PhoneNumber is not null && request.PhoneNumber != user.PhoneNumber)
        {
            var setResult = await userManager.SetPhoneNumberAsync(user, request.PhoneNumber);
            if (!setResult.Succeeded)
                return BadRequest(new ErrorResponse(
                    "Failed to update phone number.",
                    setResult.Errors.GroupBy(e => e.Code)
                        .ToDictionary(g => g.Key, g => g.Select(e => e.Description).ToArray())
                ));
            changed = true;
        }

        if (changed)
            await signInManager.RefreshSignInAsync(user);

        return Ok(new { message = "Profile updated." });
    }
}

public record UpdateProfileRequest
{
    public string? UserName { get; init; }
    public string? Email { get; init; }
    public string? PhoneNumber { get; init; }
}
