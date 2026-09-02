import React from "react";
import { X, Smartphone, Download, CheckCircle } from "lucide-react";

interface AndroidInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidInstallModal: React.FC<AndroidInstallModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white border border-slate-200 rounded-lg p-6 max-w-md w-full shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <Smartphone className="w-5 h-5 text-[#00361A]" />
            <h3 className="font-bold text-base text-slate-900">
              Install Android WebAPK
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-xs text-slate-700">
          <p className="leading-relaxed">
            MastiGuard AI is configured as a Progressive Web Application (PWA). You can install it on your Android tablet or smartphone for low-latency barn monitoring without needing the Google Play Store.
          </p>

          <div className="space-y-2 font-medium bg-slate-50 p-3 rounded-md border border-slate-200">
            <div className="flex items-start space-x-2">
              <span className="font-bold text-emerald-800">1.</span>
              <span>Open Chrome on your Android device and visit <code>http://&lt;local-ip&gt;:3000</code>.</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="font-bold text-emerald-800">2.</span>
              <span>Tap the three dots menu (⋮) in the top-right corner of Chrome.</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="font-bold text-emerald-800">3.</span>
              <span>Select <strong>"Add to Home screen"</strong> or <strong>"Install app"</strong>.</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="font-bold text-emerald-800">4.</span>
              <span>Launch directly from your Android app drawer with full offline caching.</span>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold bg-[#00361A] text-white rounded-md hover:bg-emerald-950"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
