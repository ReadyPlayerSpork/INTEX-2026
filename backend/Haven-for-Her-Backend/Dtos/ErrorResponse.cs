namespace Haven_for_Her_Backend.Dtos;

/// <summary>
/// Standard error response shape for non-ProblemDetails errors.
/// </summary>
public record ErrorResponse(
    string Message,
    IDictionary<string, string[]>? Errors = null
);
