using Haven_for_Her_Backend.Data;
using Haven_for_Her_Backend.Dtos;
using Haven_for_Her_Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Haven_for_Her_Backend.Controllers;

[ApiController]
[Route("api/social")]
[Authorize(Roles = AuthRoles.SocialMedia)]
public class SocialMediaController(HavenForHerBackendDbContext db) : ControllerBase
{
    /// <summary>
    /// Social media dashboard — aggregate metrics with month-over-month comparison.
    /// </summary>
    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard()
    {
        var now = DateTime.UtcNow;
        var thisMonthStart = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var lastMonthStart = thisMonthStart.AddMonths(-1);

        var thisMonthPosts = db.SocialMediaPosts.Where(p => p.CreatedAt >= thisMonthStart);
        var lastMonthPosts = db.SocialMediaPosts.Where(p => p.CreatedAt >= lastMonthStart && p.CreatedAt < thisMonthStart);

        // --- Aggregate metrics ---
        var totalPosts = await db.SocialMediaPosts.CountAsync();
        var totalImpressions = await db.SocialMediaPosts.SumAsync(p => (long)p.Impressions);
        var totalReach = await db.SocialMediaPosts.SumAsync(p => (long)p.Reach);
        var avgEngagementRate = await db.SocialMediaPosts.AnyAsync()
            ? await db.SocialMediaPosts.AverageAsync(p => p.EngagementRate)
            : 0m;

        // This month vs last month
        var thisMonthImpressions = await thisMonthPosts.SumAsync(p => (long)p.Impressions);
        var lastMonthImpressions = await lastMonthPosts.SumAsync(p => (long)p.Impressions);
        var thisMonthReach = await thisMonthPosts.SumAsync(p => (long)p.Reach);
        var lastMonthReach = await lastMonthPosts.SumAsync(p => (long)p.Reach);
        var thisMonthEngagement = await thisMonthPosts.AnyAsync()
            ? await thisMonthPosts.AverageAsync(p => p.EngagementRate) : 0m;
        var lastMonthEngagement = await lastMonthPosts.AnyAsync()
            ? await lastMonthPosts.AverageAsync(p => p.EngagementRate) : 0m;

        // --- Top content topics by total engagement ---
        var topContentTopics = await db.SocialMediaPosts
            .GroupBy(p => p.ContentTopic)
            .Select(g => new
            {
                topic = g.Key,
                totalEngagement = g.Sum(p => p.Likes + p.Comments + p.Shares + p.Saves),
                postCount = g.Count(),
            })
            .OrderByDescending(g => g.totalEngagement)
            .Take(10)
            .ToListAsync();

        // --- Platform breakdown ---
        var platformBreakdown = await db.SocialMediaPosts
            .GroupBy(p => p.Platform)
            .Select(g => new
            {
                platform = g.Key,
                postCount = g.Count(),
                totalImpressions = g.Sum(p => (long)p.Impressions),
                totalReach = g.Sum(p => (long)p.Reach),
                avgEngagementRate = g.Average(p => p.EngagementRate),
            })
            .OrderByDescending(g => g.totalImpressions)
            .ToListAsync();

        // --- Best posting times (top 5 by avg engagement rate) ---
        var bestPostingTimes = await db.SocialMediaPosts
            .GroupBy(p => new { p.DayOfWeek, p.PostHour })
            .Select(g => new
            {
                dayOfWeek = g.Key.DayOfWeek,
                postHour = g.Key.PostHour,
                avgEngagementRate = g.Average(p => p.EngagementRate),
                postCount = g.Count(),
            })
            .OrderByDescending(g => g.avgEngagementRate)
            .Take(5)
            .ToListAsync();

        // --- Content that drives donations (top 5 by avg donation referrals) ---
        var contentThatDrivesDonations = await db.SocialMediaPosts
            .GroupBy(p => p.ContentTopic)
            .Select(g => new
            {
                topic = g.Key,
                avgDonationReferrals = g.Average(p => (double)p.DonationReferrals),
                totalDonationReferrals = g.Sum(p => p.DonationReferrals),
                avgEstimatedValue = g.Average(p => (double)p.EstimatedDonationValuePhp),
                postCount = g.Count(),
            })
            .OrderByDescending(g => g.avgDonationReferrals)
            .Take(5)
            .ToListAsync();

        return Ok(new
        {
            totalPosts,
            totalImpressions,
            totalReach,
            avgEngagementRate,
            monthOverMonth = new
            {
                impressions = new { thisMonth = thisMonthImpressions, lastMonth = lastMonthImpressions, changePercent = PercentChange(lastMonthImpressions, thisMonthImpressions) },
                reach = new { thisMonth = thisMonthReach, lastMonth = lastMonthReach, changePercent = PercentChange(lastMonthReach, thisMonthReach) },
                engagementRate = new { thisMonth = thisMonthEngagement, lastMonth = lastMonthEngagement, changePercent = PercentChange(lastMonthEngagement, thisMonthEngagement) },
            },
            topContentTopics,
            platformBreakdown,
            bestPostingTimes,
            contentThatDrivesDonations,
        });
    }

    /// <summary>
    /// Paginated list of social media posts with optional platform filter and sorting.
    /// </summary>
    [HttpGet("posts")]
    public async Task<IActionResult> ListPosts(
        [FromQuery] string? platform,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string sortBy = "createdAt",
        [FromQuery] string sortDir = "desc")
    {
        var query = db.SocialMediaPosts.AsQueryable();

        if (!string.IsNullOrWhiteSpace(platform))
            query = query.Where(p => p.Platform == platform);

        query = sortBy.ToLowerInvariant() switch
        {
            "engagementrate" => sortDir.ToLowerInvariant() == "asc"
                ? query.OrderBy(p => p.EngagementRate)
                : query.OrderByDescending(p => p.EngagementRate),
            "donationreferrals" => sortDir.ToLowerInvariant() == "asc"
                ? query.OrderBy(p => p.DonationReferrals)
                : query.OrderByDescending(p => p.DonationReferrals),
            _ => sortDir.ToLowerInvariant() == "asc"
                ? query.OrderBy(p => p.CreatedAt)
                : query.OrderByDescending(p => p.CreatedAt),
        };

        var totalCount = await query.CountAsync();
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return Ok(new PaginatedResponse<SocialMediaPost>(items, page, pageSize, totalCount));
    }

    /// <summary>
    /// Get a single social media post by ID.
    /// </summary>
    [HttpGet("posts/{id:int}")]
    public async Task<IActionResult> GetPost(int id)
    {
        var post = await db.SocialMediaPosts.FindAsync(id);
        if (post is null)
            return NotFound(new { message = "Post not found." });

        return Ok(post);
    }

    /// <summary>
    /// Create a new social media post record (manual entry).
    /// </summary>
    [HttpPost("posts")]
    public async Task<IActionResult> CreatePost([FromBody] SocialMediaPost post)
    {
        post.PostId = 0; // ensure EF assigns the key
        if (post.CreatedAt == default)
            post.CreatedAt = DateTime.UtcNow;

        db.SocialMediaPosts.Add(post);
        await db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetPost), new { id = post.PostId }, post);
    }

    /// <summary>
    /// Update an existing social media post record.
    /// </summary>
    [HttpPut("posts/{id:int}")]
    public async Task<IActionResult> UpdatePost(int id, [FromBody] SocialMediaPost updated)
    {
        var existing = await db.SocialMediaPosts.FindAsync(id);
        if (existing is null)
            return NotFound(new { message = "Post not found." });

        // Map all mutable fields
        existing.Platform = updated.Platform;
        existing.PlatformPostId = updated.PlatformPostId;
        existing.PostUrl = updated.PostUrl;
        existing.CreatedAt = updated.CreatedAt;
        existing.DayOfWeek = updated.DayOfWeek;
        existing.PostHour = updated.PostHour;
        existing.PostType = updated.PostType;
        existing.MediaType = updated.MediaType;
        existing.Caption = updated.Caption;
        existing.Hashtags = updated.Hashtags;
        existing.NumHashtags = updated.NumHashtags;
        existing.MentionsCount = updated.MentionsCount;
        existing.HasCallToAction = updated.HasCallToAction;
        existing.CallToActionType = updated.CallToActionType;
        existing.ContentTopic = updated.ContentTopic;
        existing.SentimentTone = updated.SentimentTone;
        existing.CaptionLength = updated.CaptionLength;
        existing.FeaturesResidentStory = updated.FeaturesResidentStory;
        existing.CampaignName = updated.CampaignName;
        existing.IsBoosted = updated.IsBoosted;
        existing.BoostBudgetPhp = updated.BoostBudgetPhp;
        existing.Impressions = updated.Impressions;
        existing.Reach = updated.Reach;
        existing.Likes = updated.Likes;
        existing.Comments = updated.Comments;
        existing.Shares = updated.Shares;
        existing.Saves = updated.Saves;
        existing.ClickThroughs = updated.ClickThroughs;
        existing.VideoViews = updated.VideoViews;
        existing.EngagementRate = updated.EngagementRate;
        existing.ProfileVisits = updated.ProfileVisits;
        existing.DonationReferrals = updated.DonationReferrals;
        existing.EstimatedDonationValuePhp = updated.EstimatedDonationValuePhp;
        existing.FollowerCountAtPost = updated.FollowerCountAtPost;
        existing.WatchTimeSeconds = updated.WatchTimeSeconds;
        existing.AvgViewDurationSeconds = updated.AvgViewDurationSeconds;
        existing.SubscriberCountAtPost = updated.SubscriberCountAtPost;
        existing.Forwards = updated.Forwards;

        await db.SaveChangesAsync();

        return Ok(existing);
    }

    private static double? PercentChange(decimal previous, decimal current) =>
        previous == 0 ? null : Math.Round((double)((current - previous) / previous * 100), 2);

    private static double? PercentChange(long previous, long current) =>
        previous == 0 ? null : Math.Round((double)(current - previous) / previous * 100, 2);
}
