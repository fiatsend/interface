"use client";

import React, { useEffect, useState } from "react";
import withFiatsendNFT from "@/hocs/with-account";
// import VerificationCard from "@/components/verification/card";
import Transfer from "@/components/offramp/transfer";
import ReceiveStablecoins from "@/components/offramp/ReceiveStableCoins";
import { formatUnits } from "viem";
import toast from "react-hot-toast";
import FiatSendABI from "@/abis/FiatSend.json";
import { useReadContract } from "wagmi";
import GHSFIATABI from "@/abis/GHSFIAT.json";
import Link from "next/link";
import NFTTransfer from "@/components/offramp/NFTTransfer";
import { AgentWithdraw } from "@/components/offramp/AgentWithdraw";
import { motion, AnimatePresence } from "framer-motion";

const FIATSEND_ADDRESS = "0x1D683929B76cA50217C3B9C8CE4CcA9a0454a13d";
const GHSFIAT_ADDRESS = "0x84Fd74850911d28C4B8A722b6CE8Aa0Df802f08A";

const OfframpPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"send" | "nft-transfer" | "agent">(
    "send"
  );
  const [exchangeRate, setExchangeRate] = useState<number>(14);
  const [fiatsendReserves, setFiatsendReserves] = useState<number>(0);

  const { data: exRates, error: exRatesError } = useReadContract({
    address: FIATSEND_ADDRESS,
    abi: FiatSendABI.abi,
    functionName: "conversionRate",
  });

  const { data: reservesData, error: reservesError } = useReadContract({
    address: GHSFIAT_ADDRESS, // GHSFIAT token address
    abi: GHSFIATABI.abi, // ABI for GHSFIAT token
    functionName: "balanceOf",
    args: [FIATSEND_ADDRESS], // Fiatsend contract address
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (exRates) {
          const formattedRate = formatUnits(exRates as bigint, 2);
          setExchangeRate(Number(formattedRate));
        } else if (exRatesError) {
          toast.error("Error fetching exchange rates");
        }

        if (reservesData) {
          const formattedReserves = formatUnits(reservesData as bigint, 18); // Assuming GHSFIAT has 18 decimals
          setFiatsendReserves(Number(formattedReserves));
        } else if (reservesError) {
          toast.error("Error fetching reserves");
        }
      } catch (err) {
        toast.error("Could not fetch data");
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, [exRates, exRatesError, reservesData, reservesError]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Stats Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border-b border-gray-200 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Protocol Reserves Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 sm:p-6 border border-purple-100"
            >
              <h2 className="text-sm font-medium text-gray-600 mb-1">
                Protocol Reserves
              </h2>
              <p className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                {fiatsendReserves.toLocaleString()} GHSFIAT
              </p>
              <Link
                href="https://sepolia-blockscout.lisk.com/address/0x1D683929B76cA50217C3B9C8CE4CcA9a0454a13d"
                target="_blank"
                className="text-sm text-purple-500 hover:text-purple-600 mt-2 inline-flex items-center space-x-1 group"
              >
                <span>View Contract</span>
                <span className="group-hover:translate-x-0.5 transition-transform">→</span>
              </Link>
            </motion.div>
            {/* Exchange Rate Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 sm:p-6 border border-purple-100"
            >
              <h2 className="text-sm font-medium text-gray-600 mb-1">
                Exchange Rate
              </h2>
              <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                1 USDT = {exchangeRate} GHS
              </p>
              <p className="text-sm text-gray-500 mt-2">Updated in real-time</p>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-7xl mx-auto px-4 py-4 sm:py-8 sm:px-6 lg:px-8"
        >
          <div className="bg-white rounded-xl shadow-sm p-1 mb-8 flex overflow-x-auto">
            <button
              onClick={() => setActiveTab("send")}
              className={`flex-1 py-2 px-4 rounded-lg transition-all relative ${
                activeTab === "send"
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                  : "text-gray-600 hover:text-purple-600 hover:bg-purple-50"
              }`}
            >
              Exchange
              {activeTab === "send" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab("nft-transfer")}
              className={`flex-1 py-2 px-4 rounded-lg transition-all relative ${
                activeTab === "nft-transfer"
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                  : "text-gray-600 hover:text-purple-600 hover:bg-purple-50"
              }`}
            >
              Transfer
              {activeTab === "nft-transfer" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab("agent")}
              className={`flex-1 py-2 px-4 rounded-lg transition-all relative ${
                activeTab === "agent"
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                  : "text-gray-600 hover:text-purple-600 hover:bg-purple-50"
              }`}
            >
              Withdraw
              {activeTab === "agent" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          </div>
        </motion.div>

        {/* Active Component */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="transition-all duration-300"
          >
            {activeTab === "send" && (
              <Transfer reserve={fiatsendReserves} exchangeRate={exchangeRate} />
            )}
            {activeTab === "nft-transfer" && <NFTTransfer />}
            {activeTab === "agent" && <AgentWithdraw />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default withFiatsendNFT(OfframpPage);
