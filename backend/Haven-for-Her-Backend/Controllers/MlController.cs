using Haven_for_Her_Backend.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Haven_for_Her_Backend.Controllers;

/// <summary>
/// Proxies ML prediction requests to the Python Flask microservice.
/// Each endpoint is role-gated to the appropriate team.
/// </summary>
[ApiController]
[Route("api/ml")]
[Authorize]
public class MlController(IHttpClientFactory httpClientFactory, ILogger<MlController> logger) : ControllerBase
{
    private HttpClient CreateClient() => httpClientFactory.CreateClient("MlService");

    // ── Donor Churn (Financial / Admin) ─────────────────────────────────

    [HttpGet("donor-churn")]
    [Authorize(Roles = $"{AuthRoles.Financial},{AuthRoles.Admin}")]
    public Task<IActionResult> DonorChurn([FromQuery] int supporter_id)
        => ProxyGet($"/api/ml/donor-churn?supporter_id={supporter_id}");

    [HttpGet("donor-churn/batch")]
    [Authorize(Roles = $"{AuthRoles.Financial},{AuthRoles.Admin}")]
    public Task<IActionResult> DonorChurnBatch()
        => ProxyGet("/api/ml/donor-churn/batch");

    // ── Incident Risk (Counselor / Admin) ───────────────────────────────

    [HttpGet("incident-risk")]
    [Authorize(Roles = $"{AuthRoles.Counselor},{AuthRoles.Admin}")]
    public Task<IActionResult> IncidentRisk([FromQuery] int resident_id)
        => ProxyGet($"/api/ml/incident-risk?resident_id={resident_id}");

    [HttpGet("incident-risk/alerts")]
    [Authorize(Roles = $"{AuthRoles.Counselor},{AuthRoles.Admin}")]
    public Task<IActionResult> IncidentRiskAlerts()
        => ProxyGet("/api/ml/incident-risk/alerts");

    // ── Resident Progress (Counselor / Admin) ───────────────────────────

    [HttpGet("resident-progress")]
    [Authorize(Roles = $"{AuthRoles.Counselor},{AuthRoles.Admin}")]
    public Task<IActionResult> ResidentProgress([FromQuery] int resident_id)
        => ProxyGet($"/api/ml/resident-progress?resident_id={resident_id}");

    // ── Safehouse Outcomes (Admin) ──────────────────────────────────────

    [HttpGet("safehouse-outcomes")]
    [Authorize(Roles = AuthRoles.Admin)]
    public Task<IActionResult> SafehouseOutcomes()
        => ProxyGet("/api/ml/safehouse-outcomes");

    // ── Social Media (SocialMedia / Admin) ──────────────────────────────

    [HttpGet("social-media/recommendations")]
    [Authorize(Roles = $"{AuthRoles.SocialMedia},{AuthRoles.Admin}")]
    public Task<IActionResult> SocialMediaRecommendations()
        => ProxyGet("/api/ml/social-media/recommendations");

    [HttpPost("social-media/predict")]
    [Authorize(Roles = $"{AuthRoles.SocialMedia},{AuthRoles.Admin}")]
    public Task<IActionResult> SocialMediaPredict()
        => ProxyPost("/api/ml/social-media/predict");

    // ── Proxy helpers ───────────────────────────────────────────────────

    private async Task<IActionResult> ProxyGet(string path)
    {
        try
        {
            var client = CreateClient();
            var response = await client.GetAsync(path);
            var content = await response.Content.ReadAsStringAsync();
            return new ContentResult
            {
                StatusCode = (int)response.StatusCode,
                Content = content,
                ContentType = "application/json",
            };
        }
        catch (TaskCanceledException)
        {
            logger.LogWarning("ML service request timed out: {Path}", path);
            return StatusCode(StatusCodes.Status503ServiceUnavailable,
                new { error = "ML service is unavailable or timed out." });
        }
        catch (HttpRequestException ex)
        {
            logger.LogWarning(ex, "ML service unreachable: {Path}", path);
            return StatusCode(StatusCodes.Status503ServiceUnavailable,
                new { error = "ML service is currently unavailable." });
        }
    }

    private async Task<IActionResult> ProxyPost(string path)
    {
        try
        {
            var client = CreateClient();
            using var reader = new StreamReader(Request.Body);
            var body = await reader.ReadToEndAsync();
            var httpContent = new StringContent(body, System.Text.Encoding.UTF8, "application/json");
            var response = await client.PostAsync(path, httpContent);
            var content = await response.Content.ReadAsStringAsync();
            return new ContentResult
            {
                StatusCode = (int)response.StatusCode,
                Content = content,
                ContentType = "application/json",
            };
        }
        catch (TaskCanceledException)
        {
            logger.LogWarning("ML service request timed out: {Path}", path);
            return StatusCode(StatusCodes.Status503ServiceUnavailable,
                new { error = "ML service is unavailable or timed out." });
        }
        catch (HttpRequestException ex)
        {
            logger.LogWarning(ex, "ML service unreachable: {Path}", path);
            return StatusCode(StatusCodes.Status503ServiceUnavailable,
                new { error = "ML service is currently unavailable." });
        }
    }
}
