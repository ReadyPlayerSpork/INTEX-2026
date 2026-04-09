"""
Haven for Her — ML Model Training Pipeline

Production-grade training script that mirrors the modeling approach used in
each analysis notebook: stratified train/test splits, tuned hyperparameters,
evaluation metrics, and model export.

Reuses the feature engineering functions from serve.py to guarantee that
training features exactly match serving features.

Usage:
    python train.py                # train all 5 models
    python train.py donor_churn    # train a single model
"""

import json
import os
import sys
from datetime import datetime

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import (
    GradientBoostingClassifier,
    GradientBoostingRegressor,
    RandomForestClassifier,
    RandomForestRegressor,
)
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    mean_squared_error,
    r2_score,
    roc_auc_score,
)
from sklearn.calibration import CalibratedClassifierCV
from sklearn.model_selection import KFold, StratifiedKFold, cross_val_score, train_test_split

from serve import (
    CSV_DIR,
    MODEL_DIR,
    _donor_features,
    _incident_features,
    _resident_progress_features,
    _safehouse_features,
    _social_media_features,
)

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
RANDOM_STATE = 42
REPORT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "reports")


def _skip_classification(reason: str) -> dict:
    """Return when training cannot run (degenerate target). train_all() treats this as a soft failure."""
    print(f"\n  [SKIP] {reason}")
    return {"error": reason, "skipped": True}


def _stratify_arg(y: pd.Series) -> pd.Series | None:
    """Use stratified split only when each class has at least 2 samples (sklearn requirement)."""
    if y.nunique() < 2:
        return None
    if y.value_counts().min() < 2:
        return None
    return y


def _gb_or_calibrated_importances(model, n_features: int) -> np.ndarray:
    """Feature importances from GBC; CalibratedClassifierCV delegates to underlying estimators."""
    if hasattr(model, "feature_importances_"):
        return np.asarray(model.feature_importances_)
    if getattr(model, "calibrated_classifiers_", None):
        est = model.calibrated_classifiers_[0].estimator
        if hasattr(est, "feature_importances_"):
            return np.asarray(est.feature_importances_)
    return np.zeros(n_features)


def _save_report(name: str, report: dict) -> None:
    """Persist training metrics to a JSON file for auditing."""
    os.makedirs(REPORT_DIR, exist_ok=True)
    path = os.path.join(REPORT_DIR, f"{name}_report.json")
    with open(path, "w") as f:
        json.dump(report, f, indent=2, default=str)
    print(f"  Report saved -> {path}")


def _print_classification_results(
    name: str, y_test, y_pred, y_prob, cv_scores
) -> dict:
    """Print and return classification evaluation metrics."""
    report_dict = classification_report(y_test, y_pred, output_dict=True, zero_division=0)
    report_text = classification_report(y_test, y_pred, zero_division=0)
    cm = confusion_matrix(y_test, y_pred)

    try:
        auc = roc_auc_score(y_test, y_prob)
    except ValueError:
        auc = None  # single-class in test set

    print(f"\n  {'='*50}")
    print(f"  {name} — Evaluation Results")
    print(f"  {'='*50}")
    print(f"\n  Classification Report:\n{report_text}")
    print(f"  Confusion Matrix:\n{cm}\n")
    if auc is not None:
        print(f"  ROC-AUC Score: {auc:.4f}")
    print(f"  5-Fold Stratified CV Accuracy: {cv_scores.mean():.4f} (+/- {cv_scores.std()*2:.4f})")

    return {
        "model": name,
        "trained_at": datetime.utcnow().isoformat(),
        "test_samples": int(len(y_test)),
        "roc_auc": round(auc, 4) if auc is not None else None,
        "cv_accuracy_mean": round(float(cv_scores.mean()), 4),
        "cv_accuracy_std": round(float(cv_scores.std()), 4),
        "classification_report": report_dict,
        "confusion_matrix": cm.tolist(),
    }


def _print_regression_results(
    name: str, y_test, y_pred, cv_scores
) -> dict:
    """Print and return regression evaluation metrics."""
    r2 = r2_score(y_test, y_pred)
    rmse = float(np.sqrt(mean_squared_error(y_test, y_pred)))
    mae = float(np.mean(np.abs(y_test - y_pred)))

    print(f"\n  {'='*50}")
    print(f"  {name} — Evaluation Results")
    print(f"  {'='*50}")
    print(f"  R² Score:  {r2:.4f}")
    print(f"  RMSE:      {rmse:.4f}")
    print(f"  MAE:       {mae:.4f}")
    print(f"  5-Fold CV R²: {cv_scores.mean():.4f} (+/- {cv_scores.std()*2:.4f})")

    return {
        "model": name,
        "trained_at": datetime.utcnow().isoformat(),
        "test_samples": int(len(y_test)),
        "r2_score": round(r2, 4),
        "rmse": round(rmse, 4),
        "mae": round(mae, 4),
        "cv_r2_mean": round(float(cv_scores.mean()), 4),
        "cv_r2_std": round(float(cv_scores.std()), 4),
    }


def _print_feature_importances(feature_names: list, importances: np.ndarray, top_n: int = 10) -> dict:
    """Print top feature importances and return as dict."""
    sorted_idx = np.argsort(importances)[::-1][:top_n]
    print(f"\n  Top {top_n} Feature Importances:")
    result = {}
    for rank, idx in enumerate(sorted_idx, 1):
        print(f"    {rank:2d}. {feature_names[idx]:40s} {importances[idx]:.4f}")
        result[feature_names[idx]] = round(float(importances[idx]), 4)
    return result


# ---------------------------------------------------------------------------
# 1. Donor Churn
# ---------------------------------------------------------------------------
def train_donor_churn() -> dict:
    """
    Predict donor churn (no donation in 365+ days).

    Uses regularized GradientBoosting + sigmoid calibration so batch scores are not
    stuck at ~0% / ~100% (common with deep trees on small tabular data).
    """
    print("\n" + "="*60)
    print("Training: Donor Churn Model")
    print("="*60)

    df, X = _donor_features()
    y = df["IsChurned"].astype(int)
    feature_names = list(X.columns)

    print(f"  Dataset: {len(X)} samples, {len(feature_names)} features")
    print(f"  Target distribution: {dict(y.value_counts())}")
    print(f"  Churn rate: {y.mean()*100:.1f}%")

    if y.nunique() < 2:
        return _skip_classification(
            "donor_churn: target IsChurned has only one class; need both churned and active donors in data."
        )

    # Stratified train/test split (matches notebook: 75/25)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, stratify=_stratify_arg(y), random_state=RANDOM_STATE
    )

    # Stronger regularization than the original notebook to reduce overfitting
    base_params = dict(
        n_estimators=100,
        learning_rate=0.05,
        max_depth=3,
        min_samples_leaf=10,
        min_samples_split=24,
        subsample=0.72,
        max_features="sqrt",
        random_state=RANDOM_STATE,
    )
    base = GradientBoostingClassifier(**base_params)

    # CV on the same base estimator (avoids nested CV cost of CalibratedClassifierCV)
    try:
        cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=RANDOM_STATE)
        cv_scores = cross_val_score(
            GradientBoostingClassifier(**base_params), X, y, cv=cv, scoring="accuracy"
        )
    except ValueError as e:
        print(f"  [WARN] Stratified CV skipped: {e}")
        cv_scores = np.array([np.nan])

    # Platt scaling on out-of-fold scores pulls extreme probabilities toward calibrated values
    if len(X_train) >= 30:
        model = CalibratedClassifierCV(estimator=GradientBoostingClassifier(**base_params), cv=3, method="sigmoid")
        print("  Using CalibratedClassifierCV (sigmoid) on top of regularized GBC.")
    else:
        model = base
        print("  Dataset small; using GBC without calibration (add data for softer scores).")

    model.fit(X_train, y_train)

    # Evaluate
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]

    report = _print_classification_results("Donor Churn", y_test, y_pred, y_prob, cv_scores)
    report["feature_importances"] = _print_feature_importances(
        feature_names, _gb_or_calibrated_importances(model, len(feature_names))
    )
    report["hyperparameters"] = {
        **base_params,
        "calibration": "sigmoid (CalibratedClassifierCV cv=3)" if len(X_train) >= 30 else "none (n_train < 30)",
    }

    # Save model + features
    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump(model, os.path.join(MODEL_DIR, "donor_churn_model.joblib"))
    joblib.dump(feature_names, os.path.join(MODEL_DIR, "donor_churn_features.joblib"))

    _save_report("donor_churn", report)
    print("  [OK] Model saved")
    return report


# ---------------------------------------------------------------------------
# 2. Incident Risk
# ---------------------------------------------------------------------------
def train_incident_risk() -> dict:
    """
    Predict high-severity incident risk for residents.

    RandomForest with shallower trees + sigmoid calibration when n_train is sufficient,
    to reduce overconfident scores on tabular NGO data (same idea as donor churn).
    """
    print("\n" + "="*60)
    print("Training: Incident Risk Model")
    print("="*60)

    df, X = _incident_features()
    y = df["HasHighSeverityIncident"].astype(int)
    feature_names = list(X.columns)

    print(f"  Dataset: {len(X)} samples, {len(feature_names)} features")
    print(f"  Target distribution: {dict(y.value_counts())}")
    print(f"  High-severity rate: {y.mean()*100:.1f}%")

    if y.nunique() < 2:
        return _skip_classification(
            "incident_risk: target HasHighSeverityIncident has only one class; need mixed labels."
        )

    # Stratified train/test split (matches notebook: 75/25)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, stratify=_stratify_arg(y), random_state=RANDOM_STATE
    )

    rf_params = dict(
        n_estimators=150,
        max_depth=6,
        min_samples_leaf=6,
        min_samples_split=12,
        max_features="sqrt",
        class_weight="balanced",
        random_state=RANDOM_STATE,
    )

    try:
        cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=RANDOM_STATE)
        cv_scores = cross_val_score(
            RandomForestClassifier(**rf_params), X, y, cv=cv, scoring="accuracy"
        )
    except ValueError as e:
        print(f"  [WARN] Stratified CV skipped: {e}")
        cv_scores = np.array([np.nan])

    if len(X_train) >= 30:
        model = CalibratedClassifierCV(
            estimator=RandomForestClassifier(**rf_params), cv=3, method="sigmoid"
        )
        print("  Using CalibratedClassifierCV (sigmoid) on top of regularized RandomForest.")
    else:
        model = RandomForestClassifier(**rf_params)
        print("  Dataset small; using RandomForest without calibration (add data for softer scores).")

    model.fit(X_train, y_train)

    # Evaluate
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]

    report = _print_classification_results("Incident Risk", y_test, y_pred, y_prob, cv_scores)
    report["feature_importances"] = _print_feature_importances(
        feature_names, _gb_or_calibrated_importances(model, len(feature_names))
    )
    report["hyperparameters"] = {
        **rf_params,
        "calibration": "sigmoid (CalibratedClassifierCV cv=3)"
        if len(X_train) >= 30
        else "none (n_train < 30)",
    }

    # Save
    joblib.dump(model, os.path.join(MODEL_DIR, "incident_risk_model.joblib"))
    joblib.dump(feature_names, os.path.join(MODEL_DIR, "incident_risk_features.joblib"))

    _save_report("incident_risk", report)
    print("  [OK] Model saved")
    return report


# ---------------------------------------------------------------------------
# 3. Resident Progress
# ---------------------------------------------------------------------------
def train_resident_progress() -> dict:
    """
    Predict reintegration readiness (binary: completed vs not).

    Regularized GBC + optional sigmoid calibration (aligned with donor churn).
    """
    print("\n" + "="*60)
    print("Training: Resident Progress Model")
    print("="*60)

    df, X = _resident_progress_features()
    y = df["IsReady"].astype(int)
    feature_names = list(X.columns)

    print(f"  Dataset: {len(X)} samples, {len(feature_names)} features")
    print(f"  Target distribution: {dict(y.value_counts())}")
    print(f"  Completion rate: {y.mean()*100:.1f}%")

    if y.nunique() < 2:
        return _skip_classification(
            "resident_progress: target IsReady has only one class; need both ready and not-ready examples."
        )

    # Train/test split (matches notebook: 80/20); stratify only when each class has ≥2 rows
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, stratify=_stratify_arg(y), random_state=RANDOM_STATE
    )
    if y_train.nunique() < 2:
        return _skip_classification(
            "resident_progress: training fold has a single class after split; add more diverse labels."
        )

    base_params = dict(
        n_estimators=100,
        learning_rate=0.05,
        max_depth=3,
        min_samples_leaf=8,
        min_samples_split=20,
        subsample=0.75,
        max_features="sqrt",
        random_state=RANDOM_STATE,
    )

    try:
        cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=RANDOM_STATE)
        cv_scores = cross_val_score(
            GradientBoostingClassifier(**base_params), X, y, cv=cv, scoring="accuracy"
        )
    except ValueError as e:
        print(f"  [WARN] Stratified CV skipped: {e}")
        cv_scores = np.array([np.nan])

    if len(X_train) >= 30:
        model = CalibratedClassifierCV(
            estimator=GradientBoostingClassifier(**base_params), cv=3, method="sigmoid"
        )
        print("  Using CalibratedClassifierCV (sigmoid) on top of regularized GBC.")
    else:
        model = GradientBoostingClassifier(**base_params)
        print("  Dataset small; using GBC without calibration (add data for softer scores).")

    model.fit(X_train, y_train)

    # Evaluate
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]

    report = _print_classification_results("Resident Progress", y_test, y_pred, y_prob, cv_scores)
    report["feature_importances"] = _print_feature_importances(
        feature_names, _gb_or_calibrated_importances(model, len(feature_names))
    )
    report["hyperparameters"] = {
        **base_params,
        "calibration": "sigmoid (CalibratedClassifierCV cv=3)"
        if len(X_train) >= 30
        else "none (n_train < 30)",
    }

    # Save
    joblib.dump(model, os.path.join(MODEL_DIR, "resident_progress_model.joblib"))
    joblib.dump(feature_names, os.path.join(MODEL_DIR, "resident_progress_features.joblib"))

    _save_report("resident_progress", report)
    print("  [OK] Model saved")
    return report


# ---------------------------------------------------------------------------
# 4. Safehouse Outcomes
# ---------------------------------------------------------------------------
def train_safehouse_outcomes() -> dict:
    """
    Predict education progress based on lagged funding allocations (regression).

    Shallower RandomForest with min leaf/split and subsample to limit overfit on small cohorts.
    """
    print("\n" + "="*60)
    print("Training: Safehouse Outcomes Model")
    print("="*60)

    df_final, X = _safehouse_features()
    y = df_final["AvgEducationProgress"]
    feature_names = list(X.columns)

    print(f"  Dataset: {len(X)} samples, {len(feature_names)} features")
    print(f"  Target range: [{y.min():.2f}, {y.max():.2f}], mean={y.mean():.2f}")

    # Train/test split (matches notebook: 80/20)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=RANDOM_STATE
    )

    rf_reg_params = dict(
        n_estimators=120,
        max_depth=6,
        min_samples_leaf=6,
        min_samples_split=12,
        max_samples=0.85,
        max_features="sqrt",
        random_state=RANDOM_STATE,
    )
    model = RandomForestRegressor(**rf_reg_params)
    model.fit(X_train, y_train)

    # Evaluate
    y_pred = model.predict(X_test)
    cv = KFold(n_splits=5, shuffle=True, random_state=RANDOM_STATE)
    cv_scores = cross_val_score(
        RandomForestRegressor(**rf_reg_params), X, y, cv=cv, scoring="r2"
    )

    report = _print_regression_results("Safehouse Outcomes", y_test, y_pred, cv_scores)
    report["feature_importances"] = _print_feature_importances(feature_names, model.feature_importances_)
    report["hyperparameters"] = rf_reg_params

    # Save
    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump(model, os.path.join(MODEL_DIR, "safehouse_outcomes_model.joblib"))
    joblib.dump(feature_names, os.path.join(MODEL_DIR, "safehouse_outcomes_features.joblib"))

    _save_report("safehouse_outcomes", report)
    print("  [OK] Model saved")
    return report


# ---------------------------------------------------------------------------
# 5. Social Media Impact
# ---------------------------------------------------------------------------
def train_social_media_impact() -> dict:
    """
    Predict whether a post will drive donations (binary classification).

    Regularized RandomForest + optional sigmoid calibration (consistent with incident risk).
    """
    print("\n" + "="*60)
    print("Training: Social Media Impact Model")
    print("="*60)

    df, X = _social_media_features()
    y = df["IsDonationDriver"].astype(int)
    feature_names = list(X.columns)

    print(f"  Dataset: {len(X)} samples, {len(feature_names)} features")
    print(f"  Target distribution: {dict(y.value_counts())}")
    print(f"  Donation-driver rate: {y.mean()*100:.1f}%")

    if y.nunique() < 2:
        return _skip_classification(
            "social_media_impact: target IsDonationDriver has only one class; need mixed labels."
        )

    # Train/test split (matches notebook: 80/20)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, stratify=_stratify_arg(y), random_state=RANDOM_STATE
    )

    rf_params = dict(
        n_estimators=120,
        max_depth=6,
        min_samples_leaf=4,
        min_samples_split=10,
        max_features="sqrt",
        random_state=RANDOM_STATE,
    )

    try:
        cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=RANDOM_STATE)
        cv_scores = cross_val_score(
            RandomForestClassifier(**rf_params), X, y, cv=cv, scoring="accuracy"
        )
    except ValueError as e:
        print(f"  [WARN] Stratified CV skipped: {e}")
        cv_scores = np.array([np.nan])

    if len(X_train) >= 30:
        model = CalibratedClassifierCV(
            estimator=RandomForestClassifier(**rf_params), cv=3, method="sigmoid"
        )
        print("  Using CalibratedClassifierCV (sigmoid) on top of regularized RandomForest.")
    else:
        model = RandomForestClassifier(**rf_params)
        print("  Dataset small; using RandomForest without calibration (add data for softer scores).")

    model.fit(X_train, y_train)

    # Evaluate
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]

    report = _print_classification_results("Social Media Impact", y_test, y_pred, y_prob, cv_scores)
    report["feature_importances"] = _print_feature_importances(
        feature_names, _gb_or_calibrated_importances(model, len(feature_names))
    )
    report["hyperparameters"] = {
        **rf_params,
        "calibration": "sigmoid (CalibratedClassifierCV cv=3)"
        if len(X_train) >= 30
        else "none (n_train < 30)",
    }

    # Save
    joblib.dump(model, os.path.join(MODEL_DIR, "social_media_impact_model.joblib"))
    joblib.dump(feature_names, os.path.join(MODEL_DIR, "social_media_impact_features.joblib"))

    _save_report("social_media_impact", report)
    print("  [OK] Model saved")
    return report


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------
TRAINERS = {
    "donor_churn": train_donor_churn,
    "incident_risk": train_incident_risk,
    "resident_progress": train_resident_progress,
    "safehouse_outcomes": train_safehouse_outcomes,
    "social_media_impact": train_social_media_impact,
}


def train_all() -> dict:
    """Train all 5 models and return a combined summary."""
    print("\n" + "#"*60)
    print("  Haven for Her — ML Training Pipeline")
    print(f"  Started at {datetime.utcnow().isoformat()}")
    print(f"  CSV source: {CSV_DIR}")
    print(f"  Model output: {MODEL_DIR}")
    print("#"*60)

    results = {}
    for name, trainer in TRAINERS.items():
        try:
            results[name] = trainer()
        except Exception as e:
            print(f"\n  [FAIL] {name} -- {e}")
            import traceback
            traceback.print_exc()
            results[name] = {"model": name, "error": str(e)}

    # Summary
    print("\n" + "="*60)
    print("  Training Summary")
    print("="*60)
    for name, report in results.items():
        if report.get("skipped"):
            print(f"  [SKIP] {name:30s} {report.get('error', '')}")
        elif "error" in report:
            print(f"  [FAIL] {name:30s} {report['error']}")
        elif "roc_auc" in report:
            auc = report.get("roc_auc", "N/A")
            cv = report.get("cv_accuracy_mean", "N/A")
            print(f"  [OK]   {name:30s} AUC={auc}  CV-Acc={cv}")
        else:
            r2 = report.get("r2_score", "N/A")
            cv = report.get("cv_r2_mean", "N/A")
            print(f"  [OK]   {name:30s} R2={r2}  CV-R2={cv}")

    # Save combined summary
    summary_path = os.path.join(REPORT_DIR, "training_summary.json")
    os.makedirs(REPORT_DIR, exist_ok=True)
    with open(summary_path, "w") as f:
        json.dump(results, f, indent=2, default=str)
    
    # Update production metadata.json for the status endpoint
    metadata_path = os.path.join(MODEL_DIR, "metadata.json")
    os.makedirs(MODEL_DIR, exist_ok=True)
    metadata = {
        "last_trained": datetime.utcnow().isoformat(),
        "model_summary": {
            name: {
                "status": (
                    "skipped"
                    if report.get("skipped")
                    else ("error" if "error" in report else "success")
                ),
                "metrics": {
                    k: v for k, v in report.items()
                    if k in ["roc_auc", "cv_accuracy_mean", "r2_score", "cv_r2_mean"]
                },
            }
            for name, report in results.items()
        },
    }
    with open(metadata_path, "w") as f:
        json.dump(metadata, f, indent=2)

    print(f"\n  Full summary -> {summary_path}")
    print(f"  Metadata updated -> {metadata_path}")
    print("  Training run finished (check [SKIP]/[FAIL] lines above).")
    return results


if __name__ == "__main__":
    if len(sys.argv) > 1:
        model_name = sys.argv[1]
        if model_name in TRAINERS:
            TRAINERS[model_name]()
        else:
            print(f"Unknown model: {model_name}")
            print(f"Available: {', '.join(TRAINERS.keys())}")
            sys.exit(1)
    else:
        train_all()
