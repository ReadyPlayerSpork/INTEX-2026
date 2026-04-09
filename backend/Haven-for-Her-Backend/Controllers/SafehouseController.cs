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
    private const int CascadePreviewLimit = 5;

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

        var query = db.Safehouses.AsQueryable();

        if (!string.IsNullOrWhiteSpace(region))
            query = query.Where(s => s.Region == region);

        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(s => s.Status == status);

        var totalCount = await query.CountAsync();

        var desc = string.Equals(direction, "desc", StringComparison.OrdinalIgnoreCase);
        query = sort?.ToLower() switch
        {
            "name" => desc ? query.OrderByDescending(s => s.Name) : query.OrderBy(s => s.Name),
            "safehousecode" => desc ? query.OrderByDescending(s => s.SafehouseCode) : query.OrderBy(s => s.SafehouseCode),
            "region" => desc ? query.OrderByDescending(s => s.Region) : query.OrderBy(s => s.Region),
            "status" => desc ? query.OrderByDescending(s => s.Status) : query.OrderBy(s => s.Status),
            "capacitygirls" => desc ? query.OrderByDescending(s => s.CapacityGirls) : query.OrderBy(s => s.CapacityGirls),
            "currentoccupancy" => desc ? query.OrderByDescending(s => s.CurrentOccupancy) : query.OrderBy(s => s.CurrentOccupancy),
            "opendate" => desc ? query.OrderByDescending(s => s.OpenDate) : query.OrderBy(s => s.OpenDate),
            _ => query.OrderBy(s => s.Name),
        };

        var items = await query
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

    /// <summary>
    /// Get counts of related records for a safehouse.
    /// </summary>
    [HttpGet("{id:int}/cascade-info")]
    public async Task<IActionResult> GetCascadeInfo(int id)
    {
        var exists = await db.Safehouses.AnyAsync(s => s.SafehouseId == id);
        if (!exists) return NotFound();

        var residentCount = await db.Residents.CountAsync(r => r.SafehouseId == id);
        var residentRecords = await db.Residents
            .Where(r => r.SafehouseId == id)
            .OrderBy(r => r.CaseControlNo)
            .Select(r => $"{r.CaseControlNo} ({r.InternalCode})")
            .Take(CascadePreviewLimit)
            .ToListAsync();

        var assignmentCount = await db.PartnerAssignments.CountAsync(a => a.SafehouseId == id);
        var assignmentRecords = await db.PartnerAssignments
            .Where(a => a.SafehouseId == id)
            .OrderByDescending(a => a.AssignmentStart)
            .Select(a => new
            {
                a.ProgramArea,
                a.AssignmentStart,
                PartnerName = a.Partner.PartnerName,
            })
            .Take(CascadePreviewLimit)
            .ToListAsync();

        var allocationCount = await db.DonationAllocations.CountAsync(a => a.SafehouseId == id);
        var allocationRecords = await db.DonationAllocations
            .Where(a => a.SafehouseId == id)
            .OrderByDescending(a => a.AllocationDate)
            .Select(a => new
            {
                a.ProgramArea,
                a.AmountAllocated,
                a.AllocationDate,
            })
            .Take(CascadePreviewLimit)
            .ToListAsync();

        var incidentCount = await db.IncidentReports.CountAsync(ir => ir.SafehouseId == id);
        var incidentRecords = await db.IncidentReports
            .Where(ir => ir.SafehouseId == id)
            .OrderByDescending(ir => ir.IncidentDate)
            .Select(ir => new
            {
                ir.IncidentType,
                ir.IncidentDate,
                ResidentCode = ir.Resident.InternalCode,
            })
            .Take(CascadePreviewLimit)
            .ToListAsync();

        return Ok(new List<CascadeImpactDto>
        {
            BuildImpact("residents", "block", residentCount, residentRecords),
            BuildImpact(
                "partner assignments",
                "detach",
                assignmentCount,
                assignmentRecords.Select(a => $"{a.PartnerName} - {a.ProgramArea} ({FormatDate(a.AssignmentStart)})").ToList()),
            BuildImpact(
                "donation allocations",
                "delete",
                allocationCount,
                allocationRecords.Select(a => $"{a.ProgramArea} allocation on {FormatDate(a.AllocationDate)} ({a.AmountAllocated:N2})").ToList()),
            BuildImpact(
                "incident reports",
                "delete",
                incidentCount,
                incidentRecords.Select(ir => $"{ir.IncidentType} on {FormatDate(ir.IncidentDate)} ({ir.ResidentCode})").ToList()),
        });
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
