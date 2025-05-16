import React from "react";
import { useReadContract } from "wagmi";
import FiatSendABI from "@/abis/FiatSend.json";
import { formatUnits } from "viem";
import { motion, AnimatePresence } from "framer-motion";
import { XMarkIcon } from "@heroicons/react/24/solid";

interface KYCUpgradePromptProps {
  address: `0x${string}`;
  onClose: () => void;
}

const FIATSEND_ADDRESS = "0x1D683929B76cA50217C3B9C8CE4CcA9a0454a13d";

// KYC levels and their corresponding limits in USDT
const KYC_LIMITS = {
  0: 0, // No KYC
  1: 100, // Level 1: $100
  2: 1000, // Level 2: $1,000
};

export const KYCUpgradePrompt: React.FC<KYCUpgradePromptProps> = ({
  address,
  onClose,
}) => {
  // Read KYC level from contract
  const { data: kycLevel } = useReadContract({
    address: FIATSEND_ADDRESS,
    abi: FiatSendABI.abi,
    functionName: "kycLevel",
    args: [address],
  });

  // Read monthly spent amount
  const { data: monthlySpent } = useReadContract({
    address: FIATSEND_ADDRESS,
    abi: FiatSendABI.abi,
    functionName: "monthlySpent",
    args: [address],
  });

  if (!kycLevel || !monthlySpent) return null;

  const level = Number(kycLevel);
  const spent = Number(formatUnits(monthlySpent as bigint, 18));
  const limit = KYC_LIMITS[level as keyof typeof KYC_LIMITS] || 0;
  const remainingLimit = limit - spent;
  const nextLevel = level + 1;
  const nextLimit = KYC_LIMITS[nextLevel as keyof typeof KYC_LIMITS] || limit;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1000] flex items-center justify-center p-4"
      >
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">KYC Status</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Current Level</span>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-600">
                    Level {level}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  Monthly Limit: ${limit.toLocaleString()} USDT
                </div>
                <div className="text-sm text-gray-500">
                  Remaining: ${remainingLimit.toLocaleString()} USDT
                </div>
              </div>

              {nextLevel <= 4 && (
                <div className="p-4 bg-purple-50 rounded-xl">
                  <h3 className="text-sm font-medium text-purple-900 mb-2">
                    Upgrade to Level {nextLevel}
                  </h3>
                  <p className="text-sm text-purple-700 mb-4">
                    Increase your monthly limit to ${nextLimit.toLocaleString()} USDT
                  </p>
                  <a
                    href="https://app.deform.cc/form/6fcae3e3-eed5-4db8-b71c-85a2053067da/?page_number=0"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full py-2 px-4 text-center bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Upgrade Now
                  </a>
                </div>
              )}

              <div className="text-xs text-gray-500">
                <p>• Level 1: Basic verification - $100 limit</p>
                <p>• Level 2: Enhanced verification - $1,000 limit</p>
                <p>• Level 3: Full verification - $10,000 limit</p>
                <p>• Level 4: Premium verification - $250,000 limit</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}; 