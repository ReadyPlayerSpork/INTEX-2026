"""
Haven for Her — ML Prediction Microservice

Flask app that loads trained .joblib models and serves prediction endpoints.
Computes features from CSV data in lighthouse_csv_v7/.

Usage:
    python serve.py                         # default port 5050
    ML_SERVICE_PORT=8080 python serve.py    # custom port
"""

import os
import traceback
from datetime import datetime

import joblib
import numpy as np
import pandas as pd
from flask import Flask, jsonify, request

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
        "C:\\Users\\jrdis\\source\\repos\\INTEX-2026\\backend\\Haven-for-Her-Backend\\docs\\lighthouse_csv_v7"
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
    supporters = _csv("supporters.csv")
    donations = _csv("donations.csv")

    supporters["acquisition_channel"] = supporters["acquisition_channel"].fillna("Unknown")
    supporters["region"] = supporters["region"].fillna("Not Specified")
    supporters["created_at"] = pd.to_datetime(supporters["created_at"])
    donations["donation_date"] = pd.to_datetime(donations["donation_date"])
    donations["total_val"] = donations["amount"].fillna(0) + donations["estimated_value"].fillna(0)

    snapshot_date = donations["donation_date"].max() + pd.Timedelta(days=1)

    donor_metrics = donations.groupby("supporter_id").agg({
        "donation_date": [
            lambda x: (snapshot_date - x.max()).days,
            lambda x: (x.max() - x.min()).days,
            lambda x: x.dt.month.std(),
        ],
        "donation_id": "count",
        "total_val": ["sum", "mean"],
    })
    donor_metrics.columns = ["recency", "active_span", "seasonality_std", "frequency", "ltv", "avg_donation_val"]
    donor_metrics["seasonality_std"] = donor_metrics["seasonality_std"].fillna(0)
    donor_metrics["is_churned"] = (donor_metrics["recency"] > 365).astype(int)

    df = pd.merge(supporters, donor_metrics, left_on="supporter_id", right_index=True, how="left")
    df["frequency"] = df["frequency"].fillna(0)
    df["ltv"] = df["ltv"].fillna(0)
    df["avg_donation_val"] = df["avg_donation_val"].fillna(0)
    df["is_churned"] = df["is_churned"].fillna(1)
    df["recency"] = df["recency"].fillna((snapshot_date - df["created_at"]).dt.days)
    df["tenure_days"] = (snapshot_date - df["created_at"]).dt.days
    df["loyalty_ratio"] = df["frequency"] / (df["tenure_days"] / 30.44)
    df["seasonality_std"] = df["seasonality_std"].fillna(0)

    model_features = [
        "supporter_type", "relationship_type", "region", "acquisition_channel",
        "tenure_days", "frequency", "ltv", "avg_donation_val", "seasonality_std",
    ]
    X = pd.get_dummies(df[model_features], drop_first=True)
    X = X.fillna(0)
    return df, X


def _incident_features() -> pd.DataFrame:
    """Build the same feature matrix used by the incident risk notebook."""
    residents = _csv("residents.csv")
    incidents = _csv("incident_reports.csv")
    recordings = _csv("process_recordings.csv")

    residents["date_of_admission"] = pd.to_datetime(residents["date_of_admission"])
    residents["date_closed"] = pd.to_datetime(residents["date_closed"])
    today = residents["date_closed"].max() if residents["date_closed"].notnull().any() else pd.to_datetime("2026-03-10")
    residents["end_date"] = residents["date_closed"].fillna(today)
    residents["tenure_days"] = (residents["end_date"] - residents["date_of_admission"]).dt.days
    residents["tenure_months"] = residents["tenure_days"] / 30.44

    risk_map = {"Low": 1, "Medium": 2, "High": 3, "Critical": 4}
    residents["initial_risk_num"] = residents["initial_risk_level"].map(risk_map)

    severity_map = {"Low": 1, "Medium": 2, "High": 3}
    incidents["severity_num"] = incidents["severity"].map(severity_map)

    incident_agg = incidents.groupby("resident_id").agg({
        "incident_id": "count",
        "severity_num": "mean",
        "resolved": lambda x: (x == False).sum(),
        "severity": lambda x: (x == "High").any(),
    }).rename(columns={
        "incident_id": "total_incidents",
        "severity_num": "avg_severity",
        "resolved": "unresolved_incidents",
        "severity": "has_high_severity_incident",
    }).reset_index()

    recording_agg = recordings.groupby("resident_id").agg({
        "recording_id": "count",
        "session_duration_minutes": "mean",
        "concerns_flagged": "sum",
    }).rename(columns={
        "recording_id": "total_sessions",
        "session_duration_minutes": "avg_session_duration",
        "concerns_flagged": "concerns_flagged_count",
    }).reset_index()

    df = residents.merge(incident_agg, on="resident_id", how="left")
    df = df.merge(recording_agg, on="resident_id", how="left")
    fill_cols = ["total_incidents", "avg_severity", "unresolved_incidents", "total_sessions", "avg_session_duration", "concerns_flagged_count"]
    df[fill_cols] = df[fill_cols].fillna(0)
    df["has_high_severity_incident"] = df["has_high_severity_incident"].fillna(False).astype(int)

    model_features = [
        "case_category", "initial_risk_num", "sex", "is_pwd",
        "has_special_needs", "tenure_months", "total_sessions", "concerns_flagged_count",
    ]
    X = pd.get_dummies(df[model_features], drop_first=True)
    return df, X


def _resident_progress_features() -> pd.DataFrame:
    """Build the same feature matrix used by the resident progress notebook."""
    residents = _csv("residents.csv")
    recordings = _csv("process_recordings.csv")
    education = _csv("education_records.csv")
    health = _csv("health_wellbeing_records.csv")

    recordings["session_date"] = pd.to_datetime(recordings["session_date"])
    education["record_date"] = pd.to_datetime(education["record_date"])
    health["record_date"] = pd.to_datetime(health["record_date"])

    session_metrics = recordings.groupby("resident_id").agg({
        "recording_id": "count",
        "session_duration_minutes": "mean",
        "progress_noted": lambda x: (x == True).mean() * 100,
    }).rename(columns={
        "recording_id": "session_count",
        "session_duration_minutes": "avg_session_duration",
        "progress_noted": "progress_noted_pct",
    }).reset_index()

    def calculate_trend(src_df, id_col, date_col, value_col):
        src_df = src_df.sort_values([id_col, date_col])
        trends = {}
        for rid, group in src_df.groupby(id_col):
            if len(group) >= 2:
                trends[rid] = group.iloc[-1][value_col] - group.iloc[-2][value_col]
            else:
                trends[rid] = 0
        return pd.Series(trends, name=f"{value_col}_trend")

    health_trend = calculate_trend(health, "resident_id", "record_date", "general_health_score")
    edu_trend = calculate_trend(education, "resident_id", "record_date", "attendance_rate")
    last_health = health.sort_values("record_date").groupby("resident_id")["general_health_score"].last().rename("current_health_score")
    last_edu = education.sort_values("record_date").groupby("resident_id")["attendance_rate"].last().rename("current_attendance_rate")

    df = residents.merge(session_metrics, on="resident_id", how="left")
    df = df.merge(health_trend, left_on="resident_id", right_index=True, how="left")
    df = df.merge(edu_trend, left_on="resident_id", right_index=True, how="left")
    df = df.merge(last_health, on="resident_id", how="left")
    df = df.merge(last_edu, on="resident_id", how="left")

    df["is_ready"] = (df["reintegration_status"] == "Completed").astype(int)
    df["length_of_stay_days"] = (pd.to_datetime("today") - pd.to_datetime(df["date_of_admission"])).dt.days

    metric_cols = ["session_count", "avg_session_duration", "progress_noted_pct",
                   "general_health_score_trend", "attendance_rate_trend",
                   "current_health_score", "current_attendance_rate"]
    df[metric_cols] = df[metric_cols].fillna(0)

    features = ["session_count", "avg_session_duration", "progress_noted_pct",
                "general_health_score_trend", "attendance_rate_trend",
                "current_health_score", "current_attendance_rate", "length_of_stay_days"]
    X = df[features]
    return df, X


def _social_media_features() -> pd.DataFrame:
    """Build the same feature matrix used by the social media impact notebook."""
    df = _csv("social_media_posts.csv")
    cols_to_zero = ["boost_budget_php", "video_views", "watch_time_seconds", "avg_view_duration_seconds"]
    for c in cols_to_zero:
        if c in df.columns:
            df[c] = df[c].fillna(0)
    df["campaign_name"] = df["campaign_name"].fillna("None")
    df["call_to_action_type"] = df["call_to_action_type"].fillna("None")

    def get_time_of_day(hour):
        if 5 <= hour < 12:
            return "morning"
        elif 12 <= hour < 17:
            return "afternoon"
        elif 17 <= hour < 22:
            return "evening"
        else:
            return "night"

    df["time_of_day"] = df["post_hour"].apply(get_time_of_day)
    eng_75th = df["engagement_rate"].quantile(0.75)
    df["is_high_engagement"] = (df["engagement_rate"] > eng_75th).astype(int)
    df["is_donation_driver"] = (df["donation_referrals"] > 0).astype(int)

    model_features = ["platform", "post_type", "media_type", "time_of_day",
                       "sentiment_tone", "caption_length", "num_hashtags", "is_boosted"]
    X = pd.get_dummies(df[model_features], drop_first=True)
    return df, X


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

        idx = df.index[df["supporter_id"] == supporter_id]
        if len(idx) == 0:
            return jsonify({"error": f"Supporter {supporter_id} not found"}), 404

        row = X.loc[idx]
        prob = float(model.predict_proba(row)[0, 1])
        importances = dict(sorted(
            zip(features, model.feature_importances_),
            key=lambda x: abs(x[1]), reverse=True
        )[:5])

        return jsonify({
            "supporter_id": supporter_id,
            "churn_probability": round(prob, 4),
            "risk_level": _risk_level(prob),
            "top_factors": importances,
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
                "supporter_id": int(row["supporter_id"]),
                "display_name": row.get("display_name", ""),
                "churn_probability": round(prob, 4),
                "risk_level": _risk_level(prob),
            })
        results.sort(key=lambda x: x["churn_probability"], reverse=True)
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

        idx = df.index[df["resident_id"] == resident_id]
        if len(idx) == 0:
            return jsonify({"error": f"Resident {resident_id} not found"}), 404

        row = X.loc[idx]
        prob = float(model.predict_proba(row)[0, 1])
        importances = dict(sorted(
            zip(features, model.feature_importances_),
            key=lambda x: abs(x[1]), reverse=True
        )[:5])

        return jsonify({
            "resident_id": resident_id,
            "escalation_probability": round(prob, 4),
            "risk_level": _risk_level(prob),
            "risk_factors": importances,
        })
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@app.route("/api/ml/incident-risk/alerts", methods=["GET"])
def incident_risk_alerts():
    """Return residents with high escalation probability (>0.5)."""
    model, features = _load_model("incident_risk")
    if model is None:
        return jsonify({"error": "Model not trained yet."}), 503

    try:
        df, X = _incident_features()
        X = _align_features(X, features)
        probs = model.predict_proba(X)[:, 1]

        alerts = []
        for i, (_, row) in enumerate(df.iterrows()):
            prob = float(probs[i])
            if prob >= 0.5:
                alerts.append({
                    "resident_id": int(row["resident_id"]),
                    "first_name": row.get("first_name", ""),
                    "last_name": row.get("last_name", ""),
                    "escalation_probability": round(prob, 4),
                    "risk_level": _risk_level(prob),
                    "current_risk_level": row.get("current_risk_level", ""),
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
        idx = df.index[df["resident_id"] == resident_id]
        if len(idx) == 0:
            return jsonify({"error": f"Resident {resident_id} not found"}), 404

        row = X.loc[idx]
        prob = float(model.predict_proba(row)[0, 1])
        importances = dict(sorted(
            zip(features, model.feature_importances_),
            key=lambda x: abs(x[1]), reverse=True
        )[:5])

        return jsonify({
            "resident_id": resident_id,
            "readiness_score": round(prob, 4),
            "risk_level": _risk_level(1 - prob),  # invert: low readiness = high risk
            "top_factors": importances,
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
        # Load and prepare data similar to notebook
        allocations = _csv("donation_allocations.csv")
        metrics = _csv("safehouse_monthly_metrics.csv")
        safehouses_df = _csv("safehouses.csv")

        allocations["allocation_date"] = pd.to_datetime(allocations["allocation_date"])
        metrics["month_start"] = pd.to_datetime(metrics["month_start"])
        metrics_clean = metrics.dropna(subset=["avg_education_progress", "avg_health_score"])

        allocations["month_start"] = allocations["allocation_date"].dt.to_period("M").dt.to_timestamp()
        funding_pivot = allocations.groupby(["safehouse_id", "month_start", "program_area"])["amount_allocated"].sum().unstack(fill_value=0).reset_index()
        funding_pivot = funding_pivot.rename(columns={
            "Education": "edu_funding", "Wellbeing": "wellbeing_funding",
            "Operations": "ops_funding", "Transport": "transport_funding",
        })
        for c in ["edu_funding", "wellbeing_funding", "ops_funding", "transport_funding"]:
            if c not in funding_pivot.columns:
                funding_pivot[c] = 0
        funding_pivot["total_funding"] = funding_pivot[["edu_funding", "wellbeing_funding", "ops_funding", "transport_funding"]].sum(axis=1)

        df = pd.merge(metrics_clean, funding_pivot, on=["safehouse_id", "month_start"], how="left").fillna(0)
        df = pd.merge(df, safehouses_df[["safehouse_id", "name", "region"]], on="safehouse_id", how="left")
        df = df.sort_values(["safehouse_id", "month_start"])
        df["lagged_total_funding"] = df.groupby("safehouse_id")["total_funding"].shift(1)
        df["lagged_edu_funding"] = df.groupby("safehouse_id")["edu_funding"].shift(1)
        df["lagged_wellbeing_funding"] = df.groupby("safehouse_id")["wellbeing_funding"].shift(1)
        df_final = df.dropna(subset=["lagged_total_funding"])

        # Get latest row per safehouse
        latest = df_final.sort_values("month_start").groupby("safehouse_id").last().reset_index()

        results = []
        for _, row in latest.iterrows():
            feat_row = pd.DataFrame([row[features]])
            pred = float(model.predict(feat_row)[0])
            results.append({
                "safehouse_id": int(row["safehouse_id"]),
                "safehouse_name": row.get("name", ""),
                "predicted_education_progress": round(pred, 2),
                "actual_education_progress": round(float(row.get("avg_education_progress", 0)), 2),
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
        df = _csv("social_media_posts.csv")
        df["created_at"] = pd.to_datetime(df["created_at"])

        # Best day/hour by engagement
        best_hour = df.groupby("post_hour")["engagement_rate"].mean().idxmax()
        best_day = df.groupby("day_of_week")["engagement_rate"].mean().idxmax()
        best_type = df.groupby("post_type")["donation_referrals"].sum().idxmax()
        best_media = df.groupby("media_type")["engagement_rate"].mean().idxmax()

        # Donation-driving stats
        donation_posts = df[df["donation_referrals"] > 0]
        top_cta = donation_posts["call_to_action_type"].mode().iloc[0] if len(donation_posts) > 0 else "DonateNow"

        return jsonify({
            "best_post_hour": int(best_hour),
            "best_day_of_week": best_day,
            "best_post_type_for_donations": best_type,
            "best_media_type_for_engagement": best_media,
            "recommended_cta": top_cta,
            "avg_engagement_rate": round(float(df["engagement_rate"].mean()), 4),
            "total_donation_referrals": int(df["donation_referrals"].sum()),
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
            "platform": data.get("platform", "Facebook"),
            "post_type": data.get("post_type", "ImpactStory"),
            "media_type": data.get("media_type", "Photo"),
            "time_of_day": data.get("time_of_day", "afternoon"),
            "sentiment_tone": data.get("sentiment_tone", "Hopeful"),
            "caption_length": data.get("caption_length", 200),
            "num_hashtags": data.get("num_hashtags", 5),
            "is_boosted": data.get("is_boosted", False),
        }])
        X_row = pd.get_dummies(row, drop_first=True)
        X_row = _align_features(X_row, features)

        prob = float(model.predict_proba(X_row)[0, 1])
        return jsonify({
            "donation_driver_probability": round(prob, 4),
            "predicted_donation_driver": prob >= 0.5,
            "recommendation": "This post is likely to drive donations!" if prob >= 0.5
                else "Consider adding a stronger CTA or using video content to improve donation conversion.",
        })
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


# ── System Administration ────────────────────────────────────────────────────

@app.route("/api/ml/retrain", methods=["POST"])
def retrain_models():
    """Trigger a retraining of all models using the latest CSV data."""
    try:
        # Clear CSV cache so it re-reads from disk
        global _csv_cache, _models
        _csv_cache.clear()
        
        # Import inside the function to prevent circular import issues
        import train
        train.train_all()
        
        # Clear the model cache so the next request loads the new .joblib files
        _models.clear()
        
        return jsonify({
            "status": "success", 
            "message": "All models retrained successfully and loaded into memory.",
            "timestamp": datetime.utcnow().isoformat()
        })
    except Exception as e:
        traceback.print_exc()
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
