import React, { useState } from "react";
import {
  BrainCircuit,
  Search,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Sparkles,
  BarChart3,
  Thermometer,
  Zap,
  Activity,
  ShieldAlert,
  ArrowRight,
  Stethoscope
} from "lucide-react";
import { Cow, LanguageCode, RiskDriver } from "../types";
import { TRANSLATIONS } from "../data/translations";

interface AiIntelligenceScreenProps {
  cows: Cow[];
  selectedCow: Cow;
  currentLang: LanguageCode;
  onSelectCow: (cow: Cow) => void;
  onAnalyzeCow: (cowId: string) => Promise<void>;
  isAnalyzing: boolean;
}

export const AiIntelligenceScreen: React.FC<AiIntelligenceScreenProps> = ({
  cows,
  selectedCow,
  currentLang,
  onAnalyzeCow,
  isAnalyzing
}) => {
  const t = TRANSLATIONS[currentLang];
  const [searchFilter, setSearchFilter] = useState("");

  const filteredCows = cows.filter(
    (c) =>
      c.id.toLowerCase().includes(searchFilter.toLowerCase()) ||
      c.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      c.breed.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const isHighRisk = selectedCow.riskLevel === "high";

  return (
    <div className="space-y-6">
      {/* Studio Header Banner */}
      <div className="bg-white border border-[#E2E8F0] rounded-lg p-5 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-md bg-[#00361A] text-emerald-400">
              <BrainCircuit className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {t.navAiStudio}
            </h2>
            <span className="text-xs bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded-sm font-mono">
              TreeSHAP XAI
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Explainable bovine health predictions driven by 22-dimensional cross-validated gradient boosted trees
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-md">
          <span>Model: XGBClassifier v1.0</span>
          <span>•</span>
          <span>CV Recall: &ge;95%</span>
          <span>•</span>
          <span>CV Precision: &ge;90%</span>
        </div>
      </div>

      {/* Split-Pane Studio Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Pane (35% ~ 4 cols): Searchable Cattle Selector */}
        <div className="lg:col-span-4 bg-white border border-[#E2E8F0] rounded-lg p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="font-bold text-xs uppercase tracking-wider text-slate-700">
              Select Animal ({cows.length})
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              Active Stream
            </span>
          </div>

          {/* Mini Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filter tag or name..."
              className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-md text-xs bg-slate-50 focus:bg-white focus:outline-hidden focus:border-[#00361A]"
            />
          </div>

          {/* Roster List */}
          <div className="max-h-[580px] overflow-y-auto space-y-2 pr-1">
            {filteredCows.map((c) => {
              const isSelected = c.id === selectedCow.id;
              return (
                <div
                  key={c.id}
                  onClick={() => onAnalyzeCow(c.id)}
                  className={`p-3 rounded-md border text-xs cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? "bg-emerald-50 border-emerald-600 ring-1 ring-emerald-600"
                      : "bg-slate-50/50 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div>
                    <div className="flex items-center space-x-1.5 font-mono">
                      <span className="font-bold text-slate-900">{c.id}</span>
                      <span className="font-sans font-medium text-slate-700">
                        {c.name}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                      {c.breed} • {c.temperature}°C • {c.dailyYield}L
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-xs uppercase ${
                      c.riskLevel === "high"
                        ? "bg-red-600 text-white"
                        : c.riskLevel === "medium"
                        ? "bg-amber-100 text-amber-900 border border-amber-300"
                        : "bg-emerald-100 text-emerald-900 border border-emerald-200"
                    }`}
                  >
                    {c.mastitisProbability}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Pane (65% ~ 8 cols): Active Diagnostic Studio */}
        <div className="lg:col-span-8 space-y-6">
          {/* Active Cow Overview Card */}
          <div className="bg-white border border-[#E2E8F0] rounded-lg p-5 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center space-x-2.5">
                  <span className="font-mono font-extrabold text-2xl text-[#00361A]">
                    {selectedCow.id}
                  </span>
                  <span className="text-xl font-bold text-slate-800">
                    {selectedCow.name}
                  </span>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-xs uppercase font-mono ${
                      isHighRisk
                        ? "bg-red-600 text-white animate-pulse"
                        : selectedCow.riskLevel === "medium"
                        ? "bg-amber-100 text-amber-900"
                        : "bg-emerald-100 text-emerald-900"
                    }`}
                  >
                    {isHighRisk ? t.riskHigh : selectedCow.riskLevel === "medium" ? t.riskMedium : t.riskHealthy}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-mono mt-1">
                  Tag: {selectedCow.tagNumber} • Sector: {selectedCow.barnSector} • Lactation: {selectedCow.lactationMonths} Months
                </p>
              </div>

              {/* ANALYZE WITH AI ACTION BUTTON */}
              <button
                onClick={() => onAnalyzeCow(selectedCow.id)}
                disabled={isAnalyzing}
                className="bg-[#00361A] hover:bg-emerald-950 text-white font-bold text-xs px-5 py-2.5 rounded-md transition-all shadow-xs flex items-center space-x-2 disabled:opacity-50"
              >
                <Sparkles className={`w-4 h-4 text-emerald-400 ${isAnalyzing ? "animate-spin" : ""}`} />
                <span>{isAnalyzing ? t.analyzing : t.analyzeWithAi}</span>
              </button>
            </div>

            {/* Circular Risk Gauge & Diagnostic Probability Score */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1 bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col items-center justify-center text-center">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Mastitis Risk Probability
                </span>
                <div className="relative w-28 h-28 my-1">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-200"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className={
                        selectedCow.mastitisProbability >= 70
                          ? "text-red-600"
                          : selectedCow.mastitisProbability >= 35
                          ? "text-amber-500"
                          : "text-emerald-600"
                      }
                      strokeDasharray={`${selectedCow.mastitisProbability}, 100`}
                      strokeWidth="3.8"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center font-mono">
                    <span className="text-xl font-extrabold text-slate-900">
                      {selectedCow.mastitisProbability}%
                    </span>
                    <span className="text-[9px] text-slate-500 uppercase">
                      P(Infection)
                    </span>
                  </div>
                </div>
                <span
                  className={`text-[11px] font-bold mt-1 ${
                    selectedCow.mastitisProbability >= 70
                      ? "text-red-600"
                      : selectedCow.mastitisProbability >= 35
                      ? "text-amber-600"
                      : "text-emerald-700"
                  }`}
                >
                  {selectedCow.mastitisProbability >= 70
                    ? "Clinical Danger Threshold Met"
                    : selectedCow.mastitisProbability >= 35
                    ? "Subclinical Observation Phase"
                    : "Physiological Normal State"}
                </span>
              </div>

              {/* Middle & Right 2 Cols: Veterinary Protocol Summary */}
              <div className="sm:col-span-2 bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-2 text-slate-800 mb-2">
                    <Stethoscope className="w-4 h-4 text-[#00361A]" />
                    <span className="font-bold text-xs uppercase tracking-wider">
                      {t.clinicalRx}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                    {selectedCow.clinicalRecommendation}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 grid grid-cols-2 gap-2 text-xs font-mono">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-sans">
                      Core Thermal Spike
                    </span>
                    <span
                      className={`font-bold ${
                        selectedCow.telemetry.thermalSpike > 0.8 ? "text-red-600" : "text-slate-800"
                      }`}
                    >
                      +{selectedCow.telemetry.thermalSpike.toFixed(2)}°C vs Baseline
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-sans">
                      Contralateral Asymmetry
                    </span>
                    <span
                      className={`font-bold ${
                        selectedCow.telemetry.contraAsym > 30 ? "text-red-600" : "text-slate-800"
                      }`}
                    >
                      {selectedCow.telemetry.contraAsym.toFixed(1)} mm Left vs Right
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* TreeSHAP Local Feature Attribution Waterfall / Bar Chart */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
                    <BarChart3 className="w-4 h-4 text-emerald-700" />
                    <span>{t.shapExplanation}</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Positive SHAP values push probability toward mastitis; negative values push toward healthy
                  </p>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  Calculated via TreeExplainer
                </span>
              </div>

              {/* Attribution Impact Bars */}
              <div className="space-y-3 pt-1">
                {selectedCow.topRiskDrivers.map((driver) => {
                  const impactPercent = Math.min(100, Math.abs(driver.shap_impact) * 45);
                  return (
                    <div key={driver.feature} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-800 font-semibold font-sans">
                          {driver.human_name}
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className="text-slate-400 text-[11px]">
                            val: {driver.value}
                          </span>
                          <span
                            className={`font-bold ${
                              driver.shap_impact > 0 ? "text-red-600" : "text-emerald-700"
                            }`}
                          >
                            {driver.shap_impact > 0 ? `+${driver.shap_impact}` : driver.shap_impact}
                          </span>
                        </div>
                      </div>

                      {/* Bar Visualization */}
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            driver.shap_impact > 0 ? "bg-red-600" : "bg-emerald-600"
                          }`}
                          style={{ width: `${Math.max(5, impactPercent)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
