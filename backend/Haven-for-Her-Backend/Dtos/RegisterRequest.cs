using System.ComponentModel.DataAnnotations;

namespace Haven_for_Her_Backend.Dtos;

public record RegisterRequest
{
    [Required, EmailAddress]
    public required string Email { get; init; }

    [Required, MinLength(14)]
    public required string Password { get; init; }

    /// <summary>
    /// Self-selected persona: "Donor", "Volunteer", or "Survivor".
    /// Used for UX personalization, not exclusive RBAC.
    /// </summary>
    [Required]
    public required string Persona { get; init; }

    /// <summary>
    /// How the user heard about the organization.
    /// Allowed: SocialMedia, SearchEngine, WordOfMouth, Event, Partner, News, Other.
    /// </summary>
    [Required]
    public required string AcquisitionSource { get; init; }

    /// <summary>
    /// Optional free-text detail for the acquisition source.
    /// </summary>
    public string? AcquisitionDetail { get; init; }
}
