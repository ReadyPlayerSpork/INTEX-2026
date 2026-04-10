using Haven_for_Her_Backend.Data;
using Haven_for_Her_Backend.Dtos;
using Haven_for_Her_Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Haven_for_Her_Backend.Controllers;

[ApiController]
[Route("api/caseload")]
[Authorize(Roles = "Admin,Counselor")]
public class CaseloadController(
    HavenForHerBackendDbContext db) : ControllerBase
{
    private const int CascadePreviewLimit = 5;
    private const int UnknownRiskRank = -1;

    /// <summary>
    /// Paginated list of all residents with search and filters.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetResidents(
        [FromQuery] string? search,
        [FromQuery] string? status,
        [FromQuery] int? safehouseId,
        [FromQuery] string? riskLevel,
        [FromQuery] string? sort,
        [FromQuery] string? direction,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = db.Residents.Include(r => r.Safehouse).AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(r =>
                r.CaseControlNo.ToLower().Contains(term) ||
                r.InternalCode.ToLower().Contains(term));
        }

        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(r => r.CaseStatus == status);

        if (safehouseId.HasValue)
            query = query.Where(r => r.SafehouseId == safehouseId.Value);

        if (!string.IsNullOrWhiteSpace(riskLevel))
            query = query.Where(r => r.CurrentRiskLevel == riskLevel);

        var totalCount = await query.CountAsync();

        var desc = string.Equals(direction, "desc", StringComparison.OrdinalIgnoreCase);
        query = sort?.ToLower() switch
        {
            "casecontrolno" => desc ? query.OrderByDescending(r => r.CaseControlNo) : query.OrderBy(r => r.CaseControlNo),
            "internalcode" => desc ? query.OrderByDescending(r => r.InternalCode) : query.OrderBy(r => r.InternalCode),
            "safehousename" => desc ? query.OrderByDescending(r => r.Safehouse.Name) : query.OrderBy(r => r.Safehouse.Name),
            "casestatus" => desc ? query.OrderByDescending(r => r.CaseStatus) : query.OrderBy(r => r.CaseStatus),
            "currentrisklevel" => desc
                ? query
                    .OrderByDescending(r =>
                        r.CurrentRiskLevel == "Critical" ? 3 :
                        r.CurrentRiskLevel == "High" ? 2 :
                        r.CurrentRiskLevel == "Medium" ? 1 :
                        r.CurrentRiskLevel == "Low" ? 0 :
                        UnknownRiskRank)
                    .ThenBy(r => r.CaseControlNo)
                : query
                    .OrderBy(r =>
                        r.CurrentRiskLevel == "Critical" ? 3 :
                        r.CurrentRiskLevel == "High" ? 2 :
                        r.CurrentRiskLevel == "Medium" ? 1 :
                        r.CurrentRiskLevel == "Low" ? 0 :
                        UnknownRiskRank)
                    .ThenBy(r => r.CaseControlNo),
            "assignedsocialworker" => desc ? query.OrderByDescending(r => r.AssignedSocialWorker) : query.OrderBy(r => r.AssignedSocialWorker),
            "dateofadmission" => desc ? query.OrderByDescending(r => r.DateOfAdmission) : query.OrderBy(r => r.DateOfAdmission),
            _ => query.OrderByDescending(r => r.DateOfAdmission),
        };

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(r => new
            {
                r.ResidentId,
                r.CaseControlNo,
                r.InternalCode,
                r.CaseStatus,
                r.Sex,
                r.DateOfBirth,
                r.CaseCategory,
                r.CurrentRiskLevel,
                r.InitialRiskLevel,
                r.AssignedSocialWorker,
                r.DateOfAdmission,
                r.ReintegrationStatus,
                r.DateClosed,
                SafehouseName = r.Safehouse.Name,
            })
            .ToListAsync();

        return Ok(new { totalCount, page, pageSize, items });
    }

    /// <summary>
    /// Full resident profile with all related records.
    /// </summary>
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetResident(int id)
    {
        var resident = await db.Residents
            .Include(r => r.Safehouse)
            .Include(r => r.ProcessRecordings.OrderByDescending(pr => pr.SessionDate))
            .Include(r => r.HomeVisitations.OrderByDescending(hv => hv.VisitDate))
            .Include(r => r.EducationRecords)
            .Include(r => r.HealthWellbeingRecords)
            .Include(r => r.InterventionPlans.OrderByDescending(ip => ip.CreatedAt))
            .Include(r => r.IncidentReports.OrderByDescending(ir => ir.IncidentDate))
            .FirstOrDefaultAsync(r => r.ResidentId == id);

        if (resident is null) return NotFound();

        return Ok(resident);
    }

    /// <summary>
    /// Update a resident record (Admin only).
    /// </summary>
    [HttpPut("{id:int}")]
    [Authorize(Roles = AuthRoles.Admin)]
    public async Task<IActionResult> UpdateResident(int id, [FromBody] Resident updated)
    {
        if (!ModelState.IsValid) return ValidationProblem();

        var existing = await db.Residents.FindAsync(id);
        if (existing is null) return NotFound();

        // Update scalar fields
        existing.CaseControlNo = updated.CaseControlNo;
        existing.InternalCode = updated.InternalCode;
        existing.SafehouseId = updated.SafehouseId;
        existing.CaseStatus = updated.CaseStatus;
        existing.Sex = updated.Sex;
        existing.DateOfBirth = updated.DateOfBirth;
        existing.BirthStatus = updated.BirthStatus;
        existing.PlaceOfBirth = updated.PlaceOfBirth;
        existing.Religion = updated.Religion;
        existing.CaseCategory = updated.CaseCategory;
        existing.SubCatOrphaned = updated.SubCatOrphaned;
        existing.SubCatTrafficked = updated.SubCatTrafficked;
        existing.SubCatChildLabor = updated.SubCatChildLabor;
        existing.SubCatPhysicalAbuse = updated.SubCatPhysicalAbuse;
        existing.SubCatSexualAbuse = updated.SubCatSexualAbuse;
        existing.SubCatOsaec = updated.SubCatOsaec;
        existing.SubCatCicl = updated.SubCatCicl;
        existing.SubCatAtRisk = updated.SubCatAtRisk;
        existing.SubCatStreetChild = updated.SubCatStreetChild;
        existing.SubCatChildWithHiv = updated.SubCatChildWithHiv;
        existing.IsPwd = updated.IsPwd;
        existing.PwdType = updated.PwdType;
        existing.HasSpecialNeeds = updated.HasSpecialNeeds;
        existing.SpecialNeedsDiagnosis = updated.SpecialNeedsDiagnosis;
        existing.FamilyIs4ps = updated.FamilyIs4ps;
        existing.FamilySoloParent = updated.FamilySoloParent;
        existing.FamilyIndigenous = updated.FamilyIndigenous;
        existing.FamilyParentPwd = updated.FamilyParentPwd;
        existing.FamilyInformalSettler = updated.FamilyInformalSettler;
        existing.DateOfAdmission = updated.DateOfAdmission;
        existing.AgeUponAdmission = updated.AgeUponAdmission;
        existing.PresentAge = updated.PresentAge;
        existing.LengthOfStay = updated.LengthOfStay;
        existing.ReferralSource = updated.ReferralSource;
        existing.ReferringAgencyPerson = updated.ReferringAgencyPerson;
        existing.DateColbRegistered = updated.DateColbRegistered;
        existing.DateColbObtained = updated.DateColbObtained;
        existing.AssignedSocialWorker = updated.AssignedSocialWorker;
        existing.InitialCaseAssessment = updated.InitialCaseAssessment;
        existing.DateCaseStudyPrepared = updated.DateCaseStudyPrepared;
        existing.ReintegrationType = updated.ReintegrationType;
        existing.ReintegrationStatus = updated.ReintegrationStatus;
        existing.InitialRiskLevel = updated.InitialRiskLevel;
        existing.CurrentRiskLevel = updated.CurrentRiskLevel;
        existing.DateEnrolled = updated.DateEnrolled;
        existing.DateClosed = updated.DateClosed;
        existing.NotesRestricted = updated.NotesRestricted;

        await db.SaveChangesAsync();

        return Ok(new { message = "Resident updated." });
    }

    // ── Process Recordings ──────────────────────────────────────────

    [HttpGet("{id:int}/recordings")]
    public async Task<IActionResult> GetRecordings(int id)
    {
        var recordings = await db.ProcessRecordings
            .Where(pr => pr.ResidentId == id)
            .OrderByDescending(pr => pr.SessionDate)
            .ToListAsync();

        return Ok(recordings);
    }

    [HttpPost("{id:int}/recordings")]
    public async Task<IActionResult> CreateRecording(int id, [FromBody] ProcessRecording recording)
    {
        if (!ModelState.IsValid) return ValidationProblem();

        var resident = await db.Residents.FindAsync(id);
        if (resident is null) return NotFound();

        recording.RecordingId = 0;
        recording.ResidentId = id;

        db.ProcessRecordings.Add(recording);
        await db.SaveChangesAsync();

        return Ok(new { message = "Recording created.", recordingId = recording.RecordingId });
    }

    // ── Home Visitations ────────────────────────────────────────────

    [HttpGet("{id:int}/visitations")]
    public async Task<IActionResult> GetVisitations(int id)
    {
        var visitations = await db.HomeVisitations
            .Where(hv => hv.ResidentId == id)
            .OrderByDescending(hv => hv.VisitDate)
            .ToListAsync();

        return Ok(visitations);
    }

    [HttpPost("{id:int}/visitations")]
    public async Task<IActionResult> CreateVisitation(int id, [FromBody] HomeVisitation visitation)
    {
        if (!ModelState.IsValid) return ValidationProblem();

        var resident = await db.Residents.FindAsync(id);
        if (resident is null) return NotFound();

        visitation.VisitationId = 0;
        visitation.ResidentId = id;

        db.HomeVisitations.Add(visitation);
        await db.SaveChangesAsync();

        return Ok(new { message = "Visitation created.", visitationId = visitation.VisitationId });
    }

    // ── Incident Reports ────────────────────────────────────────────

    [HttpGet("{id:int}/incidents")]
    public async Task<IActionResult> GetIncidents(int id)
    {
        var incidents = await db.IncidentReports
            .Where(ir => ir.ResidentId == id)
            .OrderByDescending(ir => ir.IncidentDate)
            .ToListAsync();

        return Ok(incidents);
    }

    [HttpPost("{id:int}/incidents")]
    public async Task<IActionResult> CreateIncident(int id, [FromBody] IncidentReport incident)
    {
        if (!ModelState.IsValid) return ValidationProblem();

        var resident = await db.Residents.FindAsync(id);
        if (resident is null) return NotFound();

        incident.IncidentId = 0;
        incident.ResidentId = id;

        db.IncidentReports.Add(incident);
        await db.SaveChangesAsync();

        return Ok(new { message = "Incident report created.", incidentId = incident.IncidentId });
    }

    // ── Intervention Plans ──────────────────────────────────────────

    [HttpGet("{id:int}/interventions")]
    public async Task<IActionResult> GetInterventions(int id)
    {
        var interventions = await db.InterventionPlans
            .Where(ip => ip.ResidentId == id)
            .OrderByDescending(ip => ip.CreatedAt)
            .ToListAsync();

        return Ok(interventions);
    }

    [HttpPost("{id:int}/interventions")]
    public async Task<IActionResult> CreateIntervention(int id, [FromBody] InterventionPlan plan)
    {
        if (!ModelState.IsValid) return ValidationProblem();

        var resident = await db.Residents.FindAsync(id);
        if (resident is null) return NotFound();

        plan.PlanId = 0;
        plan.ResidentId = id;
        plan.CreatedAt = DateTime.UtcNow;
        plan.UpdatedAt = DateTime.UtcNow;

        db.InterventionPlans.Add(plan);
        await db.SaveChangesAsync();

        return Ok(new { message = "Intervention plan created.", planId = plan.PlanId });
    }

    [HttpGet("{id:int}/case-conferences")]
    public async Task<IActionResult> GetCaseConferences(int id)
    {
        var conferences = await db.InterventionPlans
            .Where(ip => ip.ResidentId == id && ip.CaseConferenceDate != null)
            .OrderByDescending(ip => ip.CaseConferenceDate)
            .Select(ip => new
            {
                ip.PlanId,
                ip.PlanCategory,
                ip.PlanDescription,
                ip.CaseConferenceDate,
                ip.Status
            })
            .ToListAsync();

        return Ok(conferences);
    }

    // ── Create Resident ─────────────────────────────────────────────

    /// <summary>
    /// Create a new resident record (Admin only).
    /// </summary>
    [HttpPost]
    [Authorize(Roles = AuthRoles.Admin)]
    public async Task<IActionResult> CreateResident([FromBody] Resident resident)
    {
        if (!ModelState.IsValid) return ValidationProblem();

        resident.ResidentId = 0;
        resident.CreatedAt = DateTime.UtcNow;

        db.Residents.Add(resident);
        await db.SaveChangesAsync();

        return Ok(new { message = "Resident created.", residentId = resident.ResidentId });
    }

    // ── Cascade Info ────────────────────────────────────────────────

    /// <summary>
    /// Get counts of related records that would be deleted with a resident.
    /// </summary>
    [HttpGet("{id:int}/cascade-info")]
    [Authorize(Roles = AuthRoles.Admin)]
    public async Task<IActionResult> GetCascadeInfo(int id)
    {
        var exists = await db.Residents.AnyAsync(r => r.ResidentId == id);
        if (!exists) return NotFound();

        var recordingCount = await db.ProcessRecordings.CountAsync(pr => pr.ResidentId == id);
        var recordingRecords = await db.ProcessRecordings
            .Where(pr => pr.ResidentId == id)
            .OrderByDescending(pr => pr.SessionDate)
            .Select(pr => new { pr.SessionType, pr.SessionDate })
            .Take(CascadePreviewLimit)
            .ToListAsync();

        var visitationCount = await db.HomeVisitations.CountAsync(hv => hv.ResidentId == id);
        var visitationRecords = await db.HomeVisitations
            .Where(hv => hv.ResidentId == id)
            .OrderByDescending(hv => hv.VisitDate)
            .Select(hv => new { hv.VisitType, hv.VisitDate })
            .Take(CascadePreviewLimit)
            .ToListAsync();

        var educationCount = await db.EducationRecords.CountAsync(er => er.ResidentId == id);
        var educationRecords = await db.EducationRecords
            .Where(er => er.ResidentId == id)
            .OrderByDescending(er => er.RecordDate)
            .Select(er => new { er.SchoolName, er.RecordDate })
            .Take(CascadePreviewLimit)
            .ToListAsync();

        var healthCount = await db.HealthWellbeingRecords.CountAsync(h => h.ResidentId == id);
        var healthRecords = await db.HealthWellbeingRecords
            .Where(h => h.ResidentId == id)
            .OrderByDescending(h => h.RecordDate)
            .Select(h => h.RecordDate)
            .Take(CascadePreviewLimit)
            .ToListAsync();

        var interventionCount = await db.InterventionPlans.CountAsync(ip => ip.ResidentId == id);
        var interventionRecords = await db.InterventionPlans
            .Where(ip => ip.ResidentId == id)
            .OrderByDescending(ip => ip.TargetDate)
            .Select(ip => new { ip.PlanCategory, ip.TargetDate })
            .Take(CascadePreviewLimit)
            .ToListAsync();

        var incidentCount = await db.IncidentReports.CountAsync(ir => ir.ResidentId == id);
        var incidentRecords = await db.IncidentReports
            .Where(ir => ir.ResidentId == id)
            .OrderByDescending(ir => ir.IncidentDate)
            .Select(ir => new { ir.IncidentType, ir.IncidentDate })
            .Take(CascadePreviewLimit)
            .ToListAsync();

        return Ok(new List<CascadeImpactDto>
        {
            BuildImpact(
                "counseling sessions",
                "delete",
                recordingCount,
                recordingRecords.Select(pr => $"{pr.SessionType} session on {FormatDate(pr.SessionDate)}").ToList()),
            BuildImpact(
                "home visitations",
                "delete",
                visitationCount,
                visitationRecords.Select(hv => $"{hv.VisitType} on {FormatDate(hv.VisitDate)}").ToList()),
            BuildImpact(
                "education records",
                "delete",
                educationCount,
                educationRecords.Select(er => $"{er.SchoolName} ({FormatDate(er.RecordDate)})").ToList()),
            BuildImpact(
                "health records",
                "delete",
                healthCount,
                healthRecords.Select(date => $"Health record on {FormatDate(date)}").ToList()),
            BuildImpact(
                "intervention plans",
                "delete",
                interventionCount,
                interventionRecords.Select(ip => $"{ip.PlanCategory} plan due {FormatDate(ip.TargetDate)}").ToList()),
            BuildImpact(
                "incident reports",
                "delete",
                incidentCount,
                incidentRecords.Select(ir => $"{ir.IncidentType} on {FormatDate(ir.IncidentDate)}").ToList()),
        });
    }

    // ── Delete Resident ─────────────────────────────────────────────

    /// <summary>
    /// Delete a resident and all related records (Admin only).
    /// </summary>
    [HttpDelete("{id:int}")]
    [Authorize(Roles = AuthRoles.Admin)]
    public async Task<IActionResult> DeleteResident(int id)
    {
        var resident = await db.Residents.FindAsync(id);
        if (resident is null) return NotFound();

        // EF cascade deletes handle child records
        db.Residents.Remove(resident);
        await db.SaveChangesAsync();

        return Ok(new { message = "Resident deleted." });
    }

    private static CascadeImpactDto BuildImpact(string label, string action, int count, IReadOnlyList<string> records) =>
        new()
        {
            Label = label,
            Action = action,
            Count = count,
            Records = records,
        };

    private static string FormatDate(DateOnly date) => date.ToString("MMM d, yyyy");
}
