using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Intex_Placeholder.Models;

[Table("supporters")]
public class Supporter
{
    [Key]
    [Column("supporter_id")]
    public int SupporterId { get; set; }

    [Column("supporter_type")]
    public string SupporterType { get; set; } = null!;

    [Column("display_name")]
    public string DisplayName { get; set; } = null!;

    [Column("organization_name")]
    public string? OrganizationName { get; set; }

    [Column("first_name")]
    public string? FirstName { get; set; }

    [Column("last_name")]
    public string? LastName { get; set; }

    [Column("relationship_type")]
    public string RelationshipType { get; set; } = null!;

    [Column("region")]
    public string Region { get; set; } = null!;

    [Column("country")]
    public string Country { get; set; } = null!;

    [Column("email")]
    public string Email { get; set; } = null!;

    [Column("phone")]
    public string Phone { get; set; } = null!;

    [Column("status")]
    public string Status { get; set; } = null!;

    [Column("first_donation_date")]
    public DateOnly? FirstDonationDate { get; set; }

    [Column("acquisition_channel")]
    public string AcquisitionChannel { get; set; } = null!;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    // Navigation properties
    public ICollection<Donation> Donations { get; set; } = [];
}
