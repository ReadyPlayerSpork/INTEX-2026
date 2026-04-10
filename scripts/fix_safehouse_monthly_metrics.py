"""
Fill missing avg_education_progress / avg_health_score in safehouse_monthly_metrics.csv
with carry-forward + small drift so ML "Actual" and admin demos show coherent0–100% progress.

Run from repo root:
  python scripts/fix_safehouse_monthly_metrics.py

Overwrites backend/Haven-for-Her-Backend/docs/lighthouse_csv_v7/safehouse_monthly_metrics.csv
"""
from __future__ import annotations

import math
from pathlib import Path

import numpy as np
import pandas as pd

REPO = Path(__file__).resolve().parents[1]
CSV_PATH = (
    REPO
    / "backend"
    / "Haven-for-Her-Backend"
    / "docs"
    / "lighthouse_csv_v7"
    / "safehouse_monthly_metrics.csv"
)


def _valid_pair(edu: float, hlth: float) -> bool:
    return not (math.isnan(edu) or math.isnan(hlth))


def fill_group(g: pd.DataFrame, rng: np.random.Generator) -> pd.DataFrame:
    g = g.sort_values("month_start").copy()
    edu = g["avg_education_progress"].astype(float).to_numpy().copy()
    health = g["avg_health_score"].astype(float).to_numpy().copy()
    proc = g["process_recording_count"].astype(int).to_numpy().copy()
    hv = g["home_visitation_count"].astype(int).to_numpy().copy()
    inc = g["incident_count"].astype(int).to_numpy().copy()
    active = g["active_residents"].astype(int).to_numpy().copy()
    n = len(edu)

    imputed = np.zeros(n, dtype=bool)

    # Forward: fill NaN using last known + drift
    le = lh = None
    for i in range(n):
        if _valid_pair(edu[i], health[i]):
            le, lh = float(edu[i]), float(health[i])
        elif le is not None:
            de = float(rng.uniform(-3.5, 5.5))
            dh = float(rng.uniform(-0.08, 0.09))
            neu = float(np.clip(le + de, 0.0, 100.0))
            nh = float(np.clip(lh + dh, 1.0, 5.0))
            edu[i], health[i] = neu, nh
            le, lh = neu, nh
            imputed[i] = True

    # Backward: leading NaNs
    le = lh = None
    for i in range(n - 1, -1, -1):
        if _valid_pair(edu[i], health[i]):
            le, lh = float(edu[i]), float(health[i])
        elif le is not None:
            de = float(rng.uniform(-5.5, 3.5))
            dh = float(rng.uniform(-0.1, 0.06))
            neu = float(np.clip(le + de, 0.0, 100.0))
            nh = float(np.clip(lh + dh, 1.0, 5.0))
            edu[i], health[i] = neu, nh
            le, lh = neu, nh
            imputed[i] = True

    for i in range(n):
        if math.isnan(edu[i]):
            edu[i] = 55.0
            imputed[i] = True
        if math.isnan(health[i]):
            health[i] = 3.0
            imputed[i] = True

    # Light narrative on counts for imputed months with residents
    for i in range(n):
        if imputed[i] and active[i] > 0:
            proc[i] = max(proc[i], int(rng.integers(1, 5)))
            hv[i] = max(hv[i], int(rng.integers(0, 4)))

    g["avg_education_progress"] = np.round(edu, 2)
    g["avg_health_score"] = np.round(health, 2)
    g["process_recording_count"] = proc
    g["home_visitation_count"] = hv
    g["incident_count"] = inc
    return g


def main() -> None:
    if not CSV_PATH.exists():
        raise SystemExit(f"Missing {CSV_PATH}")

    df = pd.read_csv(CSV_PATH)
    df["month_start"] = pd.to_datetime(df["month_start"])
    rng = np.random.default_rng(20260410)

    parts = [fill_group(g, rng) for _, g in df.groupby("safehouse_id", sort=False)]
    out = pd.concat(parts, ignore_index=True)
    out = out.sort_values(["safehouse_id", "month_start"])
    out["month_start"] = out["month_start"].dt.strftime("%Y-%m-%d")
    # month_end in source is YYYY-MM-DD
    out["month_end"] = pd.to_datetime(out["month_end"]).dt.strftime("%Y-%m-%d")

    out.to_csv(CSV_PATH, index=False)
    nan_edu = out["avg_education_progress"].isna().sum()
    print(f"Wrote {CSV_PATH} ({len(out)} rows). Remaining NaN edu: {nan_edu}")


if __name__ == "__main__":
    main()
