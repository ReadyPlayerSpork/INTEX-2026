using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;

namespace Haven_for_Her_Backend.Infrastructure;

/// <summary>
/// Validates the Cloudflare Access JWT (<c>Cf-Access-Jwt-Assertion</c> header)
/// on every request. When <see cref="CloudflareAccessOptions.Enabled"/> is false
/// (e.g. local dev), the middleware is a no-op pass-through.
///
/// Cloudflare docs: https://developers.cloudflare.com/cloudflare-one/identity/authorization-cookie/validating-json/
/// </summary>
public class CloudflareAccessMiddleware
{
    private const string JwtHeader = "Cf-Access-Jwt-Assertion";
    private const string JwtCookie = "CF_Authorization";

    private readonly RequestDelegate _next;
    private readonly CloudflareAccessOptions _options;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<CloudflareAccessMiddleware> _logger;

    private IList<SecurityKey>? _cachedKeys;
    private DateTime _cacheExpiry = DateTime.MinValue;
    private readonly SemaphoreSlim _refreshLock = new(1, 1);

    public CloudflareAccessMiddleware(
        RequestDelegate next,
        CloudflareAccessOptions options,
        IHttpClientFactory httpClientFactory,
        ILogger<CloudflareAccessMiddleware> logger)
    {
        _next = next;
        _options = options;
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        if (!_options.Enabled)
        {
            await _next(context);
            return;
        }

        // Cloudflare recommends the header; cookie is a browser-only fallback.
        var token = context.Request.Headers[JwtHeader].FirstOrDefault()
                    ?? context.Request.Cookies[JwtCookie];

        if (string.IsNullOrEmpty(token))
        {
            _logger.LogWarning("Cloudflare Access JWT missing on {Method} {Path}",
                context.Request.Method, context.Request.Path);
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            await context.Response.WriteAsJsonAsync(new { error = "Access denied — missing Cloudflare Access token." });
            return;
        }

        try
        {
            var keys = await GetSigningKeysAsync();
            var handler = new JwtSecurityTokenHandler();

            var validationParams = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidIssuer = _options.Issuer,
                ValidateAudience = true,
                ValidAudiences = _options.AudTags,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                IssuerSigningKeys = keys,
                // Cloudflare tokens have tight expiry; keep skew small.
                ClockSkew = TimeSpan.FromMinutes(1),
            };

            var principal = handler.ValidateToken(token, validationParams, out _);

            // Forward Cloudflare claims so downstream code can read them if needed.
            context.Items["CfAccessEmail"] = principal.FindFirst("email")?.Value;
            context.Items["CfAccessSub"] = principal.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;

            _logger.LogDebug("Cloudflare Access JWT valid for {Email}", context.Items["CfAccessEmail"]);
        }
        catch (SecurityTokenException ex)
        {
            _logger.LogWarning(ex, "Cloudflare Access JWT validation failed on {Method} {Path}",
                context.Request.Method, context.Request.Path);
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            await context.Response.WriteAsJsonAsync(new { error = "Access denied — invalid Cloudflare Access token." });
            return;
        }

        await _next(context);
    }

    /// <summary>
    /// Fetches and caches signing keys from the Cloudflare JWKS endpoint.
    /// Keys are cached for <see cref="CloudflareAccessOptions.KeyCacheMinutes"/>.
    /// Uses double-checked locking to avoid stampede on cache miss.
    /// </summary>
    private async Task<IList<SecurityKey>> GetSigningKeysAsync()
    {
        if (_cachedKeys is not null && DateTime.UtcNow < _cacheExpiry)
            return _cachedKeys;

        await _refreshLock.WaitAsync();
        try
        {
            // Double-check after acquiring lock.
            if (_cachedKeys is not null && DateTime.UtcNow < _cacheExpiry)
                return _cachedKeys;

            var client = _httpClientFactory.CreateClient();
            var json = await client.GetStringAsync(_options.CertsUrl);
            var jwks = new JsonWebKeySet(json);

            _cachedKeys = jwks.GetSigningKeys();
            _cacheExpiry = DateTime.UtcNow.AddMinutes(_options.KeyCacheMinutes);

            _logger.LogInformation("Refreshed Cloudflare Access JWKS — {Count} key(s) from {Url}",
                _cachedKeys.Count, _options.CertsUrl);

            return _cachedKeys;
        }
        finally
        {
            _refreshLock.Release();
        }
    }
}

public static class CloudflareAccessMiddlewareExtensions
{
    public static IApplicationBuilder UseCloudflareAccessValidation(this IApplicationBuilder app)
        => app.UseMiddleware<CloudflareAccessMiddleware>();
}
