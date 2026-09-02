import React from "react";
import { AlertOctagon, X, Send } from "lucide-react";
import { Cow } from "../types";

interface SmsEarlyWarningToastProps {
  cow: Cow | null;
  onDismiss: () => void;
  onIsolateAndDispatch: (cow: Cow) => void;
}

export const SmsEarlyWarningToast: React.FC<SmsEarlyWarningToastProps> = ({
  cow,
  onDismiss,
  onIsolateAndDispatch
}) => {
  if (!cow) return null;

  return (
    <div className="fixed bottom-16 right-4 z-40 max-w-sm w-full bg-red-900 text-white rounded-lg p-4 shadow-2xl border border-red-700 animate-slide-up">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center shrink-0">
            <AlertOctagon className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-xs uppercase tracking-wider text-red-200">
              Sentinel Alert Triggered
            </div>
            <div className="text-sm font-extrabold mt-0.5 font-mono">
              {cow.id} ({cow.name}) • {cow.mastitisProbability}% Risk
            </div>
            <p className="text-[11px] text-red-200 mt-1">
              Temp: {cow.temperature}°C • Swelling detected in front quarters.
            </p>
          </div>
        </div>

        <button
          onClick={onDismiss}
          className="text-red-300 hover:text-white p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3 pt-2.5 border-t border-red-800 flex items-center justify-end space-x-2">
        <button
          onClick={onDismiss}
          className="text-xs text-red-200 hover:text-white px-2.5 py-1"
        >
          Ignore
        </button>
        <button
          onClick={() => {
            onIsolateAndDispatch(cow);
            onDismiss();
          }}
          className="flex items-center space-x-1 text-xs font-bold bg-white text-red-900 hover:bg-red-50 px-3 py-1.5 rounded-sm shadow-xs transition-colors"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Isolate & SMS Alert</span>
        </button>
      </div>
    </div>
  );
};
