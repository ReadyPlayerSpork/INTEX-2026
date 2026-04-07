using Haven_for_Her_Backend.Data;
using Haven_for_Her_Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Haven_for_Her_Backend.Controllers;

[ApiController]
[Route("api/caseload")]
[Authorize(Roles = $"{AuthRoles.Admin},{AuthRoles.Counselor}")]
public class CaseloadController(
    HavenForHerBackendDbContext db) : ControllerBase
{
    /// <summary>
    /// Paginated list of all residents with search and filters.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetResidents(
        [FromQuery] string? search,
        [FromQuery] string? status,
        [FromQuery] int? safehouseId,
        [FromQuery] string? riskLevel,
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

        var items = await query
            .OrderByDescending(r => r.DateOfAdmission)
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
}
