using Haven_for_Her_Backend.Data;
using Haven_for_Her_Backend.Dtos;
using Haven_for_Her_Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Haven_for_Her_Backend.Controllers;

[ApiController]
[Route("api/counselor")]
[Authorize(Roles = "Counselor,Admin")]
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
        var isAdmin = User.IsInRole(AuthRoles.Admin);

        var assignedResidentsQuery = db.Residents.AsQueryable();
        if (!isAdmin)
        {
            assignedResidentsQuery = assignedResidentsQuery.Where(r =>
                r.AssignedSocialWorker != null
                && r.AssignedSocialWorker.ToLower() == email.ToLowerInvariant());
        }

        var assignedResidents = await assignedResidentsQuery
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

        var scopedIds = await GetScopedResidentIdsAsync(email);
        var recentSessions = await db.ProcessRecordings
            .Where(pr => scopedIds.Contains(pr.ResidentId))
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
        [FromQuery] string? sessionType,
        [FromQuery] DateOnly? dateFrom,
        [FromQuery] DateOnly? dateTo,
        [FromQuery] bool? concernsOnly,
        [FromQuery] string? sort,
        [FromQuery] string? direction,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var email = (await userManager.GetUserAsync(User))?.Email ?? "";

        var assignedResidentIds = await GetScopedResidentIdsAsync(email);

        var query = db.ProcessRecordings
            .Where(pr => assignedResidentIds.Contains(pr.ResidentId));

        if (residentId.HasValue)
            query = query.Where(pr => pr.ResidentId == residentId.Value);
        if (!string.IsNullOrWhiteSpace(sessionType))
            query = query.Where(pr => pr.SessionType == sessionType);
        if (dateFrom.HasValue)
            query = query.Where(pr => pr.SessionDate >= dateFrom.Value);
        if (dateTo.HasValue)
            query = query.Where(pr => pr.SessionDate <= dateTo.Value);
        if (concernsOnly == true)
            query = query.Where(pr => pr.ConcernsFlagged);

        var totalCount = await query.CountAsync();

        var desc = string.Equals(direction, "desc", StringComparison.OrdinalIgnoreCase);
        query = sort?.ToLower() switch
        {
            "sessiondate" => desc ? query.OrderByDescending(pr => pr.SessionDate) : query.OrderBy(pr => pr.SessionDate),
            "sessiontype" => desc ? query.OrderByDescending(pr => pr.SessionType) : query.OrderBy(pr => pr.SessionType),
            "sessiondurationminutes" => desc ? query.OrderByDescending(pr => pr.SessionDurationMinutes) : query.OrderBy(pr => pr.SessionDurationMinutes),
            "residentid" => desc ? query.OrderByDescending(pr => pr.ResidentId) : query.OrderBy(pr => pr.ResidentId),
            _ => query.OrderByDescending(pr => pr.SessionDate),
        };

        var items = await query
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
        // DB columns are non-nullable text; frontend may send null for optional fields.
        recording.EmotionalStateObserved ??= string.Empty;
        recording.EmotionalStateEnd ??= string.Empty;
        recording.SessionNarrative ??= string.Empty;
        recording.InterventionsApplied ??= string.Empty;
        recording.FollowUpActions ??= string.Empty;

        ModelState.Clear();
        TryValidateModel(recording);
        if (!ModelState.IsValid) return ValidationProblem();

        var email = (await userManager.GetUserAsync(User))?.Email ?? "";
        var isAdmin = User.IsInRole(AuthRoles.Admin);

        // Verify the resident is assigned to this counselor (Admin may record for any resident)
        var resident = await db.Residents.FindAsync(recording.ResidentId);
        if (resident is null) return NotFound(new { message = "Resident not found." });
        if (!isAdmin
            && !string.Equals(resident.AssignedSocialWorker, email, StringComparison.OrdinalIgnoreCase))
            return Forbid();

        recording.RecordingId = 0; // ensure new
        recording.SocialWorker = resident.AssignedSocialWorker ?? email;

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
        [FromQuery] string? visitType,
        [FromQuery] DateOnly? dateFrom,
        [FromQuery] DateOnly? dateTo,
        [FromQuery] string? sort,
        [FromQuery] string? direction,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var email = (await userManager.GetUserAsync(User))?.Email ?? "";

        var assignedResidentIds = await GetScopedResidentIdsAsync(email);

        var query = db.HomeVisitations
            .Where(hv => assignedResidentIds.Contains(hv.ResidentId));

        if (residentId.HasValue)
            query = query.Where(hv => hv.ResidentId == residentId.Value);
        if (!string.IsNullOrWhiteSpace(visitType))
            query = query.Where(hv => hv.VisitType == visitType);
        if (dateFrom.HasValue)
            query = query.Where(hv => hv.VisitDate >= dateFrom.Value);
        if (dateTo.HasValue)
            query = query.Where(hv => hv.VisitDate <= dateTo.Value);

        var totalCount = await query.CountAsync();

        var desc = string.Equals(direction, "desc", StringComparison.OrdinalIgnoreCase);
        query = sort?.ToLower() switch
        {
            "visitdate" => desc ? query.OrderByDescending(hv => hv.VisitDate) : query.OrderBy(hv => hv.VisitDate),
            "visittype" => desc ? query.OrderByDescending(hv => hv.VisitType) : query.OrderBy(hv => hv.VisitType),
            "residentid" => desc ? query.OrderByDescending(hv => hv.ResidentId) : query.OrderBy(hv => hv.ResidentId),
            "visitoutcome" => desc ? query.OrderByDescending(hv => hv.VisitOutcome) : query.OrderBy(hv => hv.VisitOutcome),
            _ => query.OrderByDescending(hv => hv.VisitDate),
        };

        var items = await query
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
        var isAdmin = User.IsInRole(AuthRoles.Admin);

        var resident = await db.Residents.FindAsync(visitation.ResidentId);
        if (resident is null) return NotFound(new { message = "Resident not found." });
        if (!isAdmin
            && !string.Equals(resident.AssignedSocialWorker, email, StringComparison.OrdinalIgnoreCase))
            return Forbid();

        visitation.VisitationId = 0;
        visitation.SocialWorker = resident.AssignedSocialWorker ?? email;

        db.HomeVisitations.Add(visitation);
        await db.SaveChangesAsync();

        return Ok(new { message = "Visitation recorded.", visitationId = visitation.VisitationId });
    }

    // ── Session Detail & Edit ───────────────────────────────────────

    /// <summary>
    /// Get a single process recording by ID.
    /// </summary>
    [HttpGet("sessions/{recordingId:int}")]
    public async Task<IActionResult> GetSession(int recordingId)
    {
        var email = (await userManager.GetUserAsync(User))?.Email ?? "";

        var recording = await db.ProcessRecordings
            .Include(pr => pr.Resident)
            .FirstOrDefaultAsync(pr => pr.RecordingId == recordingId);

        if (recording is null) return NotFound();

        if (!CanAccessResident(recording.Resident.AssignedSocialWorker, email))
            return Forbid();

        return Ok(new
        {
            recording.RecordingId,
            recording.ResidentId,
            residentCode = recording.Resident.CaseControlNo,
            recording.SessionDate,
            recording.SocialWorker,
            recording.SessionType,
            recording.SessionDurationMinutes,
            recording.EmotionalStateObserved,
            recording.EmotionalStateEnd,
            recording.SessionNarrative,
            recording.InterventionsApplied,
            recording.FollowUpActions,
            recording.ProgressNoted,
            recording.ConcernsFlagged,
            recording.ReferralMade,
        });
    }

    /// <summary>
    /// Update an existing process recording.
    /// </summary>
    [HttpPut("sessions/{recordingId:int}")]
    public async Task<IActionResult> UpdateSession(int recordingId, [FromBody] ProcessRecording updated)
    {
        if (!ModelState.IsValid) return ValidationProblem();

        var email = (await userManager.GetUserAsync(User))?.Email ?? "";

        var existing = await db.ProcessRecordings
            .Include(pr => pr.Resident)
            .FirstOrDefaultAsync(pr => pr.RecordingId == recordingId);

        if (existing is null) return NotFound();
        if (!CanAccessResident(existing.Resident.AssignedSocialWorker, email))
            return Forbid();

        existing.SessionDate = updated.SessionDate;
        existing.SessionType = updated.SessionType;
        existing.SessionDurationMinutes = updated.SessionDurationMinutes;
        existing.EmotionalStateObserved = updated.EmotionalStateObserved;
        existing.EmotionalStateEnd = updated.EmotionalStateEnd;
        existing.SessionNarrative = updated.SessionNarrative;
        existing.InterventionsApplied = updated.InterventionsApplied;
        existing.FollowUpActions = updated.FollowUpActions;
        existing.ProgressNoted = updated.ProgressNoted;
        existing.ConcernsFlagged = updated.ConcernsFlagged;
        existing.ReferralMade = updated.ReferralMade;

        await db.SaveChangesAsync();

        return Ok(new { message = "Session updated." });
    }

    // ── Delete Session ───────────────────────────────────────────────

    /// <summary>
    /// Delete a process recording (Admin only).
    /// </summary>
    [HttpDelete("sessions/{recordingId:int}")]
    [Authorize(Roles = AuthRoles.Admin)]
    public async Task<IActionResult> DeleteSession(int recordingId)
    {
        var recording = await db.ProcessRecordings
            .FirstOrDefaultAsync(pr => pr.RecordingId == recordingId);

        if (recording is null) return NotFound();

        db.ProcessRecordings.Remove(recording);
        await db.SaveChangesAsync();

        return Ok(new { message = "Session deleted." });
    }

    // ── Update Visitation ───────────────────────────────────────────

    /// <summary>
    /// Update an existing home visitation.
    /// </summary>
    [HttpPut("visitations/{visitationId:int}")]
    public async Task<IActionResult> UpdateVisitation(int visitationId, [FromBody] HomeVisitation updated)
    {
        if (!ModelState.IsValid) return ValidationProblem();

        var email = (await userManager.GetUserAsync(User))?.Email ?? "";

        var existing = await db.HomeVisitations
            .Include(hv => hv.Resident)
            .FirstOrDefaultAsync(hv => hv.VisitationId == visitationId);

        if (existing is null) return NotFound();
        if (!CanAccessResident(existing.Resident.AssignedSocialWorker, email))
            return Forbid();

        existing.VisitDate = updated.VisitDate;
        existing.VisitType = updated.VisitType;
        existing.LocationVisited = updated.LocationVisited;
        existing.FamilyMembersPresent = updated.FamilyMembersPresent;
        existing.Purpose = updated.Purpose;
        existing.Observations = updated.Observations;
        existing.FamilyCooperationLevel = updated.FamilyCooperationLevel;
        existing.VisitOutcome = updated.VisitOutcome;
        existing.SafetyConcernsNoted = updated.SafetyConcernsNoted;
        existing.FollowUpNeeded = updated.FollowUpNeeded;
        existing.FollowUpNotes = updated.FollowUpNotes;

        await db.SaveChangesAsync();

        return Ok(new { message = "Visitation updated." });
    }

    // ── Delete Visitation ───────────────────────────────────────────

    /// <summary>
    /// Delete a home visitation (Admin only).
    /// </summary>
    [HttpDelete("visitations/{visitationId:int}")]
    [Authorize(Roles = AuthRoles.Admin)]
    public async Task<IActionResult> DeleteVisitation(int visitationId)
    {
        var visitation = await db.HomeVisitations
            .FirstOrDefaultAsync(hv => hv.VisitationId == visitationId);

        if (visitation is null) return NotFound();

        db.HomeVisitations.Remove(visitation);
        await db.SaveChangesAsync();

        return Ok(new { message = "Visitation deleted." });
    }

    /// <summary>
    /// Unified timeline for a resident: sessions, home visitations, and case conference milestones.
    /// Counselor must be assigned to the resident unless the caller is an Admin.
    /// </summary>
    [HttpGet("residents/{residentId:int}/timeline")]
    public async Task<IActionResult> GetResidentTimeline(
        int residentId,
        [FromQuery] bool upcomingOnly = false)
    {
        var email = (await userManager.GetUserAsync(User))?.Email ?? "";
        var isAdmin = User.IsInRole(AuthRoles.Admin);

        var resident = await db.Residents.FindAsync(residentId);
        if (resident is null) return NotFound();

        if (!isAdmin && !ResidentAssignedTo(resident.AssignedSocialWorker, email))
            return Forbid();

        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        var recordings = await db.ProcessRecordings
            .Where(pr => pr.ResidentId == residentId)
            .Select(pr => new
            {
                pr.RecordingId,
                pr.SessionDate,
                pr.SessionType,
                pr.ProgressNoted,
                pr.ConcernsFlagged,
            })
            .ToListAsync();

        var visitRows = await db.HomeVisitations
            .Where(hv => hv.ResidentId == residentId)
            .Select(hv => new
            {
                hv.VisitationId,
                hv.VisitDate,
                hv.VisitType,
                hv.VisitOutcome,
                hv.FollowUpNeeded,
            })
            .ToListAsync();

        var plans = await db.InterventionPlans
            .Where(ip => ip.ResidentId == residentId && ip.CaseConferenceDate != null)
            .Select(ip => new
            {
                ip.PlanId,
                ip.CaseConferenceDate,
                ip.PlanCategory,
                ip.Status,
                ip.PlanDescription,
            })
            .ToListAsync();

        var sortable = new List<(DateOnly Date, CounselorTimelineEventDto Dto)>();

        foreach (var r in recordings)
        {
            if (upcomingOnly && r.SessionDate < today)
                continue;
            sortable.Add((r.SessionDate, new CounselorTimelineEventDto
            {
                EventType = "Session",
                EventDate = r.SessionDate.ToString("yyyy-MM-dd"),
                Title = $"Session — {r.SessionType}",
                Summary = r.ProgressNoted ? "Progress noted in session" : "Counseling session recorded",
                Status = r.ConcernsFlagged ? "Concerns flagged" : null,
                RecordingId = r.RecordingId,
                DetailPath = $"/counselor/sessions/{r.RecordingId}",
            }));
        }

        foreach (var v in visitRows)
        {
            if (upcomingOnly && v.VisitDate < today)
                continue;
            sortable.Add((v.VisitDate, new CounselorTimelineEventDto
            {
                EventType = "HomeVisitation",
                EventDate = v.VisitDate.ToString("yyyy-MM-dd"),
                Title = $"Home visit — {v.VisitType}",
                Summary = v.VisitOutcome,
                Status = v.FollowUpNeeded ? "Follow-up needed" : null,
                VisitationId = v.VisitationId,
                DetailPath = $"/counselor/visitations",
            }));
        }

        foreach (var p in plans)
        {
            var d = p.CaseConferenceDate!.Value;
            if (upcomingOnly && d < today)
                continue;
            sortable.Add((d, new CounselorTimelineEventDto
            {
                EventType = "CaseConference",
                EventDate = d.ToString("yyyy-MM-dd"),
                Title = $"Case conference — {p.PlanCategory}",
                Summary = string.IsNullOrEmpty(p.PlanDescription)
                    ? null
                    : p.PlanDescription.Length > 160
                        ? p.PlanDescription[..157] + "…"
                        : p.PlanDescription,
                Status = p.Status,
                PlanId = p.PlanId,
                DetailPath = "/counselor/case-conferences",
            }));
        }

        var events = sortable
            .OrderByDescending(x => x.Date)
            .ThenByDescending(x => x.Dto.EventType)
            .Select(x => x.Dto)
            .ToList();

        return Ok(new
        {
            residentId,
            caseControlNo = resident.CaseControlNo,
            upcomingOnly,
            events,
        });
    }

    // ── Case Conferences ────────────────────────────────────────────

    /// <summary>
    /// List intervention plans with case conference dates for the counselor's assigned residents.
    /// </summary>
    [HttpGet("case-conferences")]
    public async Task<IActionResult> GetCaseConferences(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var email = (await userManager.GetUserAsync(User))?.Email ?? "";

        var assignedResidentIds = await GetScopedResidentIdsAsync(email);

        var query = db.InterventionPlans
            .Include(ip => ip.Resident)
            .Where(ip => assignedResidentIds.Contains(ip.ResidentId) && ip.CaseConferenceDate.HasValue);

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(ip => ip.CaseConferenceDate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(ip => new
            {
                ip.PlanId,
                ip.ResidentId,
                residentCode = ip.Resident.CaseControlNo,
                ip.PlanCategory,
                ip.PlanDescription,
                ip.ServicesProvided,
                ip.Status,
                ip.CaseConferenceDate,
                ip.TargetDate,
                ip.CreatedAt,
            })
            .ToListAsync();

        return Ok(new { totalCount, page, pageSize, items });
    }

    private bool CanAccessResident(string? assignedSocialWorker, string email) =>
        User.IsInRole(AuthRoles.Admin)
        || ResidentAssignedTo(assignedSocialWorker, email);

    private static bool ResidentAssignedTo(string? assignedSocialWorker, string email) =>
        !string.IsNullOrEmpty(assignedSocialWorker)
        && !string.IsNullOrEmpty(email)
        && string.Equals(assignedSocialWorker, email, StringComparison.OrdinalIgnoreCase);

    /// <summary>
    /// Residents a counselor may act on in list views. Admins see all residents.
    /// Assignment match is case-insensitive (PostgreSQL text equality is not).
    /// </summary>
    private async Task<List<int>> GetScopedResidentIdsAsync(string email)
    {
        if (User.IsInRole(AuthRoles.Admin))
        {
            return await db.Residents.AsNoTracking()
                .Select(r => r.ResidentId)
                .ToListAsync();
        }

        var el = email.ToLowerInvariant();
        return await db.Residents.AsNoTracking()
            .Where(r =>
                r.AssignedSocialWorker != null
                && r.AssignedSocialWorker.ToLower() == el)
            .Select(r => r.ResidentId)
            .ToListAsync();
    }
}
