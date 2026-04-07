using System.ComponentModel.DataAnnotations;

namespace Haven_for_Her_Backend.Dtos;

public record DonationRequest
{
    [Required]
    public required string DonationType { get; init; }

    public decimal? Amount { get; init; }

    public string? CurrencyCode { get; init; } = "PHP";

    public string? CampaignName { get; init; }

    public string? Notes { get; init; }

    /// <summary>
    /// For anonymous donations — optional contact info for receipts.
    /// </summary>
    public string? DonorName { get; init; }
    public string? DonorEmail { get; init; }
}
