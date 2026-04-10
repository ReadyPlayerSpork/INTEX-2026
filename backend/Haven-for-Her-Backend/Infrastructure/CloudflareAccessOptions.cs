namespace Haven_for_Her_Backend.Infrastructure;

/// <summary>
/// Configuration for Cloudflare Access JWT validation.
/// Bind from the "CloudflareAccess" config section.
/// </summary>
public class CloudflareAccessOptions
{
    public const string SectionName = "CloudflareAccess";

    /// <summary>Enable JWT validation. Disable in development (no Cloudflare Access in front).</summary>
    public bool Enabled { get; set; }

    /// <summary>Cloudflare Access team name (e.g. "myteam" → https://myteam.cloudflareaccess.com).</summary>
    public string TeamName { get; set; } = "";

    /// <summary>Application Audience (AUD) tags from the Access application config.</summary>
    public string[] AudTags { get; set; } = [];

    /// <summary>How long (minutes) to cache JWKS signing keys. Default 60.</summary>
    public int KeyCacheMinutes { get; set; } = 60;

    public string CertsUrl => $"https://{TeamName}.cloudflareaccess.com/cdn-cgi/access/certs";
    public string Issuer => $"https://{TeamName}.cloudflareaccess.com";
}
