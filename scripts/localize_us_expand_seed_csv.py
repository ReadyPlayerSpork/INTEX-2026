#!/usr/bin/env python3
"""
US-localize lighthouse_csv_v7 seed data, fill sparse fields, and expand ~1.5x
donations/supporters/social (light scope). Reproducible with --seed.

Money: PHP amounts divided by PHP_RATE (default 58) to USD; currency_code USD;
impact_unit pesos -> dollars. Column names like *_php are unchanged (DB schema).

Usage:
  python scripts/localize_us_expand_seed_csv.py
  python scripts/localize_us_expand_seed_csv.py --dry-run --out /tmp/csv_out
"""

from __future__ import annotations

import argparse
import ast
import json
import random
import re
import shutil
from pathlib import Path

import numpy as np
import pandas as pd

PHP_RATE = 58.0
EXPAND_FACTOR = 1.5

# US safehouse rows (stable safehouse_id 1..9)
SAFEHOUSE_US = {
    1: ("Pacific Northwest", "Seattle", "Washington"),
    2: ("Southeast", "Atlanta", "Georgia"),
    3: ("Southwest", "Phoenix", "Arizona"),
    4: ("Mountain West", "Denver", "Colorado"),
    5: ("Northeast", "Boston", "Massachusetts"),
    6: ("Midwest", "Chicago", "Illinois"),
    7: ("South Central", "Austin", "Texas"),
    8: ("Pacific", "Portland", "Oregon"),
    9: ("Mountain", "Salt Lake City", "Utah"),
}

PH_CITY_TO_US = {
    "Manila": "Chicago, IL",
    "Quezon City": "Chicago, IL",
    "Cebu City": "Dallas, TX",
    "Davao City": "Phoenix, AZ",
    "Iloilo City": "Nashville, TN",
    "Baguio City": "Asheville, NC",
    "Bacolod": "Louisville, KY",
    "Tacloban": "Mobile, AL",
    "General Santos": "Tucson, AZ",
    "Cagayan de Oro": "Albuquerque, NM",
}

REGION_MAP = {
    "Luzon": "Northeast",
    "Visayas": "Southeast",
    "Mindanao": "West",
    "Metro Manila": "Mid-Atlantic",
}


def usd_from_php(v) -> float | None:
    if v is None or (isinstance(v, float) and np.isnan(v)):
        return None
    if isinstance(v, str) and v.strip() == "":
        return None
    try:
        return round(float(v) / PHP_RATE, 2)
    except (TypeError, ValueError):
        return None


def fake_us_phone(rng: random.Random, uid: int) -> str:
    a = 555
    b = 200 + (uid % 500)
    c = 1000 + (uid * 7) % 9000
    return f"+1 ({a}) {b:03d}-{c:04d}"


def localize_email(email: str, uid: int, kind: str) -> str:
    if not email or "@" not in email:
        return f"{kind}{uid}@example.com"
    local, _, domain = email.partition("@")
    local = re.sub(r"[^a-zA-Z0-9._-]", "-", local)[:40]
    return f"{local}.us{uid}@example.com"


def replace_city_place(s: str) -> str:
    if not isinstance(s, str) or not s.strip():
        return s
    out = s
    for ph, us in PH_CITY_TO_US.items():
        out = out.replace(ph, us)
    out = out.replace("Barangay", "County")
    out = out.replace("barangay", "county")
    out = out.replace("lighthouse.ph", "havenforher.org")
    out = out.replace("lighthouse_ph", "havenforher_us")
    out = out.replace("Philippines", "United States")
    return out


def replace_peso_mentions(text: str) -> str:
    if not isinstance(text, str):
        return text

    def repl(m: re.Match) -> str:
        num = int(m.group(1).replace(",", ""))
        usd = max(1.0, round(num / PHP_RATE, 0))
        return f"${usd:,.0f}"

    return re.sub(r"P\s*([\d,]+)", repl, text)


def localize_snapshot_json(s: str) -> str:
    if not isinstance(s, str) or not s.strip():
        return s
    s = s.strip()
    try:
        d = ast.literal_eval(s)
    except (ValueError, SyntaxError):
        return replace_city_place(replace_peso_mentions(s))
    if isinstance(d, dict) and "donations_total_for_month" in d:
        v = d["donations_total_for_month"]
        if isinstance(v, (int, float)):
            d["donations_total_for_month"] = round(float(v) / PHP_RATE, 2)
    return str(d)


def localize_series(s: pd.Series) -> pd.Series:
    """Apply replace_city_place to every non-empty cell (handles StringDtype, not just object)."""

    def one(x):
        if pd.isna(x):
            return x
        xs = str(x).strip()
        if not xs:
            return x
        return replace_city_place(xs)

    return s.apply(one)


def fill_empty_strings(df: pd.DataFrame, column: str, fill_values: list[str], rng: random.Random):
    if column not in df.columns:
        return
    mask = df[column].isna() | (df[column].astype(str).str.strip() == "")
    idx = mask[mask].index.tolist()
    if not idx:
        return
    for i in idx:
        df.at[i, column] = rng.choice(fill_values)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--csv-dir",
        type=Path,
        default=Path("backend/Haven-for-Her-Backend/docs/lighthouse_csv_v7"),
    )
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--out", type=Path, default=None)
    args = parser.parse_args()
    rng = random.Random(args.seed)
    np.random.seed(args.seed)

    csv_dir = args.csv_dir.resolve()
    if not csv_dir.is_dir():
        raise SystemExit(f"CSV dir not found: {csv_dir}")

    out_dir = args.out.resolve() if args.out else csv_dir
    if args.dry_run and args.out is None:
        raise SystemExit("--dry-run requires --out")

    if args.out:
        out_dir.mkdir(parents=True, exist_ok=True)
        for p in csv_dir.glob("*.csv"):
            shutil.copy2(p, out_dir / p.name)
        work_dir = out_dir
    else:
        work_dir = csv_dir

    def read(name: str) -> pd.DataFrame:
        # Avoid forcing str dtype on every column (breaks numeric updates).
        return pd.read_csv(work_dir / name, keep_default_na=False)

    def write(name: str, df: pd.DataFrame) -> None:
        df.to_csv(work_dir / name, index=False)

    # --- Load ---
    safehouses = read("safehouses.csv")
    supporters = read("supporters.csv")
    partners = read("partners.csv")
    snapshots = read("public_impact_snapshots.csv")
    posts = read("social_media_posts.csv")
    residents = read("residents.csv")
    donations = read("donations.csv")
    partner_assignments = read("partner_assignments.csv")
    monthly = read("safehouse_monthly_metrics.csv")
    allocations = read("donation_allocations.csv")
    in_kind = read("in_kind_donation_items.csv")
    recordings = read("process_recordings.csv")
    visitations = read("home_visitations.csv")
    education = read("education_records.csv")
    health = read("health_wellbeing_records.csv")
    interventions = read("intervention_plans.csv")
    incidents = read("incident_reports.csv")

    # numeric coercion helpers
    def to_num(df, cols, typ):
        for c in cols:
            if c in df.columns:
                df[c] = pd.to_numeric(df[c], errors="coerce").astype(typ)

    # ---------- LOCALIZE: safehouses ----------
    for sid, (reg, city, st) in SAFEHOUSE_US.items():
        m = safehouses["safehouse_id"].astype(int) == sid
        safehouses.loc[m, "region"] = reg
        safehouses.loc[m, "city"] = city
        safehouses.loc[m, "province"] = st
        safehouses.loc[m, "country"] = "United States"
    safehouses["notes"] = safehouses["notes"].apply(
        lambda x: replace_city_place(x) if x else "US network site."
    )

    # ---------- LOCALIZE: supporters ----------
    us_regions = set(REGION_MAP.values())
    supporters["region"] = supporters["region"].replace(REGION_MAP)
    for i, r in supporters.iterrows():
        reg = str(r.get("region", "")).strip()
        if reg not in us_regions:
            supporters.at[i, "region"] = rng.choice(list(us_regions))
    supporters["country"] = "United States"
    for i, r in supporters.iterrows():
        uid = int(r["supporter_id"])
        supporters.at[i, "phone"] = fake_us_phone(rng, uid)
        em = r.get("email", "")
        if em:
            supporters.at[i, "email"] = localize_email(em, uid, "supporter")

    # ---------- LOCALIZE: partners ----------
    partners["country"] = "United States"
    partners["region"] = partners["region"].replace(REGION_MAP)
    for i, r in partners.iterrows():
        pid = int(r["partner_id"])
        partners.at[i, "phone"] = fake_us_phone(rng, pid + 5000)
        if r.get("email"):
            partners.at[i, "email"] = localize_email(r["email"], pid, "partner")
        partners.at[i, "notes"] = replace_city_place(r.get("notes") or "Regional partner contact.")

    # ---------- LOCALIZE: donations (currency) ----------
    donations["supporter_id"] = pd.to_numeric(donations["supporter_id"], errors="coerce").astype("Int64")
    donations["donation_id"] = pd.to_numeric(donations["donation_id"], errors="coerce").astype("Int64")
    if "referral_post_id" in donations.columns:
        donations["referral_post_id"] = pd.to_numeric(donations["referral_post_id"], errors="coerce").astype("Int64")
    mon = donations["donation_type"] == "Monetary"
    donations.loc[mon, "currency_code"] = "USD"
    for col in ["amount", "estimated_value"]:
        if col in donations.columns:
            donations[col] = pd.to_numeric(donations[col], errors="coerce")
            donations.loc[mon, col] = donations.loc[mon, col].apply(
                lambda x: usd_from_php(x) if pd.notna(x) else x
            )
    donations.loc[donations["impact_unit"].astype(str).str.lower() == "pesos", "impact_unit"] = "dollars"

    fill_empty_strings(
        donations,
        "campaign_name",
        ["Year-End Hope", "GivingTuesday", "Summer of Safety", "Community Circle"],
        rng,
    )
    fill_empty_strings(
        donations,
        "notes",
        ["General operating support for US network sites.", "Restricted program funding."],
        rng,
    )

    # ---------- LOCALIZE: donation_allocations ----------
    to_num(allocations, ["allocation_id", "donation_id", "safehouse_id"], "Int64")
    to_num(allocations, ["amount_allocated"], float)
    allocations["amount_allocated"] = allocations["amount_allocated"].apply(
        lambda x: usd_from_php(x) if pd.notna(x) else x
    )
    fill_empty_strings(
        allocations,
        "allocation_notes",
        ["Allocated per program charter.", "Quarterly distribution."],
        rng,
    )

    # ---------- LOCALIZE: in_kind ----------
    to_num(in_kind, ["item_id", "donation_id", "quantity"], "Int64")
    to_num(in_kind, ["estimated_unit_value"], float)
    in_kind["estimated_unit_value"] = in_kind["estimated_unit_value"].apply(
        lambda x: usd_from_php(x) if pd.notna(x) else x
    )

    # ---------- LOCALIZE: snapshots ----------
    for col in ["headline", "summary_text"]:
        if col in snapshots.columns:
            snapshots[col] = snapshots[col].apply(
                lambda x: replace_city_place(replace_peso_mentions(str(x)))
            )
    if "metric_payload_json" in snapshots.columns:
        snapshots["metric_payload_json"] = snapshots["metric_payload_json"].apply(localize_snapshot_json)

    # ---------- LOCALIZE: social posts ----------
    to_num(
        posts,
        [
            "post_id",
            "post_hour",
            "num_hashtags",
            "mentions_count",
            "impressions",
            "reach",
            "likes",
            "comments",
            "shares",
            "saves",
            "click_throughs",
            "donation_referrals",
            "follower_count_at_post",
            "caption_length",
        ],
        "Int64",
    )
    for c in ["engagement_rate", "boost_budget_php", "estimated_donation_value_php", "video_views", "watch_time_seconds", "avg_view_duration_seconds", "subscriber_count_at_post", "forwards"]:
        if c in posts.columns:
            posts[c] = pd.to_numeric(posts[c], errors="coerce")

    posts["boost_budget_php"] = posts["boost_budget_php"].apply(
        lambda x: usd_from_php(x) if pd.notna(x) and x != "" else x
    )
    posts["estimated_donation_value_php"] = posts["estimated_donation_value_php"].apply(
        lambda x: usd_from_php(x) if pd.notna(x) and x != "" else 0.0
    )

    for col in ["caption", "hashtags", "post_url", "platform_post_id"]:
        if col in posts.columns:
            posts[col] = posts[col].apply(
                lambda x: replace_city_place(replace_peso_mentions(str(x))) if pd.notna(x) and str(x) else x
            )

    # ---------- LOCALIZE: residents ----------
    if "place_of_birth" in residents.columns:
        residents["place_of_birth"] = residents["place_of_birth"].apply(
            lambda x: PH_CITY_TO_US.get(str(x).strip(), replace_city_place(str(x)))
            if x and str(x).strip()
            else "United States"
        )
    for col in residents.select_dtypes(include=["object", "string"]).columns:
        residents[col] = localize_series(residents[col])
    fill_empty_strings(
        residents,
        "referring_agency_person",
        ["Jordan Lee, MSW", "Alex Morgan, LCSW", "Riley Chen, Case Coordinator"],
        rng,
    )

    # ---------- LOCALIZE: visitations (venues) ----------
    for col in visitations.select_dtypes(include=["object", "string"]).columns:
        visitations[col] = localize_series(visitations[col])

    # ---------- LOCALIZE: recordings, education, health, interventions, incidents ----------
    for df in (recordings, education, health, interventions, incidents):
        for col in df.select_dtypes(include=["object", "string"]).columns:
            df[col] = localize_series(df[col])

    # ---------- LOCALIZE: partner_assignments, monthly ----------
    for df in (partner_assignments, monthly):
        for col in df.select_dtypes(include=["object", "string"]).columns:
            df[col] = localize_series(df[col])
    fill_empty_strings(monthly, "notes", ["Monthly review completed.", "Operations note on file."], rng)

    # ---------- EXPANSION: supporters +30 ----------
    n_sup = len(supporters)
    target_sup = int(round(n_sup * EXPAND_FACTOR))
    add_sup = target_sup - n_sup
    max_sid = int(supporters["supporter_id"].astype(int).max())
    new_supporters = []
    for j in range(add_sup):
        src = supporters.iloc[rng.randint(0, n_sup - 1)].copy()
        nid = max_sid + 1 + j
        src["supporter_id"] = nid
        base_name = str(src.get("display_name", "Supporter") or "Supporter").strip()
        for suf in (" (Network)", " (network)"):
            if base_name.endswith(suf):
                base_name = base_name[: -len(suf)].strip()
        src["display_name"] = base_name or "Supporter"
        src["email"] = f"supporter.network{nid}@example.com"
        src["phone"] = fake_us_phone(rng, nid)
        src["region"] = rng.choice(list(REGION_MAP.values()))
        src["country"] = "United States"
        new_supporters.append(src)
    if new_supporters:
        supporters = pd.concat([supporters, pd.DataFrame(new_supporters)], ignore_index=True)

    # ---------- EXPANSION: social posts +406 ----------
    n_posts = len(posts)
    target_posts = int(round(n_posts * EXPAND_FACTOR))
    add_posts = target_posts - n_posts
    max_pid = int(posts["post_id"].astype(int).max())
    new_posts = []
    for j in range(add_posts):
        src = posts.iloc[rng.randint(0, n_posts - 1)].copy()
        nid = max_pid + 1 + j
        src["post_id"] = nid
        src["platform_post_id"] = f"syn_{nid}_{rng.randint(10000, 99999)}"
        cap = str(src.get("caption", ""))[:200]
        src["caption"] = f"{cap} [Network {nid}]"
        src["referral_post_id"] = ""  # n/a column might not exist
        new_posts.append(src)
    if new_posts:
        posts = pd.concat([posts, pd.DataFrame(new_posts)], ignore_index=True)

    max_post_id = int(posts["post_id"].astype(int).max())

    # ---------- EXPANSION: donations + synthetic rows ----------
    n_don = len(donations)
    target_don = int(round(n_don * EXPAND_FACTOR))
    add_don = target_don - n_don
    max_did = int(donations["donation_id"].astype(int).max())
    n_supporters_total = len(supporters)
    template_ids = donations["donation_id"].dropna().astype(int).tolist()
    synth_templates: list[tuple[int, int]] = []
    new_donation_rows = []
    for j in range(add_don):
        tid = int(rng.choice(template_ids))
        src = donations[donations["donation_id"] == tid].iloc[0].copy()
        nid = max_did + 1 + j
        src["donation_id"] = nid
        src["supporter_id"] = rng.randint(1, n_supporters_total)
        if rng.random() < 0.35 and max_post_id:
            src["referral_post_id"] = rng.randint(1, max_post_id)
        else:
            src["referral_post_id"] = pd.NA
        new_donation_rows.append(src)
        synth_templates.append((nid, tid))
    if new_donation_rows:
        donations = pd.concat([donations, pd.DataFrame(new_donation_rows)], ignore_index=True)

    # ---------- EXPANSION: allocations for new donations ----------
    max_aid = int(allocations["allocation_id"].astype(int).max())
    next_aid = max_aid + 1
    new_allocs = []
    for nid, tid in synth_templates:
        tpl_all = allocations[allocations["donation_id"] == tid]
        for _, arow in tpl_all.iterrows():
            row = arow.copy()
            row["allocation_id"] = next_aid
            next_aid += 1
            row["donation_id"] = nid
            new_allocs.append(row)
    if new_allocs:
        allocations = pd.concat([allocations, pd.DataFrame(new_allocs)], ignore_index=True)

    # ---------- EXPANSION: in_kind for new donation rows (InKind / Time) ----------
    max_iid = int(in_kind["item_id"].astype(int).max())
    next_iid = max_iid + 1
    new_items = []
    for nid, tid in synth_templates:
        drow = donations[donations["donation_id"] == nid].iloc[0]
        if drow["donation_type"] not in ("InKind", "Time"):
            continue
        tpl_items = in_kind[in_kind["donation_id"] == tid]
        if tpl_items.empty:
            continue
        titem = tpl_items.iloc[rng.randint(0, len(tpl_items) - 1)].copy()
        titem["item_id"] = next_iid
        next_iid += 1
        titem["donation_id"] = nid
        new_items.append(titem)
    if new_items:
        in_kind = pd.concat([in_kind, pd.DataFrame(new_items)], ignore_index=True)

    # ---------- Write all CSVs ----------
    write("safehouses.csv", safehouses)
    write("supporters.csv", supporters)
    write("partners.csv", partners)
    write("public_impact_snapshots.csv", snapshots)
    write("social_media_posts.csv", posts)
    write("residents.csv", residents)
    write("donations.csv", donations)
    write("partner_assignments.csv", partner_assignments)
    write("safehouse_monthly_metrics.csv", monthly)
    write("donation_allocations.csv", allocations)
    write("in_kind_donation_items.csv", in_kind)
    write("process_recordings.csv", recordings)
    write("home_visitations.csv", visitations)
    write("education_records.csv", education)
    write("health_wellbeing_records.csv", health)
    write("intervention_plans.csv", interventions)
    write("incident_reports.csv", incidents)

    print("Done.")
    print(f"  supporters: {len(supporters)}, posts: {len(posts)}, donations: {len(donations)}")
    print(f"  allocations: {len(allocations)}, in_kind: {len(in_kind)}")
    print(f"  Output: {work_dir}")


if __name__ == "__main__":
    main()
