namespace Haven_for_Her_Backend.Dtos;

/// <summary>
/// Single row in the counselor resident timeline (sessions, visitations, case conferences).
/// </summary>
public class CounselorTimelineEventDto
{
    public string EventType { get; set; } = "";
    public string EventDate { get; set; } = "";
    public string Title { get; set; } = "";
    public string? Summary { get; set; }
    public string? Status { get; set; }
    public int? RecordingId { get; set; }
    public int? VisitationId { get; set; }
    public int? PlanId { get; set; }
    public string? DetailPath { get; set; }
}
