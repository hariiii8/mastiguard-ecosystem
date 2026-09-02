import React from "react";
import { X, HelpCircle, Phone, BookOpen, AlertOctagon, CheckCircle2 } from "lucide-react";
import { LanguageCode } from "../types";

interface FarmerHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: LanguageCode;
  emergencyHotline: string;
}

export const FarmerHelpModal: React.FC<FarmerHelpModalProps> = ({
  isOpen,
  onClose,
  currentLang,
  emergencyHotline
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white border border-slate-200 rounded-lg p-6 max-w-xl w-full shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <HelpCircle className="w-5 h-5 text-[#00361A]" />
            <h3 className="font-bold text-base text-slate-900">
              Farmer Mastitis Guide & Emergency Vet Support
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Emergency Hotline Card */}
        <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-red-900 uppercase tracking-wider block">
              24/7 Bovine Emergency Vet Hotline
            </span>
            <span className="text-xl font-extrabold text-red-700 font-mono">
              {emergencyHotline}
            </span>
          </div>
          <a
            href={`tel:${emergencyHotline}`}
            className="flex items-center space-x-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-md shadow-xs transition-colors"
          >
            <Phone className="w-4 h-4" />
            <span>Call Vet Now</span>
          </a>
        </div>

        {/* Clinical Steps */}
        <div className="space-y-3 text-xs">
          <h4 className="font-bold text-sm text-slate-900 flex items-center space-x-1.5">
            <BookOpen className="w-4 h-4 text-[#00361A]" />
            <span>What To Do When Mastitis Risk (&ge;70%) is Detected</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 rounded-md border border-slate-200 space-y-1">
              <span className="font-bold text-slate-900 flex items-center space-x-1">
                <span className="w-4 h-4 rounded-full bg-[#00361A] text-white flex items-center justify-center text-[10px]">1</span>
                <span>Immediate Physical Isolation</span>
              </span>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                Relocate the flagged cow to the isolated quarantine pen. Do not allow contact with the milking cluster to prevent cross-contamination.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-md border border-slate-200 space-y-1">
              <span className="font-bold text-slate-900 flex items-center space-x-1">
                <span className="w-4 h-4 rounded-full bg-[#00361A] text-white flex items-center justify-center text-[10px]">2</span>
                <span>Withhold Milk Supply</span>
              </span>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                Strictly discard milk from all quarters of the infected cow. Do not mix with the bulk cooling tank due to somatic cell count penalties.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-md border border-slate-200 space-y-1">
              <span className="font-bold text-slate-900 flex items-center space-x-1">
                <span className="w-4 h-4 rounded-full bg-[#00361A] text-white flex items-center justify-center text-[10px]">3</span>
                <span>Perform CMT Paddle Test</span>
              </span>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                Strip 2 mL of milk from each teat into the CMT paddle, add reagent, and gently swirl for 15 seconds to identify thickening or gelation.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-md border border-slate-200 space-y-1">
              <span className="font-bold text-slate-900 flex items-center space-x-1">
                <span className="w-4 h-4 rounded-full bg-[#00361A] text-white flex items-center justify-center text-[10px]">4</span>
                <span>Teat Disinfection & Antibiotics</span>
              </span>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                Apply post-milking iodine teat dip (0.5–1.0%). Administer intramammary antibiotic infusions strictly under veterinary prescription.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold bg-[#00361A] text-white rounded-md hover:bg-emerald-950"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
