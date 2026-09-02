"""
MastiGuard AI - XGBoost Model Trainer v2
Trains on 25 raw features (18 original + 7 behavioral/rumination)
and derives 11 engineered features for a total of 32 model inputs.
"""

import json
import os
import numpy as np
import pandas as pd
from sklearn.model_selection import StratifiedKFold
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
from xgboost import XGBClassifier
import shap

BASE_DIR       = os.path.dirname(os.path.abspath(__file__))
DATA_PATH      = os.path.join(BASE_DIR, "data", "clinical_mastitis_cows_version1.csv")
MODELS_DIR     = os.path.join(BASE_DIR, "models")
os.makedirs(MODELS_DIR, exist_ok=True)
MODEL_JSON_PATH = os.path.join(MODELS_DIR, "xgboost_mastitis_model.json")
META_JSON_PATH  = os.path.join(MODELS_DIR, "model_meta.json")

# ── Raw features ─────────────────────────────────────────────────────────────
UDDER_FEATURES = [
    "Months_after_giving_birth",
    "Previous_Mastits_status",
    "IUFL", "EUFL",
    "IUFR", "EUFR",
    "IURL", "EURL",
    "IURR", "EURR",
    "Temperature",
    "Hardness",
    "Pain",
    "Milk_visibility",
]

BEHAVIORAL_FEATURES = [
    "Rumination_Time_min",
    "Eating_Time_min",
    "Lying_Time_hr",
    "Steps_Per_Day",
    "SCC_K_cells_per_mL",
    "Milk_Conductivity_mS",
    "Milk_Yield_L",
]

# ── Derived / engineered features ────────────────────────────────────────────
DERIVED_FEATURES = [
    "Delta_FL",
    "Delta_FR",
    "Delta_RL",
    "Delta_RR",
    "Contra_Asym",
    "AP_Asym",
    "Thermal_Spike",
    "Pain_Index",
    "Rumination_Ratio",
    "Activity_Drop_Index",
    "SCC_Log10",
]

ALL_FEATURES = UDDER_FEATURES + BEHAVIORAL_FEATURES + DERIVED_FEATURES


def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    res = df.copy()

    # Quarter displacement deltas
    res["Delta_FL"] = res["EUFL"] - res["IUFL"]
    res["Delta_FR"] = res["EUFR"] - res["IUFR"]
    res["Delta_RL"] = res["EURL"] - res["IURL"]
    res["Delta_RR"] = res["EURR"] - res["IURR"]

    # Contralateral asymmetry (L vs R)
    res["Contra_Asym"] = (
        (res["Delta_FL"] - res["Delta_FR"]).abs()
        + (res["Delta_RL"] - res["Delta_RR"]).abs()
    )

    # Antero-posterior asymmetry (Front vs Rear)
    res["AP_Asym"] = (
        (res["Delta_FL"] - res["Delta_RL"]).abs()
        + (res["Delta_FR"] - res["Delta_RR"]).abs()
    )

    # Thermal spike: deviation above normal bovine range (38.0–39.3 C)
    res["Thermal_Spike"] = (res["Temperature"] - 39.3).clip(lower=0)

    # Composite pain index
    res["Pain_Index"] = res["Pain"] + res["Hardness"] + res["Milk_visibility"]

    # --- New behavioral features ---
    # Rumination ratio: fraction of oral activity that is rumination
    oral_total = res["Rumination_Time_min"] + res["Eating_Time_min"]
    res["Rumination_Ratio"] = res["Rumination_Time_min"] / oral_total.replace(0, 1)

    # Activity drop: normalised steps deficit (healthy baseline ~3000)
    res["Activity_Drop_Index"] = (3000 - res["Steps_Per_Day"]).clip(lower=0) / 3000.0

    # Log-transformed SCC linearises the exponential distribution
    res["SCC_Log10"] = np.log10(res["SCC_K_cells_per_mL"].clip(lower=1))

    return res


def load_and_prepare():
    raw = pd.read_csv(DATA_PATH)

    # Rename columns to match expected names
    col_map = {
        "Months after giving birth": "Months_after_giving_birth",
        "Previous_Mastits_status":   "Previous_Mastits_status",
    }
    raw.rename(columns=col_map, inplace=True)

    df = engineer_features(raw)

    X = df[ALL_FEATURES].values
    y = df["class1"].values
    return X, y, df


def train():
    print("Loading dataset …")
    X, y, df = load_and_prepare()
    n_pos = y.sum()
    n_neg = (y == 0).sum()
    spw   = round(n_neg / n_pos, 4)
    print(f"  Samples: {len(y)}  |  Positive: {n_pos}  |  Negative: {n_neg}  |  SPW: {spw}")

    model = XGBClassifier(
        n_estimators=400,
        max_depth=6,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        scale_pos_weight=spw,
        use_label_encoder=False,
        eval_metric="logloss",
        random_state=42,
        n_jobs=-1,
    )

    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    fold_metrics = []
    print("\n5-Fold Stratified Cross-Validation:")

    for fold, (train_idx, val_idx) in enumerate(skf.split(X, y), 1):
        model.fit(X[train_idx], y[train_idx], verbose=False)
        preds  = model.predict(X[val_idx])
        proba  = model.predict_proba(X[val_idx])[:, 1]
        acc    = accuracy_score(y[val_idx], preds)
        prec   = precision_score(y[val_idx], preds, zero_division=0)
        rec    = recall_score(y[val_idx], preds, zero_division=0)
        f1     = f1_score(y[val_idx], preds, zero_division=0)
        auc    = roc_auc_score(y[val_idx], proba)
        fold_metrics.append(dict(acc=acc, prec=prec, rec=rec, f1=f1, auc=auc))
        print(f"  Fold {fold}: Acc={acc:.4f} Prec={prec:.4f} Rec={rec:.4f} F1={f1:.4f} AUC={auc:.4f}")

    # Final model on all data
    print("\nFitting final model on full dataset …")
    model.fit(X, y, verbose=False)

    print("\nBuilding TreeSHAP explainer …")
    explainer   = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(X[:500])          # sample for speed
    mean_abs    = np.abs(shap_values).mean(axis=0)
    feature_importance = dict(zip(ALL_FEATURES, mean_abs.tolist()))

    # Save model
    model.save_model(MODEL_JSON_PATH)
    print(f"Model saved: {MODEL_JSON_PATH}")

    # Save metadata
    avg = lambda key: float(np.mean([m[key] for m in fold_metrics]))
    meta = {
        "feature_names":      ALL_FEATURES,
        "udder_features":     UDDER_FEATURES,
        "behavioral_features": BEHAVIORAL_FEATURES,
        "derived_features":   DERIVED_FEATURES,
        "n_features":         len(ALL_FEATURES),
        "n_training_samples": len(y),
        "scale_pos_weight":   spw,
        "cv_results": {
            "accuracy":  avg("acc"),
            "precision": avg("prec"),
            "recall":    avg("rec"),
            "f1_score":  avg("f1"),
            "roc_auc":   avg("auc"),
        },
        "feature_importance_shap": feature_importance,
        "threshold_for_high_risk": 0.55,
    }
    with open(META_JSON_PATH, "w") as f:
        json.dump(meta, f, indent=2)
    print(f"Metadata saved: {META_JSON_PATH}")

    print("\nCV Summary:")
    for k, v in meta["cv_results"].items():
        print(f"  {k}: {v:.4f}")

    print("\nTop-10 SHAP Features:")
    top = sorted(feature_importance.items(), key=lambda x: -x[1])[:10]
    for feat, val in top:
        bar = "#" * int(val * 40 / max(v for _, v in top))
        print(f"  {feat:35s} {bar} ({val:.4f})")


if __name__ == "__main__":
    train()
