import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePrivy } from "@privy-io/react-auth";
import { useReadContract } from "wagmi";
import { formatUnits } from "viem";
import FSEND_ABI from "@/abis/FSEND.json"; // Replace with actual FSEND ABI
import USDT_ABI from "@/abis/TetherToken.json"; // Replace with actual USDT ABI
import GHSFIAT_ABI from "@/abis/GHSFIAT.json"; // Replace with actual GHSFIAT ABI
import { FaEthereum, FaDollarSign, FaCoins } from "react-icons/fa"; // Example icons
import Image from "next/image";

interface WalletDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const WalletDrawer: React.FC<WalletDrawerProps> = ({ isOpen, onClose }) => {
  const { user, logout } = usePrivy();
  const walletAddress =
    user?.wallet?.address?.substring(0, 6) +
    "..." +
    user?.wallet?.address?.substring(user?.wallet?.address?.length - 4);

  const { data: fsendBalance } = useReadContract({
    address: "0x47e71D5B59A0c8cA50a7d5e268434aA0F7E171A2", // Replace with actual FSEND token address
    abi: FSEND_ABI.abi,
    functionName: "balanceOf",
    args: [walletAddress],
  });

  const { data: usdtBalance } = useReadContract({
    address: "0xAE134a846a92CA8E7803Ca075A1a0EE854Cd6168", // USDT address
    abi: USDT_ABI.abi,
    functionName: "balanceOf",
    args: [walletAddress],
  });

  const { data: ghsfiatBalance } = useReadContract({
    address: "0x84Fd74850911d28C4B8A722b6CE8Aa0Df802f08A", // GHSFIAT address
    abi: GHSFIAT_ABI.abi,
    functionName: "balanceOf",
    args: [walletAddress],
  });

  const formatBalance = (bal: bigint | unknown) => {
    if (typeof bal === "bigint") {
      return Number(formatUnits(bal, 18)).toFixed(2);
    }
    return "0.00";
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-100"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed right-0 top-0 h-full w-64 bg-white shadow-lg z-100 p-6 rounded-lg transition-shadow duration-300 ease-in-out hover:shadow-2xl"
            style={{
              background: "linear-gradient(135deg, #f3f3f3 0%, #f3f3f3 100%)",
            }}
          >
            <button
              onClick={onClose}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <h2 className="text-lg font-bold mb-4 text-purple-600">
              Wallet Information
            </h2>
            <p className="mb-2 text-gray-600">
              Address: {walletAddress || "Not connected"}
            </p>

            <div className="space-y-4">
              <div className="bg-gray-100 p-4 rounded-lg shadow-md flex items-center">
                <Image
                  src="/images/fiatsend.png"
                  width={16}
                  height={16}
                  alt="FSEND"
                  className="rounded-full"
                />
                <span className="font-medium">FSEND: </span>
                <span>{formatBalance(fsendBalance)}</span>
              </div>
              <div className="bg-gray-100 p-4 rounded-lg shadow-md flex items-center">
                <FaEthereum className="text-purple-600 mr-2" />
                <span className="font-medium">ETH: </span>
                <span> -- </span>
              </div>
              <div className="bg-gray-100 p-4 rounded-lg shadow-md flex items-center">
                <FaDollarSign className="text-green-600 mr-2" />
                <span className="font-medium">USDT: </span>
                <span>{formatBalance(usdtBalance)}</span>
              </div>
              <div className="bg-gray-100 p-4 rounded-lg shadow-md flex items-center">
                <FaCoins className="text-yellow-600 mr-2" />
                <span className="font-medium">GHSFIAT: </span>
                <span>{formatBalance(ghsfiatBalance)}</span>
              </div>
              <button
                onClick={logout}
                className="bg-purple-600 p-2 rounded-lg text-white hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default WalletDrawer;
