import React, { useState } from "react";
import { X, ClipboardList, CheckCircle2 } from "lucide-react";
import { Cow } from "../types";

interface ClinicalExamModalProps {
  cow: Cow | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveExam: (examRecord: any) => void;
}

export const ClinicalExamModal: React.FC<ClinicalExamModalProps> = ({
  cow,
  isOpen,
  onClose,
  onSaveExam
}) => {
  const [cmtFl, setCmtFl] = useState("0");
  const [cmtFr, setCmtFr] = useState("0");
  const [cmtRl, setCmtRl] = useState("0");
  const [cmtRr, setCmtRr] = useState("0");
  const [sccScore, setSccScore] = useState(250000);
  const [vetNotes, setVetNotes] = useState("");
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen || !cow) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveExam({
      cowId: cow.id,
      timestamp: new Date().toISOString(),
      cmtScores: { FL: cmtFl, FR: cmtFr, RL: cmtRl, RR: cmtRr },
      sccScore: Number(sccScore),
      vetNotes
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white border border-slate-200 rounded-lg p-6 max-w-lg w-full shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <ClipboardList className="w-5 h-5 text-[#00361A]" />
            <div>
              <h3 className="font-bold text-base text-slate-900">
                California Mastitis Test (CMT) & SCC Log
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                {cow.id} • {cow.name} ({cow.tagNumber})
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {savedSuccess ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
            <p className="font-bold text-slate-900">Clinical Record Saved</p>
            <p className="text-xs text-slate-500">CMT score and SCC data archived to cow history.</p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            {/* 4-Quarter CMT Paddle Matrix */}
            <div>
              <label className="block font-bold text-slate-800 mb-2">
                Quarter CMT Reagent Viscosity Scores
              </label>
              <div className="grid grid-cols-2 gap-3 font-mono">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
                  <span className="font-bold block text-slate-700 mb-1">Front-Left (FL)</span>
                  <select
                    value={cmtFl}
                    onChange={(e) => setCmtFl(e.target.value)}
                    className="w-full p-1.5 border border-slate-300 rounded-sm bg-white"
                  >
                    <option value="0">0 - Negative (No Gel)</option>
                    <option value="T">T - Trace (Slight Slime)</option>
                    <option value="1">1 - Weak Positive</option>
                    <option value="2">2 - Distinct Positive (Clumping)</option>
                    <option value="3">3 - Strong Gel Formation</option>
                  </select>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
                  <span className="font-bold block text-slate-700 mb-1">Front-Right (FR)</span>
                  <select
                    value={cmtFr}
                    onChange={(e) => setCmtFr(e.target.value)}
                    className="w-full p-1.5 border border-slate-300 rounded-sm bg-white"
                  >
                    <option value="0">0 - Negative (No Gel)</option>
                    <option value="T">T - Trace (Slight Slime)</option>
                    <option value="1">1 - Weak Positive</option>
                    <option value="2">2 - Distinct Positive (Clumping)</option>
                    <option value="3">3 - Strong Gel Formation</option>
                  </select>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
                  <span className="font-bold block text-slate-700 mb-1">Rear-Left (RL)</span>
                  <select
                    value={cmtRl}
                    onChange={(e) => setCmtRl(e.target.value)}
                    className="w-full p-1.5 border border-slate-300 rounded-sm bg-white"
                  >
                    <option value="0">0 - Negative (No Gel)</option>
                    <option value="T">T - Trace (Slight Slime)</option>
                    <option value="1">1 - Weak Positive</option>
                    <option value="2">2 - Distinct Positive (Clumping)</option>
                    <option value="3">3 - Strong Gel Formation</option>
                  </select>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
                  <span className="font-bold block text-slate-700 mb-1">Rear-Right (RR)</span>
                  <select
                    value={cmtRr}
                    onChange={(e) => setCmtRr(e.target.value)}
                    className="w-full p-1.5 border border-slate-300 rounded-sm bg-white"
                  >
                    <option value="0">0 - Negative (No Gel)</option>
                    <option value="T">T - Trace (Slight Slime)</option>
                    <option value="1">1 - Weak Positive</option>
                    <option value="2">2 - Distinct Positive (Clumping)</option>
                    <option value="3">3 - Strong Gel Formation</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Somatic Cell Count (SCC) */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-bold text-slate-700">
                  Estimated Somatic Cell Count (SCC):
                </label>
                <span className="font-mono font-bold text-emerald-800">
                  {Number(sccScore).toLocaleString()} cells/mL
                </span>
              </div>
              <input
                type="range"
                min="50000"
                max="2500000"
                step="50000"
                value={sccScore}
                onChange={(e) => setSccScore(Number(e.target.value))}
                className="w-full accent-[#00361A] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>&lt;200k (Healthy)</span>
                <span>400k (Subclinical)</span>
                <span>&gt;1M (Clinical Mastitis)</span>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Veterinary Examination Remarks
              </label>
              <textarea
                rows={2}
                value={vetNotes}
                onChange={(e) => setVetNotes(e.target.value)}
                placeholder="Observed slight heat in FL quarter, somatic count elevated..."
                className="w-full p-2 border border-slate-300 rounded-md focus:outline-hidden focus:border-[#00361A]"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold bg-[#00361A] text-white rounded-md hover:bg-emerald-950 transition-colors shadow-xs"
              >
                Save Clinical Exam
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
