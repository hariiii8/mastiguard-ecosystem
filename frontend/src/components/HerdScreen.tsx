import React, { useState } from "react";
import {
  Search,
  Grid,
  List,
  Thermometer,
  Activity,
  Droplet,
  BrainCircuit,
  Lock,
  Unlock,
  Plus
} from "lucide-react";
import { Cow, LanguageCode } from "../types";
import { TRANSLATIONS } from "../data/translations";

interface HerdScreenProps {
  cows: Cow[];
  currentLang: LanguageCode;
  onSelectCow: (cow: Cow) => void;
  onAnalyzeWithAi: (cowId: string) => void;
  onToggleQuarantine: (cowId: string, isQuarantined: boolean) => void;
  onOpenAddCow: () => void;
}

export const HerdScreen: React.FC<HerdScreenProps> = ({
  cows,
  currentLang,
  onSelectCow,
  onAnalyzeWithAi,
  onToggleQuarantine,
  onOpenAddCow
}) => {
  const t = TRANSLATIONS[currentLang];
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "healthy" | "medium" | "high" | "quarantined">("all");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  const healthyCount = cows.filter((c) => c.riskLevel === "healthy").length;
  const watchlistCount = cows.filter((c) => c.riskLevel === "medium").length;
  const riskCount = cows.filter((c) => c.riskLevel === "high").length;
  const quarantinedCount = cows.filter((c) => c.isQuarantined).length;

  const filteredCows = cows.filter((cow) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      cow.id.toLowerCase().includes(query) ||
      cow.name.toLowerCase().includes(query) ||
      cow.breed.toLowerCase().includes(query) ||
      cow.tagNumber.toLowerCase().includes(query) ||
      cow.barnSector.toLowerCase().includes(query);

    if (!matchesSearch) return false;

    if (activeFilter === "healthy") return cow.riskLevel === "healthy";
    if (activeFilter === "medium") return cow.riskLevel === "medium";
    if (activeFilter === "high") return cow.riskLevel === "high";
    if (activeFilter === "quarantined") return cow.isQuarantined;

    return true;
  });

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      {/* Top Search & Filter Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Tag, Cow Name, Breed, Sector..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm bg-slate-50 focus:bg-white focus:outline-hidden focus:border-[#00361A] transition-colors"
            />
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={onOpenAddCow}
              className="flex items-center space-x-1.5 bg-[#00361A] hover:bg-emerald-950 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register Cow</span>
            </button>

            {/* View toggle on desktop */}
            <div className="hidden sm:flex bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs">
              <button
                onClick={() => setViewMode("cards")}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === "cards" ? "bg-white text-slate-900 shadow-2xs font-bold" : "text-slate-500"
                }`}
                title="Card View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === "table" ? "bg-white text-slate-900 shadow-2xs font-bold" : "text-slate-500"
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-0.5 text-xs font-semibold">
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-all ${
              activeFilter === "all"
                ? "bg-[#00361A] text-white shadow-2xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All Cattle ({cows.length})
          </button>
          <button
            onClick={() => setActiveFilter("healthy")}
            className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-all ${
              activeFilter === "healthy"
                ? "bg-emerald-700 text-white shadow-2xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Healthy ({healthyCount})
          </button>
          <button
            onClick={() => setActiveFilter("medium")}
            className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-all ${
              activeFilter === "medium"
                ? "bg-amber-600 text-white shadow-2xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Watchlist ({watchlistCount})
          </button>
          <button
            onClick={() => setActiveFilter("high")}
            className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-all ${
              activeFilter === "high"
                ? "bg-red-600 text-white shadow-2xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Mastitis Risk ({riskCount})
          </button>
          <button
            onClick={() => setActiveFilter("quarantined")}
            className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-all ${
              activeFilter === "quarantined"
                ? "bg-slate-800 text-white shadow-2xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Quarantined ({quarantinedCount})
          </button>
        </div>
      </div>

      {/* Roster Cards (Single column on mobile, 2 on tablet, 3 on desktop) */}
      {viewMode === "cards" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredCows.map((cow) => (
            <div
              key={cow.id}
              onClick={() => onSelectCow(cow)}
              className={`bg-white border rounded-2xl p-4 shadow-xs transition-all hover:shadow-md cursor-pointer flex flex-col justify-between ${
                cow.riskLevel === "high"
                  ? "border-red-400 ring-2 ring-red-300/60"
                  : cow.riskLevel === "medium"
                  ? "border-amber-300"
                  : "border-slate-200/90"
              }`}
            >
              <div>
                {/* Header: ID, Name, Risk Pill */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-1.5 font-mono">
                      <span className="font-extrabold text-sm text-[#00361A]">
                        {cow.id}
                      </span>
                      <span className="font-sans font-bold text-slate-900 text-sm">
                        {cow.name}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {cow.tagNumber} • {cow.breed}
                    </span>
                  </div>

                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase font-mono tracking-wider ${
                      cow.riskLevel === "high"
                        ? "bg-red-600 text-white animate-pulse"
                        : cow.riskLevel === "medium"
                        ? "bg-amber-100 text-amber-900 border border-amber-300"
                        : "bg-emerald-100 text-emerald-900 border border-emerald-200"
                    }`}
                  >
                    {cow.riskLevel === "high"
                      ? "Mastitis Risk"
                      : cow.riskLevel === "medium"
                      ? "Watchlist"
                      : "Healthy"}
                  </span>
                </div>

                {/* 3 Metrics Row */}
                <div className="grid grid-cols-3 gap-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center font-mono my-3">
                  <div>
                    <span className="text-[9px] text-slate-400 font-sans uppercase block">
                      Body Temp
                    </span>
                    <span
                      className={`text-xs font-bold ${
                        cow.temperature >= 39.4 ? "text-red-600" : "text-slate-800"
                      }`}
                    >
                      {cow.temperature}°C
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-sans uppercase block">
                      Health Score
                    </span>
                    <span
                      className={`text-xs font-bold ${
                        cow.healthScore < 60
                          ? "text-red-600"
                          : cow.healthScore < 80
                          ? "text-amber-600"
                          : "text-emerald-700"
                      }`}
                    >
                      {cow.healthScore}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-sans uppercase block">
                      Daily Milk
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      {cow.dailyYield} L
                    </span>
                  </div>
                </div>

                {/* Quarter displacements */}
                <div className="text-[10px] font-mono text-slate-400 flex justify-between px-1">
                  <span>FL: {cow.telemetry.eufl}mm</span>
                  <span>FR: {cow.telemetry.eufr}mm</span>
                  <span>RL: {cow.telemetry.eurl}mm</span>
                  <span>RR: {cow.telemetry.eurr}mm</span>
                </div>
              </div>

              {/* Bottom Card Controls */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleQuarantine(cow.id, !cow.isQuarantined);
                  }}
                  className={`flex items-center space-x-1 text-xs font-bold px-2.5 py-1 rounded-lg transition-colors ${
                    cow.isQuarantined
                      ? "bg-slate-800 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {cow.isQuarantined ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                  <span>{cow.isQuarantined ? "Quarantined" : "In Milking Cycle"}</span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAnalyzeWithAi(cow.id);
                  }}
                  className="flex items-center space-x-1 text-xs font-bold text-[#00361A] bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg transition-colors"
                >
                  <BrainCircuit className="w-3.5 h-3.5 text-emerald-700" />
                  <span>XAI</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Dense Table for Desktop */
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-sans font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-3.5">ID</th>
                <th className="py-3 px-3.5">Name</th>
                <th className="py-3 px-3.5">Breed</th>
                <th className="py-3 px-3.5 text-right">Temp</th>
                <th className="py-3 px-3.5 text-right">Health</th>
                <th className="py-3 px-3.5 text-right">Cond</th>
                <th className="py-3 px-3.5 text-right">Yield</th>
                <th className="py-3 px-3.5 text-center">Status</th>
                <th className="py-3 px-3.5 text-center">Quarantine</th>
                <th className="py-3 px-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCows.map((cow) => (
                <tr
                  key={cow.id}
                  onClick={() => onSelectCow(cow)}
                  className={`hover:bg-slate-50/80 cursor-pointer transition-colors ${
                    cow.riskLevel === "high" ? "bg-red-50/40" : ""
                  }`}
                >
                  <td className="py-2.5 px-3.5 font-bold text-[#00361A]">{cow.id}</td>
                  <td className="py-2.5 px-3.5 font-sans font-semibold text-slate-900">{cow.name}</td>
                  <td className="py-2.5 px-3.5 text-slate-500 font-sans">{cow.breed}</td>
                  <td className={`py-2.5 px-3.5 text-right font-bold ${cow.temperature >= 39.4 ? "text-red-600" : "text-slate-800"}`}>
                    {cow.temperature}°C
                  </td>
                  <td className={`py-2.5 px-3.5 text-right font-bold ${cow.healthScore < 60 ? "text-red-600" : "text-emerald-700"}`}>
                    {cow.healthScore}%
                  </td>
                  <td className="py-2.5 px-3.5 text-right text-slate-700">{cow.conductivity}</td>
                  <td className="py-2.5 px-3.5 text-right text-slate-900 font-bold">{cow.dailyYield} L</td>
                  <td className="py-2.5 px-3.5 text-center">
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        cow.riskLevel === "high"
                          ? "bg-red-600 text-white"
                          : cow.riskLevel === "medium"
                          ? "bg-amber-100 text-amber-900"
                          : "bg-emerald-100 text-emerald-900"
                      }`}
                    >
                      {cow.riskLevel}
                    </span>
                  </td>
                  <td className="py-2.5 px-3.5 text-center">
                    <input
                      type="checkbox"
                      checked={cow.isQuarantined}
                      onChange={(e) => {
                        e.stopPropagation();
                        onToggleQuarantine(cow.id, e.target.checked);
                      }}
                      className="w-4 h-4 text-emerald-700 rounded-sm border-slate-300 focus:ring-emerald-700 cursor-pointer"
                    />
                  </td>
                  <td className="py-2.5 px-3.5 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAnalyzeWithAi(cow.id);
                      }}
                      className="text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg transition-colors"
                    >
                      Analyze
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
