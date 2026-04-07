using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Haven_for_Her_Backend.Models;

[Table("partners")]
public class Partner
{
    [Key]
    [Column("partner_id")]
    public int PartnerId { get; set; }

    [Column("partner_name")]
    public string PartnerName { get; set; } = null!;

    [Column("partner_type")]
    public string PartnerType { get; set; } = null!;

    [Column("role_type")]
    public string RoleType { get; set; } = null!;

    [Column("contact_name")]
    public string ContactName { get; set; } = null!;

    [Column("email")]
    public string Email { get; set; } = null!;

    [Column("phone")]
    public string Phone { get; set; } = null!;

    [Column("region")]
    public string Region { get; set; } = null!;

    [Column("status")]
    public string Status { get; set; } = null!;

    [Column("start_date")]
    public DateOnly StartDate { get; set; }

    [Column("end_date")]
    public DateOnly? EndDate { get; set; }

    [Column("notes")]
    public string? Notes { get; set; }

    // Navigation properties
    public ICollection<PartnerAssignment> PartnerAssignments { get; set; } = [];
    public ICollection<Donation> CreatedDonations { get; set; } = [];
}
