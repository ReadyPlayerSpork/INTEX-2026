using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Intex_Placeholder.Models;

[Table("safehouses")]
public class Safehouse
{
    [Key]
    [Column("safehouse_id")]
    public int SafehouseId { get; set; }

    [Column("safehouse_code")]
    public string SafehouseCode { get; set; } = null!;

    [Column("name")]
    public string Name { get; set; } = null!;

    [Column("region")]
    public string Region { get; set; } = null!;

    [Column("city")]
    public string City { get; set; } = null!;

    [Column("province")]
    public string Province { get; set; } = null!;

    [Column("country")]
    public string Country { get; set; } = null!;

    [Column("open_date")]
    public DateOnly OpenDate { get; set; }

    [Column("status")]
    public string Status { get; set; } = null!;

    [Column("capacity_girls")]
    public int CapacityGirls { get; set; }

    [Column("capacity_staff")]
    public int CapacityStaff { get; set; }

    [Column("current_occupancy")]
    public int CurrentOccupancy { get; set; }

    [Column("notes")]
    public string? Notes { get; set; }

    // Navigation properties
    public ICollection<PartnerAssignment> PartnerAssignments { get; set; } = [];
    public ICollection<Resident> Residents { get; set; } = [];
    public ICollection<DonationAllocation> DonationAllocations { get; set; } = [];
    public ICollection<IncidentReport> IncidentReports { get; set; } = [];
    public ICollection<SafehouseMonthlyMetric> MonthlyMetrics { get; set; } = [];
}
