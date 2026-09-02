import React from "react";
import {
  LayoutDashboard,
  HeartPulse,
  BrainCircuit,
  Activity,
  AlertTriangle,
  MessageSquareShare
} from "lucide-react";
import { ScreenType } from "../types";

interface TopTabBarProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  criticalAlertCount: number;
}

export const TopTabBar: React.FC<TopTabBarProps> = ({
  currentScreen,
  onNavigate,
  criticalAlertCount
}) => {
  const tabs = [
    { id: "dashboard" as ScreenType, label: "Dashboard", icon: LayoutDashboard },
    { id: "herd" as ScreenType, label: "Herd", icon: HeartPulse },
    { id: "alerts" as ScreenType, label: "Triage", icon: AlertTriangle, count: criticalAlertCount },
    { id: "ai_intelligence" as ScreenType, label: "AI Studio", icon: BrainCircuit },
    { id: "live_monitoring" as ScreenType, label: "Sensors", icon: Activity },
    { id: "sms_warning" as ScreenType, label: "SMS Alert", icon: MessageSquareShare }
  ];

  return (
    <div className="bg-white border-b border-slate-200/90 px-3 py-2 shadow-xs">
      <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-0.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentScreen === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                isActive
                  ? "bg-[#00361A] text-white shadow-xs"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {Boolean(tab.count && tab.count > 0) && (
                <span className="w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-extrabold flex items-center justify-center">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
