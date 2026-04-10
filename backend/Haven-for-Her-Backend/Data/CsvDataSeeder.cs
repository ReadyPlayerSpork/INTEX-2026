using System.Globalization;
using System.Reflection;
using CsvHelper;
using CsvHelper.Configuration;
using CsvHelper.TypeConversion;
using Haven_for_Her_Backend.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Haven_for_Her_Backend.Data;

public static class CsvDataSeeder
{
    /// <summary>
    /// All CSVs required for a full domain seed. Must exist before we wipe tables,
    /// otherwise a failed mid-seed run leaves the database empty (REFRESH=true disaster).
    /// </summary>
    private static readonly string[] RequiredSeedCsvs =
    [
        "safehouses.csv",
        "supporters.csv",
        "partners.csv",
        "public_impact_snapshots.csv",
        "social_media_posts.csv",
        "residents.csv",
        "donations.csv",
        "partner_assignments.csv",
        "safehouse_monthly_metrics.csv",
        "donation_allocations.csv",
        "in_kind_donation_items.csv",
        "process_recordings.csv",
        "home_visitations.csv",
        "education_records.csv",
        "health_wellbeing_records.csv",
        "intervention_plans.csv",
        "incident_reports.csv",
    ];

    public static void ValidateSeedDirectoryOrThrow(string csvDirectory)
    {
        if (string.IsNullOrWhiteSpace(csvDirectory) || !Directory.Exists(csvDirectory))
            throw new DirectoryNotFoundException($"CSV seed directory not found: '{csvDirectory}'");

        var missing = RequiredSeedCsvs
            .Where(f => !File.Exists(Path.Combine(csvDirectory, f)))
            .ToList();

        if (missing.Count > 0)
            throw new FileNotFoundException(
                $"REFRESH aborted: {missing.Count} required CSV(s) missing under '{csvDirectory}': {string.Join(", ", missing)}");
    }

    public static async Task SeedAsync(
        HavenForHerBackendDbContext db,
        UserManager<ApplicationUser> userManager,
        string csvDirectory,
        string? supporterPassword,
        ILogger logger)
    {
        ValidateSeedDirectoryOrThrow(csvDirectory);
        logger.LogInformation("CSV pre-flight OK — all {Count} required files present under {Dir}", RequiredSeedCsvs.Length, csvDirectory);

        // Wipe all domain data so every deploy gets a fresh seed from CSVs.
        // Uses ExecuteDeleteAsync (bulk SQL DELETE) — much faster than RemoveRange.
        // Delete in reverse dependency order (Level 2 → 1 → 0).
        logger.LogInformation("Clearing existing domain data for re-seed…");

        // Level 2
        await db.IncidentReports.ExecuteDeleteAsync();
        await db.InterventionPlans.ExecuteDeleteAsync();
        await db.HealthWellbeingRecords.ExecuteDeleteAsync();
        await db.EducationRecords.ExecuteDeleteAsync();
        await db.HomeVisitations.ExecuteDeleteAsync();
        await db.ProcessRecordings.ExecuteDeleteAsync();
        await db.InKindDonationItems.ExecuteDeleteAsync();
        await db.DonationAllocations.ExecuteDeleteAsync();

        // Level 1
        await db.SafehouseMonthlyMetrics.ExecuteDeleteAsync();
        await db.PartnerAssignments.ExecuteDeleteAsync();
        await db.Donations.ExecuteDeleteAsync();
        await db.Residents.ExecuteDeleteAsync();

        // Level 0
        await db.SocialMediaPosts.ExecuteDeleteAsync();
        await db.PublicImpactSnapshots.ExecuteDeleteAsync();
        await db.Partners.ExecuteDeleteAsync();
        await db.Supporters.ExecuteDeleteAsync();
        await db.Safehouses.ExecuteDeleteAsync();

        // CounselingRequests (no CSV source, but clear for consistency)
        await db.CounselingRequests.ExecuteDeleteAsync();

        logger.LogInformation("Existing domain data cleared.");

        logger.LogInformation("Seeding database from CSVs in {Dir}…", csvDirectory);

        db.ChangeTracker.AutoDetectChangesEnabled = false;
        try
        {
            // ── Level 0: tables with no FK dependencies ──
            var safehouses = ReadCsv<Safehouse>(csvDirectory, "safehouses.csv");
            db.Safehouses.AddRange(safehouses);

            var supporters = ReadCsv<Supporter>(csvDirectory, "supporters.csv");
            db.Supporters.AddRange(supporters);

            var partners = ReadCsv<Partner>(csvDirectory, "partners.csv");
            db.Partners.AddRange(partners);

            var snapshots = ReadCsv<PublicImpactSnapshot>(csvDirectory, "public_impact_snapshots.csv");
            db.PublicImpactSnapshots.AddRange(snapshots);

            var posts = ReadCsv<SocialMediaPost>(csvDirectory, "social_media_posts.csv");
            db.SocialMediaPosts.AddRange(posts);

            await db.SaveChangesAsync();
            logger.LogInformation(
                "Level 0 — {sh} safehouses, {su} supporters, {pa} partners, {sn} snapshots, {po} posts",
                safehouses.Count, supporters.Count, partners.Count, snapshots.Count, posts.Count);

            // ── Level 1: depends on Level 0 ──
            var residents = ReadCsv<Resident>(csvDirectory, "residents.csv");
            db.Residents.AddRange(residents);

            var donations = ReadCsv<Donation>(csvDirectory, "donations.csv");
            db.Donations.AddRange(donations);
            var maxDonationId = donations.Count > 0 ? donations.Max(x => x.DonationId) : 0;
            var recentDonations = BuildRecentDonations(supporters, maxDonationId + 1);
            db.Donations.AddRange(recentDonations);

            var partnerAssignments = ReadCsv<PartnerAssignment>(csvDirectory, "partner_assignments.csv");
            db.PartnerAssignments.AddRange(partnerAssignments);

            var metrics = ReadCsv<SafehouseMonthlyMetric>(csvDirectory, "safehouse_monthly_metrics.csv");
            db.SafehouseMonthlyMetrics.AddRange(metrics);

            await db.SaveChangesAsync();
            logger.LogInformation(
                "Level 1 — {r} residents, {d} donations, {pa} partner assignments, {m} monthly metrics",
                residents.Count, donations.Count, partnerAssignments.Count, metrics.Count);

            // ── Level 2: depends on Level 1 ──
            var allocations = ReadCsv<DonationAllocation>(csvDirectory, "donation_allocations.csv");
            db.DonationAllocations.AddRange(allocations);

            var items = ReadCsv<InKindDonationItem>(csvDirectory, "in_kind_donation_items.csv");
            db.InKindDonationItems.AddRange(items);

            var recordings = ReadCsv<ProcessRecording>(csvDirectory, "process_recordings.csv");
            db.ProcessRecordings.AddRange(recordings);

            var visitations = ReadCsv<HomeVisitation>(csvDirectory, "home_visitations.csv");
            db.HomeVisitations.AddRange(visitations);

            var education = ReadCsv<EducationRecord>(csvDirectory, "education_records.csv");
            db.EducationRecords.AddRange(education);

            var health = ReadCsv<HealthWellbeingRecord>(csvDirectory, "health_wellbeing_records.csv");
            db.HealthWellbeingRecords.AddRange(health);

            var interventions = ReadCsv<InterventionPlan>(csvDirectory, "intervention_plans.csv");
            db.InterventionPlans.AddRange(interventions);

            var incidents = ReadCsv<IncidentReport>(csvDirectory, "incident_reports.csv");
            db.IncidentReports.AddRange(incidents);

            await db.SaveChangesAsync();
            logger.LogInformation(
                "Level 2 — {a} allocations, {ik} in-kind items, {pr} recordings, {hv} visitations, " +
                "{ed} education, {hw} health, {ip} interventions, {ir} incidents",
                allocations.Count, items.Count, recordings.Count, visitations.Count,
                education.Count, health.Count, interventions.Count, incidents.Count);

            // ── Create default user accounts from supporters ──
            if (!string.IsNullOrWhiteSpace(supporterPassword))
            {
                await CreateDefaultUsersAsync(supporters, userManager, supporterPassword, logger);
            }
            else
            {
                logger.LogWarning("SeedSupporterPassword not set — skipping supporter account creation");
            }
        }
        finally
        {
            db.ChangeTracker.AutoDetectChangesEnabled = true;
        }

        logger.LogInformation("CSV seed complete.");
    }

    /// <summary>
    /// Adds monetary donations dated within the last 30 days (UTC) so dashboards and donor views show recent activity after each re-seed.
    /// </summary>
    private static List<Donation> BuildRecentDonations(IReadOnlyList<Supporter> supporters, int startId)
    {
        if (supporters.Count == 0) return [];

        var supporterIds = supporters.Select(s => s.SupporterId).ToArray();
        var rng = new Random(20260410);
        var today = DateOnly.FromDateTime(DateTime.UtcNow.Date);
        var channels = new[] { "Website", "Campaign", "Direct", "Event", "PartnerReferral", "SocialMedia" };
        var campaigns = new[] { "Spring Renewal", "Safe Homes Fund", "Community Circle", "Year-End Hope", "GivingTuesday" };
        var list = new List<Donation>(16);

        for (var i = 0; i < 16; i++)
        {
            var daysAgo = rng.Next(0, 30);
            var amount = Math.Round((decimal)rng.NextDouble() * 220m + 25m, 2);
            list.Add(new Donation
            {
                DonationId = startId + i,
                SupporterId = supporterIds[rng.Next(supporterIds.Length)],
                DonationType = "Monetary",
                DonationDate = today.AddDays(-daysAgo),
                ChannelSource = channels[rng.Next(channels.Length)],
                CurrencyCode = "USD",
                Amount = amount,
                EstimatedValue = amount,
                ImpactUnit = "dollars",
                IsRecurring = rng.Next(4) == 0,
                CampaignName = campaigns[rng.Next(campaigns.Length)],
                Notes = "CSV seed — synthetic recent gift (within last 30 days, UTC)",
            });
        }

        return list;
    }

    // ─── CSV reading ────────────────────────────────────────────────

    private static List<T> ReadCsv<T>(string dir, string file)
    {
        using var reader = new StreamReader(Path.Combine(dir, file));
        using var csv = new CsvReader(reader, new CsvConfiguration(CultureInfo.InvariantCulture)
        {
            PrepareHeaderForMatch = args => args.Header.Replace("_", "").ToLower(),
            MissingFieldFound = null,
            HeaderValidated = null,
        });

        csv.Context.TypeConverterCache.AddConverter<int>(new RobustIntConverter());
        csv.Context.TypeConverterCache.AddConverter<int?>(new RobustNullableIntConverter());
        csv.Context.TypeConverterCache.AddConverter<decimal>(new RobustDecimalConverter());
        csv.Context.TypeConverterCache.AddConverter<DateTime>(new UtcDateTimeConverter());
        csv.Context.TypeConverterCache.AddConverter<DateTime?>(new UtcNullableDateTimeConverter());

        var map = csv.Context.AutoMap<T>();
        PruneNavigationProperties(map);
        csv.Context.RegisterClassMap(map);

        return csv.GetRecords<T>().ToList();
    }

    private static void PruneNavigationProperties<T>(ClassMap<T> map)
    {
        foreach (var mm in map.MemberMaps.ToList())
        {
            if (mm.Data.Member is not PropertyInfo pi) continue;
            if (!IsScalar(pi.PropertyType))
                mm.Ignore();
        }
        map.ReferenceMaps.Clear();
    }

    private static bool IsScalar(Type t)
    {
        var u = Nullable.GetUnderlyingType(t) ?? t;
        return u.IsPrimitive || u == typeof(string) || u == typeof(decimal)
            || u == typeof(DateTime) || u == typeof(DateOnly);
    }

    // ─── User account creation ──────────────────────────────────────

    private static async Task CreateDefaultUsersAsync(
        List<Supporter> supporters,
        UserManager<ApplicationUser> userManager,
        string defaultPassword,
        ILogger logger)
    {
        var created = 0;
        foreach (var s in supporters)
        {
            if (string.IsNullOrWhiteSpace(s.Email)) continue;
            if (await userManager.FindByEmailAsync(s.Email) is not null) continue;

            var user = new ApplicationUser
            {
                UserName = s.Email,
                Email = s.Email,
                EmailConfirmed = true,
                Persona = "Donor",
                AcquisitionSource = s.AcquisitionChannel,
                CreatedAtUtc = s.CreatedAt,
            };

            var result = await userManager.CreateAsync(user, defaultPassword);
            if (!result.Succeeded)
            {
                logger.LogWarning("Could not create user {Email}: {Errors}",
                    s.Email, string.Join("; ", result.Errors.Select(e => e.Description)));
                continue;
            }

            await userManager.AddToRoleAsync(user, AuthRoles.Donor);
            await userManager.AddToRoleAsync(user, AuthRoles.Survivor);
            created++;
        }

        logger.LogInformation("Created {Count} default user accounts from supporter records", created);
    }

    // ─── Custom type converters ─────────────────────────────────────

    /// <summary>Handles empty → 0 and float strings like "8.0" → 8.</summary>
    private sealed class RobustIntConverter : DefaultTypeConverter
    {
        public override object ConvertFromString(string? text, IReaderRow row, MemberMapData memberMapData)
        {
            if (string.IsNullOrWhiteSpace(text)) return 0;
            if (double.TryParse(text, NumberStyles.Any, CultureInfo.InvariantCulture, out var d))
                return (int)Math.Round(d);
            return 0;
        }
    }

    /// <summary>Handles empty → null and float strings like "8.0" → 8.</summary>
    private sealed class RobustNullableIntConverter : DefaultTypeConverter
    {
        public override object? ConvertFromString(string? text, IReaderRow row, MemberMapData memberMapData)
        {
            if (string.IsNullOrWhiteSpace(text)) return null;
            if (double.TryParse(text, NumberStyles.Any, CultureInfo.InvariantCulture, out var d))
                return (int?)Math.Round(d);
            return null;
        }
    }

    /// <summary>Handles empty → 0m for non-nullable decimal columns (e.g. safehouse_monthly_metrics).</summary>
    private sealed class RobustDecimalConverter : DefaultTypeConverter
    {
        public override object ConvertFromString(string? text, IReaderRow row, MemberMapData memberMapData)
        {
            if (string.IsNullOrWhiteSpace(text)) return 0m;
            if (decimal.TryParse(text, NumberStyles.Any, CultureInfo.InvariantCulture, out var d))
                return d;
            return 0m;
        }
    }

    /// <summary>Parses DateTime and forces Kind=Utc so Npgsql accepts it for timestamptz columns.</summary>
    private sealed class UtcDateTimeConverter : DefaultTypeConverter
    {
        public override object ConvertFromString(string? text, IReaderRow row, MemberMapData memberMapData)
        {
            if (string.IsNullOrWhiteSpace(text)) return DateTime.UtcNow;
            if (DateTime.TryParse(text, CultureInfo.InvariantCulture, DateTimeStyles.None, out var dt))
                return DateTime.SpecifyKind(dt, DateTimeKind.Utc);
            return DateTime.UtcNow;
        }
    }

    /// <summary>Parses nullable DateTime and forces Kind=Utc so Npgsql accepts it for timestamptz columns.</summary>
    private sealed class UtcNullableDateTimeConverter : DefaultTypeConverter
    {
        public override object? ConvertFromString(string? text, IReaderRow row, MemberMapData memberMapData)
        {
            if (string.IsNullOrWhiteSpace(text)) return null;
            if (DateTime.TryParse(text, CultureInfo.InvariantCulture, DateTimeStyles.None, out var dt))
                return DateTime.SpecifyKind(dt, DateTimeKind.Utc);
            return null;
        }
    }
}
