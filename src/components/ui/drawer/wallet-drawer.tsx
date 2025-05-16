import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePrivy } from "@privy-io/react-auth";
import { useBalance, useReadContract } from "wagmi";
import { formatUnits } from "viem";
import FSEND_ABI from "@/abis/FSEND.json"; // Replace with actual FSEND ABI
import USDT_ABI from "@/abis/TetherToken.json"; // Replace with actual USDT ABI
import GHSFIAT_ABI from "@/abis/GHSFIAT.json"; // Replace with actual GHSFIAT ABI
import { FaEthereum, FaDollarSign, FaCoins, FaWallet, FaSignOutAlt } from "react-icons/fa"; // Example icons
import Image from "next/image";

interface WalletDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const WalletDrawer: React.FC<WalletDrawerProps> = ({ isOpen, onClose }) => {
  const { user, logout } = usePrivy();
  const walletAddress = user?.wallet?.address || null;
  const shortenedAddress =
    user?.wallet?.address?.substring(0, 6) +
    "..." +
    user?.wallet?.address?.substring(user?.wallet?.address?.length - 4);

  const { data: fsendBalance } = useReadContract({
    address: "0x47e71D5B59A0c8cA50a7d5e268434aA0F7E171A2", // Replace with actual FSEND token address
    abi: FSEND_ABI.abi,
    functionName: "balanceOf",
    args: walletAddress ? [walletAddress] : undefined,
  });

  const { data: usdtBalance } = useReadContract({
    address: "0xAE134a846a92CA8E7803Ca075A1a0EE854Cd6168", // USDT address
    abi: USDT_ABI.abi,
    functionName: "balanceOf",
    args: walletAddress ? [walletAddress] : undefined,
  });

  const { data: ghsfiatBalance } = useReadContract({
    address: "0x84Fd74850911d28C4B8A722b6CE8Aa0Df802f08A", // GHSFIAT address
    abi: GHSFIAT_ABI.abi,
    functionName: "balanceOf",
    args: walletAddress ? [walletAddress] : undefined,
  });

  const formatBalance = (bal: bigint | unknown) => {
    if (bal) {
      return Number(formatUnits(bal as bigint, 18)).toFixed(2);
    } else return "0.00";
  };

  const logoutUser = () => {
    logout();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[999]"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed right-0 top-[4.1rem] h-[calc(100vh-4.1rem)] w-80 bg-white shadow-2xl z-[1000]"
          >
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    Wallet
                  </h2>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <svg
                      className="w-5 h-5 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Address Card */}
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <FaWallet className="text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Connected Wallet</p>
                      <p className="font-medium text-gray-900">{shortenedAddress || "Not connected"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Token Balances */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <h3 className="text-sm font-medium text-gray-500 mb-4">Token Balances</h3>
                
                {/* FSEND Balance */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <Image
                          src="/images/fiatsend.png"
                          width={20}
                          height={20}
                          alt="FSEND"
                          className="rounded-full"
                        />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">FSEND</p>
                        <p className="text-sm text-gray-500">Fiatsend Token</p>
                      </div>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">{formatBalance(fsendBalance)}</p>
                  </div>
                </motion.div>

                {/* USDT Balance */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <FaDollarSign className="text-green-600 text-xl" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">USDT</p>
                        <p className="text-sm text-gray-500">Tether USD</p>
                      </div>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">{formatBalance(usdtBalance)}</p>
                  </div>
                </motion.div>

                {/* GHSFIAT Balance */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                        <FaCoins className="text-yellow-600 text-xl" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">GHSFIAT</p>
                        <p className="text-sm text-gray-500">Ghana Cedi</p>
                      </div>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">{formatBalance(ghsfiatBalance)}</p>
                  </div>
                </motion.div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-100">
                <button
                  onClick={logoutUser}
                  className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors font-medium"
                >
                  <FaSignOutAlt />
                  <span>Disconnect Wallet</span>
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default WalletDrawer;
