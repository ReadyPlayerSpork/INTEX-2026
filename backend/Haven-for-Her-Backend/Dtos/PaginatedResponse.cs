namespace Haven_for_Her_Backend.Dtos;

/// <summary>
/// Standard paginated list response. All list endpoints should return this shape.
/// </summary>
public record PaginatedResponse<T>(
    IReadOnlyList<T> Items,
    int Page,
    int PageSize,
    int TotalCount
)
{
    public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
    public bool HasPrevious => Page > 1;
    public bool HasNext => Page < TotalPages;
}
