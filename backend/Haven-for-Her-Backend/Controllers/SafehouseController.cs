using Haven_for_Her_Backend.Data;
using Haven_for_Her_Backend.Dtos;
using Haven_for_Her_Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Haven_for_Her_Backend.Controllers;

[ApiController]
[Route("api/admin/safehouses")]
[Authorize(Roles = AuthRoles.Admin)]
public class SafehouseController(HavenForHerBackendDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? region,
        [FromQuery] string? status,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        if (page < 1) page = 1;
        if (pageSize < 1 || pageSize > 100) pageSize = 20;

        var query = db.Safehouses.AsQueryable();

        if (!string.IsNullOrWhiteSpace(region))
            query = query.Where(s => s.Region == region);

        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(s => s.Status == status);

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderBy(s => s.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(s => new
            {
                s.SafehouseId,
                s.SafehouseCode,
                s.Name,
                s.Region,
                s.City,
                s.Province,
                s.Country,
                s.OpenDate,
                s.Status,
                s.CapacityGirls,
                s.CapacityStaff,
                s.CurrentOccupancy,
                s.Notes,
            })
            .ToListAsync();

        return Ok(new PaginatedResponse<object>(items, page, pageSize, totalCount));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var safehouse = await db.Safehouses
            .Where(s => s.SafehouseId == id)
            .Select(s => new
            {
                s.SafehouseId,
                s.SafehouseCode,
                s.Name,
                s.Region,
                s.City,
                s.Province,
                s.Country,
                s.OpenDate,
                s.Status,
                s.CapacityGirls,
                s.CapacityStaff,
                s.CurrentOccupancy,
                s.Notes,
                activeResidents = s.Residents.Count(r => r.CaseStatus == "Active"),
                totalResidents = s.Residents.Count(),
            })
            .FirstOrDefaultAsync();

        if (safehouse is null)
            return NotFound(new ErrorResponse("Safehouse not found."));

        return Ok(safehouse);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Safehouse safehouse)
    {
        safehouse.SafehouseId = 0; // ensure auto-generated
        db.Safehouses.Add(safehouse);
        await db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = safehouse.SafehouseId }, new
        {
            message = "Safehouse created.",
            safehouse.SafehouseId,
        });
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] Safehouse updated)
    {
        var existing = await db.Safehouses.FindAsync(id);
        if (existing is null)
            return NotFound(new ErrorResponse("Safehouse not found."));

        existing.SafehouseCode = updated.SafehouseCode;
        existing.Name = updated.Name;
        existing.Region = updated.Region;
        existing.City = updated.City;
        existing.Province = updated.Province;
        existing.Country = updated.Country;
        existing.OpenDate = updated.OpenDate;
        existing.Status = updated.Status;
        existing.CapacityGirls = updated.CapacityGirls;
        existing.CapacityStaff = updated.CapacityStaff;
        existing.CurrentOccupancy = updated.CurrentOccupancy;
        existing.Notes = updated.Notes;

        await db.SaveChangesAsync();
        return Ok(new { message = "Safehouse updated.", existing.SafehouseId });
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var safehouse = await db.Safehouses
            .Include(s => s.Residents)
            .FirstOrDefaultAsync(s => s.SafehouseId == id);

        if (safehouse is null)
            return NotFound(new ErrorResponse("Safehouse not found."));

        if (safehouse.Residents.Count != 0)
            return BadRequest(new ErrorResponse("Cannot delete safehouse with assigned residents."));

        db.Safehouses.Remove(safehouse);
        await db.SaveChangesAsync();
        return Ok(new { message = "Safehouse deleted." });
    }
}
