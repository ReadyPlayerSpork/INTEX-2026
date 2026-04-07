using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Haven_for_Her_Backend.Migrations.Domain
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "partners",
                columns: table => new
                {
                    partner_id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    partner_name = table.Column<string>(type: "TEXT", nullable: false),
                    partner_type = table.Column<string>(type: "TEXT", nullable: false),
                    role_type = table.Column<string>(type: "TEXT", nullable: false),
                    contact_name = table.Column<string>(type: "TEXT", nullable: false),
                    email = table.Column<string>(type: "TEXT", nullable: false),
                    phone = table.Column<string>(type: "TEXT", nullable: false),
                    region = table.Column<string>(type: "TEXT", nullable: false),
                    status = table.Column<string>(type: "TEXT", nullable: false),
                    start_date = table.Column<DateOnly>(type: "TEXT", nullable: false),
                    end_date = table.Column<DateOnly>(type: "TEXT", nullable: true),
                    notes = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_partners", x => x.partner_id);
                });

            migrationBuilder.CreateTable(
                name: "public_impact_snapshots",
                columns: table => new
                {
                    snapshot_id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    snapshot_date = table.Column<DateOnly>(type: "TEXT", nullable: false),
                    headline = table.Column<string>(type: "TEXT", nullable: false),
                    summary_text = table.Column<string>(type: "TEXT", nullable: false),
                    metric_payload_json = table.Column<string>(type: "TEXT", nullable: false),
                    is_published = table.Column<bool>(type: "INTEGER", nullable: false),
                    published_at = table.Column<DateOnly>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_public_impact_snapshots", x => x.snapshot_id);
                });

            migrationBuilder.CreateTable(
                name: "safehouses",
                columns: table => new
                {
                    safehouse_id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    safehouse_code = table.Column<string>(type: "TEXT", nullable: false),
                    name = table.Column<string>(type: "TEXT", nullable: false),
                    region = table.Column<string>(type: "TEXT", nullable: false),
                    city = table.Column<string>(type: "TEXT", nullable: false),
                    province = table.Column<string>(type: "TEXT", nullable: false),
                    country = table.Column<string>(type: "TEXT", nullable: false),
                    open_date = table.Column<DateOnly>(type: "TEXT", nullable: false),
                    status = table.Column<string>(type: "TEXT", nullable: false),
                    capacity_girls = table.Column<int>(type: "INTEGER", nullable: false),
                    capacity_staff = table.Column<int>(type: "INTEGER", nullable: false),
                    current_occupancy = table.Column<int>(type: "INTEGER", nullable: false),
                    notes = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_safehouses", x => x.safehouse_id);
                });

            migrationBuilder.CreateTable(
                name: "social_media_posts",
                columns: table => new
                {
                    post_id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    platform = table.Column<string>(type: "TEXT", nullable: false),
                    platform_post_id = table.Column<string>(type: "TEXT", nullable: false),
                    post_url = table.Column<string>(type: "TEXT", nullable: false),
                    created_at = table.Column<DateTime>(type: "TEXT", nullable: false),
                    day_of_week = table.Column<string>(type: "TEXT", nullable: false),
                    post_hour = table.Column<int>(type: "INTEGER", nullable: false),
                    post_type = table.Column<string>(type: "TEXT", nullable: false),
                    media_type = table.Column<string>(type: "TEXT", nullable: false),
                    caption = table.Column<string>(type: "TEXT", nullable: false),
                    hashtags = table.Column<string>(type: "TEXT", nullable: true),
                    num_hashtags = table.Column<int>(type: "INTEGER", nullable: false),
                    mentions_count = table.Column<int>(type: "INTEGER", nullable: false),
                    has_call_to_action = table.Column<bool>(type: "INTEGER", nullable: false),
                    call_to_action_type = table.Column<string>(type: "TEXT", nullable: true),
                    content_topic = table.Column<string>(type: "TEXT", nullable: false),
                    sentiment_tone = table.Column<string>(type: "TEXT", nullable: false),
                    caption_length = table.Column<int>(type: "INTEGER", nullable: false),
                    features_resident_story = table.Column<bool>(type: "INTEGER", nullable: false),
                    campaign_name = table.Column<string>(type: "TEXT", nullable: true),
                    is_boosted = table.Column<bool>(type: "INTEGER", nullable: false),
                    boost_budget_php = table.Column<decimal>(type: "TEXT", nullable: true),
                    impressions = table.Column<int>(type: "INTEGER", nullable: false),
                    reach = table.Column<int>(type: "INTEGER", nullable: false),
                    likes = table.Column<int>(type: "INTEGER", nullable: false),
                    comments = table.Column<int>(type: "INTEGER", nullable: false),
                    shares = table.Column<int>(type: "INTEGER", nullable: false),
                    saves = table.Column<int>(type: "INTEGER", nullable: false),
                    click_throughs = table.Column<int>(type: "INTEGER", nullable: false),
                    video_views = table.Column<int>(type: "INTEGER", nullable: true),
                    engagement_rate = table.Column<decimal>(type: "TEXT", nullable: false),
                    profile_visits = table.Column<int>(type: "INTEGER", nullable: false),
                    donation_referrals = table.Column<int>(type: "INTEGER", nullable: false),
                    estimated_donation_value_php = table.Column<decimal>(type: "TEXT", nullable: false),
                    follower_count_at_post = table.Column<int>(type: "INTEGER", nullable: false),
                    watch_time_seconds = table.Column<int>(type: "INTEGER", nullable: true),
                    avg_view_duration_seconds = table.Column<int>(type: "INTEGER", nullable: true),
                    subscriber_count_at_post = table.Column<int>(type: "INTEGER", nullable: true),
                    forwards = table.Column<int>(type: "INTEGER", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_social_media_posts", x => x.post_id);
                });

            migrationBuilder.CreateTable(
                name: "supporters",
                columns: table => new
                {
                    supporter_id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    supporter_type = table.Column<string>(type: "TEXT", nullable: false),
                    display_name = table.Column<string>(type: "TEXT", nullable: false),
                    organization_name = table.Column<string>(type: "TEXT", nullable: true),
                    first_name = table.Column<string>(type: "TEXT", nullable: true),
                    last_name = table.Column<string>(type: "TEXT", nullable: true),
                    relationship_type = table.Column<string>(type: "TEXT", nullable: false),
                    region = table.Column<string>(type: "TEXT", nullable: false),
                    country = table.Column<string>(type: "TEXT", nullable: false),
                    email = table.Column<string>(type: "TEXT", nullable: false),
                    phone = table.Column<string>(type: "TEXT", nullable: false),
                    status = table.Column<string>(type: "TEXT", nullable: false),
                    first_donation_date = table.Column<DateOnly>(type: "TEXT", nullable: true),
                    acquisition_channel = table.Column<string>(type: "TEXT", nullable: false),
                    created_at = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_supporters", x => x.supporter_id);
                });

            migrationBuilder.CreateTable(
                name: "partner_assignments",
                columns: table => new
                {
                    assignment_id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    partner_id = table.Column<int>(type: "INTEGER", nullable: false),
                    safehouse_id = table.Column<int>(type: "INTEGER", nullable: true),
                    program_area = table.Column<string>(type: "TEXT", nullable: false),
                    assignment_start = table.Column<DateOnly>(type: "TEXT", nullable: false),
                    assignment_end = table.Column<DateOnly>(type: "TEXT", nullable: true),
                    responsibility_notes = table.Column<string>(type: "TEXT", nullable: true),
                    is_primary = table.Column<bool>(type: "INTEGER", nullable: false),
                    status = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_partner_assignments", x => x.assignment_id);
                    table.ForeignKey(
                        name: "FK_partner_assignments_partners_partner_id",
                        column: x => x.partner_id,
                        principalTable: "partners",
                        principalColumn: "partner_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_partner_assignments_safehouses_safehouse_id",
                        column: x => x.safehouse_id,
                        principalTable: "safehouses",
                        principalColumn: "safehouse_id");
                });

            migrationBuilder.CreateTable(
                name: "residents",
                columns: table => new
                {
                    resident_id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    case_control_no = table.Column<string>(type: "TEXT", nullable: false),
                    internal_code = table.Column<string>(type: "TEXT", nullable: false),
                    safehouse_id = table.Column<int>(type: "INTEGER", nullable: false),
                    case_status = table.Column<string>(type: "TEXT", nullable: false),
                    sex = table.Column<string>(type: "TEXT", nullable: false),
                    date_of_birth = table.Column<DateOnly>(type: "TEXT", nullable: false),
                    birth_status = table.Column<string>(type: "TEXT", nullable: false),
                    place_of_birth = table.Column<string>(type: "TEXT", nullable: false),
                    religion = table.Column<string>(type: "TEXT", nullable: false),
                    case_category = table.Column<string>(type: "TEXT", nullable: false),
                    sub_cat_orphaned = table.Column<bool>(type: "INTEGER", nullable: false),
                    sub_cat_trafficked = table.Column<bool>(type: "INTEGER", nullable: false),
                    sub_cat_child_labor = table.Column<bool>(type: "INTEGER", nullable: false),
                    sub_cat_physical_abuse = table.Column<bool>(type: "INTEGER", nullable: false),
                    sub_cat_sexual_abuse = table.Column<bool>(type: "INTEGER", nullable: false),
                    sub_cat_osaec = table.Column<bool>(type: "INTEGER", nullable: false),
                    sub_cat_cicl = table.Column<bool>(type: "INTEGER", nullable: false),
                    sub_cat_at_risk = table.Column<bool>(type: "INTEGER", nullable: false),
                    sub_cat_street_child = table.Column<bool>(type: "INTEGER", nullable: false),
                    sub_cat_child_with_hiv = table.Column<bool>(type: "INTEGER", nullable: false),
                    is_pwd = table.Column<bool>(type: "INTEGER", nullable: false),
                    pwd_type = table.Column<string>(type: "TEXT", nullable: true),
                    has_special_needs = table.Column<bool>(type: "INTEGER", nullable: false),
                    special_needs_diagnosis = table.Column<string>(type: "TEXT", nullable: true),
                    family_is_4ps = table.Column<bool>(type: "INTEGER", nullable: false),
                    family_solo_parent = table.Column<bool>(type: "INTEGER", nullable: false),
                    family_indigenous = table.Column<bool>(type: "INTEGER", nullable: false),
                    family_parent_pwd = table.Column<bool>(type: "INTEGER", nullable: false),
                    family_informal_settler = table.Column<bool>(type: "INTEGER", nullable: false),
                    date_of_admission = table.Column<DateOnly>(type: "TEXT", nullable: false),
                    age_upon_admission = table.Column<string>(type: "TEXT", nullable: true),
                    present_age = table.Column<string>(type: "TEXT", nullable: true),
                    length_of_stay = table.Column<string>(type: "TEXT", nullable: true),
                    referral_source = table.Column<string>(type: "TEXT", nullable: false),
                    referring_agency_person = table.Column<string>(type: "TEXT", nullable: true),
                    date_colb_registered = table.Column<DateOnly>(type: "TEXT", nullable: true),
                    date_colb_obtained = table.Column<DateOnly>(type: "TEXT", nullable: true),
                    assigned_social_worker = table.Column<string>(type: "TEXT", nullable: false),
                    initial_case_assessment = table.Column<string>(type: "TEXT", nullable: true),
                    date_case_study_prepared = table.Column<DateOnly>(type: "TEXT", nullable: true),
                    reintegration_type = table.Column<string>(type: "TEXT", nullable: true),
                    reintegration_status = table.Column<string>(type: "TEXT", nullable: true),
                    initial_risk_level = table.Column<string>(type: "TEXT", nullable: false),
                    current_risk_level = table.Column<string>(type: "TEXT", nullable: false),
                    date_enrolled = table.Column<DateOnly>(type: "TEXT", nullable: false),
                    date_closed = table.Column<DateOnly>(type: "TEXT", nullable: true),
                    created_at = table.Column<DateTime>(type: "TEXT", nullable: false),
                    notes_restricted = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_residents", x => x.resident_id);
                    table.ForeignKey(
                        name: "FK_residents_safehouses_safehouse_id",
                        column: x => x.safehouse_id,
                        principalTable: "safehouses",
                        principalColumn: "safehouse_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "safehouse_monthly_metrics",
                columns: table => new
                {
                    metric_id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    safehouse_id = table.Column<int>(type: "INTEGER", nullable: false),
                    month_start = table.Column<DateOnly>(type: "TEXT", nullable: false),
                    month_end = table.Column<DateOnly>(type: "TEXT", nullable: false),
                    active_residents = table.Column<int>(type: "INTEGER", nullable: false),
                    avg_education_progress = table.Column<decimal>(type: "TEXT", nullable: false),
                    avg_health_score = table.Column<decimal>(type: "TEXT", nullable: false),
                    process_recording_count = table.Column<int>(type: "INTEGER", nullable: false),
                    home_visitation_count = table.Column<int>(type: "INTEGER", nullable: false),
                    incident_count = table.Column<int>(type: "INTEGER", nullable: false),
                    notes = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_safehouse_monthly_metrics", x => x.metric_id);
                    table.ForeignKey(
                        name: "FK_safehouse_monthly_metrics_safehouses_safehouse_id",
                        column: x => x.safehouse_id,
                        principalTable: "safehouses",
                        principalColumn: "safehouse_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "donations",
                columns: table => new
                {
                    donation_id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    supporter_id = table.Column<int>(type: "INTEGER", nullable: false),
                    donation_type = table.Column<string>(type: "TEXT", nullable: false),
                    donation_date = table.Column<DateOnly>(type: "TEXT", nullable: false),
                    channel_source = table.Column<string>(type: "TEXT", nullable: false),
                    currency_code = table.Column<string>(type: "TEXT", nullable: true),
                    amount = table.Column<decimal>(type: "TEXT", nullable: true),
                    estimated_value = table.Column<decimal>(type: "TEXT", nullable: true),
                    impact_unit = table.Column<string>(type: "TEXT", nullable: true),
                    is_recurring = table.Column<bool>(type: "INTEGER", nullable: false),
                    campaign_name = table.Column<string>(type: "TEXT", nullable: true),
                    notes = table.Column<string>(type: "TEXT", nullable: true),
                    created_by_partner_id = table.Column<int>(type: "INTEGER", nullable: true),
                    referral_post_id = table.Column<int>(type: "INTEGER", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_donations", x => x.donation_id);
                    table.ForeignKey(
                        name: "FK_donations_partners_created_by_partner_id",
                        column: x => x.created_by_partner_id,
                        principalTable: "partners",
                        principalColumn: "partner_id");
                    table.ForeignKey(
                        name: "FK_donations_social_media_posts_referral_post_id",
                        column: x => x.referral_post_id,
                        principalTable: "social_media_posts",
                        principalColumn: "post_id");
                    table.ForeignKey(
                        name: "FK_donations_supporters_supporter_id",
                        column: x => x.supporter_id,
                        principalTable: "supporters",
                        principalColumn: "supporter_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "education_records",
                columns: table => new
                {
                    education_record_id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    resident_id = table.Column<int>(type: "INTEGER", nullable: false),
                    record_date = table.Column<DateOnly>(type: "TEXT", nullable: false),
                    school_name = table.Column<string>(type: "TEXT", nullable: false),
                    education_level = table.Column<string>(type: "TEXT", nullable: false),
                    enrollment_status = table.Column<string>(type: "TEXT", nullable: false),
                    attendance_rate = table.Column<decimal>(type: "TEXT", nullable: false),
                    progress_percent = table.Column<decimal>(type: "TEXT", nullable: false),
                    completion_status = table.Column<string>(type: "TEXT", nullable: false),
                    notes = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_education_records", x => x.education_record_id);
                    table.ForeignKey(
                        name: "FK_education_records_residents_resident_id",
                        column: x => x.resident_id,
                        principalTable: "residents",
                        principalColumn: "resident_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "health_wellbeing_records",
                columns: table => new
                {
                    health_record_id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    resident_id = table.Column<int>(type: "INTEGER", nullable: false),
                    record_date = table.Column<DateOnly>(type: "TEXT", nullable: false),
                    weight_kg = table.Column<decimal>(type: "TEXT", nullable: false),
                    height_cm = table.Column<decimal>(type: "TEXT", nullable: false),
                    bmi = table.Column<decimal>(type: "TEXT", nullable: false),
                    nutrition_score = table.Column<decimal>(type: "TEXT", nullable: false),
                    sleep_quality_score = table.Column<decimal>(type: "TEXT", nullable: false),
                    energy_level_score = table.Column<decimal>(type: "TEXT", nullable: false),
                    general_health_score = table.Column<decimal>(type: "TEXT", nullable: false),
                    medical_checkup_done = table.Column<bool>(type: "INTEGER", nullable: false),
                    dental_checkup_done = table.Column<bool>(type: "INTEGER", nullable: false),
                    psychological_checkup_done = table.Column<bool>(type: "INTEGER", nullable: false),
                    notes = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_health_wellbeing_records", x => x.health_record_id);
                    table.ForeignKey(
                        name: "FK_health_wellbeing_records_residents_resident_id",
                        column: x => x.resident_id,
                        principalTable: "residents",
                        principalColumn: "resident_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "home_visitations",
                columns: table => new
                {
                    visitation_id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    resident_id = table.Column<int>(type: "INTEGER", nullable: false),
                    visit_date = table.Column<DateOnly>(type: "TEXT", nullable: false),
                    social_worker = table.Column<string>(type: "TEXT", nullable: false),
                    visit_type = table.Column<string>(type: "TEXT", nullable: false),
                    location_visited = table.Column<string>(type: "TEXT", nullable: false),
                    family_members_present = table.Column<string>(type: "TEXT", nullable: false),
                    purpose = table.Column<string>(type: "TEXT", nullable: false),
                    observations = table.Column<string>(type: "TEXT", nullable: false),
                    family_cooperation_level = table.Column<string>(type: "TEXT", nullable: false),
                    safety_concerns_noted = table.Column<bool>(type: "INTEGER", nullable: false),
                    follow_up_needed = table.Column<bool>(type: "INTEGER", nullable: false),
                    follow_up_notes = table.Column<string>(type: "TEXT", nullable: true),
                    visit_outcome = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_home_visitations", x => x.visitation_id);
                    table.ForeignKey(
                        name: "FK_home_visitations_residents_resident_id",
                        column: x => x.resident_id,
                        principalTable: "residents",
                        principalColumn: "resident_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "incident_reports",
                columns: table => new
                {
                    incident_id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    resident_id = table.Column<int>(type: "INTEGER", nullable: false),
                    safehouse_id = table.Column<int>(type: "INTEGER", nullable: false),
                    incident_date = table.Column<DateOnly>(type: "TEXT", nullable: false),
                    incident_type = table.Column<string>(type: "TEXT", nullable: false),
                    severity = table.Column<string>(type: "TEXT", nullable: false),
                    description = table.Column<string>(type: "TEXT", nullable: false),
                    response_taken = table.Column<string>(type: "TEXT", nullable: false),
                    resolved = table.Column<bool>(type: "INTEGER", nullable: false),
                    resolution_date = table.Column<DateOnly>(type: "TEXT", nullable: true),
                    reported_by = table.Column<string>(type: "TEXT", nullable: false),
                    follow_up_required = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_incident_reports", x => x.incident_id);
                    table.ForeignKey(
                        name: "FK_incident_reports_residents_resident_id",
                        column: x => x.resident_id,
                        principalTable: "residents",
                        principalColumn: "resident_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_incident_reports_safehouses_safehouse_id",
                        column: x => x.safehouse_id,
                        principalTable: "safehouses",
                        principalColumn: "safehouse_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "intervention_plans",
                columns: table => new
                {
                    plan_id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    resident_id = table.Column<int>(type: "INTEGER", nullable: false),
                    plan_category = table.Column<string>(type: "TEXT", nullable: false),
                    plan_description = table.Column<string>(type: "TEXT", nullable: false),
                    services_provided = table.Column<string>(type: "TEXT", nullable: false),
                    target_value = table.Column<decimal>(type: "TEXT", nullable: true),
                    target_date = table.Column<DateOnly>(type: "TEXT", nullable: false),
                    status = table.Column<string>(type: "TEXT", nullable: false),
                    case_conference_date = table.Column<DateOnly>(type: "TEXT", nullable: true),
                    created_at = table.Column<DateTime>(type: "TEXT", nullable: false),
                    updated_at = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_intervention_plans", x => x.plan_id);
                    table.ForeignKey(
                        name: "FK_intervention_plans_residents_resident_id",
                        column: x => x.resident_id,
                        principalTable: "residents",
                        principalColumn: "resident_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "process_recordings",
                columns: table => new
                {
                    recording_id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    resident_id = table.Column<int>(type: "INTEGER", nullable: false),
                    session_date = table.Column<DateOnly>(type: "TEXT", nullable: false),
                    social_worker = table.Column<string>(type: "TEXT", nullable: false),
                    session_type = table.Column<string>(type: "TEXT", nullable: false),
                    session_duration_minutes = table.Column<int>(type: "INTEGER", nullable: false),
                    emotional_state_observed = table.Column<string>(type: "TEXT", nullable: false),
                    emotional_state_end = table.Column<string>(type: "TEXT", nullable: false),
                    session_narrative = table.Column<string>(type: "TEXT", nullable: false),
                    interventions_applied = table.Column<string>(type: "TEXT", nullable: false),
                    follow_up_actions = table.Column<string>(type: "TEXT", nullable: false),
                    progress_noted = table.Column<bool>(type: "INTEGER", nullable: false),
                    concerns_flagged = table.Column<bool>(type: "INTEGER", nullable: false),
                    referral_made = table.Column<bool>(type: "INTEGER", nullable: false),
                    notes_restricted = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_process_recordings", x => x.recording_id);
                    table.ForeignKey(
                        name: "FK_process_recordings_residents_resident_id",
                        column: x => x.resident_id,
                        principalTable: "residents",
                        principalColumn: "resident_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "donation_allocations",
                columns: table => new
                {
                    allocation_id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    donation_id = table.Column<int>(type: "INTEGER", nullable: false),
                    safehouse_id = table.Column<int>(type: "INTEGER", nullable: false),
                    program_area = table.Column<string>(type: "TEXT", nullable: false),
                    amount_allocated = table.Column<decimal>(type: "TEXT", nullable: false),
                    allocation_date = table.Column<DateOnly>(type: "TEXT", nullable: false),
                    allocation_notes = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_donation_allocations", x => x.allocation_id);
                    table.ForeignKey(
                        name: "FK_donation_allocations_donations_donation_id",
                        column: x => x.donation_id,
                        principalTable: "donations",
                        principalColumn: "donation_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_donation_allocations_safehouses_safehouse_id",
                        column: x => x.safehouse_id,
                        principalTable: "safehouses",
                        principalColumn: "safehouse_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "in_kind_donation_items",
                columns: table => new
                {
                    item_id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    donation_id = table.Column<int>(type: "INTEGER", nullable: false),
                    item_name = table.Column<string>(type: "TEXT", nullable: false),
                    item_category = table.Column<string>(type: "TEXT", nullable: false),
                    quantity = table.Column<int>(type: "INTEGER", nullable: false),
                    unit_of_measure = table.Column<string>(type: "TEXT", nullable: false),
                    estimated_unit_value = table.Column<decimal>(type: "TEXT", nullable: false),
                    intended_use = table.Column<string>(type: "TEXT", nullable: false),
                    received_condition = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_in_kind_donation_items", x => x.item_id);
                    table.ForeignKey(
                        name: "FK_in_kind_donation_items_donations_donation_id",
                        column: x => x.donation_id,
                        principalTable: "donations",
                        principalColumn: "donation_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_donation_allocations_donation_id",
                table: "donation_allocations",
                column: "donation_id");

            migrationBuilder.CreateIndex(
                name: "IX_donation_allocations_safehouse_id",
                table: "donation_allocations",
                column: "safehouse_id");

            migrationBuilder.CreateIndex(
                name: "IX_donations_created_by_partner_id",
                table: "donations",
                column: "created_by_partner_id");

            migrationBuilder.CreateIndex(
                name: "IX_donations_referral_post_id",
                table: "donations",
                column: "referral_post_id");

            migrationBuilder.CreateIndex(
                name: "IX_donations_supporter_id",
                table: "donations",
                column: "supporter_id");

            migrationBuilder.CreateIndex(
                name: "IX_education_records_resident_id",
                table: "education_records",
                column: "resident_id");

            migrationBuilder.CreateIndex(
                name: "IX_health_wellbeing_records_resident_id",
                table: "health_wellbeing_records",
                column: "resident_id");

            migrationBuilder.CreateIndex(
                name: "IX_home_visitations_resident_id",
                table: "home_visitations",
                column: "resident_id");

            migrationBuilder.CreateIndex(
                name: "IX_in_kind_donation_items_donation_id",
                table: "in_kind_donation_items",
                column: "donation_id");

            migrationBuilder.CreateIndex(
                name: "IX_incident_reports_resident_id",
                table: "incident_reports",
                column: "resident_id");

            migrationBuilder.CreateIndex(
                name: "IX_incident_reports_safehouse_id",
                table: "incident_reports",
                column: "safehouse_id");

            migrationBuilder.CreateIndex(
                name: "IX_intervention_plans_resident_id",
                table: "intervention_plans",
                column: "resident_id");

            migrationBuilder.CreateIndex(
                name: "IX_partner_assignments_partner_id",
                table: "partner_assignments",
                column: "partner_id");

            migrationBuilder.CreateIndex(
                name: "IX_partner_assignments_safehouse_id",
                table: "partner_assignments",
                column: "safehouse_id");

            migrationBuilder.CreateIndex(
                name: "IX_process_recordings_resident_id",
                table: "process_recordings",
                column: "resident_id");

            migrationBuilder.CreateIndex(
                name: "IX_residents_safehouse_id",
                table: "residents",
                column: "safehouse_id");

            migrationBuilder.CreateIndex(
                name: "IX_safehouse_monthly_metrics_safehouse_id",
                table: "safehouse_monthly_metrics",
                column: "safehouse_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "donation_allocations");

            migrationBuilder.DropTable(
                name: "education_records");

            migrationBuilder.DropTable(
                name: "health_wellbeing_records");

            migrationBuilder.DropTable(
                name: "home_visitations");

            migrationBuilder.DropTable(
                name: "in_kind_donation_items");

            migrationBuilder.DropTable(
                name: "incident_reports");

            migrationBuilder.DropTable(
                name: "intervention_plans");

            migrationBuilder.DropTable(
                name: "partner_assignments");

            migrationBuilder.DropTable(
                name: "process_recordings");

            migrationBuilder.DropTable(
                name: "public_impact_snapshots");

            migrationBuilder.DropTable(
                name: "safehouse_monthly_metrics");

            migrationBuilder.DropTable(
                name: "donations");

            migrationBuilder.DropTable(
                name: "residents");

            migrationBuilder.DropTable(
                name: "partners");

            migrationBuilder.DropTable(
                name: "social_media_posts");

            migrationBuilder.DropTable(
                name: "supporters");

            migrationBuilder.DropTable(
                name: "safehouses");
        }
    }
}
