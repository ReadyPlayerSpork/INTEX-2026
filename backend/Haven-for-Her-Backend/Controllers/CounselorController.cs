using Haven_for_Her_Backend.Data;
using Haven_for_Her_Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Haven_for_Her_Backend.Controllers;

[ApiController]
[Route("api/counselor")]
[Authorize(Roles = AuthRoles.Counselor)]
public class CounselorController(
    HavenForHerBackendDbContext db,
    UserManager<ApplicationUser> userManager) : ControllerBase
{
    /// <summary>
    /// Counselor dashboard: assigned residents, recent sessions, open request count.
    /// </summary>
    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard()
    {
        var email = (await userManager.GetUserAsync(User))?.Email ?? "";

        var assignedResidents = await db.Residents
            .Where(r => r.AssignedSocialWorker == email)
            .Include(r => r.Safehouse)
            .OrderByDescending(r => r.DateOfAdmission)
            .Select(r => new
            {
                r.ResidentId,
                r.CaseControlNo,
                r.InternalCode,
                r.CaseStatus,
                r.CurrentRiskLevel,
                r.DateOfAdmission,
                SafehouseName = r.Safehouse.Name,
            })
            .ToListAsync();

        var recentSessions = await db.ProcessRecordings
            .Where(pr => pr.SocialWorker == email)
            .OrderByDescending(pr => pr.SessionDate)
            .Take(10)
            .Select(pr => new
            {
                pr.RecordingId,
                pr.ResidentId,
                pr.SessionDate,
                pr.SessionType,
                pr.SessionDurationMinutes,
                pr.EmotionalStateObserved,
                pr.EmotionalStateEnd,
                pr.ProgressNoted,
                pr.ConcernsFlagged,
            })
            .ToListAsync();

        var openRequests = await db.CounselingRequests
            .CountAsync(cr => cr.Status == "Open");

        return Ok(new
        {
            assignedResidents,
            recentSessions,
            openRequests,
        });
    }

    /// <summary>
    /// Paginated process recordings for the counselor's assigned residents.
    /// </summary>
    [HttpGet("sessions")]
    public async Task<IActionResult> GetSessions(
        [FromQuery] int? residentId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var email = (await userManager.GetUserAsync(User))?.Email ?? "";

        var assignedResidentIds = await db.Residents
            .Where(r => r.AssignedSocialWorker == email)
            .Select(r => r.ResidentId)
            .ToListAsync();

        var query = db.ProcessRecordings
            .Where(pr => assignedResidentIds.Contains(pr.ResidentId));

        if (residentId.HasValue)
            query = query.Where(pr => pr.ResidentId == residentId.Value);

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(pr => pr.SessionDate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return Ok(new { totalCount, page, pageSize, items });
    }

    /// <summary>
    /// Create a new process recording.
    /// </summary>
    [HttpPost("sessions")]
    public async Task<IActionResult> CreateSession([FromBody] ProcessRecording recording)
    {
        if (!ModelState.IsValid) return ValidationProblem();

        var email = (await userManager.GetUserAsync(User))?.Email ?? "";

        // Verify the resident is assigned to this counselor
        var resident = await db.Residents.FindAsync(recording.ResidentId);
        if (resident is null) return NotFound(new { message = "Resident not found." });
        if (resident.AssignedSocialWorker != email)
            return Forbid();

        recording.RecordingId = 0; // ensure new
        recording.SocialWorker = email;

        db.ProcessRecordings.Add(recording);
        await db.SaveChangesAsync();

        return Ok(new { message = "Session recorded.", recordingId = recording.RecordingId });
    }

    /// <summary>
    /// Paginated home visitations for the counselor's assigned residents.
    /// </summary>
    [HttpGet("visitations")]
    public async Task<IActionResult> GetVisitations(
        [FromQuery] int? residentId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var email = (await userManager.GetUserAsync(User))?.Email ?? "";

        var assignedResidentIds = await db.Residents
            .Where(r => r.AssignedSocialWorker == email)
            .Select(r => r.ResidentId)
            .ToListAsync();

        var query = db.HomeVisitations
            .Where(hv => assignedResidentIds.Contains(hv.ResidentId));

        if (residentId.HasValue)
            query = query.Where(hv => hv.ResidentId == residentId.Value);

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(hv => hv.VisitDate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return Ok(new { totalCount, page, pageSize, items });
    }

    /// <summary>
    /// Create a new home visitation.
    /// </summary>
    [HttpPost("visitations")]
    public async Task<IActionResult> CreateVisitation([FromBody] HomeVisitation visitation)
    {
        if (!ModelState.IsValid) return ValidationProblem();

        var email = (await userManager.GetUserAsync(User))?.Email ?? "";

        var resident = await db.Residents.FindAsync(visitation.ResidentId);
        if (resident is null) return NotFound(new { message = "Resident not found." });
        if (resident.AssignedSocialWorker != email)
            return Forbid();

        visitation.VisitationId = 0;
        visitation.SocialWorker = email;

        db.HomeVisitations.Add(visitation);
        await db.SaveChangesAsync();

        return Ok(new { message = "Visitation recorded.", visitationId = visitation.VisitationId });
    }
}
