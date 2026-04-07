using System.ComponentModel.DataAnnotations;

namespace Haven_for_Her_Backend.Dtos;

public record CreateCounselingRequest
{
    [Required]
    public required string Reason { get; init; }

    public string? PreferredDay { get; init; }

    public string? PreferredTimeOfDay { get; init; }

    public string? Notes { get; init; }
}

public record CounselingRequestDto
{
    public required int Id { get; init; }
    public required string RequestedByEmail { get; init; }
    public required string Reason { get; init; }
    public string? PreferredDay { get; init; }
    public string? PreferredTimeOfDay { get; init; }
    public string? Notes { get; init; }
    public required string Status { get; init; }
    public string? AssignedCounselorEmail { get; init; }
    public required DateTime CreatedAtUtc { get; init; }
}
