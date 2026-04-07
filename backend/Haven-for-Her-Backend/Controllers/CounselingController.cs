using Haven_for_Her_Backend.Data;
using Haven_for_Her_Backend.Dtos;
using Haven_for_Her_Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Haven_for_Her_Backend.Controllers;

[ApiController]
[Route("api/counseling")]
[Authorize]
public class CounselingController(
    HavenForHerBackendDbContext db,
    UserManager<ApplicationUser> userManager) : ControllerBase
{
    /// <summary>
    /// Submit a counseling request (Survivor role).
    /// </summary>
    [HttpPost("requests")]
    [Authorize(Roles = AuthRoles.Survivor)]
    public async Task<IActionResult> CreateRequest([FromBody] CreateCounselingRequest request)
    {
        if (!ModelState.IsValid) return ValidationProblem();

        var userId = userManager.GetUserId(User)!;

        var entity = new CounselingRequest
        {
            RequestedByUserId = userId,
            Reason = request.Reason,
            PreferredDay = request.PreferredDay,
            PreferredTimeOfDay = request.PreferredTimeOfDay,
            Notes = request.Notes,
            Status = "Open",
            CreatedAtUtc = DateTime.UtcNow,
        };

        db.CounselingRequests.Add(entity);
        await db.SaveChangesAsync();

        return Ok(new { message = "Counseling request submitted.", requestId = entity.RequestId });
    }

    /// <summary>
    /// Get my counseling requests (Survivor role).
    /// </summary>
    [HttpGet("requests/mine")]
    [Authorize(Roles = AuthRoles.Survivor)]
    public async Task<IActionResult> GetMyRequests()
    {
        var user = await userManager.GetUserAsync(User);
        if (user is null) return Unauthorized();

        var requests = await db.CounselingRequests
            .Where(r => r.RequestedByUserId == user.Id)
            .OrderByDescending(r => r.CreatedAtUtc)
            .ToListAsync();

        var dtos = new List<CounselingRequestDto>();
        foreach (var r in requests)
        {
            var counselor = r.AssignedCounselorUserId != null
                ? await userManager.FindByIdAsync(r.AssignedCounselorUserId)
                : null;

            dtos.Add(new CounselingRequestDto
            {
                Id = r.RequestId,
                RequestedByEmail = user.Email ?? "",
                Reason = r.Reason,
                PreferredDay = r.PreferredDay,
                PreferredTimeOfDay = r.PreferredTimeOfDay,
                Notes = r.Notes,
                Status = r.Status,
                AssignedCounselorEmail = counselor?.Email,
                CreatedAtUtc = r.CreatedAtUtc,
            });
        }

        return Ok(dtos);
    }

    /// <summary>
    /// Get all open counseling requests (Counselor role).
    /// </summary>
    [HttpGet("requests")]
    [Authorize(Roles = AuthRoles.Counselor)]
    public async Task<IActionResult> GetAllRequests([FromQuery] string? status)
    {
        var query = db.CounselingRequests.AsQueryable();

        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(r => r.Status == status);

        var requests = await query
            .OrderByDescending(r => r.CreatedAtUtc)
            .ToListAsync();

        // Resolve emails for display
        var dtos = new List<CounselingRequestDto>();
        foreach (var r in requests)
        {
            var requester = await userManager.FindByIdAsync(r.RequestedByUserId);
            var counselor = r.AssignedCounselorUserId != null
                ? await userManager.FindByIdAsync(r.AssignedCounselorUserId)
                : null;

            dtos.Add(new CounselingRequestDto
            {
                Id = r.RequestId,
                RequestedByEmail = requester?.Email ?? "Unknown",
                Reason = r.Reason,
                PreferredDay = r.PreferredDay,
                PreferredTimeOfDay = r.PreferredTimeOfDay,
                Notes = r.Notes,
                Status = r.Status,
                AssignedCounselorEmail = counselor?.Email,
                CreatedAtUtc = r.CreatedAtUtc,
            });
        }

        return Ok(dtos);
    }

    /// <summary>
    /// Assign yourself to a counseling request (Counselor role).
    /// </summary>
    [HttpPost("requests/{requestId:int}/assign")]
    [Authorize(Roles = AuthRoles.Counselor)]
    public async Task<IActionResult> AssignToRequest(int requestId)
    {
        var request = await db.CounselingRequests.FindAsync(requestId);
        if (request is null) return NotFound();
        if (request.Status != "Open")
            return BadRequest(new ErrorResponse("This request is no longer open."));

        request.AssignedCounselorUserId = userManager.GetUserId(User)!;
        request.Status = "Assigned";
        await db.SaveChangesAsync();

        return Ok(new { message = "You have been assigned to this counseling request." });
    }
}
