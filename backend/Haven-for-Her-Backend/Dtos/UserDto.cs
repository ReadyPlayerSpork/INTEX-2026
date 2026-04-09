namespace Haven_for_Her_Backend.Dtos;

public record UserDto
{
    public required string Id { get; init; }
    public required string Email { get; init; }
    public required string? Persona { get; init; }
    public required string? AcquisitionSource { get; init; }
    public required IReadOnlyList<string> Roles { get; init; }
    public required DateTime CreatedAtUtc { get; init; }
}

public record UserRoleChangeRequest
{
    public required string Role { get; init; }
}

public record CreateUserRequest
{
    public required string Email { get; init; }
    public required string Password { get; init; }
    /// <summary>Optional initial roles to assign (invalid values are ignored).</summary>
    public List<string>? Roles { get; init; }
}
