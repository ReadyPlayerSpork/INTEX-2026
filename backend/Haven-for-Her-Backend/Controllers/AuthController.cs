using System.Security.Claims;
using Haven_for_Her_Backend.Data;
using Haven_for_Her_Backend.Dtos;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.WebUtilities;

namespace Haven_for_Her_Backend.Controllers;

[ApiController]
[Route("api/auth")]
[EnableRateLimiting("auth")]
public class AuthController(
    UserManager<ApplicationUser> userManager,
    SignInManager<ApplicationUser> signInManager,
    IConfiguration configuration) : ControllerBase
{
    private const string DefaultFrontendUrl = "https://localhost:5173";
    private const string DefaultExternalReturnPath = "/";

    [HttpGet("me")]
    public async Task<IActionResult> GetCurrentSession()
    {
        if (User.Identity?.IsAuthenticated != true)
        {
            return Ok(new SessionResponse(false, null, null, []));
        }

        var user = await userManager.GetUserAsync(User);
        var roles = User.Claims
            .Where(claim => claim.Type == ClaimTypes.Role)
            .Select(claim => claim.Value)
            .Distinct()
            .OrderBy(role => role)
            .ToArray();

        var twoFactorEnabled = user is not null && await userManager.GetTwoFactorEnabledAsync(user);

        return Ok(new SessionResponse(
            true,
            user?.UserName ?? User.Identity?.Name,
            user?.Email,
            roles,
            twoFactorEnabled));
    }

    [HttpGet("providers")]
    public IActionResult GetExternalProviders()
    {
        var providers = new List<object>();

        if (IsGoogleConfigured())
        {
            providers.Add(new
            {
                name = GoogleDefaults.AuthenticationScheme,
                displayName = "Google"
            });
        }

        return Ok(providers);
    }

    [HttpGet("external-login")]
    public IActionResult ExternalLogin(
        [FromQuery] string provider,
        [FromQuery] string? returnPath = null)
    {
        if (!string.Equals(provider, GoogleDefaults.AuthenticationScheme, StringComparison.OrdinalIgnoreCase) ||
            !IsGoogleConfigured())
        {
            return BadRequest(new
            {
                message = "The requested external login provider is not available."
            });
        }

        var callbackUrl = Url.Action(nameof(ExternalLoginCallback), new
        {
            returnPath = NormalizeReturnPath(returnPath)
        });

        if (string.IsNullOrWhiteSpace(callbackUrl))
        {
            return Problem("Unable to create the external login callback URL.");
        }

        var properties = signInManager.ConfigureExternalAuthenticationProperties(
            GoogleDefaults.AuthenticationScheme,
            callbackUrl);

        return Challenge(properties, GoogleDefaults.AuthenticationScheme);
    }

    [HttpGet("external-callback")]
    public async Task<IActionResult> ExternalLoginCallback([FromQuery] string? returnPath = null, [FromQuery] string? remoteError = null)
    {
        if (!string.IsNullOrWhiteSpace(remoteError))
        {
            return Redirect(BuildFrontendErrorUrl("External login failed."));
        }

        var info = await signInManager.GetExternalLoginInfoAsync();

        if (info is null)
        {
            return Redirect(BuildFrontendErrorUrl("External login information was unavailable."));
        }

        var signInResult = await signInManager.ExternalLoginSignInAsync(
            info.LoginProvider,
            info.ProviderKey,
            isPersistent: false,
            bypassTwoFactor: true);

        if (signInResult.Succeeded)
        {
            return Redirect(BuildFrontendSuccessUrl(returnPath));
        }

        var email = info.Principal.FindFirstValue(ClaimTypes.Email) ??
            info.Principal.FindFirstValue("email");

        if (string.IsNullOrWhiteSpace(email))
        {
            return Redirect(BuildFrontendErrorUrl("The external provider did not return an email address."));
        }

        var user = await userManager.FindByEmailAsync(email);

        if (user is null)
        {
            user = new ApplicationUser
            {
                UserName = email,
                Email = email,
                EmailConfirmed = true
            };

            var createUserResult = await userManager.CreateAsync(user);

            if (!createUserResult.Succeeded)
            {
                return Redirect(BuildFrontendErrorUrl("Unable to create a local account for the external login."));
            }
        }

        var addLoginResult = await userManager.AddLoginAsync(user, info);

        if (!addLoginResult.Succeeded)
        {
            return Redirect(BuildFrontendErrorUrl("Unable to associate the external login with the local account."));
        }

        await signInManager.SignInAsync(user, isPersistent: false, info.LoginProvider);
        return Redirect(BuildFrontendSuccessUrl(returnPath));
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var user = await userManager.FindByEmailAsync(request.Email);
        if (user is null)
            return Unauthorized(new { message = "Invalid email or password." });

        var result = await signInManager.PasswordSignInAsync(
            user, request.Password, isPersistent: false, lockoutOnFailure: true);

        if (result.IsLockedOut)
            return StatusCode(StatusCodes.Status429TooManyRequests,
                new { message = "Account locked due to too many failed attempts. Please try again later." });

        if (result.RequiresTwoFactor)
            return Ok(new { requiresTwoFactor = true, message = "Two-factor authentication required." });

        if (!result.Succeeded)
            return Unauthorized(new { message = "Invalid email or password." });

        return Ok(new { requiresTwoFactor = false, message = "Login successful." });
    }

    [HttpPost("login-2fa")]
    public async Task<IActionResult> LoginTwoFactor([FromBody] LoginTwoFactorRequest request)
    {
        var user = await signInManager.GetTwoFactorAuthenticationUserAsync();
        if (user is null)
            return Unauthorized(new { message = "Two-factor session expired. Please log in again." });

        var result = await signInManager.TwoFactorAuthenticatorSignInAsync(
            request.Code, isPersistent: false, rememberClient: false);

        if (!result.Succeeded)
            return Unauthorized(new { message = "Invalid authenticator code." });

        return Ok(new { message = "Login successful." });
    }

    // ── 2FA Management ──────────────────────────────────────────────

    [HttpGet("2fa/status")]
    [Microsoft.AspNetCore.Authorization.Authorize]
    public async Task<IActionResult> GetTwoFactorStatus()
    {
        var user = await userManager.GetUserAsync(User);
        if (user is null) return Unauthorized();

        var isEnabled = await userManager.GetTwoFactorEnabledAsync(user);
        return Ok(new TwoFactorStatusResponse(isEnabled));
    }

    [HttpPost("2fa/setup")]
    [Microsoft.AspNetCore.Authorization.Authorize]
    public async Task<IActionResult> SetupTwoFactor()
    {
        var user = await userManager.GetUserAsync(User);
        if (user is null) return Unauthorized();

        await userManager.ResetAuthenticatorKeyAsync(user);
        var unformattedKey = await userManager.GetAuthenticatorKeyAsync(user);
        if (string.IsNullOrEmpty(unformattedKey))
            return Problem("Unable to generate authenticator key.");

        var email = await userManager.GetEmailAsync(user) ?? "user";
        var uri = $"otpauth://totp/HavenForHer:{Uri.EscapeDataString(email)}?secret={unformattedKey}&issuer=HavenForHer&digits=6";

        return Ok(new TwoFactorSetupResponse(FormatKey(unformattedKey), uri));
    }

    [HttpPost("2fa/verify")]
    [Microsoft.AspNetCore.Authorization.Authorize]
    public async Task<IActionResult> VerifyAndEnableTwoFactor([FromBody] TwoFactorVerifyRequest request)
    {
        var user = await userManager.GetUserAsync(User);
        if (user is null) return Unauthorized();

        var code = request.Code.Replace(" ", "").Replace("-", "");
        var isValid = await userManager.VerifyTwoFactorTokenAsync(
            user, userManager.Options.Tokens.AuthenticatorTokenProvider, code);

        if (!isValid)
            return BadRequest(new { message = "Invalid verification code. Please try again." });

        await userManager.SetTwoFactorEnabledAsync(user, true);
        return Ok(new { message = "Two-factor authentication has been enabled." });
    }

    [HttpPost("2fa/disable")]
    [Microsoft.AspNetCore.Authorization.Authorize]
    public async Task<IActionResult> DisableTwoFactor()
    {
        var user = await userManager.GetUserAsync(User);
        if (user is null) return Unauthorized();

        await userManager.SetTwoFactorEnabledAsync(user, false);
        await userManager.ResetAuthenticatorKeyAsync(user);
        return Ok(new { message = "Two-factor authentication has been disabled." });
    }

    private static string FormatKey(string unformattedKey)
    {
        var sb = new System.Text.StringBuilder();
        for (var i = 0; i < unformattedKey.Length; i++)
        {
            if (i > 0 && i % 4 == 0) sb.Append(' ');
            sb.Append(unformattedKey[i]);
        }
        return sb.ToString();
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        await signInManager.SignOutAsync();

        return Ok(new
        {
            message = "Logout successful."
        });
    }

    private bool IsGoogleConfigured()
    {
        return !string.IsNullOrWhiteSpace(configuration["Authentication:Google:ClientId"]) &&
            !string.IsNullOrWhiteSpace(configuration["Authentication:Google:ClientSecret"]);
    }

    private string NormalizeReturnPath(string? returnPath)
    {
        if (string.IsNullOrWhiteSpace(returnPath) || !returnPath.StartsWith('/'))
        {
            return DefaultExternalReturnPath;
        }

        return returnPath;
    }

    private string ResolvedFrontendUrl =>
        configuration["FrontendUrl"] ??
        configuration["FrontendUrls"]?.Split(',', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries).FirstOrDefault() ??
        DefaultFrontendUrl;
    
    private string BuildFrontendSuccessUrl(string? returnPath)
    {
        return $"{ResolvedFrontendUrl.TrimEnd('/')}{NormalizeReturnPath(returnPath)}";
    }

    private string BuildFrontendErrorUrl(string errorMessage)
    {
        var loginUrl = $"{ResolvedFrontendUrl.TrimEnd('/')}/login";
        return QueryHelpers.AddQueryString(loginUrl, "externalError", errorMessage);
    }
}
