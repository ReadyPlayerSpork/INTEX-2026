namespace Haven_for_Her_Backend.Dtos;

public record DonationRequest
{
    /// <summary>Omitted or empty defaults to Monetary for website cash gifts.</summary>
    public string? DonationType { get; init; }

    public decimal? Amount { get; init; }

    public string? CurrencyCode { get; init; } = "USD";

    public string? CampaignName { get; init; }

    public string? Notes { get; init; }

    /// <summary>Donor intent only; no automated billing is performed by this API.</summary>
    public bool IsRecurring { get; init; }

    /// <summary>
    /// For anonymous donations — optional contact info for receipts.
    /// </summary>
    public string? DonorName { get; init; }
    public string? DonorEmail { get; init; }
}
