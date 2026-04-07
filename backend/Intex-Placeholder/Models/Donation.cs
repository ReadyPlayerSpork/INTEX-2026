using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Intex_Placeholder.Models;

[Table("donations")]
public class Donation
{
    [Key]
    [Column("donation_id")]
    public int DonationId { get; set; }

    [Column("supporter_id")]
    public int SupporterId { get; set; }

    [Column("donation_type")]
    public string DonationType { get; set; } = null!;

    [Column("donation_date")]
    public DateOnly DonationDate { get; set; }

    [Column("channel_source")]
    public string ChannelSource { get; set; } = null!;

    [Column("currency_code")]
    public string? CurrencyCode { get; set; }

    [Column("amount")]
    public decimal? Amount { get; set; }

    [Column("estimated_value")]
    public decimal? EstimatedValue { get; set; }

    [Column("impact_unit")]
    public string? ImpactUnit { get; set; }

    [Column("is_recurring")]
    public bool IsRecurring { get; set; }

    [Column("campaign_name")]
    public string? CampaignName { get; set; }

    [Column("notes")]
    public string? Notes { get; set; }

    [Column("created_by_partner_id")]
    public int? CreatedByPartnerId { get; set; }

    [Column("referral_post_id")]
    public int? ReferralPostId { get; set; }

    // Navigation properties
    [ForeignKey(nameof(SupporterId))]
    public Supporter Supporter { get; set; } = null!;

    [ForeignKey(nameof(CreatedByPartnerId))]
    public Partner? CreatedByPartner { get; set; }

    [ForeignKey(nameof(ReferralPostId))]
    public SocialMediaPost? ReferralPost { get; set; }

    public ICollection<InKindDonationItem> InKindItems { get; set; } = [];
    public ICollection<DonationAllocation> Allocations { get; set; } = [];
}
