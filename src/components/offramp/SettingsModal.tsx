import React, { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/solid";

interface SettingsModalProps {
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const [tipAmount, setTipAmount] = useState("0");
  const [spreadAmount, setSpreadAmount] = useState("0");

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20">
      <div className="bg-[#1C1C28] rounded-2xl shadow-xl w-full max-w-md mx-4">
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Tip for Merchant */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-white font-medium">Tip for Merchant</h3>
                <p className="text-sm text-gray-400">
                  Add a tip to incentivize faster order matching
                </p>
              </div>
              <div className="flex items-center">
                <span className="text-white mr-2">$</span>
                <input
                  type="text"
                  value={tipAmount}
                  onChange={(e) => setTipAmount(e.target.value)}
                  className="w-20 px-3 py-2 bg-gray-800 rounded-lg text-white text-right"
                />
              </div>
            </div>

            <div className="flex items-center justify-between space-x-2">
              <button
                onClick={() => setTipAmount("0")}
                className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-colors ${
                  tipAmount === "0"
                    ? "bg-purple-500 text-white"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
                Zero
              </button>
              <button
                onClick={() => setTipAmount("1")}
                className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-colors ${
                  tipAmount === "1"
                    ? "bg-purple-500 text-white"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
                Regular
              </button>
              <button
                onClick={() => setTipAmount("2")}
                className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-colors ${
                  tipAmount === "2"
                    ? "bg-purple-500 text-white"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
                High
              </button>
            </div>
          </div>

          {/* Spread */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-white font-medium">Spread</h3>
                <p className="text-sm text-gray-400">
                  Additional spread for market fluctuations
                </p>
              </div>
              <div className="flex items-center">
                <input
                  type="text"
                  value={spreadAmount}
                  onChange={(e) => setSpreadAmount(e.target.value)}
                  className="w-20 px-3 py-2 bg-gray-800 rounded-lg text-white text-right"
                />
                <span className="text-white ml-2">%</span>
              </div>
            </div>

            <div className="flex items-center justify-between space-x-2">
              <button
                onClick={() => setSpreadAmount("0")}
                className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-colors ${
                  spreadAmount === "0"
                    ? "bg-purple-500 text-white"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
                Zero
              </button>
              <button
                onClick={() => setSpreadAmount("0.5")}
                className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-colors ${
                  spreadAmount === "0.5"
                    ? "bg-purple-500 text-white"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
                Regular
              </button>
              <button
                onClick={() => setSpreadAmount("1")}
                className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-colors ${
                  spreadAmount === "1"
                    ? "bg-purple-500 text-white"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
                High
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
