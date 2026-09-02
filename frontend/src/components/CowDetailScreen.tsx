import React, { useState } from "react";
import {
  ArrowLeft,
  Thermometer,
  Zap,
  Activity,
  Droplet,
  Lock,
  Unlock,
  MessageSquare,
  ClipboardList,
  AlertOctagon,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { Cow, LanguageCode } from "../types";
import { TRANSLATIONS } from "../data/translations";

interface CowDetailScreenProps {
  cow: Cow;
  currentLang: LanguageCode;
  onBack: () => void;
  onToggleQuarantine: (cowId: string, isQuarantined: boolean) => void;
  onOpenSmsForCow: (cow: Cow) => void;
  onOpenExamForCow: (cow: Cow) => void;
  onAnalyzeWithAi: (cowId: string) => void;
}

export const CowDetailScreen: React.FC<CowDetailScreenProps> = ({
  cow,
  currentLang,
  onBack,
  onToggleQuarantine,
  onOpenSmsForCow,
  onOpenExamForCow,
  onAnalyzeWithAi
}) => {
  const t = TRANSLATIONS[currentLang];
  const [activeQuarterTab, setActiveQuarterTab] = useState<"FL" | "FR" | "RL" | "RR">("FL");

  const isHighRisk = cow.riskLevel === "high";

  // Quarter displacement deltas
  const quarters = [
    {
      id: "FL" as const,
      label: "Front-Left (FL)",
      inhale: cow.telemetry.iufl,
      exhale: cow.telemetry.eufl,
      delta: cow.telemetry.deltaFl,
      isSwollen: cow.telemetry.eufl > 270
    },
    {
      id: "FR" as const,
      label: "Front-Right (FR)",
      inhale: cow.telemetry.iufr,
      exhale: cow.telemetry.eufr,
      delta: cow.telemetry.deltaFr,
      isSwollen: cow.telemetry.eufr > 270
    },
    {
      id: "RL" as const,
      label: "Rear-Left (RL)",
      inhale: cow.telemetry.iurl,
      exhale: cow.telemetry.eurl,
      delta: cow.telemetry.deltaRl,
      isSwollen: cow.telemetry.eurl > 270
    },
    {
      id: "RR" as const,
      label: "Rear-Right (RR)",
      inhale: cow.telemetry.iurr,
      exhale: cow.telemetry.eurr,
      delta: cow.telemetry.deltaRr,
      isSwollen: cow.telemetry.eurr > 270
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Bar: Back & Cow Identity */}
      <div className="bg-white border border-[#E2E8F0] rounded-lg p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="p-2 border border-slate-200 hover:border-slate-400 rounded-md transition-colors text-slate-600 hover:text-slate-900"
              title="Back to Herd"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center space-x-2.5">
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono">
                  {cow.id}
                </h2>
                <span className="text-lg font-bold text-slate-700">
                  {cow.name}
                </span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-xs uppercase tracking-wider font-mono ${
                    isHighRisk
                      ? "bg-red-600 text-white animate-pulse"
                      : cow.riskLevel === "medium"
                      ? "bg-amber-100 text-amber-900 border border-amber-300"
                      : "bg-emerald-100 text-emerald-900 border border-emerald-200"
                  }`}
                >
                  {isHighRisk ? t.riskHigh : cow.riskLevel === "medium" ? t.riskMedium : t.riskHealthy}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Tag: {cow.tagNumber} • {cow.breed} • {cow.barnSector} • DIM: {cow.daysInMilk} Days
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onToggleQuarantine(cow.id, !cow.isQuarantined)}
              className={`flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold rounded-md transition-colors shadow-xs ${
                cow.isQuarantined
                  ? "bg-slate-800 text-white"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300"
              }`}
            >
              {cow.isQuarantined ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
              <span>{cow.isQuarantined ? t.quarantined : "Isolate Cow"}</span>
            </button>

            <button
              onClick={() => onOpenExamForCow(cow)}
              className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold bg-white text-slate-800 border border-slate-300 rounded-md hover:bg-slate-50 shadow-xs transition-colors"
            >
              <ClipboardList className="w-4 h-4 text-slate-600" />
              <span>Log CMT Exam</span>
            </button>

            <button
              onClick={() => onOpenSmsForCow(cow)}
              className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-md shadow-xs transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>SMS Vet Alert</span>
            </button>

            <button
              onClick={() => onAnalyzeWithAi(cow.id)}
              className="flex items-center space-x-1.5 px-4 py-2 text-xs font-bold bg-[#00361A] hover:bg-emerald-950 text-white rounded-md shadow-xs transition-colors"
            >
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>{t.analyzeWithAi}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Clinical Recommendation Banner */}
      <div
        className={`p-4 rounded-lg border text-sm flex items-start space-x-3 shadow-xs ${
          isHighRisk
            ? "bg-red-50 border-red-300 text-red-900"
            : cow.riskLevel === "medium"
            ? "bg-amber-50 border-amber-300 text-amber-900"
            : "bg-emerald-50 border-emerald-300 text-emerald-950"
        }`}
      >
        <div className="mt-0.5 shrink-0">
          {isHighRisk ? (
            <AlertOctagon className="w-5 h-5 text-red-600" />
          ) : cow.riskLevel === "medium" ? (
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          ) : (
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
          )}
        </div>
        <div>
          <span className="font-bold uppercase tracking-wider text-xs block">
            {t.clinicalRx}
          </span>
          <p className="mt-0.5 font-medium">{cow.clinicalRecommendation}</p>
        </div>
      </div>

      {/* Grid: 4-Quarter Biometrics & Physical Sensors */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: 4-Quarter Udder Physical Sensor Array */}
        <div className="lg:col-span-2 bg-white border border-[#E2E8F0] rounded-lg p-5 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Quad-Quarter Flex Displacement Array
              </h3>
              <p className="text-xs text-slate-500">
                Continuous millimeter flex displacements captured during natural breathing and rumination cycles
              </p>
            </div>
            <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-sm border border-slate-200">
              Asymmetry: {cow.telemetry.contraAsym.toFixed(1)} mm
            </span>
          </div>

          {/* 4-Teat Anatomical Quarter Cards */}
          <div className="grid grid-cols-2 gap-4">
            {quarters.map((q) => (
              <div
                key={q.id}
                onClick={() => setActiveQuarterTab(q.id)}
                className={`p-4 rounded-lg border transition-all cursor-pointer ${
                  q.isSwollen
                    ? "bg-red-50/70 border-red-400 ring-2 ring-red-400"
                    : "bg-slate-50 border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs text-slate-900 font-mono">
                    {q.label}
                  </span>
                  {q.isSwollen && (
                    <span className="text-[10px] font-extrabold bg-red-600 text-white px-1.5 py-0.2 rounded-xs uppercase font-mono animate-pulse">
                      Swelling
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-1 text-center font-mono mt-3">
                  <div className="bg-white p-2 rounded-md border border-slate-100">
                    <div className="text-[10px] text-slate-400 font-sans">Inhale</div>
                    <div className="text-xs font-bold text-slate-700 mt-0.5">
                      {q.inhale} mm
                    </div>
                  </div>
                  <div className="bg-white p-2 rounded-md border border-slate-100">
                    <div className="text-[10px] text-slate-400 font-sans">Exhale</div>
                    <div
                      className={`text-xs font-bold mt-0.5 ${
                        q.isSwollen ? "text-red-600" : "text-slate-700"
                      }`}
                    >
                      {q.exhale} mm
                    </div>
                  </div>
                  <div className="bg-white p-2 rounded-md border border-slate-100">
                    <div className="text-[10px] text-slate-400 font-sans">Delta</div>
                    <div
                      className={`text-xs font-extrabold mt-0.5 ${
                        q.delta > 40 ? "text-red-600" : "text-emerald-700"
                      }`}
                    >
                      +{q.delta.toFixed(1)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Anatomical Diagram Preview */}
          <div className="bg-slate-50 border border-slate-200 rounded-md p-4 text-xs font-mono text-slate-600 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              <span>Baseline Expansion: 20-35 mm</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
              <span>Clinical Swelling: &gt;55 mm</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span>AP Drift: {cow.telemetry.apAsym.toFixed(1)} mm</span>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Key Clinical Biometrics & SHAP Drivers */}
        <div className="bg-white border border-[#E2E8F0] rounded-lg p-5 shadow-xs space-y-5">
          <div>
            <h3 className="font-bold text-base text-slate-900">
              Telemetry Vitals
            </h3>
            <p className="text-xs text-slate-500">
              Thermographic and biochemical milk parameters
            </p>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {/* Body Temperature */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-md border border-slate-200">
              <div className="flex items-center space-x-2">
                <Thermometer className="w-4 h-4 text-amber-600" />
                <span className="font-sans font-semibold text-slate-700">
                  {t.temp}
                </span>
              </div>
              <div className="text-right">
                <span
                  className={`font-bold text-sm ${
                    cow.temperature >= 39.4 ? "text-red-600" : "text-slate-900"
                  }`}
                >
                  {cow.temperature}°C
                </span>
                <span className="text-[10px] text-slate-400 block">
                  Delta: +{cow.telemetry.thermalSpike.toFixed(2)}°C
                </span>
              </div>
            </div>

            {/* Electrical Conductivity */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-md border border-slate-200">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-blue-600" />
                <span className="font-sans font-semibold text-slate-700">
                  Conductivity
                </span>
              </div>
              <div className="text-right">
                <span
                  className={`font-bold text-sm ${
                    cow.conductivity >= 6.0 ? "text-red-600" : "text-slate-900"
                  }`}
                >
                  {cow.conductivity} mS/cm
                </span>
                <span className="text-[10px] text-slate-400 block">
                  Normal: 4.0 - 5.5
                </span>
              </div>
            </div>

            {/* Daily Milk Yield */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-md border border-slate-200">
              <div className="flex items-center space-x-2">
                <Droplet className="w-4 h-4 text-emerald-700" />
                <span className="font-sans font-semibold text-slate-700">
                  Current Yield
                </span>
              </div>
              <div className="text-right">
                <span className="font-bold text-sm text-slate-900">
                  {cow.dailyYield} L
                </span>
                <span className="text-[10px] text-slate-400 block">
                  Base: {cow.baseYield} L
                </span>
              </div>
            </div>
          </div>

          {/* Primary TreeSHAP Attribution Drivers */}
          <div className="pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Top Risk Drivers (SHAP)
              </span>
              <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded-xs">
                XGBoost Explainer
              </span>
            </div>

            <div className="space-y-2">
              {cow.topRiskDrivers.map((driver) => (
                <div
                  key={driver.feature}
                  className="bg-slate-50 border border-slate-200 p-2.5 rounded-md text-xs"
                >
                  <div className="flex items-center justify-between font-medium">
                    <span className="text-slate-800 text-[11px] font-semibold">
                      {driver.human_name}
                    </span>
                    <span
                      className={`font-mono font-bold text-[11px] ${
                        driver.shap_impact > 0 ? "text-red-600" : "text-emerald-700"
                      }`}
                    >
                      {driver.shap_impact > 0 ? `+${driver.shap_impact}` : driver.shap_impact}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    Measured Value: {driver.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
