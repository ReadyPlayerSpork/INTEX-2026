using System.Net.Http.Headers;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Haven_for_Her_Backend.Services;

/// <summary>
/// Wraps the Meta Marketing API (Graph API) to create paused ad campaigns.
///
/// Flow:  Upload Image → Create Campaign → Create Ad Set → Create Ad Creative → Create Ad
/// All campaigns are created with status PAUSED so nothing goes live without manual approval.
/// </summary>
public class MetaAdsService
{
    private readonly HttpClient _http;
    private readonly ILogger<MetaAdsService> _logger;
    private readonly MetaAdsConfig _config;

    public MetaAdsService(HttpClient http, ILogger<MetaAdsService> logger, MetaAdsConfig config)
    {
        _http = http;
        _logger = logger;
        _config = config;
    }

    // ── Public entry point ─────────────────────────────────────────────────

    /// <summary>
    /// Creates a full paused ad campaign from a single request.
    /// Returns IDs for every object created so the caller can inspect them in Ads Manager.
    /// </summary>
    public async Task<CampaignResult> CreatePausedCampaignAsync(CreateCampaignRequest req)
    {
        // 1. Upload the ad image
        _logger.LogInformation("Uploading ad image to Meta...");
        var imageHash = await UploadImageAsync(req.ImageBytes, req.ImageFileName);

        // 2. Create Campaign (PAUSED)
        _logger.LogInformation("Creating campaign: {Name}", req.CampaignName);
        var campaignId = await CreateCampaignAsync(req.CampaignName);

        // 3. Create Ad Set (targeting + budget + schedule)
        _logger.LogInformation("Creating ad set for campaign {CampaignId}", campaignId);
        var adSetId = await CreateAdSetAsync(
            campaignId,
            req.CampaignName + " - Ad Set",
            req.DailyBudgetCents,
            req.Targeting,
            req.StartTime,
            req.EndTime
        );

        // 4. Create Ad Creative (image + text + link)
        _logger.LogInformation("Creating ad creative...");
        var creativeId = await CreateAdCreativeAsync(
            req.CampaignName + " - Creative",
            imageHash,
            req.PrimaryText,
            req.Headline,
            req.LinkUrl,
            req.CallToAction
        );

        // 5. Create Ad (binds creative to ad set)
        _logger.LogInformation("Creating ad...");
        var adId = await CreateAdAsync(adSetId, creativeId, req.CampaignName + " - Ad");

        return new CampaignResult
        {
            CampaignId = campaignId,
            AdSetId = adSetId,
            AdCreativeId = creativeId,
            AdId = adId,
            ImageHash = imageHash,
            Status = "PAUSED",
            AdsManagerUrl = $"https://business.facebook.com/adsmanager/manage/campaigns?act={_config.AdAccountId}&campaign_ids={campaignId}",
        };
    }

    // ── Graph API calls ────────────────────────────────────────────────────

    private async Task<string> UploadImageAsync(byte[] imageBytes, string fileName)
    {
        var url = $"/{_config.ApiVersion}/act_{_config.AdAccountId}/adimages";

        using var form = new MultipartFormDataContent();
        form.Add(new StringContent(_config.AccessToken), "access_token");
        var imageContent = new ByteArrayContent(imageBytes);
        imageContent.Headers.ContentType = new MediaTypeHeaderValue("image/png");
        form.Add(imageContent, "filename", fileName);

        var json = await PostFormAsync(url, form);

        // Response: { "images": { "<filename>": { "hash": "abc123", ... } } }
        var images = json.GetProperty("images");
        foreach (var prop in images.EnumerateObject())
        {
            return prop.Value.GetProperty("hash").GetString()!;
        }
        throw new MetaApiException("Image upload returned no hash.");
    }

    private async Task<string> CreateCampaignAsync(string name)
    {
        var url = $"/{_config.ApiVersion}/act_{_config.AdAccountId}/campaigns";
        var payload = new Dictionary<string, string>
        {
            ["name"] = name,
            ["objective"] = "OUTCOME_AWARENESS",   // broad awareness — works for nonprofits
            ["status"] = "PAUSED",
            ["special_ad_categories"] = "[]",       // no housing/credit/employment
            ["access_token"] = _config.AccessToken,
        };

        var json = await PostAsync(url, payload);
        return json.GetProperty("id").GetString()!;
    }

    private async Task<string> CreateAdSetAsync(
        string campaignId,
        string name,
        int dailyBudgetCents,
        AudienceTargeting targeting,
        DateTime? startTime,
        DateTime? endTime)
    {
        var url = $"/{_config.ApiVersion}/act_{_config.AdAccountId}/adsets";

        var targetingObj = new Dictionary<string, object>
        {
            ["geo_locations"] = new Dictionary<string, object>
            {
                ["countries"] = targeting.Countries ?? new[] { "US" },
            },
        };

        if (targeting.AgeMin.HasValue)
            targetingObj["age_min"] = targeting.AgeMin.Value;
        if (targeting.AgeMax.HasValue)
            targetingObj["age_max"] = targeting.AgeMax.Value;
        if (targeting.Genders is { Length: > 0 })
            targetingObj["genders"] = targeting.Genders;  // 1=male, 2=female
        if (targeting.Interests is { Count: > 0 })
            targetingObj["flexible_spec"] = new[]
            {
                new Dictionary<string, object>
                {
                    ["interests"] = targeting.Interests.Select(i => new { id = i.Id, name = i.Name }).ToArray(),
                },
            };

        var payload = new Dictionary<string, string>
        {
            ["campaign_id"] = campaignId,
            ["name"] = name,
            ["optimization_goal"] = "REACH",
            ["billing_event"] = "IMPRESSIONS",
            ["bid_strategy"] = "LOWEST_COST_WITHOUT_CAP",
            ["daily_budget"] = dailyBudgetCents.ToString(),  // in cents
            ["targeting"] = JsonSerializer.Serialize(targetingObj),
            ["status"] = "PAUSED",
            ["access_token"] = _config.AccessToken,
        };

        if (startTime.HasValue)
            payload["start_time"] = startTime.Value.ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ");
        if (endTime.HasValue)
            payload["end_time"] = endTime.Value.ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ");

        var json = await PostAsync(url, payload);
        return json.GetProperty("id").GetString()!;
    }

    private async Task<string> CreateAdCreativeAsync(
        string name,
        string imageHash,
        string primaryText,
        string headline,
        string linkUrl,
        string callToAction)
    {
        var url = $"/{_config.ApiVersion}/act_{_config.AdAccountId}/adcreatives";

        var ctaValue = new Dictionary<string, string> { ["link"] = linkUrl };

        var objectStorySpec = new Dictionary<string, object>
        {
            ["page_id"] = _config.PageId,
            ["link_data"] = new Dictionary<string, object>
            {
                ["image_hash"] = imageHash,
                ["link"] = linkUrl,
                ["message"] = primaryText,
                ["name"] = headline,
                ["call_to_action"] = new Dictionary<string, object>
                {
                    ["type"] = callToAction,
                    ["value"] = ctaValue,
                },
            },
        };

        var payload = new Dictionary<string, string>
        {
            ["name"] = name,
            ["object_story_spec"] = JsonSerializer.Serialize(objectStorySpec),
            ["access_token"] = _config.AccessToken,
        };

        var json = await PostAsync(url, payload);
        return json.GetProperty("id").GetString()!;
    }

    private async Task<string> CreateAdAsync(string adSetId, string creativeId, string name)
    {
        var url = $"/{_config.ApiVersion}/act_{_config.AdAccountId}/ads";
        var payload = new Dictionary<string, string>
        {
            ["name"] = name,
            ["adset_id"] = adSetId,
            ["creative"] = JsonSerializer.Serialize(new { creative_id = creativeId }),
            ["status"] = "PAUSED",
            ["access_token"] = _config.AccessToken,
        };

        var json = await PostAsync(url, payload);
        return json.GetProperty("id").GetString()!;
    }

    // ── HTTP helpers ───────────────────────────────────────────────────────

    private async Task<JsonElement> PostAsync(string url, Dictionary<string, string> payload)
    {
        using var content = new FormUrlEncodedContent(payload);
        var response = await _http.PostAsync(url, content);
        var body = await response.Content.ReadAsStringAsync();

        _logger.LogDebug("Meta API {Url} -> {Status}: {Body}", url, response.StatusCode, body);

        if (!response.IsSuccessStatusCode)
        {
            _logger.LogError("Meta API error on {Url}: {Body}", url, body);
            throw new MetaApiException($"Meta API returned {(int)response.StatusCode}: {body}");
        }

        return JsonSerializer.Deserialize<JsonElement>(body);
    }

    private async Task<JsonElement> PostFormAsync(string url, MultipartFormDataContent form)
    {
        var response = await _http.PostAsync(url, form);
        var body = await response.Content.ReadAsStringAsync();

        _logger.LogDebug("Meta API {Url} -> {Status}: {Body}", url, response.StatusCode, body);

        if (!response.IsSuccessStatusCode)
        {
            _logger.LogError("Meta API error on {Url}: {Body}", url, body);
            throw new MetaApiException($"Meta API returned {(int)response.StatusCode}: {body}");
        }

        return JsonSerializer.Deserialize<JsonElement>(body);
    }
}

// ── Configuration ──────────────────────────────────────────────────────────

public class MetaAdsConfig
{
    public string AccessToken { get; set; } = "";
    public string AdAccountId { get; set; } = "";
    public string PageId { get; set; } = "";
    public string AppId { get; set; } = "";
    public string AppSecret { get; set; } = "";
    public string ApiVersion { get; set; } = "v20.0";
}

// ── Request / Response DTOs ────────────────────────────────────────────────

public class CreateCampaignRequest
{
    public string CampaignName { get; set; } = "Haven for Her Campaign";

    /// <summary>Raw image bytes (PNG/JPG). Frontend sends base64, controller decodes.</summary>
    [JsonIgnore]
    public byte[] ImageBytes { get; set; } = Array.Empty<byte>();

    [JsonIgnore]
    public string ImageFileName { get; set; } = "ad_image.png";

    /// <summary>Base64-encoded image data from the frontend.</summary>
    public string ImageBase64 { get; set; } = "";

    public string PrimaryText { get; set; } = "";
    public string Headline { get; set; } = "Support Survivors Today";
    public string LinkUrl { get; set; } = "https://havenforher.org";

    /// <summary>Meta CTA type: LEARN_MORE, DONATE_NOW, SIGN_UP, etc.</summary>
    public string CallToAction { get; set; } = "LEARN_MORE";

    /// <summary>Daily budget in cents (e.g., 500 = $5.00/day).</summary>
    public int DailyBudgetCents { get; set; } = 500;

    public AudienceTargeting Targeting { get; set; } = new();

    public DateTime? StartTime { get; set; }
    public DateTime? EndTime { get; set; }
}

public class AudienceTargeting
{
    public string[]? Countries { get; set; } = new[] { "US" };
    public int? AgeMin { get; set; } = 18;
    public int? AgeMax { get; set; } = 65;

    /// <summary>1 = male, 2 = female. Null/empty = all genders.</summary>
    public int[]? Genders { get; set; }

    /// <summary>Interest targeting. Each entry needs an ID + name from Meta's targeting search.</summary>
    public List<InterestTarget>? Interests { get; set; }
}

public class InterestTarget
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
}

public class CampaignResult
{
    public string CampaignId { get; set; } = "";
    public string AdSetId { get; set; } = "";
    public string AdCreativeId { get; set; } = "";
    public string AdId { get; set; } = "";
    public string ImageHash { get; set; } = "";
    public string Status { get; set; } = "PAUSED";
    public string AdsManagerUrl { get; set; } = "";
}

// ── Exception ──────────────────────────────────────────────────────────────

public class MetaApiException : Exception
{
    public MetaApiException(string message) : base(message) { }
}
