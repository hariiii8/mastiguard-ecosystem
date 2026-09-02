import React, { useState } from "react";
import {
  MessageSquare,
  Send,
  Smartphone,
  CheckCircle2,
  AlertOctagon,
  History,
  Settings,
  Sliders,
  Radio
} from "lucide-react";
import { Cow, LanguageCode, SmsSettings } from "../types";
import { TRANSLATIONS } from "../data/translations";

interface SmsWarningScreenProps {
  cows: Cow[];
  selectedCow: Cow;
  currentLang: LanguageCode;
  smsSettings: SmsSettings;
  onUpdateSmsSettings: (settings: SmsSettings) => void;
  onDispatchSms: (cowId: string, phone: string, message: string) => Promise<void>;
  onOpenHistory: () => void;
  isDispatching: boolean;
}

export const SmsWarningScreen: React.FC<SmsWarningScreenProps> = ({
  cows,
  selectedCow,
  currentLang,
  smsSettings,
  onUpdateSmsSettings,
  onDispatchSms,
  onOpenHistory,
  isDispatching
}) => {
  const t = TRANSLATIONS[currentLang];
  const [recipientPhone, setRecipientPhone] = useState(smsSettings.recipientPhone);
  const [threshold, setThreshold] = useState(smsSettings.autoDispatchThreshold);
  const [targetCowId, setTargetCowId] = useState(selectedCow.id);
  const [customNote, setCustomNote] = useState("");

  const targetCow = cows.find((c) => c.id === targetCowId) || selectedCow;

  // Generate multi-language message preview
  const generateMessage = (lang: LanguageCode): string => {
    if (lang === "ta") {
      return `[மாஸ்டிகார்ட் AI அவசர எச்சரிக்கை] மாடு: ${targetCow.name} (${targetCow.id})
மடிநோய் ஆபத்து: ${targetCow.mastitisProbability}%
உடல் வெப்பநிலை: ${targetCow.temperature}°C
முன் இடது மடி வீக்கம்: ${targetCow.telemetry.eufl} மி.மீ
பரிந்துரை: மாட்டை உடனடியாக தனிமைப்படுத்தி பால் கறவையை நிறுத்தவும். CMT பரிசோதனை செய்யவும்.
கால்நடை மருத்துவர்: ${smsSettings.emergencyVetHotline}`;
    } else if (lang === "hi") {
      return `[मास्टीगार्ड AI चेतावनी] गाय: ${targetCow.name} (${targetCow.id})
थनेला संक्रमण संभावना: ${targetCow.mastitisProbability}%
तापमान: ${targetCow.temperature}°C
मडी सूजन (FL): ${targetCow.telemetry.eufl} mm
सलाह: गाय को तुरंत क्वारंटाइन करें और दुग्ध चक्र रोकें। CMT जांच करें।
पशु चिकित्सक: ${smsSettings.emergencyVetHotline}`;
    }
    return `[MASTIGUARD AI ALERT] Cow: ${targetCow.name} (${targetCow.id})
Risk Probability: ${targetCow.mastitisProbability}% (CRITICAL)
Core Temp: ${targetCow.temperature}°C (Spike: +${targetCow.telemetry.thermalSpike.toFixed(1)}°C)
Quarter Swelling (FL): ${targetCow.telemetry.eufl} mm
Action: Immediate isolation in quarantine pen. Withhold automated milking. Verify with CMT test.
Emergency Vet: ${smsSettings.emergencyVetHotline}`;
  };

  const previewMessage = generateMessage(currentLang) + (customNote ? `\nNote: ${customNote}` : "");

  const handleSend = () => {
    onDispatchSms(targetCow.id, recipientPhone, previewMessage);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-[#E2E8F0] rounded-lg p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-md bg-amber-100 text-amber-800">
              <MessageSquare className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {t.smsDispatchHeader}
            </h2>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-sm font-mono">
              Quectel GSM 4G / Twilio
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Automated low-latency SMS broadcast engine triggered at critical probability thresholds
          </p>
        </div>

        <button
          onClick={onOpenHistory}
          className="flex items-center space-x-2 px-3.5 py-2 border border-slate-300 hover:bg-slate-50 rounded-md text-xs font-bold text-slate-700 transition-colors shadow-xs"
        >
          <History className="w-4 h-4 text-slate-500" />
          <span>{t.smsHistory}</span>
        </button>
      </div>

      {/* Main 2-Column Split: Dispatch Controls vs Interactive Phone Mockup */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Configuration & Message Composer */}
        <div className="lg:col-span-7 bg-white border border-[#E2E8F0] rounded-lg p-5 shadow-xs space-y-5">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
            <Settings className="w-4 h-4 text-slate-600" />
            <span className="font-bold text-sm text-slate-900">
              Gateway Dispatch Parameters
            </span>
          </div>

          <div className="space-y-4 text-xs">
            {/* Target Cow Dropdown */}
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Target Animal Focus
              </label>
              <select
                value={targetCowId}
                onChange={(e) => setTargetCowId(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-md font-mono bg-slate-50 focus:bg-white focus:outline-hidden focus:border-[#00361A]"
              >
                {cows.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.id} - {c.name} ({c.riskLevel.toUpperCase()} • {c.mastitisProbability}%)
                  </option>
                ))}
              </select>
            </div>

            {/* Recipient Mobile Phone */}
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                {t.smsRecipient} (E.164 Format)
              </label>
              <input
                type="text"
                value={recipientPhone}
                onChange={(e) => {
                  setRecipientPhone(e.target.value);
                  onUpdateSmsSettings({ ...smsSettings, recipientPhone: e.target.value });
                }}
                placeholder="+919876543210"
                className="w-full p-2.5 border border-slate-300 rounded-md font-mono bg-slate-50 focus:bg-white focus:outline-hidden focus:border-[#00361A]"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Primary dairy manager / mobile veterinary emergency contact
              </span>
            </div>

            {/* Automatic Risk Trigger Slider */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-slate-700 font-bold">
                  Automated Edge Trigger Threshold:
                </label>
                <span className="font-mono font-bold text-red-600 text-sm">
                  {threshold}% Probability
                </span>
              </div>
              <input
                type="range"
                min="40"
                max="90"
                step="5"
                value={threshold}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setThreshold(val);
                  onUpdateSmsSettings({ ...smsSettings, autoDispatchThreshold: val });
                }}
                className="w-full accent-red-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>40% (Aggressive)</span>
                <span>70% (Standard Sentinel)</span>
                <span>90% (Strict Clinical)</span>
              </div>
            </div>

            {/* Custom Notes */}
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Optional Vet Field Note
              </label>
              <input
                type="text"
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="e.g. CMT reagent test kit in Barn A locker..."
                className="w-full p-2 border border-slate-300 rounded-md text-xs bg-slate-50 focus:bg-white"
              />
            </div>
          </div>

          {/* Trigger Dispatch Button */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div className="text-[11px] font-mono text-slate-500">
              Engine: <span className="text-emerald-700 font-bold">Quectel GSM Modem Serial AT Command</span>
            </div>

            <button
              onClick={handleSend}
              disabled={isDispatching}
              className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-5 py-2.5 rounded-md transition-all shadow-xs disabled:opacity-50"
            >
              <Send className={`w-4 h-4 ${isDispatching ? "animate-pulse" : ""}`} />
              <span>{isDispatching ? "Transmitting..." : t.sendSmsAlert}</span>
            </button>
          </div>
        </div>

        {/* Right Column (5 cols): Interactive 3D Phone Screen Mockup */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full max-w-[320px] bg-slate-900 rounded-[36px] p-3.5 shadow-2xl border-4 border-slate-800">
            {/* Phone Speaker & Camera Notch */}
            <div className="w-24 h-4 bg-slate-800 rounded-full mx-auto mb-2 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-950 mr-2"></div>
              <div className="w-8 h-1 bg-slate-700 rounded-full"></div>
            </div>

            {/* Phone Screen Display */}
            <div className="bg-slate-100 rounded-[28px] p-3 text-slate-900 min-h-[460px] flex flex-col justify-between overflow-hidden">
              {/* Messages Header */}
              <div>
                <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
                  <span className="text-[10px] font-bold text-slate-500">
                    MastiGuard GSM Relay
                  </span>
                  <span className="text-[10px] font-mono text-emerald-800 font-bold flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>SMS Active</span>
                  </span>
                </div>

                {/* SMS Bubble */}
                <div className="bg-white border border-slate-300 rounded-2xl rounded-tl-xs p-3.5 shadow-xs text-xs font-mono space-y-2 leading-relaxed">
                  <div className="text-[10px] font-extrabold text-red-600 uppercase tracking-wider flex items-center space-x-1">
                    <AlertOctagon className="w-3.5 h-3.5 mr-0.5" />
                    <span>EMERGENCY DISPATCH</span>
                  </div>

                  <p className="whitespace-pre-line text-[11px] text-slate-800 font-sans">
                    {previewMessage}
                  </p>

                  <div className="text-[9px] text-slate-400 text-right pt-1 border-t border-slate-100">
                    Just now • Delivered via GSM Serial AT
                  </div>
                </div>
              </div>

              {/* Phone Input Bar */}
              <div className="bg-white rounded-full p-2 border border-slate-200 flex items-center justify-between text-[11px] text-slate-400 mt-4">
                <span className="px-2">Reply to acknowledge...</span>
                <div className="w-6 h-6 rounded-full bg-[#00361A] text-white flex items-center justify-center">
                  <Send className="w-3 h-3" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
