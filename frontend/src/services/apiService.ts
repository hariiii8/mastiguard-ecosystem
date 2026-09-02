import { Cow, RiskLevel, SensorTelemetry, SmsAlert } from "../types";
import { MOCK_HERD_METADATA } from "../data/mockHerd";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://mastiguard-ecosystem.onrender.com";

interface BackendCowRecord {
  cow_id: string;
  timestamp: string;
  last_updated: string;
  risk_level: "Healthy" | "Watchlist" | "Mastitis Risk";
  mastitis_probability: number;
  clinical_recommendation: string;
  is_quarantined: boolean;
  raw_telemetry: {
    Months_after_giving_birth: number;
    Previous_Mastits_status: number;
    IUFL: number;
    EUFL: number;
    IUFR: number;
    EUFR: number;
    IURL: number;
    EURL: number;
    IURR: number;
    EURR: number;
    Temperature: number;
    Hardness: number;
    Pain: number;
    Milk_visibility: number;
  };
  derived_features: {
    Delta_FL: number;
    Delta_FR: number;
    Delta_RL: number;
    Delta_RR: number;
    Contra_Asym: number;
    AP_Asym: number;
    Thermal_Spike: number;
    Pain_Index: number;
  };
  top_risk_drivers: Array<{
    feature: string;
    human_name: string;
    value: number;
    shap_impact: number;
    is_danger: boolean;
  }>;
}

export function transformBackendCow(record: BackendCowRecord): Cow {
  const cowId = record.cow_id;
  const cowNumMatch = cowId.match(/\d+/);
  const cowNum = cowNumMatch ? parseInt(cowNumMatch[0], 10) : 1;

  const meta = MOCK_HERD_METADATA[cowId] || {
    id: cowId,
    name: `Cow #${cowNum}`,
    tagNumber: `IN-TN-${7200 + cowNum}`,
    breed: "Jersey Cross",
    barnSector: "Barn Alpha"
  };

  const raw = record.raw_telemetry;
  const derived = record.derived_features;

  const months = raw.Months_after_giving_birth || 2;
  const dim = Math.round(months * 30);

  const isRisk = record.risk_level === "Mastitis Risk";
  const isWatchlist = record.risk_level === "Watchlist";

  let riskLevel: RiskLevel = "healthy";
  if (isRisk) riskLevel = "high";
  else if (isWatchlist) riskLevel = "medium";

  // Dynamic Daily Yield
  const baseYield = Math.max(
    14.0,
    28.0 - dim * 0.038 + ((cowNum % 7) * 0.75)
  );
  const lossPercent = isRisk ? 0.38 + ((record.mastitis_probability / 100) * 0.15) : 0.0;
  const dailyYield = isRisk
    ? Math.max(5.0, baseYield * (1 - lossPercent))
    : isWatchlist
    ? baseYield * 0.92
    : baseYield;

  // Unclamped Health Score (0-100)
  const healthScore = isRisk
    ? Math.max(
        15,
        Math.min(
          60,
          100 - record.mastitis_probability + ((cowNum % 5) * 2)
        )
      )
    : isWatchlist
    ? Math.max(62, Math.min(78, 100 - record.mastitis_probability))
    : Math.min(99, Math.max(88, 100 - record.mastitis_probability));

  // Udder Electrical Conductivity (mS/cm)
  const conductivity = isRisk
    ? Math.min(8.5, 5.8 + ((raw.EUFL - 240) * 0.025))
    : 4.3 + ((cowNum % 4) * 0.12);

  const telemetry: SensorTelemetry = {
    iufl: raw.IUFL,
    eufl: raw.EUFL,
    iufr: raw.IUFR,
    eufr: raw.EUFR,
    iurl: raw.IURL,
    eurl: raw.EURL,
    iurr: raw.IURR,
    eurr: raw.EURR,
    deltaFl: derived.Delta_FL,
    deltaFr: derived.Delta_FR,
    deltaRl: derived.Delta_RL,
    deltaRr: derived.Delta_RR,
    contraAsym: derived.Contra_Asym,
    apAsym: derived.AP_Asym,
    temperature: raw.Temperature,
    thermalSpike: derived.Thermal_Spike,
    hardness: raw.Hardness,
    pain: raw.Pain,
    milkVisibility: raw.Milk_visibility,
    painIndex: derived.Pain_Index
  };

  return {
    id: cowId,
    name: meta.name,
    tagNumber: meta.tagNumber,
    breed: meta.breed,
    barnSector: meta.barnSector,
    lactationMonths: months,
    daysInMilk: dim,
    dailyYield: Math.round(dailyYield * 10) / 10,
    baseYield: Math.round(baseYield * 10) / 10,
    healthScore: Math.round(healthScore),
    mastitisProbability: record.mastitis_probability,
    riskLevel,
    isQuarantined: record.is_quarantined,
    temperature: raw.Temperature,
    conductivity: Math.round(conductivity * 100) / 100,
    telemetry,
    topRiskDrivers: record.top_risk_drivers || [],
    clinicalRecommendation: record.clinical_recommendation,
    lastUpdated: record.last_updated
  };
}

export async function fetchLiveHerd(): Promise<Cow[]> {
  const resp = await fetch(`${API_BASE}/api/v1/cows`);
  if (!resp.ok) {
    throw new Error(`Failed to fetch live herd: ${resp.statusText}`);
  }
  const data: BackendCowRecord[] = await resp.json();
  return data.map(transformBackendCow);
}

export async function analyzeCowWithAi(cowId: string): Promise<Cow> {
  const resp = await fetch(`${API_BASE}/api/v1/cows/${cowId}`);
  if (!resp.ok) {
    throw new Error(`Failed to analyze cow ${cowId}: ${resp.statusText}`);
  }
  const data: BackendCowRecord = await resp.json();
  return transformBackendCow(data);
}

export async function sendLiveSmsAlert(
  cowId: string,
  recipientPhone: string,
  message: string
): Promise<SmsAlert> {
  const resp = await fetch(`${API_BASE}/api/v1/sms/dispatch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      cow_id: cowId,
      recipient_phone: recipientPhone,
      message
    })
  });
  if (!resp.ok) {
    throw new Error(`Failed to dispatch SMS: ${resp.statusText}`);
  }
  return await resp.json();
}

export async function fetchSmsHistory(): Promise<SmsAlert[]> {
  const resp = await fetch(`${API_BASE}/api/v1/sms/history`);
  if (!resp.ok) {
    throw new Error(`Failed to fetch SMS history: ${resp.statusText}`);
  }
  return await resp.json();
}

export async function toggleCowQuarantine(
  cowId: string,
  isQuarantined: boolean
): Promise<{ cow_id: string; is_quarantined: boolean }> {
  const resp = await fetch(`${API_BASE}/api/v1/cows/${cowId}/quarantine`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ is_quarantined: isQuarantined })
  });
  if (!resp.ok) {
    throw new Error(`Failed to toggle quarantine: ${resp.statusText}`);
  }
  return await resp.json();
}
