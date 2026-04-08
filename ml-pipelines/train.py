import os
import joblib
import pandas as pd
from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier, GradientBoostingRegressor
from sklearn.linear_model import LogisticRegression

# Import the feature engineering functions already written in serve.py
# This ensures our training features exactly match our serving features!
from serve import (
    _donor_features, 
    _incident_features, 
    _resident_progress_features, 
    _social_media_features,
    CSV_DIR,
    MODEL_DIR
)

def train_donor_churn():
    print("Training Donor Churn model...")
    df, X = _donor_features()
    y = df['is_churned']
    
    model = GradientBoostingClassifier(n_estimators=100, random_state=42)
    model.fit(X, y)
    
    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump(model, os.path.join(MODEL_DIR, 'donor_churn_model.joblib'))
    joblib.dump(list(X.columns), os.path.join(MODEL_DIR, 'donor_churn_features.joblib'))
    print("Done: donor_churn")

def train_incident_risk():
    print("Training Incident Risk model...")
    df, X = _incident_features()
    # Assuming 'has_high_severity_incident' is the target based on serve.py
    y = df['has_high_severity_incident']
    
    model = GradientBoostingClassifier(n_estimators=100, random_state=42)
    model.fit(X, y)
    
    joblib.dump(model, os.path.join(MODEL_DIR, 'incident_risk_model.joblib'))
    joblib.dump(list(X.columns), os.path.join(MODEL_DIR, 'incident_risk_features.joblib'))
    print("Done: incident_risk")

def train_resident_progress():
    print("Training Resident Progress model...")
    df, X = _resident_progress_features()
    y = df['is_ready']
    
    model = GradientBoostingClassifier(n_estimators=100, random_state=42)
    model.fit(X, y)
    
    joblib.dump(model, os.path.join(MODEL_DIR, 'resident_progress_model.joblib'))
    joblib.dump(list(X.columns), os.path.join(MODEL_DIR, 'resident_progress_features.joblib'))
    print("Done: resident_progress")

def train_safehouse_outcomes():
    print("Training Safehouse Outcomes model...")
    # serve.py doesn't have a specific feature extraction function for this yet
    # We'll recreate the basic training logic from serve.py's inference block
    allocations = pd.read_csv(os.path.join(CSV_DIR, "donation_allocations.csv"))
    metrics = pd.read_csv(os.path.join(CSV_DIR, "safehouse_monthly_metrics.csv"))
    
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
    df = df.sort_values(["safehouse_id", "month_start"])
    df["lagged_total_funding"] = df.groupby("safehouse_id")["total_funding"].shift(1)
    df["lagged_edu_funding"] = df.groupby("safehouse_id")["edu_funding"].shift(1)
    df["lagged_wellbeing_funding"] = df.groupby("safehouse_id")["wellbeing_funding"].shift(1)
    df_final = df.dropna(subset=["lagged_total_funding"])
    
    features = ['lagged_total_funding', 'lagged_edu_funding', 'lagged_wellbeing_funding']
    X = df_final[features]
    y = df_final['avg_education_progress']
    
    model = GradientBoostingRegressor(n_estimators=100, random_state=42)
    model.fit(X, y)
    
    joblib.dump(model, os.path.join(MODEL_DIR, 'safehouse_outcomes_model.joblib'))
    joblib.dump(list(X.columns), os.path.join(MODEL_DIR, 'safehouse_outcomes_features.joblib'))
    print("Done: safehouse_outcomes")

def train_social_media_impact():
    print("Training Social Media Impact model...")
    df, X = _social_media_features()
    y = df['is_donation_driver']
    
    model = GradientBoostingClassifier(n_estimators=100, random_state=42)
    model.fit(X, y)
    
    joblib.dump(model, os.path.join(MODEL_DIR, 'social_media_impact_model.joblib'))
    joblib.dump(list(X.columns), os.path.join(MODEL_DIR, 'social_media_impact_features.joblib'))
    print("Done: social_media_impact")

def train_all():
    print("Starting model training pipeline...")
    train_donor_churn()
    train_incident_risk()
    train_resident_progress()
    train_safehouse_outcomes()
    train_social_media_impact()
    print("All models trained and saved to /models directory successfully!")

if __name__ == "__main__":
    train_all()