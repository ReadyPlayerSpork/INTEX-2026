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
    private const string DefaultPassword = "LighthouseDev2026!";

    public static async Task SeedAsync(
        HavenForHerBackendDbContext db,
        UserManager<ApplicationUser> userManager,
        string csvDirectory,
        ILogger logger)
    {
        // Wipe all domain data so every deploy gets a fresh seed from CSVs.
        // Delete in reverse dependency order (Level 2 → 1 → 0).
        if (await db.Safehouses.AnyAsync())
        {
            logger.LogInformation("Clearing existing domain data for re-seed…");

            // Level 2
            db.IncidentReports.RemoveRange(db.IncidentReports);
            db.InterventionPlans.RemoveRange(db.InterventionPlans);
            db.HealthWellbeingRecords.RemoveRange(db.HealthWellbeingRecords);
            db.EducationRecords.RemoveRange(db.EducationRecords);
            db.HomeVisitations.RemoveRange(db.HomeVisitations);
            db.ProcessRecordings.RemoveRange(db.ProcessRecordings);
            db.InKindDonationItems.RemoveRange(db.InKindDonationItems);
            db.DonationAllocations.RemoveRange(db.DonationAllocations);

            // Level 1
            db.SafehouseMonthlyMetrics.RemoveRange(db.SafehouseMonthlyMetrics);
            db.PartnerAssignments.RemoveRange(db.PartnerAssignments);
            db.Donations.RemoveRange(db.Donations);
            db.Residents.RemoveRange(db.Residents);

            // Level 0
            db.SocialMediaPosts.RemoveRange(db.SocialMediaPosts);
            db.PublicImpactSnapshots.RemoveRange(db.PublicImpactSnapshots);
            db.Partners.RemoveRange(db.Partners);
            db.Supporters.RemoveRange(db.Supporters);
            db.Safehouses.RemoveRange(db.Safehouses);

            // CounselingRequests (no CSV source, but clear for consistency)
            db.CounselingRequests.RemoveRange(db.CounselingRequests);

            await db.SaveChangesAsync();
            logger.LogInformation("Existing domain data cleared.");
        }

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
            await CreateDefaultUsersAsync(supporters, userManager, logger);
        }
        finally
        {
            db.ChangeTracker.AutoDetectChangesEnabled = true;
        }

        logger.LogInformation("CSV seed complete.");
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

            var result = await userManager.CreateAsync(user, DefaultPassword);
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
}
