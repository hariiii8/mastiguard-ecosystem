import React, { useState } from "react";
import {
  AlertOctagon,
  AlertTriangle,
  Info,
  CheckCircle,
  Trash2,
  Lock,
  Unlock,
  MessageSquare,
  Thermometer,
  Activity,
  ArrowRight
} from "lucide-react";
import { Cow, HerdAlert, LanguageCode } from "../types";
import { TRANSLATIONS } from "../data/translations";

interface AlertsScreenProps {
  alerts: HerdAlert[];
  cows: Cow[];
  currentLang: LanguageCode;
  onSelectCow: (cow: Cow) => void;
  onIsolateAndDispatch: (cow: Cow) => void;
  onToggleQuarantine: (cowId: string, isQuarantined: boolean) => void;
  onDismissAlert: (id: string) => void;
  onClearAll: () => void;
}

export const AlertsScreen: React.FC<AlertsScreenProps> = ({
  alerts,
  cows,
  currentLang,
  onSelectCow,
  onIsolateAndDispatch,
  onToggleQuarantine,
  onDismissAlert,
  onClearAll
}) => {
  const t = TRANSLATIONS[currentLang];
  const [activeTab, setActiveTab] = useState<"critical_cows" | "event_logs">("critical_cows");

  const highRiskCows = cows.filter((c) => c.riskLevel === "high");
  const watchlistCows = cows.filter((c) => c.riskLevel === "medium");

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-red-100 text-red-700">
              <AlertOctagon className="w-5 h-5" />
            </span>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
              Clinical Triage & Isolation
            </h2>
            <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
              {highRiskCows.length} Critical
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Dedicated veterinary triage station for isolating infected quarters and dispatching alerts
          </p>
        </div>

        {/* View Switcher: Critical Cows vs Raw Logs */}
        <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("critical_cows")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === "critical_cows"
                ? "bg-red-600 text-white shadow-2xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Infected Cattle ({highRiskCows.length})
          </button>
          <button
            onClick={() => setActiveTab("event_logs")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === "event_logs"
                ? "bg-slate-800 text-white shadow-2xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Incident Logs ({alerts.length})
          </button>
        </div>
      </div>

      {/* View 1: Dedicated Critical Cows Roster */}
      {activeTab === "critical_cows" && (
        <div className="space-y-3">
          {highRiskCows.map((cow) => (
            <div
              key={cow.id}
              className="bg-white border-2 border-red-500 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3"
            >
              {/* Row 1: ID, Name, Probability Badge */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2.5">
                  <span className="font-mono font-extrabold text-lg text-red-950">
                    {cow.id}
                  </span>
                  <span className="font-bold text-base text-slate-900">
                    {cow.name}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    • {cow.breed} • {cow.barnSector}
                  </span>
                </div>

                <span className="bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full font-mono uppercase tracking-wider animate-pulse">
                  {cow.mastitisProbability}% Mastitis Risk
                </span>
              </div>

              {/* Row 2: Vitals Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-red-50/50 p-3 rounded-xl border border-red-200 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 font-sans block">Body Temp</span>
                  <span className="font-bold text-red-700 text-sm">{cow.temperature}°C (Fever)</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-sans block">Swelling (FL)</span>
                  <span className="font-bold text-red-700 text-sm">{cow.telemetry.eufl} mm</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-sans block">Asymmetry</span>
                  <span className="font-bold text-slate-800 text-sm">+{cow.telemetry.contraAsym.toFixed(1)} mm</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-sans block">Milk Yield</span>
                  <span className="font-bold text-slate-800 text-sm">{cow.dailyYield} L (Withheld)</span>
                </div>
              </div>

              {/* Row 3: Protocol & Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 pt-2 border-t border-slate-100">
                <p className="text-xs text-slate-600 font-medium">
                  {cow.clinicalRecommendation}
                </p>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => onToggleQuarantine(cow.id, !cow.isQuarantined)}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                      cow.isQuarantined
                        ? "bg-slate-800 text-white"
                        : "bg-red-100 hover:bg-red-200 text-red-900 border border-red-300"
                    }`}
                  >
                    {cow.isQuarantined ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                    <span>{cow.isQuarantined ? "Quarantined" : "Isolate In Pen"}</span>
                  </button>

                  <button
                    onClick={() => onIsolateAndDispatch(cow)}
                    className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-xs transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Dispatch SMS</span>
                  </button>

                  <button
                    onClick={() => onSelectCow(cow)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
                  >
                    Dossier ➔
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View 2: Raw Incident Event Logs */}
      {activeTab === "event_logs" && (
        <div className="space-y-2.5">
          {alerts.length === 0 ? (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-10 text-center text-slate-400 text-xs">
              No incident logs recorded in the current session.
            </div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-xs flex items-center justify-between text-xs"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">
                      {alert.title} • <span className="font-mono text-[#00361A]">{alert.cowId}</span>
                    </div>
                    <p className="text-slate-500 text-[11px] mt-0.5">{alert.message}</p>
                  </div>
                </div>

                <button
                  onClick={() => onDismissAlert(alert.id)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
                  title="Dismiss"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
