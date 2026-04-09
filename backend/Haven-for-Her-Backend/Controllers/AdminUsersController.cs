using Haven_for_Her_Backend.Data;
using Haven_for_Her_Backend.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Haven_for_Her_Backend.Controllers;

[ApiController]
[Route("api/admin/users")]
[Authorize(Roles = AuthRoles.Admin)]
public class AdminUsersController(
    UserManager<ApplicationUser> userManager) : ControllerBase
{
    /// <summary>
    /// List all users with their roles. Supports search and pagination.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> ListUsers(
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 25)
    {
        var query = userManager.Users.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(u => u.Email != null && u.Email.ToLower().Contains(term));
        }

        var totalCount = await query.CountAsync();

        var users = await query
            .OrderBy(u => u.Email)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var dtos = new List<UserDto>();
        foreach (var user in users)
        {
            var roles = await userManager.GetRolesAsync(user);
            dtos.Add(new UserDto
            {
                Id = user.Id,
                Email = user.Email ?? "",
                Persona = user.Persona,
                AcquisitionSource = user.AcquisitionSource,
                Roles = roles.OrderBy(r => r).ToList(),
                CreatedAtUtc = user.CreatedAtUtc,
            });
        }

        return Ok(new PaginatedResponse<UserDto>(dtos, page, pageSize, totalCount));
    }

    /// <summary>
    /// Get a single user by ID.
    /// </summary>
    [HttpGet("{userId}")]
    public async Task<IActionResult> GetUser(string userId)
    {
        var user = await userManager.FindByIdAsync(userId);
        if (user is null) return NotFound();

        var roles = await userManager.GetRolesAsync(user);
        return Ok(new UserDto
        {
            Id = user.Id,
            Email = user.Email ?? "",
            Persona = user.Persona,
            AcquisitionSource = user.AcquisitionSource,
            Roles = roles.OrderBy(r => r).ToList(),
            CreatedAtUtc = user.CreatedAtUtc,
        });
    }

    /// <summary>
    /// Add a role to a user. Admins cannot remove their own Admin role.
    /// </summary>
    [HttpPost("{userId}/roles")]
    public async Task<IActionResult> AddRole(string userId, [FromBody] UserRoleChangeRequest request)
    {
        if (!AuthRoles.All.Contains(request.Role))
            return BadRequest(new ErrorResponse($"Invalid role '{request.Role}'."));

        var user = await userManager.FindByIdAsync(userId);
        if (user is null) return NotFound();

        if (await userManager.IsInRoleAsync(user, request.Role))
            return Ok(new { message = $"User already has role '{request.Role}'." });

        var result = await userManager.AddToRoleAsync(user, request.Role);
        if (!result.Succeeded)
            return BadRequest(new ErrorResponse("Failed to add role."));

        return Ok(new { message = $"Role '{request.Role}' added." });
    }

    /// <summary>
    /// Remove a role from a user. Admins cannot remove Admin from themselves.
    /// </summary>
    [HttpDelete("{userId}/roles/{role}")]
    public async Task<IActionResult> RemoveRole(string userId, string role)
    {
        if (!AuthRoles.All.Contains(role))
            return BadRequest(new ErrorResponse($"Invalid role '{role}'."));

        var user = await userManager.FindByIdAsync(userId);
        if (user is null) return NotFound();

        // Prevent admins from removing their own Admin role
        var currentUserId = userManager.GetUserId(User);
        if (userId == currentUserId && role == AuthRoles.Admin)
            return BadRequest(new ErrorResponse("You cannot remove the Admin role from yourself."));

        if (!await userManager.IsInRoleAsync(user, role))
            return Ok(new { message = $"User does not have role '{role}'." });

        var result = await userManager.RemoveFromRoleAsync(user, role);
        if (!result.Succeeded)
            return BadRequest(new ErrorResponse("Failed to remove role."));

        return Ok(new { message = $"Role '{role}' removed." });
    }

    /// <summary>
    /// Create a new user account with an optional initial set of roles.
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            return BadRequest(new ErrorResponse("Email and password are required."));

        var existing = await userManager.FindByEmailAsync(request.Email);
        if (existing is not null)
            return BadRequest(new ErrorResponse("A user with that email already exists."));

        var user = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
            EmailConfirmed = true,
        };

        var createResult = await userManager.CreateAsync(user, request.Password);
        if (!createResult.Succeeded)
        {
            var errors = string.Join("; ", createResult.Errors.Select(e => e.Description));
            return BadRequest(new ErrorResponse(errors));
        }

        // Assign requested roles (invalid ones skipped)
        var validRoles = (request.Roles ?? []).Where(r => AuthRoles.All.Contains(r)).ToList();
        foreach (var role in validRoles)
            await userManager.AddToRoleAsync(user, role);

        var assignedRoles = await userManager.GetRolesAsync(user);
        return Ok(new UserDto
        {
            Id = user.Id,
            Email = user.Email,
            Persona = user.Persona,
            AcquisitionSource = user.AcquisitionSource,
            Roles = assignedRoles.OrderBy(r => r).ToList(),
            CreatedAtUtc = user.CreatedAtUtc,
        });
    }

    /// <summary>
    /// Delete a user account permanently.
    /// Admins cannot delete their own account.
    /// </summary>
    [HttpDelete("{userId}")]
    public async Task<IActionResult> DeleteUser(string userId)
    {
        var currentUserId = userManager.GetUserId(User);
        if (userId == currentUserId)
            return BadRequest(new ErrorResponse("You cannot delete your own account."));

        var user = await userManager.FindByIdAsync(userId);
        if (user is null) return NotFound();

        var result = await userManager.DeleteAsync(user);
        if (!result.Succeeded)
            return BadRequest(new ErrorResponse("Failed to delete user."));

        return Ok(new { message = "User deleted." });
    }
}
