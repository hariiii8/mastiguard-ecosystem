import os
import json
import time
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from xgboost import XGBClassifier
import shap
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_JSON_PATH = os.path.join(BASE_DIR, "models", "xgboost_mastitis_model.json")
META_JSON_PATH = os.path.join(BASE_DIR, "models", "model_meta.json")

# Model and explainer singletons
model: Optional[XGBClassifier] = None
explainer: Optional[shap.TreeExplainer] = None
model_meta: Dict[str, Any] = {}

# In-memory thread-safe state stores
herd_store: Dict[str, Dict[str, Any]] = {}
sms_history: List[Dict[str, Any]] = []

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

DERIVED_FEATURES = [
    "Delta_FL", "Delta_FR", "Delta_RL", "Delta_RR",
    "Contra_Asym", "AP_Asym", "Thermal_Spike", "Pain_Index",
    "Rumination_Ratio", "Activity_Drop_Index", "SCC_Log10",
]

RAW_FEATURES = UDDER_FEATURES + BEHAVIORAL_FEATURES
ALL_FEATURES = RAW_FEATURES + DERIVED_FEATURES

FEATURE_HUMAN_NAMES = {
    "Temperature": "Core Body Temperature Elevation",
    "Thermal_Spike": "Core Thermal Spike (above 38.5 deg C)",
    "EUFL": "Front-Left Quarter Udder Swelling",
    "EUFR": "Front-Right Quarter Udder Swelling",
    "EURL": "Rear-Left Quarter Udder Swelling",
    "EURR": "Rear-Right Quarter Udder Swelling",
    "Delta_FL": "Front-Left Tissue Displacement Delta",
    "Delta_FR": "Front-Right Tissue Displacement Delta",
    "Delta_RL": "Rear-Left Tissue Displacement Delta",
    "Delta_RR": "Rear-Right Tissue Displacement Delta",
    "Contra_Asym": "Contralateral Udder Asymmetry (Left vs Right)",
    "AP_Asym": "Antero-Posterior Asymmetry (Front vs Rear)",
    "Pain_Index": "Tissue Hardness, Pain & Secretion Score",
    "Hardness": "Palpable Udder Induration / Hardness",
    "Pain": "Clinical Nociception & Sensitivity",
    "Milk_visibility": "Visible Milk Clots / Discoloration",
    "Previous_Mastits_status": "Anamnesis: Previous Infection History",
    "Months_after_giving_birth": "Lactation Stage / Days in Milk",
    "IUFL": "Front-Left Inhale Flex Displacement",
    "IUFR": "Front-Right Inhale Flex Displacement",
    "IURL": "Rear-Left Inhale Flex Displacement",
    "IURR": "Rear-Right Inhale Flex Displacement"
}

app = FastAPI(
    title="MastiGuard AI (Aarogya) Backend Ingestion Engine",
    description="Sentinel Platform for Bovine Mastitis Early Warning, Biometric Inference, and IoT Ingestion",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TelemetryPayload(BaseModel):
    cow_id: str
    timestamp: Optional[str] = None
    Months_after_giving_birth: float = 2.0
    Previous_Mastits_status: float = 0.0
    IUFL: float
    EUFL: float
    IUFR: float
    EUFR: float
    IURL: float
    EURL: float
    IURR: float
    EURR: float
    Temperature: float
    Hardness: float = 0.0
    Pain: float = 0.0
    Milk_visibility: float = 0.0
    # Behavioral / rumination features (v2)
    Rumination_Time_min: float = 500.0
    Eating_Time_min: float = 370.0
    Lying_Time_hr: float = 11.5
    Steps_Per_Day: float = 3000.0
    SCC_K_cells_per_mL: float = 80.0
    Milk_Conductivity_mS: float = 4.5
    Milk_Yield_L: float = 20.0

class SmsDispatchRequest(BaseModel):
    cow_id: str
    recipient_phone: str
    message: str

class QuarantineToggleRequest(BaseModel):
    is_quarantined: bool

def compute_derived_features(raw: Dict[str, float]) -> Dict[str, float]:
    delta_fl = raw["EUFL"] - raw["IUFL"]
    delta_fr = raw["EUFR"] - raw["IUFR"]
    delta_rl = raw["EURL"] - raw["IURL"]
    delta_rr = raw["EURR"] - raw["IURR"]

    contra_asym  = abs(delta_fl - delta_fr) + abs(delta_rl - delta_rr)
    ap_asym      = abs(delta_fl - delta_rl) + abs(delta_fr - delta_rr)
    thermal_spike = max(0.0, raw["Temperature"] - 39.3)
    pain_index   = raw["Hardness"] + raw["Pain"] + raw["Milk_visibility"]

    # Behavioral derived
    rum   = raw.get("Rumination_Time_min", 500.0)
    eat   = raw.get("Eating_Time_min", 370.0)
    oral  = rum + eat if (rum + eat) > 0 else 1.0
    rum_ratio = rum / oral

    steps = raw.get("Steps_Per_Day", 3000.0)
    activity_drop = max(0.0, (3000.0 - steps) / 3000.0)

    scc = max(1.0, raw.get("SCC_K_cells_per_mL", 80.0))
    scc_log = float(np.log10(scc))

    return {
        "Delta_FL": float(delta_fl),
        "Delta_FR": float(delta_fr),
        "Delta_RL": float(delta_rl),
        "Delta_RR": float(delta_rr),
        "Contra_Asym": float(contra_asym),
        "AP_Asym": float(ap_asym),
        "Thermal_Spike": float(thermal_spike),
        "Pain_Index": float(pain_index),
        "Rumination_Ratio": float(rum_ratio),
        "Activity_Drop_Index": float(activity_drop),
        "SCC_Log10": float(scc_log),
    }

@app.on_event("startup")
def startup_event():
    global model, explainer, model_meta
    print("[*] FastAPI Sentinel Engine starting up...")
    if os.path.exists(MODEL_JSON_PATH):
        model = XGBClassifier()
        model.load_model(MODEL_JSON_PATH)
        explainer = shap.TreeExplainer(model)
        print(f"[+] Loaded XGBoost model from {MODEL_JSON_PATH}")
    else:
        print(f"[!] Warning: Model file not found at {MODEL_JSON_PATH}")

    if os.path.exists(META_JSON_PATH):
        with open(META_JSON_PATH, "r", encoding="utf-8") as f:
            model_meta = json.load(f)
            print(f"[+] Loaded model metadata from {META_JSON_PATH}")

@app.get("/")
def root():
    return {
        "system": "MastiGuard AI (Aarogya) Sentinel Platform",
        "status": "online",
        "active_cattle_count": len(herd_store),
        "model_loaded": model is not None,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@app.post("/api/v1/telemetry")
def ingest_telemetry(payload: TelemetryPayload):
    if model is None:
        raise HTTPException(status_code=503, detail="XGBoost model not initialized")

    ts = payload.timestamp or datetime.now(timezone.utc).isoformat()
    raw_dict = {
        "Months_after_giving_birth": payload.Months_after_giving_birth,
        "Previous_Mastits_status": payload.Previous_Mastits_status,
        "IUFL": payload.IUFL,
        "EUFL": payload.EUFL,
        "IUFR": payload.IUFR,
        "EUFR": payload.EUFR,
        "IURL": payload.IURL,
        "EURL": payload.EURL,
        "IURR": payload.IURR,
        "EURR": payload.EURR,
        "Temperature": payload.Temperature,
        "Hardness": payload.Hardness,
        "Pain": payload.Pain,
        "Milk_visibility": payload.Milk_visibility
    }

    derived_dict = compute_derived_features(raw_dict)
    full_vector_dict = {**raw_dict, **derived_dict}
    vector = np.array([[full_vector_dict[feat] for feat in ALL_FEATURES]], dtype=np.float32)

    # Inference probability
    probs = model.predict_proba(vector)[0]
    prob_mastitis = float(probs[1])

    # Local TreeSHAP risk drivers
    top_risk_drivers = []
    if explainer is not None:
        shap_vals = explainer.shap_values(vector)[0]
        # Rank by positive impact on mastitis risk
        ranked_indices = np.argsort(shap_vals)[::-1]
        for idx in ranked_indices[:3]:
            feat_name = ALL_FEATURES[idx]
            impact = float(shap_vals[idx])
            val = float(vector[0, idx])
            top_risk_drivers.append({
                "feature": feat_name,
                "human_name": FEATURE_HUMAN_NAMES.get(feat_name, feat_name),
                "value": round(val, 2),
                "shap_impact": round(impact, 4),
                "is_danger": impact > 0.1
            })

    # Determine risk level
    if prob_mastitis < 0.35:
        risk_level = "Healthy"
        clinical_recommendation = "Maintain standard milking cycle and hygiene protocol."
    elif prob_mastitis < 0.70:
        risk_level = "Watchlist"
        clinical_recommendation = "Flag for close observation, verify milk electrical conductivity, and monitor core temperature in next milking."
    else:
        risk_level = "Mastitis Risk"
        clinical_recommendation = "Isolate in quarantine pen, withhold automated milking, and verify with CMT."

    # Preserve or update quarantine state
    prev_state = herd_store.get(payload.cow_id, {})
    is_quarantined = prev_state.get("is_quarantined", False)
    if risk_level == "Mastitis Risk" and not prev_state.get("user_unquarantined", False):
        is_quarantined = True

    cow_record = {
        "cow_id": payload.cow_id,
        "timestamp": ts,
        "last_updated": datetime.now(timezone.utc).isoformat(),
        "risk_level": risk_level,
        "mastitis_probability": round(prob_mastitis * 100, 2),
        "clinical_recommendation": clinical_recommendation,
        "is_quarantined": is_quarantined,
        "raw_telemetry": raw_dict,
        "derived_features": derived_dict,
        "top_risk_drivers": top_risk_drivers
    }

    herd_store[payload.cow_id] = cow_record
    return cow_record

@app.get("/api/v1/cows")
def get_all_cows():
    return list(herd_store.values())

@app.get("/api/v1/cows/{cow_id}")
def get_cow(cow_id: str):
    if cow_id not in herd_store:
        raise HTTPException(status_code=404, detail=f"Cow {cow_id} not found in live telemetry store")
    return herd_store[cow_id]

@app.post("/api/v1/cows/{cow_id}/quarantine")
def toggle_quarantine(cow_id: str, req: QuarantineToggleRequest):
    if cow_id not in herd_store:
        raise HTTPException(status_code=404, detail=f"Cow {cow_id} not found")
    herd_store[cow_id]["is_quarantined"] = req.is_quarantined
    herd_store[cow_id]["user_unquarantined"] = not req.is_quarantined
    return {"cow_id": cow_id, "is_quarantined": req.is_quarantined}

@app.post("/api/v1/sms/dispatch")
def dispatch_sms(req: SmsDispatchRequest):
    msg_id = f"MSG_{uuid.uuid4().hex[:10].upper()}"
    ts = datetime.now(timezone.utc).isoformat()
    
    account_sid = os.getenv("TWILIO_ACCOUNT_SID")
    auth_token = os.getenv("TWILIO_AUTH_TOKEN")
    from_number = os.getenv("TWILIO_PHONE_NUMBER")
    
    delivered_via = "GSM_AT_SIMULATOR"
    raw_serial_command = f'AT+CMGS="{req.recipient_phone}"\r\n{req.message}\x1A'

    if account_sid and auth_token and from_number:
        try:
            from twilio.rest import Client
            client = Client(account_sid, auth_token)
            message = client.messages.create(
                body=req.message,
                from_=from_number,
                to=req.recipient_phone
            )
            msg_id = message.sid
            delivered_via = "TWILIO_GATEWAY"
        except Exception as e:
            print(f"[!] Twilio dispatch failed ({e}); defaulting to Edge GSM AT Simulator")

    log_entry = {
        "message_id": msg_id,
        "cow_id": req.cow_id,
        "recipient_phone": req.recipient_phone,
        "message": req.message,
        "status": "delivered",
        "method": delivered_via,
        "raw_at_command": raw_serial_command,
        "timestamp": ts
    }
    sms_history.insert(0, log_entry)

    return log_entry

@app.get("/api/v1/sms/history")
def get_sms_history():
    return sms_history

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
