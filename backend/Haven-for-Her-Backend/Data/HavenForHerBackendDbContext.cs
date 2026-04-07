using Haven_for_Her_Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Haven_for_Her_Backend.Data;

public class HavenForHerBackendDbContext : DbContext
{
    public HavenForHerBackendDbContext(DbContextOptions<HavenForHerBackendDbContext> options) : base(options)
    {
    }

    // Donor & Support Domain
    public DbSet<Safehouse> Safehouses { get; set; }
    public DbSet<Partner> Partners { get; set; }
    public DbSet<PartnerAssignment> PartnerAssignments { get; set; }
    public DbSet<Supporter> Supporters { get; set; }
    public DbSet<Donation> Donations { get; set; }
    public DbSet<InKindDonationItem> InKindDonationItems { get; set; }
    public DbSet<DonationAllocation> DonationAllocations { get; set; }

    // Case Management Domain
    public DbSet<Resident> Residents { get; set; }
    public DbSet<ProcessRecording> ProcessRecordings { get; set; }
    public DbSet<HomeVisitation> HomeVisitations { get; set; }
    public DbSet<EducationRecord> EducationRecords { get; set; }
    public DbSet<HealthWellbeingRecord> HealthWellbeingRecords { get; set; }
    public DbSet<InterventionPlan> InterventionPlans { get; set; }
    public DbSet<IncidentReport> IncidentReports { get; set; }

    // Counseling & Appointments
    public DbSet<CounselingRequest> CounselingRequests { get; set; }

    // Outreach & Communication Domain
    public DbSet<SocialMediaPost> SocialMediaPosts { get; set; }
    public DbSet<SafehouseMonthlyMetric> SafehouseMonthlyMetrics { get; set; }
    public DbSet<PublicImpactSnapshot> PublicImpactSnapshots { get; set; }
}