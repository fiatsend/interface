import React from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";

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
    <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between text-gray-700 hover:bg-gray-100 transition-colors"
      >
        <span className="text-sm font-medium">Transaction details</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDownIcon className="w-5 h-5 text-gray-500" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="px-4 pb-4 space-y-2 text-sm text-gray-600"
          >
            <div className="flex justify-between">
              <span>Estimated Time</span>
              <span className="font-medium text-gray-800">{estimatedTime}</span>
            </div>
            <div className="flex justify-between">
              <span>Gas fee</span>
              <span className="font-medium text-gray-800">${gasFee}</span>
            </div>
            <div className="flex justify-between">
              <span>Merchant fee</span>
              <span className="font-medium text-gray-800">${merchantFee}</span>
            </div>
            <div className="flex justify-between">
              <span>Protocol fee</span>
              <span className="font-medium text-gray-800">${protocolFee}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200 font-semibold text-gray-800">
              <span>Total fees</span>
              <span className="font-bold">${totalFees}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
