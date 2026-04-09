"""
Haven for Her — ML Prediction Microservice

Flask app that loads trained .joblib models and serves prediction endpoints.
Computes features from CSV data in lighthouse_csv_v7/.

Usage:
    python serve.py                         # default port 5050
    ML_SERVICE_PORT=8080 python serve.py    # custom port
"""

import os
import json
import traceback
from datetime import datetime

import gc
import joblib
import numpy as np
import pandas as pd
from flask import Flask, jsonify, request
from database import db_client

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "models")

# Robust discovery of CSV directory
def discover_csv_dir():
    # 1. Environment variable override
    env_path = os.environ.get("ML_CSV_DIR")
    if env_path and os.path.exists(env_path):
        return env_path
    
    # 2. Try common relative paths
    search_paths = [
        os.path.join(BASE_DIR, "..", "backend", "Haven-for-Her-Backend", "docs", "lighthouse_csv_v7"),
        os.path.join(BASE_DIR, "..", "lighthouse_csv_v7"),
        os.path.join(BASE_DIR, "lighthouse_csv_v7"),
        os.path.join(os.path.expanduser("~"), "source", "repos", "INTEX-2026", "backend", "Haven-for-Her-Backend", "docs", "lighthouse_csv_v7")
    ]
    for p in search_paths:
        if os.path.exists(p) and os.path.exists(os.path.join(p, "supporters.csv")):
            return os.path.abspath(p)
    
    # Fallback to the most likely one even if it doesn't exist yet (for volume mounting)
    return os.path.join(BASE_DIR, "..", "backend", "Haven-for-Her-Backend", "docs", "lighthouse_csv_v7")

CSV_DIR = discover_csv_dir()
print(f"Final CSV directory used: {CSV_DIR}")
if not os.path.exists(CSV_DIR):
    print(f"CRITICAL WARNING: {CSV_DIR} does not exist!")

app = Flask(__name__)

# ---------------------------------------------------------------------------
# Model loading (lazy — loaded once on first request or at startup)
# ---------------------------------------------------------------------------
_models: dict = {}


def _load_model(name: str):
    """Load a model + feature list from the models/ directory."""
    if name not in _models:
        model_path = os.path.join(MODEL_DIR, f"{name}_model.joblib")
        feat_path = os.path.join(MODEL_DIR, f"{name}_features.joblib")
        if not os.path.exists(model_path):
            return None, None
        model = joblib.load(model_path)
        features = joblib.load(feat_path) if os.path.exists(feat_path) else None
        _models[name] = (model, features)
    return _models[name]


# ---------------------------------------------------------------------------
# CSV data loading helpers (cached)
# ---------------------------------------------------------------------------
_csv_cache: dict = {}


def _csv(filename: str) -> pd.DataFrame:
    if filename not in _csv_cache:
        path = os.path.join(CSV_DIR, filename)
        if not os.path.exists(path):
            raise FileNotFoundError(f"CSV not found: {path}")
        _csv_cache[filename] = pd.read_csv(path)
    return _csv_cache[filename].copy()


# ---------------------------------------------------------------------------
# Feature engineering helpers (mirror notebook logic)
# ---------------------------------------------------------------------------

def _donor_features() -> pd.DataFrame:
    """Build the same feature matrix used by the donor churn notebook."""
    supporters = db_client.fetch_data("Supporters")
    if supporters is None:
        supporters = _csv("supporters.csv")
    
    donations = db_client.fetch_data("Donations")
    if donations is None:
        donations = _csv("donations.csv")

    # Column normalization to handle potential naming diffs
    supporters["AcquisitionChannel"] = supporters["AcquisitionChannel"].fillna("Unknown")
    supporters["Region"] = supporters["Region"].fillna("Not Specified")
    supporters["CreatedAt"] = pd.to_datetime(supporters["CreatedAt"])
    donations["DonationDate"] = pd.to_datetime(donations["DonationDate"])
    
    # Handle both amount and estimated value for total worth
    amount_col = "Amount" if "Amount" in donations.columns else "amount"
    val_col = "EstimatedValue" if "EstimatedValue" in donations.columns else "estimated_value"
    
    donations["TotalVal"] = donations[amount_col].fillna(0)
    if val_col in donations.columns:
        donations["TotalVal"] += donations[val_col].fillna(0)

    snapshot_date = donations["DonationDate"].max() + pd.Timedelta(days=1)
    if pd.isna(snapshot_date):
        snapshot_date = pd.to_datetime(datetime.utcnow())

    donor_metrics = donations.groupby("SupporterId").agg({
        "DonationDate": [
            lambda x: (snapshot_date - x.max()).days,
            lambda x: (x.max() - x.min()).days,
            lambda x: x.dt.month.std(),
        ],
        "DonationId": "count",
        "TotalVal": ["sum", "mean"],
    })
    donor_metrics.columns = ["Recency", "ActiveSpan", "SeasonalityStd", "Frequency", "Ltv", "AvgDonationVal"]
    donor_metrics["SeasonalityStd"] = donor_metrics["SeasonalityStd"].fillna(0)
    donor_metrics["IsChurned"] = (donor_metrics["Recency"] > 365).astype(int)

    df = pd.merge(supporters, donor_metrics, left_on="SupporterId", right_index=True, how="left")
    df["Frequency"] = df["Frequency"].fillna(0)
    df["Ltv"] = df["Ltv"].fillna(0)
    df["AvgDonationVal"] = df["AvgDonationVal"].fillna(0)
    df["IsChurned"] = df["IsChurned"].fillna(1)
    df["Recency"] = df["Recency"].fillna((snapshot_date - df["CreatedAt"]).dt.days)
    df["TenureDays"] = (snapshot_date - df["CreatedAt"]).dt.days
    df["LoyaltyRatio"] = df["Frequency"] / ((df["TenureDays"] / 30.44).replace(0, 1))
    df["SeasonalityStd"] = df["SeasonalityStd"].fillna(0)

    model_features = [
        "SupporterType", "RelationshipType", "Region", "AcquisitionChannel",
        "TenureDays", "Frequency", "Ltv", "AvgDonationVal", "SeasonalityStd",
    ]
    available = [f for f in model_features if f in df.columns]
    X = pd.get_dummies(df[available], drop_first=True)
    X = X.fillna(0)
    return df, X


def _incident_features() -> pd.DataFrame:
    """Build the same feature matrix used by the incident risk notebook."""
    residents = db_client.fetch_data("Residents")
    if residents is None:
        residents = _csv("residents.csv")
    
    incidents = db_client.fetch_data("IncidentReports")
    if incidents is None:
        incidents = _csv("incident_reports.csv")
    
    recordings = db_client.fetch_data("ProcessRecordings")
    if recordings is None:
        recordings = _csv("process_recordings.csv")

    residents["DateOfAdmission"] = pd.to_datetime(residents["DateOfAdmission"])
    residents["DateClosed"] = pd.to_datetime(residents["DateClosed"], errors="coerce")
    
    # Use the max observed date or today
    today = residents["DateClosed"].max() if residents["DateClosed"].notnull().any() else pd.to_datetime("2026-03-10")
    residents["EndDate"] = residents["DateClosed"].fillna(today)
    residents["TenureDays"] = (residents["EndDate"] - residents["DateOfAdmission"]).dt.days
    residents["TenureMonths"] = residents["TenureDays"] / 30.44

    risk_map = {"Low": 1, "Medium": 2, "High": 3, "Critical": 4}
    residents["InitialRiskNum"] = residents["InitialRiskLevel"].map(risk_map)

    severity_map = {"Low": 1, "Medium": 2, "High": 3}
    incidents["SeverityNum"] = incidents["Severity"].map(severity_map)

    incident_agg = incidents.groupby("ResidentId").agg({
        "IncidentId": "count",
        "SeverityNum": "mean",
        "Resolved": lambda x: (x == False).sum(),
        "Severity": lambda x: (x == "High").any(),
    }).rename(columns={
        "IncidentId": "TotalIncidents",
        "SeverityNum": "AvgSeverity",
        "Resolved": "UnresolvedIncidents",
        "Severity": "HasHighSeverityIncident",
    }).reset_index()

    recording_agg = recordings.groupby("ResidentId").agg({
        "RecordingId": "count",
        "SessionDurationMinutes": "mean",
        "ConcernsFlagged": "sum",
    }).rename(columns={
        "RecordingId": "TotalSessions",
        "SessionDurationMinutes": "AvgSessionDuration",
        "ConcernsFlagged": "ConcernsFlaggedCount",
    }).reset_index()

    df = residents.merge(incident_agg, on="ResidentId", how="left")
    df = df.merge(recording_agg, on="ResidentId", how="left")
    
    # Fill based on columns that actually exist in the merged dataframe
    fill_cols = [c for c in ["TotalIncidents", "AvgSeverity", "UnresolvedIncidents", "TotalSessions", "AvgSessionDuration", "ConcernsFlaggedCount"] if c in df.columns]
    df[fill_cols] = df[fill_cols].fillna(0)
    
    if "HasHighSeverityIncident" in df.columns:
        df["HasHighSeverityIncident"] = df["HasHighSeverityIncident"].fillna(False).astype(int)

    model_features = [
        "CaseCategory", "InitialRiskNum", "Sex", "IsPwd",
        "HasSpecialNeeds", "TenureMonths", "TotalSessions", "ConcernsFlaggedCount",
    ]
    # Filter only available features for dummy encoding
    available_features = [f for f in model_features if f in df.columns]
    X = pd.get_dummies(df[available_features], drop_first=True)
    return df, X


def _resident_progress_features() -> pd.DataFrame:
    """Build the same feature matrix used by the resident progress notebook."""
    residents = db_client.fetch_data("Residents")
    if residents is None:
        residents = _csv("residents.csv")
    
    recordings = db_client.fetch_data("ProcessRecordings")
    if recordings is None:
        recordings = _csv("process_recordings.csv")
    
    education = db_client.fetch_data("EducationRecords")
    if education is None:
        education = _csv("education_records.csv")
    
    health = db_client.fetch_data("HealthWellbeingRecords")
    if health is None:
        health = _csv("health_wellbeing_records.csv")

    recordings["SessionDate"] = pd.to_datetime(recordings["SessionDate"])
    education["RecordDate"] = pd.to_datetime(education["RecordDate"])
    health["RecordDate"] = pd.to_datetime(health["RecordDate"])

    session_metrics = recordings.groupby("ResidentId").agg({
        "RecordingId": "count",
        "SessionDurationMinutes": "mean",
        "ProgressNoted": lambda x: (x == True).mean() * 100,
    }).rename(columns={
        "RecordingId": "SessionCount",
        "SessionDurationMinutes": "AvgSessionDuration",
        "ProgressNoted": "ProgressNotedPct",
    }).reset_index()

    def calculate_trend(src_df, id_col, date_col, value_col):
        if src_df.empty: return pd.Series({}, name=f"{value_col}_trend")
        src_df = src_df.sort_values([id_col, date_col])
        trends = {}
        for rid, group in src_df.groupby(id_col):
            if len(group) >= 2:
                trends[rid] = group.iloc[-1][value_col] - group.iloc[-2][value_col]
            else:
                trends[rid] = 0
        return pd.Series(trends, name=f"{value_col}_trend", dtype=float)

    health_trend = calculate_trend(health, "ResidentId", "RecordDate", "GeneralHealthScore")
    edu_trend = calculate_trend(education, "ResidentId", "RecordDate", "AttendanceRate")
    last_health = health.sort_values("RecordDate").groupby("ResidentId")["GeneralHealthScore"].last().rename("CurrentHealthScore")
    last_edu = education.sort_values("RecordDate").groupby("ResidentId")["AttendanceRate"].last().rename("CurrentAttendanceRate")

    df = residents.merge(session_metrics, on="ResidentId", how="left")
    df = df.merge(health_trend, left_on="ResidentId", right_index=True, how="left")
    df = df.merge(edu_trend, left_on="ResidentId", right_index=True, how="left")
    df = df.merge(last_health, on="ResidentId", how="left")
    df = df.merge(last_edu, on="ResidentId", how="left")
    df = df.merge(last_health, left_on="ResidentId", right_index=True, how="left")
    df = df.merge(last_edu, left_on="ResidentId", right_index=True, how="left")

    fill_cols = ["SessionCount", "AvgSessionDuration", "ProgressNotedPct", 
                 "GeneralHealthScore_trend", "AttendanceRate_trend", 
                 "CurrentHealthScore", "CurrentAttendanceRate"]
    df[fill_cols] = df[fill_cols].fillna(0)
    
    # Target definition
    df["IsReady"] = ((df["CurrentHealthScore"] >= 7) & 
                     (df["CurrentAttendanceRate"] >= 80) & 
                     (df["ProgressNotedPct"] >= 50)).astype(int)

    model_features = [
        "CaseCategory", "InitialRiskLevel", "Sex", "SessionCount", 
        "AvgSessionDuration", "ProgressNotedPct", "GeneralHealthScore_trend", 
        "AttendanceRate_trend", "CurrentHealthScore", "CurrentAttendanceRate"
    ]
    available = [f for f in model_features if f in df.columns]
    X = pd.get_dummies(df[available], drop_first=True)
    return df, X


def _safehouse_features() -> pd.DataFrame:
    """Build the same feature matrix used by the safehouse outcomes notebook."""
    safehouses = db_client.fetch_data("Safehouses")
    if safehouses is None:
        safehouses = _csv("safehouses.csv")
        
    funding = db_client.fetch_data("FundingAllocations")
    if funding is None:
        funding = _csv("funding_allocations.csv")
        
    education = db_client.fetch_data("EducationRecords")
    if education is None:
        education = _csv("education_records.csv")

    # Aggregate funding by safehouse and period (month/year)
    funding["AllocationDate"] = pd.to_datetime(funding["AllocationDate"])
    funding["Month"] = funding["AllocationDate"].dt.month
    funding["Year"] = funding["AllocationDate"].dt.year
    funding_agg = funding.groupby(["SafehouseId", "Year", "Month"])["Amount"].sum().reset_index()

    # Aggregate education by safehouse and period
    education["RecordDate"] = pd.to_datetime(education["RecordDate"])
    education["Month"] = education["RecordDate"].dt.month
    education["Year"] = education["RecordDate"].dt.year
    edu_agg = education.groupby(["SafehouseId", "Year", "Month"])["AttendanceRate"].mean().rename("AvgEducationProgress").reset_index()

    # Merge foundations
    df = pd.merge(funding_agg, edu_agg, on=["SafehouseId", "Year", "Month"], how="inner")
    df = df.sort_values(["SafehouseId", "Year", "Month"])

    # Create lag features (previous month's funding predicts current progress)
    df["PrevMonthFunding"] = df.groupby("SafehouseId")["Amount"].shift(1)
    df = df.dropna(subset=["PrevMonthFunding"])

    model_features = ["SafehouseId", "PrevMonthFunding", "Month"]
    X = df[model_features].copy()
    X = pd.get_dummies(X, columns=["SafehouseId"], drop_first=True)
    return df, X


def _social_media_features() -> pd.DataFrame:
    """Build the same feature matrix used by the social media impact notebook."""
    df = db_client.fetch_data("SocialMediaPosts")
    if df is None:
        df = _csv("social_media_posts.csv")

    # Column cleanup
    numeric_cols = ["EngagementRate", "DonationReferrals", "BoostBudgetPhp", "VideoViews", "WatchTimeSeconds", "AvgViewDurationSeconds"]
    for c in numeric_cols:
        if c in df.columns:
            df[c] = pd.to_numeric(df[c], errors="coerce").fillna(0)
            
    df["CampaignName"] = df["CampaignName"].fillna("None") if "CampaignName" in df.columns else "None"
    df["CallToActionType"] = df["CallToActionType"].fillna("None") if "CallToActionType" in df.columns else "None"

    def get_time_of_day(hour):
        try:
            h = int(hour)
            if 5 <= h < 12: return "morning"
            if 12 <= h < 17: return "afternoon"
            if 17 <= h < 22: return "evening"
            return "night"
        except:
            return "afternoon"

    if "PostHour" in df.columns:
        df["TimeOfDay"] = df["PostHour"].apply(get_time_of_day)
    else:
        df["TimeOfDay"] = "afternoon"
        
    eng_75th = df["EngagementRate"].quantile(0.75) if "EngagementRate" in df.columns else 0
    df["IsHighEngagement"] = (df["EngagementRate"] > eng_75th).astype(int) if "EngagementRate" in df.columns else 0
    df["IsDonationDriver"] = (df["DonationReferrals"] > 0).astype(int) if "DonationReferrals" in df.columns else 0

    model_features = ["Platform", "PostType", "MediaType", "TimeOfDay",
                       "SentimentTone", "CaptionLength", "NumHashtags", "IsBoosted"]
    available = [f for f in model_features if f in df.columns]
    X = pd.get_dummies(df[available], drop_first=True)
    return df, X


def _safehouse_features() -> (pd.DataFrame, pd.DataFrame):
    """Build the feature matrix for safehouse outcomes (regression)."""
    allocations = db_client.fetch_data("DonationAllocations")
    if allocations is None:
        allocations = _csv("donation_allocations.csv")
        
    metrics = db_client.fetch_data("SafehouseMonthlyMetrics")
    if metrics is None:
        metrics = _csv("safehouse_monthly_metrics.csv")
        
    safehouses_df = db_client.fetch_data("Safehouses")
    if safehouses_df is None:
        safehouses_df = _csv("safehouses.csv")

    allocations["AllocationDate"] = pd.to_datetime(allocations["AllocationDate"])
    metrics["MonthStart"] = pd.to_datetime(metrics["MonthStart"])
    metrics_clean = metrics.dropna(subset=["AvgEducationProgress", "AvgHealthScore"])

    allocations["MonthStart"] = allocations["AllocationDate"].dt.to_period("M").dt.to_timestamp()
    funding_pivot = allocations.groupby(["SafehouseId", "MonthStart", "ProgramArea"])["AmountAllocated"].sum().unstack(fill_value=0).reset_index()
    funding_pivot = funding_pivot.rename(columns={
        "Education": "EduFunding", "Wellbeing": "WellbeingFunding",
        "Operations": "OpsFunding", "Transport": "TransportFunding",
    })
    
    funding_cols = ["EduFunding", "WellbeingFunding", "OpsFunding", "TransportFunding"]
    for c in funding_cols:
        if c not in funding_pivot.columns:
            funding_pivot[c] = 0
            
    funding_pivot["TotalFunding"] = funding_pivot[funding_cols].sum(axis=1)

    df = pd.merge(metrics_clean, funding_pivot, on=["SafehouseId", "MonthStart"], how="left").fillna(0)
    df = pd.merge(df, safehouses_df[["SafehouseId", "Name", "Region"]], on="SafehouseId", how="left")
    df = df.sort_values(["SafehouseId", "MonthStart"])
    
    # Calculate lags
    df["LaggedTotalFunding"] = df.groupby("SafehouseId")["TotalFunding"].shift(1)
    df["LaggedEduFunding"] = df.groupby("SafehouseId")["EduFunding"].shift(1)
    df["LaggedWellbeingFunding"] = df.groupby("SafehouseId")["WellbeingFunding"].shift(1)
    df["LaggedOpsFunding"] = df.groupby("SafehouseId")["OpsFunding"].shift(1)
    df["LaggedTransportFunding"] = df.groupby("SafehouseId")["TransportFunding"].shift(1)
    
    df_final = df.dropna(subset=["LaggedTotalFunding"])
    
    features = [
        "LaggedTotalFunding", "LaggedEduFunding", "LaggedWellbeingFunding", 
        "LaggedOpsFunding", "LaggedTransportFunding", "ActiveResidents"
    ]
    
    # Ensure columns exist (e.g. ActiveResidents)
    for f in features:
        if f not in df_final.columns:
            df_final[f] = 0
            
    X = df_final[features].fillna(0)
    return df_final, X


# ---------------------------------------------------------------------------
# Utility: align feature columns to what the model expects
# ---------------------------------------------------------------------------

def _align_features(X: pd.DataFrame, expected_features: list) -> pd.DataFrame:
    """Ensure X has exactly the columns the model was trained on."""
    for col in expected_features:
        if col not in X.columns:
            X[col] = 0
    return X[expected_features]


def _risk_level(prob: float) -> str:
    if prob < 0.3:
        return "Low"
    elif prob < 0.7:
        return "Medium"
    else:
        return "High"


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({"status": "ok", "timestamp": datetime.utcnow().isoformat()})


# ── Donor Churn ──────────────────────────────────────────────────────────────

@app.route("/api/ml/donor-churn", methods=["GET"])
def donor_churn():
    """Predict churn for a single supporter."""
    supporter_id = request.args.get("supporter_id", type=int)
    if supporter_id is None:
        return jsonify({"error": "supporter_id query parameter required"}), 400

    model, features = _load_model("donor_churn")
    if model is None:
        return jsonify({"error": "Model not trained yet. Run the donor_loyalty notebook first."}), 503

    try:
        df, X = _donor_features()
        X = _align_features(X, features)

        idx = df.index[df["SupporterId"] == supporter_id]
        if len(idx) == 0:
            return jsonify({"error": f"Supporter {supporter_id} not found"}), 404

        row = X.loc[idx]
        prob = float(model.predict_proba(row)[0, 1])
        importances = dict(sorted(
            zip(features, model.feature_importances_),
            key=lambda x: abs(x[1]), reverse=True
        )[:5])

        return jsonify({
            "SupporterId": supporter_id,
            "ChurnProbability": round(prob, 4),
            "RiskLevel": _risk_level(prob),
            "TopFactors": importances,
        })
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@app.route("/api/ml/donor-churn/batch", methods=["GET"])
def donor_churn_batch():
    """Predict churn for all supporters."""
    model, features = _load_model("donor_churn")
    if model is None:
        return jsonify({"error": "Model not trained yet."}), 503

    try:
        df, X = _donor_features()
        X = _align_features(X, features)
        probs = model.predict_proba(X)[:, 1]

        results = []
        for i, (_, row) in enumerate(df.iterrows()):
            prob = float(probs[i])
            results.append({
                "SupporterId": int(row["SupporterId"]),
                "DisplayName": row.get("DisplayName", ""),
                "ChurnProbability": round(prob, 4),
                "RiskLevel": _risk_level(prob),
            })
        results.sort(key=lambda x: x["ChurnProbability"], reverse=True)
        return jsonify(results)
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


# ── Incident Risk ────────────────────────────────────────────────────────────

@app.route("/api/ml/incident-risk", methods=["GET"])
def incident_risk():
    """Predict high-severity incident risk for a single resident."""
    resident_id = request.args.get("resident_id", type=int)
    if resident_id is None:
        return jsonify({"error": "resident_id query parameter required"}), 400

    model, features = _load_model("incident_risk")
    if model is None:
        return jsonify({"error": "Model not trained yet."}), 503

    try:
        df, X = _incident_features()
        X = _align_features(X, features)

        idx = df.index[df["ResidentId"] == resident_id]
        if len(idx) == 0:
            return jsonify({"error": f"Resident {resident_id} not found"}), 404

        row = X.loc[idx]
        prob = float(model.predict_proba(row)[0, 1])
        importances = dict(sorted(
            zip(features, model.feature_importances_),
            key=lambda x: abs(x[1]), reverse=True
        )[:5])

        return jsonify({
            "ResidentId": resident_id,
            "EscalationProbability": round(prob, 4),
            "RiskLevel": _risk_level(prob),
            "RiskFactors": importances,
        })
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@app.route("/api/ml/incident-risk/alerts", methods=["GET"])
def incident_risk_alerts():
    """Return residents with high escalation probability (>0.5).

    When the model is not trained yet, return 200 + [] so the admin dashboard
    does not surface 503s in the browser console (proxies still forward 5xx).
    Keys use snake_case to match the SPA (IncidentRiskAlert).
    """
    model, features = _load_model("incident_risk")
    if model is None:
        return jsonify([])

    try:
        df, X = _incident_features()
        X = _align_features(X, features)
        probs = model.predict_proba(X)[:, 1]

        alerts = []
        for i, (_, row) in enumerate(df.iterrows()):
            prob = float(probs[i])
            if prob >= 0.5:
                alerts.append({
                    "resident_id": int(row["ResidentId"]),
                    "first_name": str(row.get("FirstName", "")),
                    "last_name": str(row.get("LastName", "")),
                    "escalation_probability": round(prob, 4),
                    "risk_level": _risk_level(prob),
                    "current_risk_level": str(row.get("CurrentRiskLevel", "")),
                })
        alerts.sort(key=lambda x: x["escalation_probability"], reverse=True)
        return jsonify(alerts)
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


# ── Resident Progress ────────────────────────────────────────────────────────

@app.route("/api/ml/resident-progress", methods=["GET"])
def resident_progress():
    """Predict reintegration readiness for a single resident."""
    resident_id = request.args.get("resident_id", type=int)
    if resident_id is None:
        return jsonify({"error": "resident_id query parameter required"}), 400

    model, features = _load_model("resident_progress")
    if model is None:
        return jsonify({"error": "Model not trained yet."}), 503

    try:
        df, X = _resident_progress_features()
        idx = df.index[df["ResidentId"] == resident_id]
        if len(idx) == 0:
            return jsonify({"error": f"Resident {resident_id} not found"}), 404

        row = X.loc[idx]
        prob = float(model.predict_proba(row)[0, 1])
        importances = dict(sorted(
            zip(features, model.feature_importances_),
            key=lambda x: abs(x[1]), reverse=True
        )[:5])

        return jsonify({
            "ResidentId": resident_id,
            "ReadinessScore": round(prob, 4),
            "RiskLevel": _risk_level(1 - prob),  # invert: low readiness = high risk
            "TopFactors": importances,
        })
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


# ── Safehouse Outcomes ───────────────────────────────────────────────────────

@app.route("/api/ml/safehouse-outcomes", methods=["GET"])
def safehouse_outcomes():
    """Predict education progress outcome for a safehouse given current metrics."""
    model, features = _load_model("safehouse_outcomes")
    if model is None:
        return jsonify({"error": "Model not trained yet."}), 503

    try:
        df_final, X = _safehouse_features()

        # Get latest row per safehouse
        latest = df_final.sort_values("MonthStart").groupby("SafehouseId").last().reset_index()

        results = []
        for _, row in latest.iterrows():
            feat_row = pd.DataFrame([row[features]])
            feat_row = _align_features(feat_row, features)
            pred = float(model.predict(feat_row)[0])
            results.append({
                "SafehouseId": int(row["SafehouseId"]),
                "SafehouseName": row.get("Name", ""),
                "PredictedEducationProgress": round(pred, 2),
                "ActualEducationProgress": round(float(row.get("AvgEducationProgress", 0)), 2),
            })
        return jsonify(results)
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


# ── Social Media ─────────────────────────────────────────────────────────────

@app.route("/api/ml/social-media/recommendations", methods=["GET"])
def social_media_recommendations():
    """Analyze past posts to recommend optimal posting strategy."""
    try:
        df = db_client.fetch_data("SocialMediaPosts")
        if df is None:
            df = _csv("social_media_posts.csv")
            
        df["CreatedAt"] = pd.to_datetime(df["CreatedAt"])

        # Best day/hour by engagement
        best_hour = df.groupby("PostHour")["EngagementRate"].mean().idxmax()
        best_day = df.groupby("DayOfWeek")["EngagementRate"].mean().idxmax()
        best_type = df.groupby("PostType")["DonationReferrals"].sum().idxmax()
        best_media = df.groupby("MediaType")["EngagementRate"].mean().idxmax()

        # Donation-driving stats
        donation_posts = df[df["DonationReferrals"] > 0]
        top_cta = donation_posts["CallToActionType"].mode().iloc[0] if len(donation_posts) > 0 else "DonateNow"

        return jsonify({
            "BestPostHour": int(best_hour),
            "BestDayOfWeek": best_day,
            "BestPostTypeForDonations": best_type,
            "BestMediaTypeForEngagement": best_media,
            "RecommendedCta": top_cta,
            "AvgEngagementRate": round(float(df["EngagementRate"].mean()), 4),
            "TotalDonationReferrals": int(df["DonationReferrals"].sum()),
        })
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@app.route("/api/ml/social-media/predict", methods=["POST"])
def social_media_predict():
    """Predict whether a planned post will drive donations."""
    model, features = _load_model("social_media_impact")
    if model is None:
        return jsonify({"error": "Model not trained yet."}), 503

    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "JSON body required"}), 400

        # Build a single-row DataFrame with the same dummy encoding
        df, _ = _social_media_features()  # just to get the encoding reference
        row = pd.DataFrame([{
            "Platform": data.get("Platform", data.get("platform", "Facebook")),
            "PostType": data.get("PostType", data.get("post_type", "ImpactStory")),
            "MediaType": data.get("MediaType", data.get("media_type", "Photo")),
            "TimeOfDay": data.get("TimeOfDay", data.get("time_of_day", "afternoon")),
            "SentimentTone": data.get("SentimentTone", data.get("sentiment_tone", "Hopeful")),
            "CaptionLength": data.get("CaptionLength", data.get("caption_length", 200)),
            "NumHashtags": data.get("NumHashtags", data.get("num_hashtags", 5)),
            "IsBoosted": data.get("IsBoosted", data.get("is_boosted", False)),
        }])
        X_row = pd.get_dummies(row, drop_first=True)
        X_row = _align_features(X_row, features)

        prob = float(model.predict_proba(X_row)[0, 1])
        return jsonify({
            "DonationDriverProbability": round(prob, 4),
            "PredictedDonationDriver": prob >= 0.5,
            "Recommendation": "This post is likely to drive donations!" if prob >= 0.5
                else "Consider adding a stronger CTA or using video content to improve donation conversion.",
        })
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@app.route("/api/ml/status", methods=["GET"])
def ml_status():
    """Return model health and last trained metadata."""
    metadata_path = os.path.join(MODEL_DIR, "metadata.json")
    last_trained = "Never"
    if os.path.exists(metadata_path):
        try:
            with open(metadata_path, "r") as f:
                meta = json.load(f)
                last_trained = meta.get("last_trained", "Unknown")
        except:
            pass

    # Check which models are missing
    model_names = ["donor_churn", "incident_risk", "resident_progress", "safehouse_outcomes", "social_media_impact"]
    missing = []
    for name in model_names:
        if not os.path.exists(os.path.join(MODEL_DIR, f"{name}_model.joblib")):
            missing.append(name)

    return jsonify({
        "status": "Running",
        "database_connected": db_client.is_connected(),
        "last_trained": last_trained,
        "missing_models": missing,
        "is_healthy": len(missing) == 0
    })


@app.route("/api/ml/retrain", methods=["POST"])
def retrain_models():
    """Trigger a retraining of all models using the latest database data."""
    try:
        # Clear caches and explicitly free memory BEFORE retraining
        global _csv_cache, _models
        _csv_cache.clear()
        _models.clear()
        gc.collect()
        
        # Import inside the function to prevent circular import issues
        import train
        train.train_all()
        
        # Explicitly clear again in case train_all left anything in memory
        _csv_cache.clear()
        _models.clear()
        gc.collect()
        
        return jsonify({
            "status": "success", 
            "message": "All models retrained successfully using live data. Models will be re-loaded into memory on next use.",
            "timestamp": datetime.utcnow().isoformat()
        })
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@app.route("/api/ml/status", methods=["GET"])
def get_ml_status():
    """Returns the current status and performance of all models from metadata.json."""
    try:
        metadata_path = os.path.join(MODEL_DIR, "metadata.json")
        if not os.path.exists(metadata_path):
            return jsonify({
                "status": "partial",
                "message": "Model metadata not found. Models may have been initialized but not fully trained through the production pipeline.",
                "last_trained": None,
                "models": {}
            })
            
        with open(metadata_path, 'r') as f:
            metadata = json.load(f)
            
        return jsonify(metadata)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    port = int(os.environ.get("ML_SERVICE_PORT", 5050))
    print(f"Starting ML service on port {port}")
    print(f"Model directory: {MODEL_DIR}")
    print(f"CSV directory: {CSV_DIR}")

    # Pre-check which models are available
    model_names = ["donor_churn", "incident_risk", "resident_progress", "safehouse_outcomes", "social_media_impact"]
    for name in model_names:
        path = os.path.join(MODEL_DIR, f"{name}_model.joblib")
        status = "READY" if os.path.exists(path) else "NOT FOUND (run notebook to export)"
        print(f"  {name}: {status}")

    app.run(host="0.0.0.0", port=port, debug=False)
