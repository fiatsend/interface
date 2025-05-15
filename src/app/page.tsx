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

const FIATSEND_ADDRESS = "0xb55B7EeCB4F13C15ab545C8C49e752B396aaD0BD";
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
    <div className="min-h-screen bg-gray-50 pt-20 py-12 px-4 sm:px-6 lg:px-8">
      {/* Stats Banner */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Protocol Reserves Card */}
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 sm:p-6">
              <h2 className="text-sm font-medium text-gray-600 mb-1">
                Protocol Reserves
              </h2>
              <p className="text-xl sm:text-2xl font-bold text-purple-600">
                {fiatsendReserves.toLocaleString()} GHSFIAT
              </p>
              <Link
                href="https://sepolia-blockscout.lisk.com/address/0xb55B7EeCB4F13C15ab545C8C49e752B396aaD0BD"
                target="_blank"
                className="text-sm text-purple-500 hover:text-purple-600 mt-2 inline-flex items-center space-x-1"
              >
                <span>View Contract</span>
                <span>→</span>
              </Link>
            </div>
            {/* Exchange Rate Card */}
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 sm:p-6">
              <h2 className="text-sm font-medium text-gray-600 mb-1">
                Exchange Rate
              </h2>
              <p className="text-2xl font-bold text-purple-600">
                1 USDT = {exchangeRate} GHS
              </p>
              <p className="text-sm text-gray-500 mt-2">Updated in real-time</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 py-4 sm:py-8 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-sm p-1 mb-8 flex overflow-x-auto">
            <button
              onClick={() => setActiveTab("send")}
              className={`flex-1 py-2 px-4 rounded-lg transition-all ${
                activeTab === "send"
                  ? "bg-purple-600 text-white"
                  : "text-gray-600 hover:text-purple-600"
              }`}
            >
              Exchange
            </button>
            <button
              onClick={() => setActiveTab("nft-transfer")}
              className={`flex-1 py-2 px-4 rounded-lg transition-all ${
                activeTab === "nft-transfer"
                  ? "bg-purple-600 text-white"
                  : "text-gray-600 hover:text-purple-600"
              }`}
            >
              Transfer
            </button>
            <button
              onClick={() => setActiveTab("agent")}
              className={`flex-1 py-2 px-4 rounded-lg transition-all ${
                activeTab === "agent"
                  ? "bg-purple-600 text-white"
                  : "text-gray-600 hover:text-purple-600"
              }`}
            >
              Withdraw
            </button>
          </div>
        </div>

        {/* Active Component */}
        <div className="transition-all duration-300">
          {activeTab === "send" && (
            <Transfer reserve={fiatsendReserves} exchangeRate={exchangeRate} />
          )}
          {activeTab === "nft-transfer" && <NFTTransfer />}
          {activeTab === "agent" && <AgentWithdraw />}
        </div>
      </div>
    </div>
  );
};

export default withFiatsendNFT(OfframpPage);
