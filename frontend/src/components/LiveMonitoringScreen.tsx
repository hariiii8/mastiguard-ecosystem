import React from "react";
import {
  Activity,
  Cpu,
  Radio,
  Wifi,
  Server,
  RefreshCw,
  Thermometer,
  Zap,
  Droplet
} from "lucide-react";
import { Cow, LanguageCode } from "../types";
import { TRANSLATIONS } from "../data/translations";

interface LiveMonitoringScreenProps {
  cows: Cow[];
  currentLang: LanguageCode;
  onSelectCow: (cow: Cow) => void;
}

export const LiveMonitoringScreen: React.FC<LiveMonitoringScreenProps> = ({
  cows,
  currentLang,
  onSelectCow
}) => {
  const t = TRANSLATIONS[currentLang];

  return (
    <div className="space-y-6">
      {/* Hardware Mesh Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E2E8F0] rounded-lg p-4 shadow-xs flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase font-mono tracking-wider">
              Edge Node Array
            </span>
            <div className="text-sm font-bold text-slate-900 flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>54 ESP32 Collars Online</span>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">40ms Telemetry Cadence</span>
          </div>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-lg p-4 shadow-xs flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-800 flex items-center justify-center">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase font-mono tracking-wider">
              Cellular Gateway
            </span>
            <div className="text-sm font-bold text-slate-900 flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span>Quectel 4G GSM Active</span>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">AT+CMGS Engine Ready</span>
          </div>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-lg p-4 shadow-xs flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-800 flex items-center justify-center">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase font-mono tracking-wider">
              Ingestion State Store
            </span>
            <div className="text-sm font-bold text-slate-900 flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              <span>FastAPI Memory Store</span>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">Thread-Safe Async Commit</span>
          </div>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-lg p-4 shadow-xs flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase font-mono tracking-wider">
              ML Inference Latency
            </span>
            <div className="text-sm font-bold text-slate-900 flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>2.8ms / Cow Vector</span>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">TreeSHAP Fast Attribution</span>
          </div>
        </div>
      </div>

      {/* Live Sparkline Waves & Stream Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core Temperature Live Wave */}
        <div className="bg-white border border-[#E2E8F0] rounded-lg p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Thermometer className="w-4 h-4 text-amber-600" />
              <span className="font-bold text-xs uppercase tracking-wider text-slate-700">
                Herd Temperature Wave
              </span>
            </div>
            <span className="font-mono text-xs text-slate-400">Normal ~38.5°C</span>
          </div>
          {/* SVG Sparkline */}
          <div className="h-32 w-full pt-2">
            <svg className="w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
              <path
                d="M 0 50 Q 50 45, 100 52 T 200 48 T 260 25 T 300 50"
                fill="none"
                stroke="#D97706"
                strokeWidth="2.5"
              />
              <circle cx="260" cy="25" r="4" fill="#DC2626" />
            </svg>
          </div>
          <div className="mt-2 text-[11px] font-mono text-slate-500 flex justify-between">
            <span>Min: 38.0°C</span>
            <span className="text-red-600 font-bold">Fever Spike: 40.5°C (COW_03)</span>
          </div>
        </div>

        {/* Flex Displacement Wave */}
        <div className="bg-white border border-[#E2E8F0] rounded-lg p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-emerald-700" />
              <span className="font-bold text-xs uppercase tracking-wider text-slate-700">
                Front-Left Flex Expansion
              </span>
            </div>
            <span className="font-mono text-xs text-slate-400">EUFL Displacement</span>
          </div>
          {/* SVG Sparkline */}
          <div className="h-32 w-full pt-2">
            <svg className="w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
              <path
                d="M 0 65 Q 60 62, 120 68 T 220 60 T 265 15 T 300 65"
                fill="none"
                stroke="#00361A"
                strokeWidth="2.5"
              />
              <circle cx="265" cy="15" r="4" fill="#DC2626" />
            </svg>
          </div>
          <div className="mt-2 text-[11px] font-mono text-slate-500 flex justify-between">
            <span>Base: 220 mm</span>
            <span className="text-red-600 font-bold">Swelling: 310 mm (COW_12)</span>
          </div>
        </div>

        {/* Electrical Conductivity Wave */}
        <div className="bg-white border border-[#E2E8F0] rounded-lg p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-blue-600" />
              <span className="font-bold text-xs uppercase tracking-wider text-slate-700">
                Conductivity Stream
              </span>
            </div>
            <span className="font-mono text-xs text-slate-400">mS/cm Scale</span>
          </div>
          {/* SVG Sparkline */}
          <div className="h-32 w-full pt-2">
            <svg className="w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
              <path
                d="M 0 70 Q 70 72, 140 68 T 240 70 T 270 20 T 300 68"
                fill="none"
                stroke="#2563EB"
                strokeWidth="2.5"
              />
              <circle cx="270" cy="20" r="4" fill="#DC2626" />
            </svg>
          </div>
          <div className="mt-2 text-[11px] font-mono text-slate-500 flex justify-between">
            <span>Norm: 4.4 mS/cm</span>
            <span className="text-red-600 font-bold">Peak: 7.2 mS/cm (COW_27)</span>
          </div>
        </div>
      </div>

      {/* Real-Time Telemetry Packets Log */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 text-xs font-mono text-slate-300 shadow-md">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
          <div className="flex items-center space-x-2 text-emerald-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>LIVE ESP32 JSON PACKET STREAM</span>
          </div>
          <span className="text-slate-500 text-[11px]">
            POST http://127.0.0.1:8000/api/v1/telemetry
          </span>
        </div>

        <div className="space-y-1.5 max-h-60 overflow-y-auto pr-2">
          {cows.slice(0, 8).map((cow) => (
            <div
              key={cow.id}
              onClick={() => onSelectCow(cow)}
              className="p-1.5 rounded-sm hover:bg-slate-800 cursor-pointer flex flex-wrap items-center justify-between transition-colors"
            >
              <div className="flex items-center space-x-3">
                <span className="text-emerald-400 font-bold">{cow.id}</span>
                <span className="text-slate-400">
                  TEMP={cow.temperature}°C EUFL={cow.telemetry.eufl} EUFR={cow.telemetry.eufr}
                </span>
                <span className="text-slate-500">
                  ASYM={cow.telemetry.contraAsym.toFixed(1)}mm
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded-xs uppercase ${
                    cow.riskLevel === "high"
                      ? "bg-red-900 text-red-200"
                      : cow.riskLevel === "medium"
                      ? "bg-amber-900 text-amber-200"
                      : "bg-emerald-900 text-emerald-200"
                  }`}
                >
                  {cow.riskLevel} ({cow.mastitisProbability}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
