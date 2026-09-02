import React, { useState, useEffect, useRef } from "react";
import { Sidebar } from "./components/Sidebar";
import { TopTabBar } from "./components/TopTabBar";
import { DashboardScreen } from "./components/DashboardScreen";
import { HerdScreen } from "./components/HerdScreen";
import { CowDetailScreen } from "./components/CowDetailScreen";
import { AiIntelligenceScreen } from "./components/AiIntelligenceScreen";
import { LiveMonitoringScreen } from "./components/LiveMonitoringScreen";
import { AlertsScreen } from "./components/AlertsScreen";
import { SmsWarningScreen } from "./components/SmsWarningScreen";
import { AddCowModal } from "./components/AddCowModal";
import { ClinicalExamModal } from "./components/ClinicalExamModal";
import { ProfileModal } from "./components/ProfileModal";
import { FarmerHelpModal } from "./components/FarmerHelpModal";
import { AndroidInstallModal } from "./components/AndroidInstallModal";
import { SmsEarlyWarningToast } from "./components/SmsEarlyWarningToast";
import { SmsHistoryModal } from "./components/SmsHistoryModal";
import {
  fetchLiveHerd,
  analyzeCowWithAi,
  sendLiveSmsAlert,
  fetchSmsHistory,
  toggleCowQuarantine,
} from "./services/apiService";
import {
  Cow,
  ScreenType,
  LanguageCode,
  HerdAlert,
  SmsAlert,
  SmsSettings,
} from "./types";

const defaultCow: Cow = {
  id: "COW_01", name: "Kamadhenu", tagNumber: "IN-TN-7201", breed: "Gir",
  barnSector: "Barn Alpha", lactationMonths: 2, daysInMilk: 60,
  dailyYield: 24.5, baseYield: 25.0, healthScore: 92,
  mastitisProbability: 8.5, riskLevel: "healthy", isQuarantined: false,
  temperature: 38.5, conductivity: 4.4,
  telemetry: {
    iufl:198, eufl:228, iufr:196, eufr:226, iurl:195, eurl:225, iurr:195, eurr:226,
    deltaFl:30, deltaFr:30, deltaRl:30, deltaRr:31,
    contraAsym:1, apAsym:1, temperature:38.5, thermalSpike:0,
    hardness:0, pain:0, milkVisibility:0, painIndex:0,
  },
  topRiskDrivers: [],
  clinicalRecommendation: "Maintain standard milking cycle.",
  lastUpdated: new Date().toISOString(),
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>("dashboard");
  const [currentLang, setCurrentLang]     = useState<LanguageCode>("en");
  const [cows, setCows]                   = useState<Cow[]>([]);
  const [selectedCowId, setSelectedCowId] = useState<string>("COW_03");
  const [isConnected, setIsConnected]     = useState(true);
  const [isAnalyzing, setIsAnalyzing]     = useState(false);
  const [isDispatchingSms, setIsDispatchingSms] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [alerts, setAlerts]       = useState<HerdAlert[]>([]);
  const [smsHistory, setSmsHistory] = useState<SmsAlert[]>([]);
  const [toastCow, setToastCow]   = useState<Cow | null>(null);
  const [isAddCowOpen, setIsAddCowOpen]   = useState(false);
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen]       = useState(false);
  const [isInstallOpen, setIsInstallOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [smsSettings, setSmsSettings]     = useState<SmsSettings>({
    recipientPhone: "+919876543210",
    autoDispatchThreshold: 70,
    emergencyVetHotline: "+919443322110",
    language: "en",
  });
  const notifiedRef = useRef<Set<string>>(new Set());

  /* ── live polling ────────────────────────────────────────────────── */
  useEffect(() => {
    let alive = true;
    const poll = async () => {
      try {
        const live = await fetchLiveHerd();
        if (!alive) return;
        setCows(live);
        setIsConnected(true);
        live.forEach((cow) => {
          if (cow.riskLevel === "high" && !notifiedRef.current.has(cow.id)) {
            notifiedRef.current.add(cow.id);
            setToastCow(cow);
            setAlerts((prev) => [{
              id: `ALT_${Date.now()}_${cow.id}`,
              cowId: cow.id, severity: "critical",
              title: "High Mastitis Risk Detected",
              message: `${cow.name} (${cow.id}) — temp ${cow.temperature}°C, marked quarter swelling.`,
              timestamp: new Date().toISOString(), isRead: false,
            }, ...prev]);
          }
        });
      } catch { if (alive) setIsConnected(false); }
    };
    poll();
    const id = setInterval(poll, 2000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  useEffect(() => { fetchSmsHistory().then(setSmsHistory).catch(() => {}); }, []);

  const selectedCow = cows.find((c) => c.id === selectedCowId) || cows[0] || defaultCow;
  const criticalCount = cows.filter((c) => c.riskLevel === "high").length;
  const unreadCount   = alerts.filter((a) => !a.isRead).length;

  const handleSelectCow = (cow: Cow) => { setSelectedCowId(cow.id); setCurrentScreen("cow_detail"); };

  const handleAnalyzeWithAi = async (cowId: string) => {
    setSelectedCowId(cowId); setCurrentScreen("ai_intelligence"); setIsAnalyzing(true);
    try { const u = await analyzeCowWithAi(cowId); setCows((p) => p.map((c) => c.id === u.id ? u : c)); }
    catch (e) { console.error(e); }
    finally { setTimeout(() => setIsAnalyzing(false), 400); }
  };

  const handleToggleQuarantine = async (cowId: string, q: boolean) => {
    try { await toggleCowQuarantine(cowId, q); setCows((p) => p.map((c) => c.id === cowId ? { ...c, isQuarantined: q } : c)); }
    catch (e) { console.error(e); }
  };

  const handleIsolateAndDispatch = async (cow: Cow) => {
    await handleToggleQuarantine(cow.id, true);
    setSelectedCowId(cow.id); setCurrentScreen("sms_warning");
  };

  const handleSendLiveSms = async (cowId: string, phone: string, message: string) => {
    setIsDispatchingSms(true);
    try { const r = await sendLiveSmsAlert(cowId, phone, message); setSmsHistory((p) => [r, ...p]); }
    catch (e) { console.error(e); }
    finally { setIsDispatchingSms(false); }
  };

  const navigate = (screen: ScreenType) => { setCurrentScreen(screen); setIsMobileDrawerOpen(false); };

  const renderScreen = () => {
    switch (currentScreen) {
      case "dashboard":
        return <DashboardScreen cows={cows} currentLang={currentLang}
          onSelectCow={handleSelectCow} onIsolateAndDispatch={handleIsolateAndDispatch}
          onNavigateToHerd={() => navigate("herd")} onNavigateToAlerts={() => navigate("alerts")}
          onNavigateToAiStudio={handleAnalyzeWithAi} onNavigateToSms={() => navigate("sms_warning")} />;
      case "herd":
        return <HerdScreen cows={cows} currentLang={currentLang}
          onSelectCow={handleSelectCow} onAnalyzeWithAi={handleAnalyzeWithAi}
          onToggleQuarantine={handleToggleQuarantine} onOpenAddCow={() => setIsAddCowOpen(true)} />;
      case "cow_detail":
        return <CowDetailScreen cow={selectedCow} currentLang={currentLang}
          onBack={() => navigate("herd")} onToggleQuarantine={handleToggleQuarantine}
          onOpenSmsForCow={(c) => { setSelectedCowId(c.id); navigate("sms_warning"); }}
          onOpenExamForCow={() => setIsExamModalOpen(true)} onAnalyzeWithAi={handleAnalyzeWithAi} />;
      case "ai_intelligence":
        return <AiIntelligenceScreen cows={cows} selectedCow={selectedCow} currentLang={currentLang}
          onSelectCow={handleSelectCow} onAnalyzeCow={handleAnalyzeWithAi} isAnalyzing={isAnalyzing} />;
      case "live_monitoring":
        return <LiveMonitoringScreen cows={cows} currentLang={currentLang} onSelectCow={handleSelectCow} />;
      case "alerts":
        return <AlertsScreen alerts={alerts} cows={cows} currentLang={currentLang}
          onSelectCow={handleSelectCow} onIsolateAndDispatch={handleIsolateAndDispatch}
          onToggleQuarantine={handleToggleQuarantine}
          onDismissAlert={(id) => setAlerts((p) => p.filter((a) => a.id !== id))}
          onClearAll={() => setAlerts([])} />;
      case "sms_warning":
        return <SmsWarningScreen cows={cows} selectedCow={selectedCow} currentLang={currentLang}
          smsSettings={smsSettings} onUpdateSmsSettings={setSmsSettings}
          onDispatchSms={handleSendLiveSms} onOpenHistory={() => setIsHistoryOpen(true)}
          isDispatching={isDispatchingSms} />;
    }
  };

  const sidebarProps = {
    currentScreen, onNavigate: navigate, currentLang, criticalAlertCount: criticalCount,
    isOpenMobile: isMobileDrawerOpen, onCloseMobile: () => setIsMobileDrawerOpen(false),
    onOpenHelp: () => setIsHelpOpen(true), onOpenProfile: () => setIsProfileOpen(true),
    onLanguageChange: setCurrentLang, isConnected,
  };

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans">
      {/* ── PERMANENT LEFT SIDEBAR ── */}
      <Sidebar {...sidebarProps} />

      {/* ── MAIN CONTENT AREA ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top action bar — NO duplicate logo. Just page title + utils */}
        <header className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between shadow-xs">
          {/* Left: hamburger (mobile only) + page title */}
          <div className="flex items-center space-x-3">
            {/* Hamburger — only visible on mobile where sidebar is hidden */}
            <button
              onClick={() => setIsMobileDrawerOpen(true)}
              className="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Page title that changes per screen */}
            <div>
              <h1 className="text-sm font-extrabold text-slate-900 tracking-tight">
                {{
                  dashboard:      "Command Center",
                  herd:           "Herd Roster",
                  cow_detail:     `${selectedCow.id} · ${selectedCow.name}`,
                  ai_intelligence:"AI Diagnostic Studio",
                  live_monitoring:"Edge Telemetry",
                  alerts:         "Clinical Triage",
                  sms_warning:    "SMS Alert Engine",
                }[currentScreen]}
              </h1>
              <p className="text-[10px] text-slate-400 font-medium">
                {isConnected ? (
                  <span className="flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                    <span>Live — {cows.length} cattle streaming</span>
                  </span>
                ) : (
                  <span className="text-red-500">Reconnecting…</span>
                )}
              </p>
            </div>
          </div>

          {/* Right: language picker + alerts */}
          <div className="flex items-center space-x-2">
            {/* Language */}
            <div className="flex bg-slate-100 p-0.5 rounded-full border border-slate-200 text-[11px] font-semibold">
              {(["en","ta","hi"] as LanguageCode[]).map((lang) => (
                <button key={lang} onClick={() => setCurrentLang(lang)}
                  className={`px-2.5 py-0.5 rounded-full transition-all ${currentLang === lang ? "bg-[#00361A] text-white shadow-xs" : "text-slate-500"}`}>
                  {lang === "en" ? "EN" : lang === "ta" ? "தமிழ்" : "हिंदी"}
                </button>
              ))}
            </div>

            {/* Alerts bell */}
            <button onClick={() => navigate("alerts")}
              className="relative p-2 rounded-full text-slate-500 hover:bg-slate-100 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-5-5.917V4a1 1 0 10-2 0v1.083A6 6 0 006 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {criticalCount > 0 && (
                <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-red-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {criticalCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Mobile-only top tab bar */}
        <div className="md:hidden">
          <TopTabBar currentScreen={currentScreen} onNavigate={navigate} criticalAlertCount={criticalCount} />
        </div>

        {/* Screen body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-10">
          {renderScreen()}
        </main>
      </div>

      {/* ── MODALS ── */}
      <AddCowModal isOpen={isAddCowOpen} onClose={() => setIsAddCowOpen(false)}
        currentLang={currentLang}
        onAddCow={(data) => {
          const n = cows.length + 1;
          const id = `COW_${n.toString().padStart(2,"0")}`;
          setCows((p) => [...p, { ...defaultCow, id, name: data.name || `Cow #${n}`,
            tagNumber:`IN-TN-${7200+n}`, breed: data.breed || "Jersey Cross",
            barnSector: data.barnSector || "Barn Alpha",
            lactationMonths: data.lactationMonths || 2,
            daysInMilk: (data.lactationMonths || 2) * 30,
            lastUpdated: new Date().toISOString() }]);
        }} />
      <ClinicalExamModal cow={selectedCow} isOpen={isExamModalOpen}
        onClose={() => setIsExamModalOpen(false)} onSaveExam={(e) => console.log(e)} />
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)}
        smsSettings={smsSettings} onSaveSettings={setSmsSettings} />
      <FarmerHelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)}
        currentLang={currentLang} emergencyHotline={smsSettings.emergencyVetHotline} />
      <AndroidInstallModal isOpen={isInstallOpen} onClose={() => setIsInstallOpen(false)} />
      <SmsHistoryModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} history={smsHistory} />
      <SmsEarlyWarningToast cow={toastCow} onDismiss={() => setToastCow(null)}
        onIsolateAndDispatch={handleIsolateAndDispatch} />
    </div>
  );
}
