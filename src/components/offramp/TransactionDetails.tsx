import React from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";

interface TransactionDetailsProps {
  isOpen: boolean;
  onToggle: () => void;
  gasFee: string;
  merchantFee: string;
  protocolFee: string;
  totalFees: string;
  estimatedTime: string;
}

export const TransactionDetails: React.FC<TransactionDetailsProps> = ({
  isOpen,
  onToggle,
  gasFee,
  merchantFee,
  protocolFee,
  totalFees,
  estimatedTime,
}) => {
  return (
    <div className="rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between text-black hover:text-white transition-colors"
      >
        <span className="text-sm font-medium">Transaction details</span>
        {isOpen ? (
          <ChevronUpIcon className="w-5 h-5" />
        ) : (
          <ChevronDownIcon className="w-5 h-5" />
        )}
      </button>

      {isOpen && (
        <div className="px-4 pb-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Time to Lisk Sepolia</span>
            <span className="text-gray-300">{estimatedTime}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Gas fee</span>
            <span className="text-gray-300">${gasFee}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Merchant fee</span>
            <span className="text-gray-300">${merchantFee}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Protocol fee</span>
            <span className="text-gray-300">${protocolFee}</span>
          </div>
          <div className="flex justify-between text-sm pt-2 border-t border-gray-800">
            <span className="text-gray-400">Total fees</span>
            <span className="text-gray-300">${totalFees}</span>
          </div>
        </div>
      )}
    </div>
  );
};
