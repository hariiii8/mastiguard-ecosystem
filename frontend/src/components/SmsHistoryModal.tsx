import React from "react";
import { X, History, CheckCircle2, Radio } from "lucide-react";
import { SmsAlert } from "../types";

interface SmsHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: SmsAlert[];
}

export const SmsHistoryModal: React.FC<SmsHistoryModalProps> = ({
  isOpen,
  onClose,
  history
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white border border-slate-200 rounded-lg p-6 max-w-2xl w-full shadow-xl space-y-4 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <History className="w-5 h-5 text-[#00361A]" />
            <h3 className="font-bold text-base text-slate-900">
              SMS Emergency Broadcast Transmission History
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs">
            No SMS alerts have been dispatched in the current session.
          </div>
        ) : (
          <div className="space-y-3 font-mono text-xs">
            {history.map((alert) => (
              <div
                key={alert.message_id}
                className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-[#00361A] text-sm">
                      {alert.cow_id}
                    </span>
                    <span className="text-slate-400">To: {alert.recipient_phone}</span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="font-bold text-emerald-800 uppercase text-[10px]">
                      {alert.status} ({alert.method || "GSM_AT_SIMULATOR"})
                    </span>
                  </div>
                </div>

                <p className="font-sans text-xs text-slate-700 bg-white p-2.5 rounded-md border border-slate-200 whitespace-pre-line">
                  {alert.message}
                </p>

                {alert.raw_at_command && (
                  <div className="text-[10px] text-slate-500 bg-slate-900 text-emerald-400 p-2 rounded-sm overflow-x-auto">
                    <code>{alert.raw_at_command}</code>
                  </div>
                )}

                <div className="text-[10px] text-slate-400 text-right">
                  ID: {alert.message_id} • {new Date(alert.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold bg-[#00361A] text-white rounded-md hover:bg-emerald-950"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
