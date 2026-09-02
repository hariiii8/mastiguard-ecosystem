export type RiskLevel = "high" | "medium" | "healthy";

export type ScreenType =
  | "dashboard"
  | "herd"
  | "cow_detail"
  | "ai_intelligence"
  | "live_monitoring"
  | "alerts"
  | "sms_warning";

export type LanguageCode = "en" | "ta" | "hi";

export interface RiskDriver {
  feature: string;
  human_name: string;
  value: number;
  shap_impact: number;
  is_danger: boolean;
}

export interface SensorTelemetry {
  iufl: number;
  eufl: number;
  iufr: number;
  eufr: number;
  iurl: number;
  eurl: number;
  iurr: number;
  eurr: number;
  deltaFl: number;
  deltaFr: number;
  deltaRl: number;
  deltaRr: number;
  contraAsym: number;
  apAsym: number;
  temperature: number;
  thermalSpike: number;
  hardness: number;
  pain: number;
  milkVisibility: number;
  painIndex: number;
}

export interface Cow {
  id: string; // e.g. "COW_01"
  name: string;
  tagNumber: string;
  breed: string;
  barnSector: string;
  lactationMonths: number;
  daysInMilk: number;
  dailyYield: number;
  baseYield: number;
  healthScore: number;
  mastitisProbability: number;
  riskLevel: RiskLevel;
  isQuarantined: boolean;
  temperature: number;
  conductivity: number;
  telemetry: SensorTelemetry;
  topRiskDrivers: RiskDriver[];
  clinicalRecommendation: string;
  lastUpdated: string;
}

export interface YieldDataPoint {
  timeLabel: string;
  morning: number;
  evening: number;
}

export interface HerdAlert {
  id: string;
  cowId: string;
  severity: "critical" | "warning" | "info";
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

export interface SmsAlert {
  message_id: string;
  cow_id: string;
  recipient_phone: string;
  message: string;
  status: string;
  method?: string;
  raw_at_command?: string;
  timestamp: string;
}

export interface SmsSettings {
  recipientPhone: string;
  autoDispatchThreshold: number;
  emergencyVetHotline: string;
  language: LanguageCode;
}
