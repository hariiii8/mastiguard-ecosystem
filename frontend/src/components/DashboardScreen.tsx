import React, { useState } from "react";
import {
  AlertOctagon,
  ShieldCheck,
  Activity,
  AlertTriangle,
  Volume2,
  VolumeX,
  ArrowRight,
  TrendingUp,
  HeartPulse,
  BrainCircuit,
  MessageSquareShare,
  Droplet
} from "lucide-react";
import { Cow, LanguageCode, YieldDataPoint } from "../types";
import { TRANSLATIONS } from "../data/translations";
import { VoiceAssistant } from "../utils/voiceAssistant";

interface DashboardScreenProps {
  cows: Cow[];
  currentLang: LanguageCode;
  onSelectCow: (cow: Cow) => void;
  onIsolateAndDispatch: (cow: Cow) => void;
  onNavigateToHerd: () => void;
  onNavigateToAlerts: () => void;
  onNavigateToAiStudio: (cowId: string) => void;
  onNavigateToSms: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  cows,
  currentLang,
  onSelectCow,
  onIsolateAndDispatch,
  onNavigateToHerd,
  onNavigateToAlerts,
  onNavigateToAiStudio,
  onNavigateToSms
}) => {
  const t = TRANSLATIONS[currentLang];
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const highRiskCows = cows.filter((c) => c.riskLevel === "high");
  const watchlistCows = cows.filter((c) => c.riskLevel === "medium");
  const healthyCows = cows.filter((c) => c.riskLevel === "healthy");

  const avgHealthScore =
    cows.length > 0
      ? Math.round(cows.reduce((acc, c) => acc + c.healthScore, 0) / cows.length)
      : 86;

  const totalYield = Math.round(
    cows.reduce((acc, c) => acc + c.dailyYield, 0)
  );

  const yieldData: YieldDataPoint[] = [
    { timeLabel: "Mon", morning: 640, evening: 590 },
    { timeLabel: "Tue", morning: 652, evening: 595 },
    { timeLabel: "Wed", morning: 635, evening: 580 },
    { timeLabel: "Thu", morning: 615, evening: 565 },
    { timeLabel: "Fri", morning: 595, evening: 545 },
    { timeLabel: "Sat", morning: 588, evening: 540 },
    { timeLabel: "Today", morning: 608, evening: 555 }
  ];

  const handleVoiceAssistant = () => {
    if (isSpeaking) {
      VoiceAssistant.stop();
      setIsSpeaking(false);
      return;
    }

    let text = "";
    if (currentLang === "ta") {
      text = `வணக்கம். ஆரோக்யா மாஸ்டிகார்ட் AI தினசரி அறிக்கை. மந்தையின் ஆரோக்கியம் ${avgHealthScore} சதவீதம். ${highRiskCows.length} மாடுகளுக்கு மடிநோய் தொற்று கண்டறியப்பட்டுள்ளது.`;
    } else if (currentLang === "hi") {
      text = `नमस्ते। आरोग्य मास्टीगार्ड स्वास्थ्य रिपोर्ट। कुल स्वास्थ्य ${avgHealthScore} प्रतिशत है। ${highRiskCows.length} गायों में थनेला संक्रमण पाया गया है।`;
    } else {
      text = `Aarogya MastiGuard Sentinel Briefing. Total herd: ${cows.length} cattle. Overall health index is ${avgHealthScore} percent. ${highRiskCows.length} cattle require immediate isolation.`;
    }

    VoiceAssistant.speak(
      text,
      currentLang,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false)
    );
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* 1. HERO HERD HEALTH CARD */}
      <div className="bg-gradient-to-br from-[#00361A] to-[#014d25] text-white rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider block font-mono">
              Herd Health Index
            </span>
            <div className="flex items-baseline space-x-2">
              <span className="text-4xl font-extrabold font-mono tracking-tight">
                {avgHealthScore}%
              </span>
              <span className="text-xs text-emerald-200 font-medium">
                Overall Vitality
              </span>
            </div>
            <p className="text-xs text-emerald-100/90 pt-1">
              54 Cattle Active • 3 Barn Sectors Monitored
            </p>
          </div>

          {/* Voice Assistant Pill Button */}
          <button
            onClick={handleVoiceAssistant}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-full text-xs font-bold transition-all shadow-xs shrink-0 ${
              isSpeaking
                ? "bg-amber-400 text-slate-900 animate-pulse"
                : "bg-white/20 hover:bg-white/30 text-white border border-white/20"
            }`}
          >
            {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-300" />}
            <span className="hidden sm:inline">{isSpeaking ? "Pause" : "Voice Briefing"}</span>
          </button>
        </div>
      </div>

      {/* 2. DEDICATED CLEAN CRITICAL ALERT BANNER (NO SQUEEZING) */}
      {highRiskCows.length > 0 && (
        <div
          onClick={onNavigateToAlerts}
          className="bg-red-50 hover:bg-red-100/80 border-2 border-red-500 rounded-2xl p-4 shadow-xs transition-all cursor-pointer flex items-center justify-between gap-3 group"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <AlertOctagon className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-sm sm:text-base text-red-950">
                  {highRiskCows.length} Cows Require Immediate Attention
                </span>
                <span className="bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-xs uppercase">
                  Critical
                </span>
              </div>
              <p className="text-xs text-red-800 mt-0.5 font-medium">
                Clinical fever and quarter swelling detected in {highRiskCows.slice(0, 3).map((c) => c.id).join(", ")}
                {highRiskCows.length > 3 ? "..." : ""}
              </p>
            </div>
          </div>

          <button
            className="flex items-center space-x-1 bg-red-600 group-hover:bg-red-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-xs transition-colors shrink-0"
          >
            <span>Review & Isolate</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 3. 2x2 CLEAN METRIC GRID (2 Columns, Never Squished!) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Metric 1 */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Herd
          </span>
          <div className="font-mono text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            {cows.length || 54}
          </div>
          <span className="text-[10px] text-slate-500 font-medium mt-0.5 block">
            All Collars Streaming
          </span>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Healthy Grade-A
          </span>
          <div className="font-mono text-2xl sm:text-3xl font-extrabold text-emerald-700 mt-1">
            {healthyCows.length}
          </div>
          <span className="text-[10px] text-emerald-800 font-semibold mt-0.5 block">
            Approved For Milking
          </span>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Mastitis Risk
          </span>
          <div className="font-mono text-2xl sm:text-3xl font-extrabold text-red-600 mt-1">
            {highRiskCows.length}
          </div>
          <span className="text-[10px] text-red-700 font-bold mt-0.5 block">
            +{watchlistCows.length} Observation
          </span>
        </div>

        {/* Metric 4 */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Today's Milk
          </span>
          <div className="font-mono text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            {totalYield || 1163} <span className="text-sm font-normal text-slate-500">L</span>
          </div>
          <span className="text-[10px] text-slate-500 font-medium mt-0.5 block">
            Daily Production
          </span>
        </div>
      </div>

      {/* 4. CLEAN MILK PRODUCTION CHART */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-bold text-sm text-slate-900">
              Barn Milk Yield (Liters)
            </h3>
            <p className="text-[10px] text-slate-400">
              7-day morning vs evening production trend
            </p>
          </div>
          <div className="flex items-center space-x-2.5 text-[11px] font-semibold">
            <span className="flex items-center space-x-1 text-slate-700">
              <span className="w-2 h-2 rounded-full bg-[#00361A]"></span>
              <span>Morning</span>
            </span>
            <span className="flex items-center space-x-1 text-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Evening</span>
            </span>
          </div>
        </div>

        <div className="relative w-full h-44">
          <svg className="w-full h-full" viewBox="0 0 500 160" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00361A" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#00361A" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            <line x1="0" y1="35" x2="500" y2="35" stroke="#F1F5F9" strokeWidth="1" />
            <line x1="0" y1="75" x2="500" y2="75" stroke="#F1F5F9" strokeWidth="1" />
            <line x1="0" y1="115" x2="500" y2="115" stroke="#F1F5F9" strokeWidth="1" />
            <line x1="0" y1="145" x2="500" y2="145" stroke="#E2E8F0" strokeWidth="1" />

            <path
              d="M 15 45 C 90 30, 170 55, 250 75 C 330 95, 410 100, 485 75 L 485 145 L 15 145 Z"
              fill="url(#chartGrad)"
            />

            <path
              d="M 15 45 C 90 30, 170 55, 250 75 C 330 95, 410 100, 485 75"
              fill="none"
              stroke="#00361A"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            <path
              d="M 15 75 C 90 60, 170 85, 250 100 C 330 115, 410 120, 485 105"
              fill="none"
              stroke="#10B981"
              strokeWidth="2"
              strokeDasharray="4 4"
              strokeLinecap="round"
            />

            {yieldData.map((pt, i) => {
              const x = 15 + i * 78;
              return (
                <g key={pt.timeLabel}>
                  <circle
                    cx={x}
                    cy={45 + (i % 3) * 12}
                    r="3.5"
                    fill="#00361A"
                  />
                  <text
                    x={x}
                    y="156"
                    textAnchor="middle"
                    className="text-[9px] font-mono fill-slate-400"
                  >
                    {pt.timeLabel}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* 5. DEDICATED QUICK-ACCESS TILES (CLEAN & TOUCH-FRIENDLY) */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <button
          onClick={onNavigateToHerd}
          className="bg-white hover:bg-slate-50 border border-slate-200/90 rounded-2xl p-4 text-left shadow-xs transition-all flex items-center justify-between group"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-xs text-slate-900 block font-sans">
                Herd Directory
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                View 54 Cows
              </span>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600" />
        </button>

        <button
          onClick={onNavigateToAlerts}
          className="bg-white hover:bg-slate-50 border border-slate-200/90 rounded-2xl p-4 text-left shadow-xs transition-all flex items-center justify-between group"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-xs text-slate-900 block font-sans">
                Triage & Isolate
              </span>
              <span className="text-[10px] text-red-600 font-mono font-bold">
                {highRiskCows.length} Critical
              </span>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600" />
        </button>

        <button
          onClick={() => onNavigateToAiStudio("COW_03")}
          className="bg-white hover:bg-slate-50 border border-slate-200/90 rounded-2xl p-4 text-left shadow-xs transition-all flex items-center justify-between group"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-xs text-slate-900 block font-sans">
                AI Diagnostics
              </span>
              <span className="text-[10px] text-purple-700 font-mono">
                TreeSHAP XAI
              </span>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600" />
        </button>

        <button
          onClick={onNavigateToSms}
          className="bg-white hover:bg-slate-50 border border-slate-200/90 rounded-2xl p-4 text-left shadow-xs transition-all flex items-center justify-between group"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <MessageSquareShare className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-xs text-slate-900 block font-sans">
                SMS Gateway
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Quectel 4G GSM
              </span>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600" />
        </button>
      </div>
    </div>
  );
};
