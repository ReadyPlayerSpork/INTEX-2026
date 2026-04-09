using Haven_for_Her_Backend.Data;
using Haven_for_Her_Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Haven_for_Her_Backend.Controllers;

/// <summary>
/// Meta (Facebook/Instagram) Ads API integration.
/// Allows SocialMedia and Admin users to create paused ad campaigns,
/// search for interest-based targeting, and preview campaign settings.
/// </summary>
[ApiController]
[Route("api/meta-ads")]
[Authorize(Roles = $"{AuthRoles.SocialMedia},{AuthRoles.Admin}")]
public class MetaAdsController : ControllerBase
{
    private readonly MetaAdsService _metaAds;
    private readonly MetaAdsConfig _config;
    private readonly ILogger<MetaAdsController> _logger;

    public MetaAdsController(MetaAdsService metaAds, MetaAdsConfig config, ILogger<MetaAdsController> logger)
    {
        _metaAds = metaAds;
        _config = config;
        _logger = logger;
    }

    /// <summary>
    /// Health check — confirms Meta credentials are configured.
    /// </summary>
    [HttpGet("status")]
    public IActionResult Status()
    {
        var configured = !string.IsNullOrEmpty(_config.AccessToken)
                      && !string.IsNullOrEmpty(_config.AdAccountId)
                      && !string.IsNullOrEmpty(_config.PageId);

        return Ok(new
        {
            configured,
            adAccountId = _config.AdAccountId,
            pageId = _config.PageId,
            apiVersion = _config.ApiVersion,
        });
    }

    /// <summary>
    /// Create a full paused ad campaign.
    ///
    /// The frontend sends an image (base64), ad copy, and audience targeting.
    /// This endpoint creates: Campaign → Ad Set → Ad Creative → Ad, all PAUSED.
    /// Returns IDs and an Ads Manager link to review before publishing.
    /// </summary>
    [HttpPost("campaigns")]
    public async Task<IActionResult> CreateCampaign([FromBody] CreateCampaignRequest request)
    {
        // Validate required fields
        if (string.IsNullOrWhiteSpace(request.ImageBase64))
            return BadRequest(new { error = "ImageBase64 is required." });
        if (string.IsNullOrWhiteSpace(request.PrimaryText))
            return BadRequest(new { error = "PrimaryText is required." });

        // Decode base64 image
        try
        {
            // Strip data URI prefix if present (e.g., "data:image/png;base64,...")
            var base64 = request.ImageBase64;
            if (base64.Contains(','))
                base64 = base64[(base64.IndexOf(',') + 1)..];

            request.ImageBytes = Convert.FromBase64String(base64);

            // Infer file extension from data URI or default to png
            if (request.ImageBase64.Contains("image/jpeg"))
                request.ImageFileName = "ad_image.jpg";
            else if (request.ImageBase64.Contains("image/webp"))
                request.ImageFileName = "ad_image.webp";
            else
                request.ImageFileName = "ad_image.png";
        }
        catch (FormatException)
        {
            return BadRequest(new { error = "ImageBase64 is not valid base64." });
        }

        if (!string.IsNullOrEmpty(_config.AccessToken))
        {
            // Real Meta API call
            try
            {
                var result = await _metaAds.CreatePausedCampaignAsync(request);

                _logger.LogInformation(
                    "Campaign created: {CampaignId} (Ad Set: {AdSetId}, Ad: {AdId})",
                    result.CampaignId, result.AdSetId, result.AdId);

                return Ok(result);
            }
            catch (MetaApiException ex)
            {
                _logger.LogError(ex, "Meta Ads API error");
                return StatusCode(502, new { error = "Meta API error", detail = ex.Message });
            }
        }
        else
        {
            // Dev mode — return a simulated response so frontend can be built without real credentials
            _logger.LogWarning("Meta Ads API not configured — returning simulated response.");
            return Ok(new CampaignResult
            {
                CampaignId = "SIMULATED_CAMPAIGN_123",
                AdSetId = "SIMULATED_ADSET_456",
                AdCreativeId = "SIMULATED_CREATIVE_789",
                AdId = "SIMULATED_AD_012",
                ImageHash = "SIMULATED_HASH",
                Status = "PAUSED (simulated)",
                AdsManagerUrl = "https://business.facebook.com/adsmanager",
            });
        }
    }

    /// <summary>
    /// Search Meta's targeting API for interests/behaviors by keyword.
    /// Used by the frontend to let users build audience targeting.
    /// </summary>
    [HttpGet("targeting/search")]
    public async Task<IActionResult> SearchTargetingInterests([FromQuery] string q)
    {
        if (string.IsNullOrWhiteSpace(q) || q.Length < 2)
            return BadRequest(new { error = "Query must be at least 2 characters." });

        if (string.IsNullOrEmpty(_config.AccessToken))
            return Ok(new
            {
                data = new[]
                {
                    new { id = "6003139266461", name = "Volunteering", audience_size = 350_000_000, type = "interests" },
                    new { id = "6003107902433", name = "Nonprofit organization", audience_size = 200_000_000, type = "interests" },
                    new { id = "6003384829661", name = "Charity", audience_size = 150_000_000, type = "interests" },
                }
            });

        try
        {
            var url = $"/{_config.ApiVersion}/search?type=adinterest&q={Uri.EscapeDataString(q)}&access_token={_config.AccessToken}";
            var client = new HttpClient { BaseAddress = new Uri("https://graph.facebook.com") };
            var response = await client.GetAsync(url);
            var body = await response.Content.ReadAsStringAsync();

            return new ContentResult
            {
                StatusCode = (int)response.StatusCode,
                Content = body,
                ContentType = "application/json",
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to search Meta targeting interests");
            return StatusCode(502, new { error = "Failed to search targeting interests." });
        }
    }

    /// <summary>
    /// Returns available CTA types and campaign defaults for the frontend to populate dropdowns.
    /// </summary>
    [HttpGet("defaults")]
    public IActionResult GetDefaults()
    {
        return Ok(new
        {
            callToActionTypes = new[]
            {
                new { value = "LEARN_MORE", label = "Learn More" },
                new { value = "DONATE_NOW", label = "Donate Now" },
                new { value = "SIGN_UP", label = "Sign Up" },
                new { value = "CONTACT_US", label = "Contact Us" },
                new { value = "GET_OFFER", label = "Get Offer" },
                new { value = "SUBSCRIBE", label = "Subscribe" },
                new { value = "WATCH_MORE", label = "Watch More" },
            },
            defaultTargeting = new
            {
                countries = new[] { "US" },
                ageMin = 18,
                ageMax = 65,
            },
            defaultDailyBudgetCents = 500,
            defaultObjective = "OUTCOME_AWARENESS",
            note = "All campaigns are created PAUSED. You must manually activate them in Meta Ads Manager.",
        });
    }
}
