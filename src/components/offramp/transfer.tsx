"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useSimulateContract,
  usePrepareTransactionRequest,
} from "wagmi";
import FiatSendABI from "@/abis/FiatSend.json";
import { toast } from "react-hot-toast";
import TetherTokenABI from "@/abis/TetherToken.json";
import Link from "next/link";
import { formatUnits, parseUnits } from "viem";
import LoadingScreen from "./LoadingScreen";
import { TransactionStatus } from "./TransactionStatus";
import { ClockIcon, Cog6ToothIcon } from "@heroicons/react/24/outline";
import { TransactionHistory } from "./TransactionHistory";
import { SettingsModal } from "./SettingsModal";
import { TransactionDetails } from "./TransactionDetails";
import { withChainEnforcement, WithChainEnforcementProps } from "@/hocs/with-chain-enforcement";

interface Token {
  symbol: string;
  name: string;
  icon: string;
  balance?: string;
  address?: string;
  disabled?: boolean;
}

const FIATSEND_ADDRESS = "0xb55B7EeCB4F13C15ab545C8C49e752B396aaD0BD";
const USDT_ADDRESS = "0xAE134a846a92CA8E7803CA075A1a0EE854Cd6168";

const stablecoins: Token[] = [
  {
    symbol: "USDT",
    name: "Tether USD",
    icon: "/images/tokens/usdt.png",
    address: USDT_ADDRESS,
  },
];

interface TransferProps {
  exchangeRate: number;
  reserve: number;
  isCorrectChain?: boolean;
  handleAction?: (action: () => Promise<void>) => Promise<void>;
}

const TransferBase: React.FC<TransferProps & WithChainEnforcementProps> = ({ exchangeRate, reserve, handleAction }) => {
  const [ghsAmount, setGhsAmount] = useState("");
  const [usdtAmount, setUsdtAmount] = useState("");
  const [usdtAllowance, setUSDTAllowance] = useState<bigint>(BigInt(0));
  const { address } = useAccount();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const amount = parseUnits(usdtAmount, 18);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [showStatus, setShowStatus] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showTransactionDetails, setShowTransactionDetails] = useState(false);

  //simulate data
  const {
    data: approvalData,
    isFetching: approvalIsFetching,
    isLoading: isApprovalLoading,
    isError: approvalError,
  } = useSimulateContract({
    address: USDT_ADDRESS,
    abi: TetherTokenABI.abi,
    functionName: "approve",
    args: [FIATSEND_ADDRESS, amount],
  });

  const {
    writeContractAsync: setApproval,
    data: apprData,
    isPending: isApprovalPending,
    isSuccess: isApprovalSuccess,
  } = useWriteContract();

  const {
    writeContractAsync: swapTokens,
    isPending: isSwapPending,
    isSuccess: isSwapSuccess,
    data: swapData,
    error: swapError,
  } = useWriteContract();

  const {
    data: txData,
    isSuccess: txSuccess,
    error: txError,
  } = useWaitForTransactionReceipt({
    hash: swapData,
  });

  const {
    data: txAppData,
    isSuccess: txAppSuccess,
    error: txAppError,
  } = useWaitForTransactionReceipt({
    hash: apprData,
  });

  const isApproved = txAppSuccess;
  const isSwapComplete = txSuccess;

  const [selectedQuoteToken, setSelectedQuoteToken] = useState<Token>({
    symbol: "USDT",
    name: "Tether USD",
    icon: "/images/tokens/usdt.png",
    address: USDT_ADDRESS,
  });

  const { data: usdtBalance } = useReadContract({
    address: USDT_ADDRESS,
    abi: TetherTokenABI.abi,
    functionName: "balanceOf",
    args: address ? [address as `0x${string}`] : undefined,
  });

  const { data: currentusdtAllowance, error: AllowanceError } = useReadContract(
    {
      address: USDT_ADDRESS,
      abi: TetherTokenABI.abi,
      functionName: "allowance",
      args: address ? [address, FIATSEND_ADDRESS] : undefined,
    }
  );

  const [transactionStatus, setTransactionStatus] = useState<
    "idle" | "approving" | "converting" | "completed"
  >("idle");

  const handleApprove = async () => {
    if (!address) {
      toast.error("Please connect your wallet");
      return;
    }

    if (!handleAction) {
      toast.error("Chain enforcement not available");
      return;
    }

    await handleAction(async () => {
      try {
        setTransactionStatus("approving");
        toast.loading("Waiting for approval...", { id: "approve" });

        await setApproval({
          address: USDT_ADDRESS,
          abi: TetherTokenABI.abi,
          functionName: "approve",
          args: [FIATSEND_ADDRESS, amount],
        });
      } catch (error: any) {
        handleTransactionError(error, "approve");
        setTransactionStatus("idle");
      }
    });
  };

  const handleSendFiat = async () => {
    if (!address) {
      toast.error("Please connect your wallet");
      return;
    }

    if (!handleAction) {
      toast.error("Chain enforcement not available");
      return;
    }

    await handleAction(async () => {
      try {
        setTransactionStatus("converting");
        toast.loading("Converting USDT to GHS...", { id: "convert" });

        // Add validation for amount
        if (!usdtAmount || Number(usdtAmount) <= 0) {
          toast.error("Please enter a valid amount", { id: "convert" });
          return;
        }

        // Add validation for liquidity
        if (Number(ghsAmount) > reserve) {
          toast.error("Insufficient liquidity", { id: "convert" });
          return;
        }

        const tx = await swapTokens({
          address: FIATSEND_ADDRESS,
          abi: FiatSendABI.abi,
          functionName: "offRamp",
          args: [parseUnits(usdtAmount, 18)],
        });

        if (!tx) {
          throw new Error("Transaction failed");
        }

        setTxHash("0x123..."); // Replace with actual tx hash
        setShowStatus(true);
      } catch (error: any) {
        console.error("Swap error:", error);
        handleTransactionError(error, "convert");
        setTransactionStatus("idle");
      }
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (currentusdtAllowance) {
          // Safely format and set the allowance
          const formattedAllowance = BigInt(
            formatUnits(currentusdtAllowance as bigint, 0)
          );
          setUSDTAllowance(formattedAllowance);
          console.log("Usdt allowance", formattedAllowance);
        } else if (AllowanceError) {
          toast.error("Error fetching allowances");
        }
      } catch (error) {
        console.error("An unexpected error occurred:", error);
        toast.error("An unexpected error occurred");
      }
    };

    fetchData();
  }, [
    address,
    currentusdtAllowance,
    AllowanceError,
    isApproved,
    isSwapComplete,
  ]);

  useEffect(() => {
    if (txAppSuccess) {
      toast.success("USDT Approved!", { id: "approve" });
      setTransactionStatus("idle");
    }
  }, [txAppSuccess]);

  useEffect(() => {
    if (txSuccess) {
      toast.success("Successfully converted USDT to GHS!", { id: "convert" });
      setTransactionStatus("completed");

      // Reset form after successful transaction
      setTimeout(() => {
        setGhsAmount("");
        setUsdtAmount("");
        setTransactionStatus("idle");
      }, 2000);
    }
  }, [txSuccess]);

  const formattedBalance = usdtBalance
    ? Number(formatUnits(usdtBalance as bigint, 18)).toFixed(2)
    : "0.00";

  const handleTransactionError = (error: any, toastId: string) => {
    if (error.message?.includes("user rejected")) {
      toast.error("Transaction cancelled by user", { id: toastId });
    } else if (error.message?.includes("insufficient funds")) {
      toast.error("Insufficient funds for transaction", { id: toastId });
    } else {
      toast.error("Transaction failed. Please try again", { id: toastId });
    }
  };

  const handleGhsAmountChange = (value: string) => {
    setGhsAmount(value);
    if (value && !isNaN(Number(value)) && exchangeRate) {
      // Convert GHS to USDT considering the exchange rate
      const ghsValue = Number(value);
      // If exchangeRate is 17, then for 170 GHS:
      // 170 / 17 = 10 USDT
      const usdtValue = ghsValue / exchangeRate;

      // Format to 6 decimal places for USDT display
      setUsdtAmount(usdtValue.toFixed(2));
    } else {
      setUsdtAmount("");
    }
  };

  const SuccessScreen = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 space-y-6 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <svg
            className="w-8 h-8 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          Transaction Successful!
        </h2>
        <p className="text-gray-600">
          You have successfully converted {usdtAmount} USDT to {ghsAmount} GHS
        </p>
        <button
          onClick={() => setTransactionStatus("idle")}
          className="w-full py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );

  if (isSwapPending) {
    return <LoadingScreen />;
  }

  if (showStatus && txHash) {
    return (
      <TransactionStatus
        txHash={txHash}
        onComplete={() => {
          // Handle completion (e.g., reset form, show success message)
          setShowStatus(false);
          setTxHash(null);
        }}
      />
    );
  }

  return (
    <>
      {transactionStatus === "completed" && <SuccessScreen />}
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        {/* Header with Gradient */}
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-8 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Send with Wallet</h2>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowHistory(true)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <ClockIcon className="w-6 h-6" />
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <Cog6ToothIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
          <p className="mt-2">
            Convert your USDT to GHS directly from your wallet
          </p>

          {/* Exchange Rate Cards */}
          <div className="grid sm:grid-cols-2 z-0 grid-cols-1 gap-4 mt-6">
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-sm font-medium">Exchange Rate</p>
              <div className="flex items-baseline mt-1">
                <p className="text-2xl font-bold">1 USDT</p>
                <p className="text-lg ml-2">= {exchangeRate.toFixed(2)} GHS</p>
              </div>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-sm font-medium">Available Liquidity</p>
              <p className="text-2xl font-bold mt-1">
                {reserve.toFixed(2)} GHS
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8 space-y-8">
          {/* Step 1: Amount Input */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-lg">
                1
              </div>
              <h2 className="text-xl font-semibold">Enter Amount in GHS</h2>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl space-y-4">
              <div className="">
                <input
                  type="number"
                  value={ghsAmount}
                  onChange={(e) => {
                    setGhsAmount(e.target.value);
                    setUsdtAmount(
                      (Number(e.target.value) / exchangeRate).toFixed(2)
                    );
                  }}
                  className="w-full p-4 pr-24 text-3xl font-bold rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="0.00"
                />
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">You&apos;ll send</span>
                <span className="text-lg font-semibold text-gray-700">
                  ≈ {usdtAmount} USDT
                </span>
              </div>
            </div>
          </div>

          {/* Step 2: Token Selection */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-lg">
                2
              </div>
              <h2 className="text-xl font-semibold">Select Token</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {stablecoins.map((token) => (
                <button
                  key={token.symbol}
                  onClick={() =>
                    !token.disabled && setSelectedQuoteToken(token)
                  }
                  disabled={token.disabled}
                  className={`flex items-center justify-center p-4 rounded-xl border-2 transition-all ${
                    selectedQuoteToken.symbol === token.symbol
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-200 hover:border-purple-300"
                  } ${token.disabled ? "cursor-not-allowed" : ""}`}
                >
                  <div className="flex items-center space-x-2">
                    <Image
                      src={token.icon}
                      alt={token.name}
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                    <span className="font-medium text-gray-900">
                      {token.symbol}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Transaction */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-lg">
                3
              </div>
              <h2 className="text-xl font-semibold">Approve & Send</h2>
            </div>

            <div className="space-y-4">
              {usdtAllowance <
                (usdtAmount ? parseUnits(usdtAmount, 18) : BigInt(0)) && (
                <button
                  onClick={handleApprove}
                  disabled={transactionStatus === "approving"}
                  className={`w-full py-4 rounded-xl font-medium transition-all ${
                    transactionStatus === "approving"
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-purple-600 text-white hover:bg-purple-700"
                  }`}
                >
                  {transactionStatus === "approving" ? (
                    <div className="flex items-center justify-center space-x-2">
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span>Approving...</span>
                    </div>
                  ) : (
                    "Approve USDT"
                  )}
                </button>
              )}

              <div className="mt-4">
                <TransactionDetails
                  isOpen={showTransactionDetails}
                  onToggle={() =>
                    setShowTransactionDetails(!showTransactionDetails)
                  }
                  gasFee="0.0003"
                  merchantFee="2.65"
                  protocolFee="0.00"
                  totalFees="2.65"
                  estimatedTime="~25s"
                />
              </div>

              <button
                onClick={handleSendFiat}
                disabled={
                  transactionStatus === "converting" ||
                  !ghsAmount ||
                  usdtAllowance <
                    (usdtAmount ? parseUnits(usdtAmount, 18) : BigInt(0))
                }
                className={`w-full py-4 rounded-xl font-medium transition-all ${
                  transactionStatus === "converting" ||
                  !ghsAmount ||
                  usdtAllowance <
                    (usdtAmount ? parseUnits(usdtAmount, 18) : BigInt(0))
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700"
                }`}
              >
                {transactionStatus === "converting" ? (
                  <div className="flex items-center justify-center space-x-2">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Converting...</span>
                  </div>
                ) : (
                  "Convert to GHS"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      {showHistory && (
        <TransactionHistory onClose={() => setShowHistory(false)} />
      )}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </>
  );
};

export const Transfer = withChainEnforcement(TransferBase);
export default Transfer;
