"use client";

import React, { useEffect, useState } from "react";
import { useTokenFaucet } from "@/hooks/use-token-faucet";
import { toast } from "react-hot-toast";
import { useAccount } from "wagmi";
import { usePrivy } from "@privy-io/react-auth";
import NeedGas from "@/components/need-gas";
import Turnstile from "react-turnstile";
import { withChainEnforcement } from "@/hocs/with-chain-enforcement";

interface FaucetProps {
  isCorrectChain: boolean;
  handleAction: (action: () => Promise<void>) => Promise<void>;
}

const FaucetBase: React.FC<FaucetProps> = ({ isCorrectChain, handleAction }) => {
  const { isClaimLoading, canClaim, timeRemaining, formattedTime } =
    useTokenFaucet({ isCorrectChain, handleAction });
  const { isConnected } = useAccount();
  const [isProcessing, setIsProcessing] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const { login, user } = usePrivy();

  const userAddress = user?.wallet?.address;

  const handleClaim = async () => {
    try {
      if (!captchaToken) {
        toast.error("Please complete the CAPTCHA before claiming tokens.");
        return;
      }

      if (!canClaim) {
        toast.error("Please wait for the cooldown period to end");
        return;
      }

      setIsProcessing(true);

      const response = await fetch(
        "https://67dd6a3b7e52ed014165.appwrite.global/claim",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user: userAddress,
            captchaToken,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        if (
          errorData.error &&
          errorData.error.includes("Cooldown period not met")
        ) {
          toast.error("Cooldown period not met. Please try again later.");
        } else {
          throw new Error("Failed to claim tokens");
        }
      }

      const data = await response.json();
      toast.success("Tokens claimed successfully!");
      console.log("Response data:", data);
    } catch (error) {
      console.error("Claim error:", error);
      if (
        error instanceof Error &&
        error.message !== "Failed to claim tokens"
      ) {
        toast.error("An unexpected error occurred.");
      } else {
        toast.error("Failed to claim tokens. Please try again.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center my-8">
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
            {/* Claim Section */}
            <div className="space-y-6">
              {isConnected ? (
                <div className="flex flex-col items-center">
                  {canClaim && !timeRemaining && (
                    <Turnstile
                      sitekey="0x4AAAAAABAtlmbVW2fPXlwn"
                      onVerify={(token: string) => setCaptchaToken(token)}
                      onExpire={() => setCaptchaToken(null)}
                    />
                  )}
                  <button
                    onClick={handleClaim}
                    disabled={
                      isClaimLoading ||
                      !canClaim ||
                      isProcessing ||
                      !captchaToken
                    }
                    className={`w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-medium text-sm transition-all ${
                      isClaimLoading || isProcessing || !captchaToken
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
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
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

export default withChainEnforcement(FaucetBase);
