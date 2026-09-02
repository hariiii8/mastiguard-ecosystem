import React, { useState } from "react";
import { X, Building2, Phone, Shield, Save } from "lucide-react";
import { SmsSettings } from "../types";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  smsSettings: SmsSettings;
  onSaveSettings: (newSettings: SmsSettings) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  smsSettings,
  onSaveSettings
}) => {
  const [phone, setPhone] = useState(smsSettings.recipientPhone);
  const [hotline, setHotline] = useState(smsSettings.emergencyVetHotline);
  const [farmName, setFarmName] = useState("Aarogya Dairy Tech Cooperative #4");

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      ...smsSettings,
      recipientPhone: phone,
      emergencyVetHotline: hotline
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white border border-slate-200 rounded-lg p-6 max-w-md w-full shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-[#00361A]" />
            <h3 className="font-bold text-base text-slate-900">
              Farm & Veterinarian Profile
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Dairy Facility Name
            </label>
            <input
              type="text"
              value={farmName}
              onChange={(e) => setFarmName(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-md font-sans"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Primary Farm Manager Mobile (SMS Recipient)
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+919876543210"
              className="w-full p-2 border border-slate-300 rounded-md font-mono"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Emergency Veterinary Doctor Hotline
            </label>
            <input
              type="text"
              value={hotline}
              onChange={(e) => setHotline(e.target.value)}
              placeholder="+919443322110"
              className="w-full p-2 border border-slate-300 rounded-md font-mono"
            />
          </div>

          <div className="bg-slate-50 p-3 rounded-md border border-slate-200 text-slate-600 space-y-1">
            <div className="font-bold text-slate-800">Edge Gateway Configuration</div>
            <div className="font-mono text-[11px]">Backend Ingestion: http://127.0.0.1:8000</div>
            <div className="font-mono text-[11px]">Model Engine: XGBoost 2.1 + TreeSHAP</div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-md"
            >
              Close
            </button>
            <button
              type="submit"
              className="flex items-center space-x-1 px-4 py-2 text-xs font-bold bg-[#00361A] text-white rounded-md hover:bg-emerald-950 transition-colors shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Configuration</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
