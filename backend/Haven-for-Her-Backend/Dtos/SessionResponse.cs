namespace Haven_for_Her_Backend.Dtos;

/// <summary>
/// Returned by GET /api/auth/me to describe the current user session.
/// </summary>
public record SessionResponse(
    bool IsAuthenticated,
    string? UserName,
    string? Email,
    IReadOnlyList<string> Roles,
    bool TwoFactorEnabled = false
);
