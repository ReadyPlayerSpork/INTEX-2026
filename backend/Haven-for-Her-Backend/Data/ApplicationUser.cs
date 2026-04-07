using Microsoft.AspNetCore.Identity;

namespace Haven_for_Her_Backend.Data;

public class ApplicationUser : IdentityUser
{
    /// <summary>
    /// User's self-selected persona during registration (e.g. "Donor", "Volunteer", "Survivor").
    /// Used for personalization/routing, not for RBAC.
    /// </summary>
    public string? Persona { get; set; }

    /// <summary>
    /// Structured acquisition source — how the user heard about the organization.
    /// Normalized values: SocialMedia, SearchEngine, WordOfMouth, Event, Partner, News, Other.
    /// </summary>
    public string? AcquisitionSource { get; set; }

    /// <summary>
    /// Optional free-text detail for the acquisition source (e.g. "Facebook ad about counseling").
    /// </summary>
    public string? AcquisitionDetail { get; set; }

    /// <summary>
    /// When the user account was created (UTC).
    /// </summary>
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}
