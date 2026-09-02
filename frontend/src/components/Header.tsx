import React from "react";
import {
  Bell,
  Menu,
  Smartphone,
  Monitor
} from "lucide-react";
import { LanguageCode } from "../types";

interface HeaderProps {
  currentLang: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  unreadAlertsCount: number;
  onOpenAlerts: () => void;
  onOpenProfile: () => void;
  onOpenHelp: () => void;
  isConnected: boolean;
  totalCows: number;
  criticalCount: number;
  isMobileFrame: boolean;
  onToggleMobileFrame: () => void;
  onOpenMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLang,
  onLanguageChange,
  unreadAlertsCount,
  onOpenAlerts,
  criticalCount,
  isMobileFrame,
  onToggleMobileFrame,
  onOpenMenu
}) => {
  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-3 sm:px-5 py-2.5">
      <div className="flex items-center justify-between">
        {/* Left: Mobile-only Hamburger Menu + Brand Identity */}
        <div className="flex items-center space-x-2.5 select-none">
          {onOpenMenu && (
            <button
              onClick={onOpenMenu}
              className="md:hidden p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
              title="Open Navigation Drawer"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div className="w-8 h-8 rounded-full overflow-hidden border border-emerald-700/20 bg-white shadow-2xs shrink-0">
            <img
              src="/aarogya-logo.png"
              alt="Aarogya"
              className="w-full h-full object-cover"
            />
          </div>

          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-base sm:text-lg text-[#00361A] tracking-tight leading-none">
                Aarogya
              </span>
              <span className="text-[9px] font-bold bg-emerald-100 text-emerald-900 px-1.5 py-0.2 rounded-xs">
                AI
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium block">
              Bovine Mastitis Sentinel
            </span>
          </div>
        </div>

        {/* Right Controls: View Switcher, Languages, Alerts */}
        <div className="flex items-center space-x-2">
          {/* View Toggle (Desktop vs Mobile Frame) */}
          <button
            onClick={onToggleMobileFrame}
            className={`hidden sm:flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all ${
              isMobileFrame
                ? "bg-[#00361A] text-white border-[#00361A] shadow-xs"
                : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
            }`}
            title="Toggle between Mobile App Frame and Full Desktop View"
          >
            {isMobileFrame ? (
              <>
                <Smartphone className="w-3.5 h-3.5 text-emerald-300" />
                <span>Mobile App View</span>
              </>
            ) : (
              <>
                <Monitor className="w-3.5 h-3.5 text-slate-500" />
                <span>Desktop View</span>
              </>
            )}
          </button>

          {/* Languages */}
          <div className="flex bg-slate-100 p-0.5 rounded-full border border-slate-200 text-[11px] font-semibold">
            <button
              onClick={() => onLanguageChange("en")}
              className={`px-2 py-0.5 rounded-full transition-all ${
                currentLang === "en"
                  ? "bg-[#00361A] text-white font-bold shadow-2xs"
                  : "text-slate-600"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => onLanguageChange("ta")}
              className={`px-2 py-0.5 rounded-full transition-all ${
                currentLang === "ta"
                  ? "bg-[#00361A] text-white font-bold shadow-2xs"
                  : "text-slate-600"
              }`}
            >
              தமிழ்
            </button>
            <button
              onClick={() => onLanguageChange("hi")}
              className={`px-2 py-0.5 rounded-full transition-all ${
                currentLang === "hi"
                  ? "bg-[#00361A] text-white font-bold shadow-2xs"
                  : "text-slate-600"
              }`}
            >
              हिंदी
            </button>
          </div>

          {/* Alerts Bell Badge */}
          <button
            onClick={onOpenAlerts}
            className="relative p-1.5 text-slate-600 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors"
            title="View Triage Alerts"
          >
            <Bell className="w-4 h-4" />
            {criticalCount > 0 && (
              <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-red-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {criticalCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
