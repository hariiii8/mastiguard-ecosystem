import React from "react";
import {
  LayoutDashboard,
  HeartPulse,
  BrainCircuit,
  Activity,
  AlertTriangle,
  MessageSquareShare,
  X,
  Thermometer,
  Droplets,
  Wind,
  HelpCircle,
  UserCircle,
  Wifi,
  WifiOff,
} from "lucide-react";
import { ScreenType, LanguageCode } from "../types";
import { TRANSLATIONS } from "../data/translations";

interface SidebarProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  currentLang: LanguageCode;
  criticalAlertCount: number;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onOpenHelp: () => void;
  onOpenProfile: () => void;
  onLanguageChange: (lang: LanguageCode) => void;
  isConnected: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentScreen,
  onNavigate,
  currentLang,
  criticalAlertCount,
  isOpenMobile,
  onCloseMobile,
  onOpenHelp,
  onOpenProfile,
  onLanguageChange,
  isConnected,
}) => {
  const t = TRANSLATIONS[currentLang];

  const navItems = [
    { id: "dashboard"       as ScreenType, label: "Command Center",   icon: LayoutDashboard },
    { id: "herd"            as ScreenType, label: "Herd Roster",      icon: HeartPulse },
    { id: "alerts"          as ScreenType, label: "Clinical Triage",  icon: AlertTriangle, badge: criticalAlertCount },
    { id: "ai_intelligence" as ScreenType, label: "AI Diagnostics",   icon: BrainCircuit, tag: "SHAP" },
    { id: "live_monitoring" as ScreenType, label: "Edge Telemetry",   icon: Activity },
    { id: "sms_warning"     as ScreenType, label: "SMS Alert Engine", icon: MessageSquareShare },
  ];

  const content = (
    <div className="h-full w-56 flex flex-col bg-white border-r border-slate-200 select-none">

      {/* ── Brand header (only place with logo) ── */}
      <div className="px-4 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-full overflow-hidden border border-emerald-700/20 shrink-0 shadow-xs">
            <img src="/aarogya-logo.png" alt="Aarogya" className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="flex items-center space-x-1">
              <span className="font-extrabold text-[15px] text-[#00361A] tracking-tight leading-none">Aarogya</span>
              <span className="text-[9px] font-bold bg-emerald-100 text-emerald-900 px-1.5 rounded-xs">AI</span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium block mt-0.5">Cattle Health Sentinel</span>
          </div>
        </div>
        {/* Mobile close */}
        <button onClick={onCloseMobile} className="md:hidden p-1 text-slate-400 hover:text-slate-700">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* ── Navigation items ── */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = currentScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => { onNavigate(item.id); onCloseMobile(); }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                active
                  ? "bg-[#00361A] text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <span className="flex items-center space-x-2.5">
                <Icon className={`w-4 h-4 ${active ? "text-emerald-300" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </span>
              <span className="flex items-center space-x-1">
                {item.tag && (
                  <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-xs ${
                    active ? "bg-emerald-900 text-emerald-300" : "bg-slate-100 text-slate-500"
                  }`}>{item.tag}</span>
                )}
                {Boolean(item.badge && item.badge > 0) && (
                  <span className="w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-extrabold flex items-center justify-center animate-pulse">
                    {item.badge}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </nav>

      {/* ── Barn climate telemetry ── */}
      <div className="px-3 pb-2">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5 text-[11px] font-mono text-slate-600">
          <div className="font-sans font-bold text-[10px] uppercase tracking-wider text-slate-500 mb-2">
            Barn Parlor Climate
          </div>
          <div className="flex justify-between items-center">
            <span className="flex items-center space-x-1.5">
              <Thermometer className="w-3 h-3 text-amber-500" />
              <span>Temp</span>
            </span>
            <span className="font-bold text-slate-900">24.6°C</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="flex items-center space-x-1.5">
              <Droplets className="w-3 h-3 text-blue-500" />
              <span>Humidity</span>
            </span>
            <span className="font-bold text-slate-900">62%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="flex items-center space-x-1.5">
              <Wind className="w-3 h-3 text-emerald-600" />
              <span>Air Flow</span>
            </span>
            <span className="font-bold text-slate-900">42.8 L/m</span>
          </div>
        </div>
      </div>

      {/* ── Footer: profile, help, connection status ── */}
      <div className="px-3 py-3 border-t border-slate-100 flex items-center justify-between">
        <button
          onClick={onOpenProfile}
          className="flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <UserCircle className="w-4 h-4 text-[#00361A]" />
          <span>Farm Profile</span>
        </button>
        <div className="flex items-center space-x-2">
          {isConnected
            ? <Wifi className="w-3.5 h-3.5 text-emerald-500" />
            : <WifiOff className="w-3.5 h-3.5 text-red-500" />}
          <button onClick={onOpenHelp} className="p-1 text-slate-400 hover:text-slate-700">
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop: always visible */}
      <aside className="hidden md:block h-screen sticky top-0 shrink-0">
        {content}
      </aside>

      {/* Mobile: slide-out drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={onCloseMobile} />
          <div className="relative z-10 h-full shadow-2xl">{content}</div>
        </div>
      )}
    </>
  );
};
