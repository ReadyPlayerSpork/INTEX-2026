//This schema was designed around two main entities: residents and donations. Residents support case management and connect to records like education, health, visitations, and incidents. 
  Donations support financial tracking and connect to supporters, allocations, and in-kind items. Other tables such as safehouses, partners, and social media posts provide additional context. 
  The design keeps the data organized, reduces duplication, and supports reporting and application needs.

Table safehouses {
  safehouse_id int [pk, increment]
  safehouse_code varchar
  name varchar
  region varchar
  city varchar
  province varchar
  country varchar
  open_date date
  status varchar
  capacity_girls int
  capacity_staff int
  current_occupancy int
  notes text
}

Table partners {
  partner_id int [pk, increment]
  partner_name varchar
  partner_type varchar
  role_type varchar
  contact_name varchar
  email varchar
  phone varchar
  region varchar
  status varchar
  start_date date
  end_date date
  notes text
}

Table partner_assignments {
  assignment_id int [pk, increment]
  partner_id int [not null, ref: > partners.partner_id]
  safehouse_id int [ref: > safehouses.safehouse_id]
  program_area varchar
  assignment_start date
  assignment_end date
  responsibility_notes text
  is_primary boolean
  status varchar
}

Table supporters {
  supporter_id int [pk, increment]
  supporter_type varchar
  display_name varchar
  organization_name varchar
  first_name varchar
  last_name varchar
  relationship_type varchar
  region varchar
  country varchar
  email varchar
  phone varchar
  status varchar
  first_donation_date date
  acquisition_channel varchar
  created_at datetime
}

Table social_media_posts {
  post_id int [pk, increment]
  platform varchar
  platform_post_id varchar
  post_url varchar
  created_at datetime
  day_of_week varchar
  post_hour int
  post_type varchar
  media_type varchar
  caption text
  hashtags text
  num_hashtags int
  mentions_count int
  has_call_to_action boolean
  call_to_action_type varchar
  content_topic varchar
  sentiment_tone varchar
  caption_length int
  features_resident_story boolean
  campaign_name varchar
  is_boosted boolean
  boost_budget_php decimal
  impressions int
  reach int
  likes int
  comments int
  shares int
  saves int
  click_throughs int
  video_views int
  engagement_rate decimal
  profile_visits int
  donation_referrals int
  estimated_donation_value_php decimal
  follower_count_at_post int
  watch_time_seconds int
  avg_view_duration_seconds int
  subscriber_count_at_post int
  forwards int
}

Table donations {
  donation_id int [pk, increment]
  supporter_id int [not null, ref: > supporters.supporter_id]
  donation_type varchar
  donation_date date
  channel_source varchar
  currency_code varchar
  amount decimal
  estimated_value decimal
  impact_unit varchar
  is_recurring boolean
  campaign_name varchar
  notes text
  created_by_partner_id int [ref: > partners.partner_id]
  referral_post_id int [ref: > social_media_posts.post_id]
}

Table in_kind_donation_items {
  item_id int [pk, increment]
  donation_id int [not null, ref: > donations.donation_id]
  item_name varchar
  item_category varchar
  quantity int
  unit_of_measure varchar
  estimated_unit_value decimal
  intended_use varchar
  received_condition varchar
}

Table donation_allocations {
  allocation_id int [pk, increment]
  donation_id int [not null, ref: > donations.donation_id]
  safehouse_id int [not null, ref: > safehouses.safehouse_id]
  program_area varchar
  amount_allocated decimal
  allocation_date date
  allocation_notes text
}

Table residents {
  resident_id int [pk, increment]
  case_control_no varchar [unique]
  internal_code varchar [unique]
  safehouse_id int [not null, ref: > safehouses.safehouse_id]
  case_status varchar
  sex varchar
  date_of_birth date
  birth_status varchar
  place_of_birth varchar
  religion varchar
  case_category varchar
  sub_cat_orphaned boolean
  sub_cat_trafficked boolean
  sub_cat_child_labor boolean
  sub_cat_physical_abuse boolean
  sub_cat_sexual_abuse boolean
  sub_cat_osaec boolean
  sub_cat_cicl boolean
  sub_cat_at_risk boolean
  sub_cat_street_child boolean
  sub_cat_child_with_hiv boolean
  is_pwd boolean
  pwd_type varchar
  has_special_needs boolean
  special_needs_diagnosis varchar
  family_is_4ps boolean
  family_solo_parent boolean
  family_indigenous boolean
  family_parent_pwd boolean
  family_informal_settler boolean
  date_of_admission date
  age_upon_admission varchar
  present_age varchar
  length_of_stay varchar
  referral_source varchar
  referring_agency_person varchar
  date_colb_registered date
  date_colb_obtained date
  assigned_social_worker varchar
  initial_case_assessment text
  date_case_study_prepared date
  reintegration_type varchar
  reintegration_status varchar
  initial_risk_level varchar
  current_risk_level varchar
  date_enrolled date
  date_closed date
  created_at datetime
  notes_restricted text
}

Table process_recordings {
  recording_id int [pk, increment]
  resident_id int [not null, ref: > residents.resident_id]
  session_date date
  social_worker varchar
  session_type varchar
  session_duration_minutes int
  emotional_state_observed varchar
  emotional_state_end varchar
  session_narrative text
  interventions_applied text
  follow_up_actions text
  progress_noted boolean
  concerns_flagged boolean
  referral_made boolean
  notes_restricted text
}

Table home_visitations {
  visitation_id int [pk, increment]
  resident_id int [not null, ref: > residents.resident_id]
  visit_date date
  social_worker varchar
  visit_type varchar
  location_visited varchar
  family_members_present text
  purpose text
  observations text
  family_cooperation_level varchar
  safety_concerns_noted boolean
  follow_up_needed boolean
  follow_up_notes text
  visit_outcome varchar
}

Table education_records {
  education_record_id int [pk, increment]
  resident_id int [not null, ref: > residents.resident_id]
  record_date date
  program_name varchar
  course_name varchar
  education_level varchar
  attendance_status varchar
  attendance_rate decimal
  progress_percent decimal
  completion_status varchar
  gpa_like_score decimal
  notes text
}

Table health_wellbeing_records {
  health_record_id int [pk, increment]
  resident_id int [not null, ref: > residents.resident_id]
  record_date date
  weight_kg decimal
  height_cm decimal
  bmi decimal
  nutrition_score decimal
  sleep_score decimal
  energy_score decimal
  general_health_score decimal
  medical_checkup_done boolean
  dental_checkup_done boolean
  psychological_checkup_done boolean
  medical_notes_restricted text
}

Table intervention_plans {
  plan_id int [pk, increment]
  resident_id int [not null, ref: > residents.resident_id]
  plan_category varchar
  plan_description text
  services_provided text
  target_value decimal
  target_date date
  status varchar
  case_conference_date date
  created_at datetime
  updated_at datetime
}

Table incident_reports {
  incident_id int [pk, increment]
  resident_id int [not null, ref: > residents.resident_id]
  safehouse_id int [not null, ref: > safehouses.safehouse_id]
  incident_date date
  incident_type varchar
  severity varchar
  description text
  response_taken text
  resolved boolean
  resolution_date date
  reported_by varchar
  follow_up_required boolean
}

Table safehouse_monthly_metrics {
  metric_id int [pk, increment]
  safehouse_id int [not null, ref: > safehouses.safehouse_id]
  month_start date
  month_end date
  active_residents int
  avg_education_progress decimal
  avg_health_score decimal
  process_recording_count int
  home_visitation_count int
  incident_count int
  notes text
}

Table public_impact_snapshots {
  snapshot_id int [pk, increment]
  snapshot_date date
  headline varchar
  summary_text text
  metric_payload_json text
  is_published boolean
  published_at date
}
