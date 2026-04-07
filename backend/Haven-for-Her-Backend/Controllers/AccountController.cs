using Haven_for_Her_Backend.Data;
using Haven_for_Her_Backend.Dtos;
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
    /// Every user gets the Donor role by default. Volunteers also get Employee.
    /// Survivors also get Survivor.
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

        // Additive role based on persona
        if (request.Persona == "Volunteer")
            await userManager.AddToRoleAsync(user, AuthRoles.Employee);
        else if (request.Persona == "Survivor")
            await userManager.AddToRoleAsync(user, AuthRoles.Survivor);

        // Sign in immediately
        await signInManager.SignInAsync(user, isPersistent: false);

        return Ok(new { message = "Registration successful." });
    }
}
