using Haven_for_Her_Backend.Data;
using Haven_for_Her_Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Haven_for_Her_Backend.Controllers;

[ApiController]
[Route("api/interventions")]
[Authorize(Roles = AuthRoles.Admin)]
public class InterventionsController(
    HavenForHerBackendDbContext db) : ControllerBase
{
    /// <summary>
    /// Paginated intervention plans with filters.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetInterventions(
        [FromQuery] string? category,
        [FromQuery] string? status,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = db.InterventionPlans
            .Include(ip => ip.Resident)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(category))
        {
            var cat = category.Trim().ToLower();
            query = query.Where(ip => ip.PlanCategory.ToLower().Contains(cat));
        }

        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(ip => ip.Status == status);

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(ip => ip.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(ip => new
            {
                ip.PlanId,
                ip.ResidentId,
                ResidentCode = ip.Resident.InternalCode,
                ip.PlanCategory,
                ip.PlanDescription,
                ip.ServicesProvided,
                ip.TargetValue,
                ip.TargetDate,
                ip.Status,
                ip.CaseConferenceDate,
                ip.CreatedAt,
                ip.UpdatedAt,
            })
            .ToListAsync();

        return Ok(new { totalCount, page, pageSize, items });
    }

    /// <summary>
    /// Create a new intervention plan.
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CreateIntervention([FromBody] InterventionPlan plan)
    {
        if (!ModelState.IsValid) return ValidationProblem();

        plan.PlanId = 0;
        plan.CreatedAt = DateTime.UtcNow;
        plan.UpdatedAt = DateTime.UtcNow;

        db.InterventionPlans.Add(plan);
        await db.SaveChangesAsync();

        return Ok(new { message = "Intervention plan created.", planId = plan.PlanId });
    }

    /// <summary>
    /// Update an intervention plan.
    /// </summary>
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateIntervention(int id, [FromBody] InterventionPlan updated)
    {
        if (!ModelState.IsValid) return ValidationProblem();

        var existing = await db.InterventionPlans.FindAsync(id);
        if (existing is null) return NotFound();

        existing.PlanCategory = updated.PlanCategory;
        existing.PlanDescription = updated.PlanDescription;
        existing.ServicesProvided = updated.ServicesProvided;
        existing.TargetValue = updated.TargetValue;
        existing.TargetDate = updated.TargetDate;
        existing.Status = updated.Status;
        existing.CaseConferenceDate = updated.CaseConferenceDate;
        existing.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();

        return Ok(new { message = "Intervention plan updated." });
    }
}
