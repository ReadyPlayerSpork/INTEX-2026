using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Haven_for_Her_Backend.Models;

[Table("home_visitations")]
public class HomeVisitation
{
    [Key]
    [Column("visitation_id")]
    public int VisitationId { get; set; }

    [Column("resident_id")]
    public int ResidentId { get; set; }

    [Column("visit_date")]
    public DateOnly VisitDate { get; set; }

    [Column("social_worker")]
    public string SocialWorker { get; set; } = null!;

    [Column("visit_type")]
    public string VisitType { get; set; } = null!;

    [Column("location_visited")]
    public string LocationVisited { get; set; } = null!;

    [Column("family_members_present")]
    public string FamilyMembersPresent { get; set; } = null!;

    [Column("purpose")]
    public string Purpose { get; set; } = null!;

    [Column("observations")]
    public string Observations { get; set; } = null!;

    [Column("family_cooperation_level")]
    public string FamilyCooperationLevel { get; set; } = null!;

    [Column("safety_concerns_noted")]
    public bool SafetyConcernsNoted { get; set; }

    [Column("follow_up_needed")]
    public bool FollowUpNeeded { get; set; }

    [Column("follow_up_notes")]
    public string? FollowUpNotes { get; set; }

    [Column("visit_outcome")]
    public string VisitOutcome { get; set; } = null!;

    // Navigation properties
    [ForeignKey(nameof(ResidentId))]
    public Resident Resident { get; set; } = null!;
}
