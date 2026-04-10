using System.ComponentModel.DataAnnotations;

namespace Haven_for_Her_Backend.Models;

public class MLRetrainSchedule
{
    [Key]
    public int Id { get; set; }
    
    public bool IsEnabled { get; set; }
    
    [Required]
    public string Frequency { get; set; } = "Daily"; // Daily, Weekly, Monthly
    
    public int Hour { get; set; } // 0-23
    public int Minute { get; set; } // 0-59
    
    public DayOfWeek? DayOfWeek { get; set; }
    
    public int? DayOfMonth { get; set; }
    
    public DateTime? LastRun { get; set; }
    
    public string? LastRunStatus { get; set; }
    
    public DateTime? NextRun { get; set; }
}
