using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Haven_for_Her_Backend.Models;

[Table("counseling_requests")]
public class CounselingRequest
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("request_id")]
    public int RequestId { get; set; }

    [Required]
    [Column("requested_by_user_id")]
    public string RequestedByUserId { get; set; } = null!;

    [Required]
    [Column("reason")]
    public string Reason { get; set; } = null!;

    [Column("preferred_day")]
    public string? PreferredDay { get; set; }

    [Column("preferred_time_of_day")]
    public string? PreferredTimeOfDay { get; set; }

    [Column("notes")]
    public string? Notes { get; set; }

    /// <summary>
    /// Open, Assigned, Completed, Cancelled
    /// </summary>
    [Required]
    [Column("status")]
    public string Status { get; set; } = "Open";

    [Column("assigned_counselor_user_id")]
    public string? AssignedCounselorUserId { get; set; }

    [Column("created_at_utc")]
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}
