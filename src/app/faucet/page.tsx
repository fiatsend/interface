"use client";

import React, { useEffect, useState } from "react";
import { useTokenFaucet } from "@/hooks/use-token-faucet";
import { toast } from "react-hot-toast";
import { useAccount, useSwitchChain } from "wagmi";
import { liskSepolia } from "viem/chains";
import { formatDistanceToNow } from "date-fns";
import NeedGas from "@/components/need-gas";
import { usePrivy } from "@privy-io/react-auth";
import Image from "next/image";

const Faucet = () => {
  const {
    claimTokens,
    isClaimLoading,
    isSuccess,
    canClaim,
    timeRemaining,
    formattedTime,
  } = useTokenFaucet();
  const { chain } = useAccount();
  const { switchChain } = useSwitchChain();
  const [hasSwitchedChain, setHasSwitchedChain] = useState(false);
  const { isConnected } = useAccount();
  const [isProcessing, setIsProcessing] = useState(false);
  const { login } = usePrivy();

  useEffect(() => {
    if (chain && chain.id !== liskSepolia.id) {
      toast.error(
        <div className="flex flex-col gap-2">
          <span>Please switch to Lisk Sepolia network</span>
          <button
            onClick={async () => {
              try {
                await switchChain({ chainId: liskSepolia.id });
                setHasSwitchedChain(true);
              } catch (error) {
                console.error("Failed to switch chain:", error);
                toast.error("Failed to switch to Lisk Sepolia network");
              }
            }}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm"
          >
            Switch Network
          </button>
        </div>,
        {
          duration: 5000,
          position: "top-center",
        }
      );
    }
  }, [chain, switchChain, hasSwitchedChain]);

  const formatTimeRemaining = (ms: number) => {
    const futureDate = new Date(Date.now() + ms);
    return formatDistanceToNow(futureDate, { addSuffix: true });
  };

  const handleClaim = async () => {
    try {
      if (chain?.id !== liskSepolia.id && !hasSwitchedChain) {
        await switchChain({ chainId: liskSepolia.id });
        return;
      }

      if (!canClaim) {
        toast.error("Please wait for the cooldown period to end");
        return;
      }

      setIsProcessing(true);
      await claimTokens();

      if (isSuccess) {
        toast.success("Tokens claimed successfully!");
        setIsProcessing(false);
      }
    } catch (error: any) {
      console.error("Claim error:", error);
      handleClaimError(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClaimError = (error: any) => {
    if (
      error.message?.includes("Cooldown period not met") ||
      error.message?.includes('function "requestTokens" reverted')
    ) {
      toast.error("Please wait before claiming again", {
        duration: 4000,
        icon: "⏳",
      });
      return;
    }

    if (
      error.message?.includes("User rejected") ||
      error.shortMessage?.includes("User rejected") ||
      error.code === 4001
    ) {
      toast.error("Transaction cancelled", {
        duration: 3000,
        icon: "❌",
      });
      return;
    }

    toast.error("Failed to claim tokens. Please try again", {
      duration: 4000,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Testnet Faucet
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Get started with free testnet tokens to explore and test the network
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          {/* Token Distribution Section */}
          <div className="p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
              {/* FSEND Card */}
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 sm:p-6 border border-purple-100">
                <div className="flex items-center space-x-3 mb-3 sm:mb-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-100 p-1.5 sm:p-2">
                    <Image
                      src="/images/fiatsend.png"
                      width={24}
                      height={24}
                      alt="FSEND"
                      className="rounded-full"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">FSEND</h3>
                    <p className="text-sm text-gray-600">Governance Token</p>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Daily Limit</span>
                  <span className="text-lg font-bold text-purple-600">100</span>
                </div>
              </div>

              {/* GHSFIAT Card */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-green-100 p-2">
                    <Image
                      src="/images/tokens/ghs.png"
                      width={24}
                      height={24}
                      alt="GHSFIAT"
                      className="rounded-full"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">GHSFIAT</h3>
                    <p className="text-sm text-gray-600">Stablecoin</p>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Daily Limit</span>
                  <span className="text-lg font-bold text-green-600">100</span>
                </div>
              </div>

              {/* USDT Card */}
              <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-6 border border-teal-100">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-teal-100 p-2">
                    <Image
                      src="/images/tokens/usdt.png"
                      width={24}
                      height={24}
                      alt="USDT"
                      className="rounded-full"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">USDT</h3>
                    <p className="text-sm text-gray-600">Stablecoin</p>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Daily Limit</span>
                  <span className="text-lg font-bold text-teal-600">100</span>
                </div>
              </div>
            </div>

            {/* Claim Section */}
            <div className="space-y-6">
              {isConnected ? (
                <div className="flex flex-col items-center">
                  <button
                    onClick={handleClaim}
                    disabled={isClaimLoading || !canClaim || isProcessing}
                    className={`w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-medium text-sm transition-all ${
                      isClaimLoading || isProcessing
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : !canClaim
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700"
                    }`}
                  >
                    {isClaimLoading || isProcessing ? (
                      <div className="flex items-center space-x-2">
                        <svg
                          className="animate-spin h-5 w-5"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        <span>
                          {isProcessing ? "Processing..." : "Claiming..."}
                        </span>
                      </div>
                    ) : !canClaim && timeRemaining ? (
                      `Next claim ${formattedTime}`
                    ) : (
                      "Claim Tokens"
                    )}
                  </button>
                  {!canClaim && timeRemaining && (
                    <p className="mt-2 text-sm text-gray-500">
                      Please wait before claiming again
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-4">
                  <p className="text-gray-600">
                    Connect your wallet to claim tokens
                  </p>
                  <button
                    onClick={login}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
                  >
                    Login
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Gas Section */}
          <div className="border-t border-gray-100 bg-gray-50 p-8">
            <NeedGas />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Faucet;
