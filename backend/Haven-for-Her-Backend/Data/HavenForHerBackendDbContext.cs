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

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ── Safehouse one-to-many relationships ──────────────────────────
        modelBuilder.Entity<Resident>()
            .HasOne(r => r.Safehouse)
            .WithMany(s => s.Residents)
            .HasForeignKey(r => r.SafehouseId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<SafehouseMonthlyMetric>()
            .HasOne(m => m.Safehouse)
            .WithMany(s => s.MonthlyMetrics)
            .HasForeignKey(m => m.SafehouseId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<IncidentReport>()
            .HasOne(i => i.Safehouse)
            .WithMany(s => s.IncidentReports)
            .HasForeignKey(i => i.SafehouseId)
            .OnDelete(DeleteBehavior.Cascade);

        // ── Partner one-to-many relationships ────────────────────────────
        // PartnerAssignment is an explicit join entity (Partner ↔ Safehouse),
        // NOT an implicit many-to-many.
        modelBuilder.Entity<PartnerAssignment>()
            .HasOne(pa => pa.Partner)
            .WithMany(p => p.PartnerAssignments)
            .HasForeignKey(pa => pa.PartnerId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<PartnerAssignment>()
            .HasOne(pa => pa.Safehouse)
            .WithMany(s => s.PartnerAssignments)
            .HasForeignKey(pa => pa.SafehouseId)
            .OnDelete(DeleteBehavior.SetNull);

        // ── Supporter → Donation ─────────────────────────────────────────
        modelBuilder.Entity<Donation>()
            .HasOne(d => d.Supporter)
            .WithMany(s => s.Donations)
            .HasForeignKey(d => d.SupporterId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Donation>()
            .HasOne(d => d.CreatedByPartner)
            .WithMany(p => p.CreatedDonations)
            .HasForeignKey(d => d.CreatedByPartnerId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<Donation>()
            .HasOne(d => d.ReferralPost)
            .WithMany(sp => sp.ReferredDonations)
            .HasForeignKey(d => d.ReferralPostId)
            .OnDelete(DeleteBehavior.SetNull);

        // ── Donation child entities ──────────────────────────────────────
        // DonationAllocation is an explicit join entity (Donation ↔ Safehouse),
        // NOT an implicit many-to-many.
        modelBuilder.Entity<DonationAllocation>()
            .HasOne(da => da.Donation)
            .WithMany(d => d.Allocations)
            .HasForeignKey(da => da.DonationId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<DonationAllocation>()
            .HasOne(da => da.Safehouse)
            .WithMany(s => s.DonationAllocations)
            .HasForeignKey(da => da.SafehouseId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<InKindDonationItem>()
            .HasOne(ik => ik.Donation)
            .WithMany(d => d.InKindItems)
            .HasForeignKey(ik => ik.DonationId)
            .OnDelete(DeleteBehavior.Cascade);

        // ── Resident child entities ──────────────────────────────────────
        modelBuilder.Entity<ProcessRecording>()
            .HasOne(pr => pr.Resident)
            .WithMany(r => r.ProcessRecordings)
            .HasForeignKey(pr => pr.ResidentId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<HomeVisitation>()
            .HasOne(hv => hv.Resident)
            .WithMany(r => r.HomeVisitations)
            .HasForeignKey(hv => hv.ResidentId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<EducationRecord>()
            .HasOne(er => er.Resident)
            .WithMany(r => r.EducationRecords)
            .HasForeignKey(er => er.ResidentId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<HealthWellbeingRecord>()
            .HasOne(hw => hw.Resident)
            .WithMany(r => r.HealthWellbeingRecords)
            .HasForeignKey(hw => hw.ResidentId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<InterventionPlan>()
            .HasOne(ip => ip.Resident)
            .WithMany(r => r.InterventionPlans)
            .HasForeignKey(ip => ip.ResidentId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<IncidentReport>()
            .HasOne(ir => ir.Resident)
            .WithMany(r => r.IncidentReports)
            .HasForeignKey(ir => ir.ResidentId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}