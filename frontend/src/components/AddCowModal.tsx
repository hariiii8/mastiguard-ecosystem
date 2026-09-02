import React, { useState } from "react";
import { X, PlusCircle, Check } from "lucide-react";
import { Cow, LanguageCode } from "../types";

interface AddCowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCow: (newCow: Partial<Cow>) => void;
  currentLang: LanguageCode;
}

export const AddCowModal: React.FC<AddCowModalProps> = ({
  isOpen,
  onClose,
  onAddCow
}) => {
  const [name, setName] = useState("");
  const [breed, setBreed] = useState("Gir");
  const [barnSector, setBarnSector] = useState("Barn Alpha (Sector A)");
  const [lactationMonths, setLactationMonths] = useState(2);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddCow({
      name: name || "New Cow",
      breed,
      barnSector,
      lactationMonths: Number(lactationMonths),
      daysInMilk: Number(lactationMonths) * 30
    });
    setName("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white border border-slate-200 rounded-lg p-6 max-w-md w-full shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <PlusCircle className="w-5 h-5 text-[#00361A]" />
            <h3 className="font-bold text-base text-slate-900">
              Register New Cattle
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Cow Name / Alias
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Nandini"
              className="w-full p-2 border border-slate-300 rounded-md focus:outline-hidden focus:border-[#00361A]"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Breed</label>
            <select
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-md focus:outline-hidden focus:border-[#00361A]"
            >
              <option value="Gir">Gir (Indigenous Indian)</option>
              <option value="Sahiwal">Sahiwal (Zebu High-Yield)</option>
              <option value="Jersey Cross">Jersey Cross</option>
              <option value="Holstein Cross">Holstein Cross</option>
              <option value="Red Sindhi">Red Sindhi</option>
              <option value="Tharparkar">Tharparkar</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Assigned Barn Sector
            </label>
            <select
              value={barnSector}
              onChange={(e) => setBarnSector(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-md focus:outline-hidden focus:border-[#00361A]"
            >
              <option value="Barn Alpha (Sector A)">Barn Alpha (Sector A - High Producers)</option>
              <option value="Barn Beta (Sector B)">Barn Beta (Sector B - Mid Lactation)</option>
              <option value="Barn Gamma (Sector C)">Barn Gamma (Sector C - Fresh Cows)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Months After Calving (DIM)
            </label>
            <input
              type="number"
              min="1"
              max="12"
              value={lactationMonths}
              onChange={(e) => setLactationMonths(Number(e.target.value))}
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
              Confirm Registration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
