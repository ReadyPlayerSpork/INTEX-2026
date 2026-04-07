using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Haven_for_Her_Backend.Models;

[Table("education_records")]
public class EducationRecord
{
    [Key]
    [Column("education_record_id")]
    public int EducationRecordId { get; set; }

    [Column("resident_id")]
    public int ResidentId { get; set; }

    [Column("record_date")]
    public DateOnly RecordDate { get; set; }

    [Column("school_name")]
    public string SchoolName { get; set; } = null!;

    [Column("education_level")]
    public string EducationLevel { get; set; } = null!;

    [Column("enrollment_status")]
    public string EnrollmentStatus { get; set; } = null!;

    [Column("attendance_rate")]
    public decimal AttendanceRate { get; set; }

    [Column("progress_percent")]
    public decimal ProgressPercent { get; set; }

    [Column("completion_status")]
    public string CompletionStatus { get; set; } = null!;

    [Column("notes")]
    public string? Notes { get; set; }

    // Navigation properties
    [ForeignKey(nameof(ResidentId))]
    public Resident Resident { get; set; } = null!;
}
