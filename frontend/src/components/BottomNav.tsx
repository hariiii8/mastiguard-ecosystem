import React from "react";
import {
  LayoutDashboard,
  HeartPulse,
  BrainCircuit,
  Activity,
  MessageSquareShare
} from "lucide-react";
import { ScreenType, LanguageCode } from "../types";
import { TRANSLATIONS } from "../data/translations";

interface BottomNavProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  currentLang: LanguageCode;
  criticalAlertCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentScreen,
  onNavigate,
  currentLang,
  criticalAlertCount
}) => {
  const t = TRANSLATIONS[currentLang];

  const navItems = [
    {
      id: "dashboard" as ScreenType,
      label: "Dashboard",
      icon: LayoutDashboard
    },
    {
      id: "herd" as ScreenType,
      label: "Herd",
      icon: HeartPulse
    },
    {
      id: "ai_intelligence" as ScreenType,
      label: "AI Studio",
      icon: BrainCircuit,
      highlight: true
    },
    {
      id: "live_monitoring" as ScreenType,
      label: "Sensors",
      icon: Activity
    },
    {
      id: "sms_warning" as ScreenType,
      label: "SMS Alert",
      icon: MessageSquareShare,
      badgeCount: criticalAlertCount
    }
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 shadow-lg py-1.5 px-3">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`relative flex flex-col items-center justify-center w-16 py-1 rounded-xl transition-all ${
                isActive
                  ? "text-[#00361A] font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-all ${
                  isActive
                    ? "bg-emerald-100 text-[#00361A] scale-110 shadow-xs"
                    : "hover:bg-slate-100"
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight font-medium">
                {item.label}
              </span>

              {/* Badge Counter */}
              {Boolean(item.badgeCount && item.badgeCount > 0) && (
                <span className="absolute top-0.5 right-2 w-4 h-4 bg-red-600 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center animate-pulse">
                  {item.badgeCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
