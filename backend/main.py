import os
import json
import time
import uuid
import requests
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Optional
from contextlib import asynccontextmanager
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

# ----------------- SMS GATEWAY CREDENTIALS (VONAGE) -----------------
VONAGE_API_KEY = os.getenv("VONAGE_API_KEY", "ab1a588f")
VONAGE_API_SECRET = os.getenv("VONAGE_API_SECRET", "wSKHxospQla5kqyS")
DEFAULT_FARMER_PHONE = os.getenv("FARMER_PHONE_NUMBER", "9080665253")

# Cooldown Tracker: Maps cow_id -> last sent datetime (Prevents SMS flood every 8s)
sms_cooldown_tracker: Dict[str, datetime] = {}
COOLDOWN_MINUTES = 15

# Model and explainer singletons
model: Optional[XGBClassifier] = None
explainer: Optional[shap.TreeExplainer] = None
model_meta: Dict[str, Any] = {}

# In-memory state stores
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
    "IURR": "Rear-Right Inhale Flex Displacement",
    "Milk_Conductivity_mS": "Elevated Milk Electrical Conductivity",
    "Rumination_Time_min": "Depressed Rumination Time",
    "Steps_Per_Day": "Lethargy / Daily Activity Drop",
    "Milk_Yield_L": "Sudden Milk Yield Depression"
}

@asynccontextmanager
async def lifespan(app: FastAPI):
    global model, explainer, model_meta
    print("[*] FastAPI Sentinel Engine starting up...")
    if os.path.exists(MODEL_JSON_PATH):
        model = XGBClassifier()
        model.load_model(MODEL_JSON_PATH)
        try:
            explainer = shap.TreeExplainer(model)
        except Exception as e:
            print(f"[!] Warning initializing TreeExplainer: {e}")
        print(f"[+] Loaded XGBoost model from {MODEL_JSON_PATH}")
    else:
        print(f"[!] Warning: Model file not found at {MODEL_JSON_PATH}")

    if os.path.exists(META_JSON_PATH):
        with open(META_JSON_PATH, "r", encoding="utf-8") as f:
            model_meta = json.load(f)
            print(f"[+] Loaded model metadata from {META_JSON_PATH}")
    yield

app = FastAPI(
    title="MastiGuard AI (Aarogya) Backend Ingestion Engine",
    description="Sentinel Platform for Bovine Mastitis Early Warning, Biometric Inference, and IoT Ingestion",
    version="1.0.0",
    lifespan=lifespan
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
    Rumination_Time_min: float = 500.0
    Eating_Time_min: float = 370.0
    Lying_Time_hr: float = 11.5
    Steps_Per_Day: float = 3000.0
    SCC_K_cells_per_mL: float = 80.0
    Milk_Conductivity_mS: float = 4.5
    Milk_Yield_L: float = 20.0

class CowRegisterPayload(BaseModel):
    cow_id: str
    cow_name: Optional[str] = "Unnamed Cow"
    associated_phone: str = Field(..., description="10-digit Indian phone number for critical alerts")
    breed: Optional[str] = "Holstein Friesian"
    age_years: Optional[float] = 3.5

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

    contra_asym = abs(delta_fl - delta_fr) + abs(delta_rl - delta_rr)
    ap_asym = abs(delta_fl - delta_rl) + abs(delta_fr - delta_rr)
    thermal_spike = max(0.0, raw["Temperature"] - 39.3)
    pain_index = raw["Hardness"] + raw["Pain"] + raw["Milk_visibility"]

    rum = raw.get("Rumination_Time_min", 500.0)
    eat = raw.get("Eating_Time_min", 370.0)
    oral = rum + eat if (rum + eat) > 0 else 1.0
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

def clean_indian_phone(phone: str) -> str:
    p = phone.replace("+91", "").replace("-", "").replace(" ", "").strip()
    if len(p) > 10:
        p = p[-10:]
    return p

def trigger_outbound_sms(cow_id: str, phone: str, custom_message: str, force_send: bool = False) -> Dict[str, Any]:
    msg_id = f"MSG_{uuid.uuid4().hex[:10].upper()}"
    ts = datetime.now(timezone.utc).isoformat()
    now_utc = datetime.now(timezone.utc)

    cleaned_number = clean_indian_phone(phone)
    formatted_to = f"91{cleaned_number}"

    # 15-minute alert cooldown per cow to prevent notification storms
    if not force_send and cow_id in sms_cooldown_tracker:
        last_sent = sms_cooldown_tracker[cow_id]
        if now_utc - last_sent < timedelta(minutes=COOLDOWN_MINUTES):
            remaining_mins = int(COOLDOWN_MINUTES - (now_utc - last_sent).total_seconds() / 60)
            print(f"[*] SMS Cooldown active for {cow_id}. Next alert allowed in {remaining_mins} min.")
            return {
                "message_id": msg_id,
                "cow_id": cow_id,
                "status": "debounced",
                "reason": f"Cooldown active ({remaining_mins}m left)",
                "timestamp": ts
            }

    delivered_via = "VONAGE_REST_SMS"
    status = "failed"

    try:
        url = "https://rest.nexmo.com/sms/json"
        payload = {
            "from": "VonageAPIs",
            "text": custom_message,
            "to": formatted_to,
            "api_key": VONAGE_API_KEY,
            "api_secret": VONAGE_API_SECRET
        }
        res = requests.post(url, data=payload, timeout=8)
        res_json = res.json()
        messages = res_json.get("messages", [])

        if messages and messages[0].get("status") == "0":
            status = "delivered"
            sms_cooldown_tracker[cow_id] = now_utc
            msg_id = messages[0].get("message-id", msg_id)
            print(f"[+] Vonage SMS successfully delivered to {formatted_to} for {cow_id}")
        else:
            err_msg = messages[0].get("error-text") if messages else res_json
            print(f"[!] Vonage Gateway Delivery Failed: {err_msg}")
    except Exception as e:
        print(f"[!] Vonage Connection Exception: {e}")

    log_entry = {
        "message_id": msg_id,
        "cow_id": cow_id,
        "recipient_phone": cleaned_number,
        "message": custom_message,
        "status": status,
        "method": delivered_via,
        "timestamp": ts
    }
    sms_history.insert(0, log_entry)
    return log_entry

def seed_initial_herd():
    print("[*] Pre-populating 54 cows into memory store...")
    for i in range(1, 55):
        cow_id = f"COW_{i:03d}"
        is_sample_risk = (i in [7, 14, 29])
        is_sample_watch = (i in [3, 19, 42])

        risk_level = "Mastitis Risk" if is_sample_risk else ("Watchlist" if is_sample_watch else "Healthy")
        prob = 84.5 if is_sample_risk else (56.0 if is_sample_watch else 12.0)
        temp = 39.6 if is_sample_risk else (39.1 if is_sample_watch else 38.5)
        hardness = 2.5 if is_sample_risk else (1.0 if is_sample_watch else 0.0)
        pain = 2.0 if is_sample_risk else 0.0
        visibility = 1.0 if is_sample_risk else 0.0

        raw_dict = {
            "Months_after_giving_birth": float(2.0 + (i % 6)),
            "Previous_Mastits_status": float(1.0 if (i % 5 == 0) else 0.0),
            "IUFL": float(215.0 + (i % 10)),
            "EUFL": float(245.0 if is_sample_risk else (230.0 + (i % 8))),
            "IUFR": 218.0,
            "EUFR": float(242.0 if is_sample_risk else 231.0),
            "IURL": 220.0,
            "EURL": 236.0,
            "IURR": 222.0,
            "EURR": 235.0,
            "Temperature": float(temp),
            "Hardness": float(hardness),
            "Pain": float(pain),
            "Milk_visibility": float(visibility),
            "Rumination_Time_min": float(320.0 if is_sample_risk else (480.0 + (i % 50))),
            "Eating_Time_min": float(240.0 if is_sample_risk else 370.0),
            "Lying_Time_hr": float(13.5 if is_sample_risk else 11.5),
            "Steps_Per_Day": float(1400.0 if is_sample_risk else 3200.0),
            "SCC_K_cells_per_mL": float(450.0 if is_sample_risk else 80.0),
            "Milk_Conductivity_mS": float(6.8 if is_sample_risk else 4.5),
            "Milk_Yield_L": float(12.0 if is_sample_risk else 22.0)
        }

        derived_dict = compute_derived_features(raw_dict)

        top_drivers = []
        if is_sample_risk:
            top_drivers = [
                {"feature": "EUFL", "human_name": "Front-Left Quarter Udder Swelling", "value": 245.0, "shap_impact": 0.28, "is_danger": True},
                {"feature": "Temperature", "human_name": "Core Body Temperature Elevation", "value": 39.6, "shap_impact": 0.22, "is_danger": True},
                {"feature": "Pain_Index", "human_name": "Tissue Hardness, Pain & Secretion Score", "value": 5.5, "shap_impact": 0.18, "is_danger": True}
            ]

        herd_store[cow_id] = {
            "cow_id": cow_id,
            "cow_name": f"Kamadhenu {i:03d}",
            "associated_phone": "9080665253",  # Seeded default phone for all initial 54 cows
            "breed": "Holstein Friesian Cross",
            "age_years": 3.5,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "last_updated": datetime.now(timezone.utc).isoformat(),
            "risk_level": risk_level,
            "mastitis_probability": prob,
            "clinical_recommendation": "Isolate in quarantine pen, withhold automated milking, and verify with CMT." if is_sample_risk else ("Flag for close observation and verify electrical conductivity." if is_sample_watch else "Maintain standard milking cycle and hygiene protocol."),
            "is_quarantined": is_sample_risk,
            "raw_telemetry": raw_dict,
            "derived_features": derived_dict,
            "top_risk_drivers": top_drivers
        }
    print(f"[+] Initial seed completed: {len(herd_store)} cows ready in store.")

seed_initial_herd()

@app.get("/")
def root():
    return {
        "system": "MastiGuard AI (Aarogya) Sentinel Platform",
        "status": "online",
        "active_cattle_count": len(herd_store),
        "model_loaded": model is not None,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@app.post("/api/v1/cows/register")
def register_new_cow(payload: CowRegisterPayload):
    cleaned_phone = clean_indian_phone(payload.associated_phone)
    if len(cleaned_phone) != 10 or not cleaned_phone.isdigit():
        raise HTTPException(status_code=400, detail="Please provide a valid 10-digit Indian phone number.")

    cow_id = payload.cow_id.strip().upper()
    now_iso = datetime.now(timezone.utc).isoformat()

    herd_store[cow_id] = {
        "cow_id": cow_id,
        "cow_name": payload.cow_name,
        "associated_phone": cleaned_phone,
        "breed": payload.breed,
        "age_years": payload.age_years,
        "timestamp": now_iso,
        "last_updated": now_iso,
        "risk_level": "Healthy",
        "mastitis_probability": 0.0,
        "clinical_recommendation": "Newly registered. Awaiting initial telemetry ingestion.",
        "is_quarantined": False,
        "raw_telemetry": {},
        "derived_features": {},
        "top_risk_drivers": []
    }
    return {
        "status": "success",
        "message": f"Cow {cow_id} registered with phone {cleaned_phone}",
        "cow": herd_store[cow_id]
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
        "Milk_visibility": payload.Milk_visibility,
        "Rumination_Time_min": payload.Rumination_Time_min,
        "Eating_Time_min": payload.Eating_Time_min,
        "Lying_Time_hr": payload.Lying_Time_hr,
        "Steps_Per_Day": payload.Steps_Per_Day,
        "SCC_K_cells_per_mL": payload.SCC_K_cells_per_mL,
        "Milk_Conductivity_mS": payload.Milk_Conductivity_mS,
        "Milk_Yield_L": payload.Milk_Yield_L,
    }

    derived_dict = compute_derived_features(raw_dict)
    full_vector_dict = {**raw_dict, **derived_dict}
    vector = np.array([[full_vector_dict[feat] for feat in ALL_FEATURES]], dtype=np.float32)

    probs = model.predict_proba(vector)[0]
    prob_mastitis = float(probs[1])

    top_risk_drivers = []
    primary_driver_text = "Elevated Biometric Risk"
    if explainer is not None:
        try:
            shap_vals = explainer.shap_values(vector)[0]
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
            if len(top_risk_drivers) > 0:
                primary_driver_text = f"{top_risk_drivers[0]['human_name']} ({top_risk_drivers[0]['value']})"
        except Exception as e:
            print(f"[!] SHAP calculation bypassed: {e}")

    if prob_mastitis < 0.35:
        risk_level = "Healthy"
        clinical_recommendation = "Maintain standard milking cycle and hygiene protocol."
    elif prob_mastitis < 0.70:
        risk_level = "Watchlist"
        clinical_recommendation = "Flag for close observation, verify milk electrical conductivity, and monitor core temperature in next milking."
    else:
        risk_level = "Mastitis Risk"
        clinical_recommendation = "Isolate in quarantine pen, withhold automated milking, and verify with CMT."

    prev_state = herd_store.get(payload.cow_id, {})
    is_quarantined = prev_state.get("is_quarantined", False)
    if risk_level == "Mastitis Risk" and not prev_state.get("user_unquarantined", False):
        is_quarantined = True

    # Retrieve cow-specific contact number, falling back to default if unassigned
    target_phone = prev_state.get("associated_phone") or DEFAULT_FARMER_PHONE

    # ----------------- AUTOMATED CELLULAR ALERT DISPATCH -----------------
    if risk_level == "Mastitis Risk":
        alert_msg = (
            f"AAROGYA ALERT: {payload.cow_id} detected with acute mastitis risk "
            f"({round(prob_mastitis * 100, 1)}%). "
            f"Primary Driver: {primary_driver_text}. "
            f"Action: Withhold milk line and isolate to quarantine pen."
        )
        trigger_outbound_sms(
            cow_id=payload.cow_id,
            phone=target_phone,
            custom_message=alert_msg,
            force_send=False
        )

    cow_record = {
        "cow_id": payload.cow_id,
        "cow_name": prev_state.get("cow_name", f"Cow {payload.cow_id}"),
        "associated_phone": target_phone,
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
    return trigger_outbound_sms(
        cow_id=req.cow_id,
        phone=req.recipient_phone,
        custom_message=req.message,
        force_send=True  # Bypass cooldown for manual dashboard dispatches
    )

@app.get("/api/v1/sms/history")
def get_sms_history():
    return sms_history

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
