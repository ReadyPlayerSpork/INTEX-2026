using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Haven_for_Her_Backend.Models;

[Table("intervention_plans")]
public class InterventionPlan
{
    [Key]
    [Column("plan_id")]
    public int PlanId { get; set; }

    [Column("resident_id")]
    public int ResidentId { get; set; }

    [Column("plan_category")]
    public string PlanCategory { get; set; } = null!;

    [Column("plan_description")]
    public string PlanDescription { get; set; } = null!;

    [Column("services_provided")]
    public string ServicesProvided { get; set; } = null!;

    [Column("target_value")]
    public decimal? TargetValue { get; set; }

    [Column("target_date")]
    public DateOnly TargetDate { get; set; }

    [Column("status")]
    public string Status { get; set; } = null!;

    [Column("case_conference_date")]
    public DateOnly? CaseConferenceDate { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    [ForeignKey(nameof(ResidentId))]
    [JsonIgnore]
    public Resident Resident { get; set; } = null!;
}
