using Haven_for_Her_Backend.Data;
using Haven_for_Her_Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Haven_for_Her_Backend.Controllers;

[ApiController]
[Route("api/incidents")]
[Authorize(Roles = AuthRoles.Admin)]
public class IncidentsController(
    HavenForHerBackendDbContext db) : ControllerBase
{
    /// <summary>
    /// Paginated incident reports with filters.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetIncidents(
        [FromQuery] int? safehouseId,
        [FromQuery] string? severity,
        [FromQuery] bool? resolved,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = db.IncidentReports
            .Include(ir => ir.Resident)
            .Include(ir => ir.Safehouse)
            .AsQueryable();

        if (safehouseId.HasValue)
            query = query.Where(ir => ir.SafehouseId == safehouseId.Value);

        if (!string.IsNullOrWhiteSpace(severity))
            query = query.Where(ir => ir.Severity == severity);

        if (resolved.HasValue)
            query = query.Where(ir => ir.Resolved == resolved.Value);

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(ir => ir.IncidentDate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(ir => new
            {
                ir.IncidentId,
                ir.ResidentId,
                ResidentCode = ir.Resident.InternalCode,
                ir.SafehouseId,
                SafehouseName = ir.Safehouse.Name,
                ir.IncidentDate,
                ir.IncidentType,
                ir.Severity,
                ir.Description,
                ir.ResponseTaken,
                ir.Resolved,
                ir.ResolutionDate,
                ir.ReportedBy,
                ir.FollowUpRequired,
            })
            .ToListAsync();

        return Ok(new { totalCount, page, pageSize, items });
    }

    /// <summary>
    /// Create a new incident report.
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CreateIncident([FromBody] IncidentReport incident)
    {
        if (!ModelState.IsValid) return ValidationProblem();

        incident.IncidentId = 0;

        db.IncidentReports.Add(incident);
        await db.SaveChangesAsync();

        return Ok(new { message = "Incident report created.", incidentId = incident.IncidentId });
    }

    /// <summary>
    /// Update or resolve an incident report.
    /// </summary>
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateIncident(int id, [FromBody] IncidentReport updated)
    {
        if (!ModelState.IsValid) return ValidationProblem();

        var existing = await db.IncidentReports.FindAsync(id);
        if (existing is null) return NotFound();

        existing.SafehouseId = updated.SafehouseId;
        existing.IncidentDate = updated.IncidentDate;
        existing.IncidentType = updated.IncidentType;
        existing.Severity = updated.Severity;
        existing.Description = updated.Description;
        existing.ResponseTaken = updated.ResponseTaken;
        existing.Resolved = updated.Resolved;
        existing.ResolutionDate = updated.ResolutionDate;
        existing.ReportedBy = updated.ReportedBy;
        existing.FollowUpRequired = updated.FollowUpRequired;

        await db.SaveChangesAsync();

        return Ok(new { message = "Incident report updated." });
    }
}
