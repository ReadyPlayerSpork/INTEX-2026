using Haven_for_Her_Backend.Data;
using Haven_for_Her_Backend.Dtos;
using Haven_for_Her_Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Haven_for_Her_Backend.Controllers;

[ApiController]
[Route("api/admin/partners")]
[Authorize(Roles = AuthRoles.Admin)]
public class PartnerController(HavenForHerBackendDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? region,
        [FromQuery] string? status,
        [FromQuery] string? sort,
        [FromQuery] string? direction,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        if (page < 1) page = 1;
        if (pageSize < 1 || pageSize > 100) pageSize = 20;

        var query = db.Partners.AsQueryable();

        if (!string.IsNullOrWhiteSpace(region))
        {
            var r = region.Trim().ToLower();
            query = query.Where(p => p.Region.ToLower().Contains(r));
        }

        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(p => p.Status == status);

        var totalCount = await query.CountAsync();

        var desc = string.Equals(direction, "desc", StringComparison.OrdinalIgnoreCase);
        query = sort?.ToLower() switch
        {
            "partnername" => desc ? query.OrderByDescending(p => p.PartnerName) : query.OrderBy(p => p.PartnerName),
            "partnertype" => desc ? query.OrderByDescending(p => p.PartnerType) : query.OrderBy(p => p.PartnerType),
            "region" => desc ? query.OrderByDescending(p => p.Region) : query.OrderBy(p => p.Region),
            "status" => desc ? query.OrderByDescending(p => p.Status) : query.OrderBy(p => p.Status),
            "email" => desc ? query.OrderByDescending(p => p.Email) : query.OrderBy(p => p.Email),
            "startdate" => desc ? query.OrderByDescending(p => p.StartDate) : query.OrderBy(p => p.StartDate),
            _ => query.OrderBy(p => p.PartnerName),
        };

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new
            {
                p.PartnerId,
                p.PartnerName,
                p.PartnerType,
                p.RoleType,
                p.ContactName,
                p.Email,
                p.Phone,
                p.Region,
                p.Status,
                p.StartDate,
                p.EndDate,
                p.Notes,
                assignmentCount = p.PartnerAssignments.Count,
            })
            .ToListAsync();

        return Ok(new PaginatedResponse<object>(items, page, pageSize, totalCount));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var partner = await db.Partners
            .Where(p => p.PartnerId == id)
            .Select(p => new
            {
                p.PartnerId,
                p.PartnerName,
                p.PartnerType,
                p.RoleType,
                p.ContactName,
                p.Email,
                p.Phone,
                p.Region,
                p.Status,
                p.StartDate,
                p.EndDate,
                p.Notes,
                assignments = p.PartnerAssignments.Select(a => new
                {
                    a.AssignmentId,
                    a.SafehouseId,
                    safehouseName = a.Safehouse != null ? a.Safehouse.Name : null,
                    a.ProgramArea,
                    a.AssignmentStart,
                    a.AssignmentEnd,
                    a.ResponsibilityNotes,
                    a.IsPrimary,
                    a.Status,
                }).ToList(),
            })
            .FirstOrDefaultAsync();

        if (partner is null)
            return NotFound(new ErrorResponse("Partner not found."));

        return Ok(partner);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Partner partner)
    {
        partner.PartnerId = 0;
        db.Partners.Add(partner);
        await db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = partner.PartnerId }, new
        {
            message = "Partner created.",
            partner.PartnerId,
        });
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] Partner updated)
    {
        var existing = await db.Partners.FindAsync(id);
        if (existing is null)
            return NotFound(new ErrorResponse("Partner not found."));

        existing.PartnerName = updated.PartnerName;
        existing.PartnerType = updated.PartnerType;
        existing.RoleType = updated.RoleType;
        existing.ContactName = updated.ContactName;
        existing.Email = updated.Email;
        existing.Phone = updated.Phone;
        existing.Region = updated.Region;
        existing.Status = updated.Status;
        existing.StartDate = updated.StartDate;
        existing.EndDate = updated.EndDate;
        existing.Notes = updated.Notes;

        await db.SaveChangesAsync();
        return Ok(new { message = "Partner updated.", existing.PartnerId });
    }

    /// <summary>
    /// Get counts of related records for a partner.
    /// </summary>
    [HttpGet("{id:int}/cascade-info")]
    public async Task<IActionResult> GetCascadeInfo(int id)
    {
        var exists = await db.Partners.AnyAsync(p => p.PartnerId == id);
        if (!exists) return NotFound();

        var assignments = await db.PartnerAssignments.CountAsync(a => a.PartnerId == id);

        return Ok(new[]
        {
            new { label = "assignments", count = assignments },
        });
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var partner = await db.Partners
            .Include(p => p.PartnerAssignments)
            .FirstOrDefaultAsync(p => p.PartnerId == id);

        if (partner is null)
            return NotFound(new ErrorResponse("Partner not found."));

        if (partner.PartnerAssignments.Count != 0)
            return BadRequest(new ErrorResponse("Cannot delete partner with existing assignments."));

        db.Partners.Remove(partner);
        await db.SaveChangesAsync();
        return Ok(new { message = "Partner deleted." });
    }

    [HttpGet("{id:int}/assignments")]
    public async Task<IActionResult> GetAssignments(int id)
    {
        var exists = await db.Partners.AnyAsync(p => p.PartnerId == id);
        if (!exists)
            return NotFound(new ErrorResponse("Partner not found."));

        var assignments = await db.PartnerAssignments
            .Where(a => a.PartnerId == id)
            .Select(a => new
            {
                a.AssignmentId,
                a.PartnerId,
                a.SafehouseId,
                safehouseName = a.Safehouse != null ? a.Safehouse.Name : null,
                a.ProgramArea,
                a.AssignmentStart,
                a.AssignmentEnd,
                a.ResponsibilityNotes,
                a.IsPrimary,
                a.Status,
            })
            .OrderByDescending(a => a.AssignmentStart)
            .ToListAsync();

        return Ok(assignments);
    }

    [HttpPost("{id:int}/assignments")]
    public async Task<IActionResult> CreateAssignment(int id, [FromBody] PartnerAssignment assignment)
    {
        var exists = await db.Partners.AnyAsync(p => p.PartnerId == id);
        if (!exists)
            return NotFound(new ErrorResponse("Partner not found."));

        assignment.AssignmentId = 0;
        assignment.PartnerId = id;
        db.PartnerAssignments.Add(assignment);
        await db.SaveChangesAsync();

        return Created($"api/admin/partners/{id}/assignments", new
        {
            message = "Assignment created.",
            assignment.AssignmentId,
        });
    }
}
