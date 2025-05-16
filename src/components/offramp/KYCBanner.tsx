import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { useKycLimits } from "@/hooks/useKycLimits";

interface KYCBannerProps {
  address: `0x${string}`;
}

export const KYCBanner: React.FC<KYCBannerProps> = ({ address }) => {
  const [isVisible, setIsVisible] = useState(true);
  const {
    level,
    limit,
    remainingLimit,
    nextLevel,
    isLoading,
    levelDescription,
    nextLevelDescription,
    canUpgrade,
  } = useKycLimits(address);

  if (isLoading || !isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-0 left-0 right-0 z-[1000] bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-white/20">
                  {levelDescription}
                </span>
                <span className="text-sm">
                  Monthly Limit: ${limit.toLocaleString()} USDT
                </span>
                {level > 0 && (
                  <span className="text-sm">
                    Remaining: ${remainingLimit.toLocaleString()} USDT
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {canUpgrade && (
                <a
                  href="https://app.deform.cc/form/6fcae3e3-eed5-4db8-b71c-85a2053067da/?page_number=0"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-1.5 text-sm font-medium bg-white text-purple-600 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Upgrade to {nextLevelDescription}
                </a>
              )}
              <button
                onClick={() => setIsVisible(false)}
                className="p-1 hover:bg-white/10 rounded-full transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}; 