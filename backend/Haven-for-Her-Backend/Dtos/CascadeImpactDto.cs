namespace Haven_for_Her_Backend.Dtos;

public sealed class CascadeImpactDto
{
    public string Label { get; init; } = string.Empty;
    public int Count { get; init; }
    public string Action { get; init; } = "delete";
    public IReadOnlyList<string> Records { get; init; } = [];
}
