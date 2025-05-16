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
import { ClockIcon, Cog6ToothIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { TransactionHistory } from "./TransactionHistory";
import { SettingsModal } from "./SettingsModal";
import { TransactionDetails } from "./TransactionDetails";
import { withChainEnforcement, WithChainEnforcementProps } from "@/hocs/with-chain-enforcement";
import { motion, AnimatePresence } from "framer-motion";
import { KYCLimitWarning } from "./KYCLimitWarning";

interface Token {
  symbol: string;
  name: string;
  icon: string;
  balance?: string;
  address?: string;
  disabled?: boolean;
}

const FIATSEND_ADDRESS = "0x1D683929B76cA50217C3B9C8CE4CcA9a0454a13d";
const USDT_ADDRESS = "0xAE134a846a92CA8E7803Ca075A1a0EE854Cd6168";

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
  const amount = usdtAmount ? parseUnits(usdtAmount, 18) : BigInt(0);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [showStatus, setShowStatus] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showTransactionDetails, setShowTransactionDetails] = useState(false);

  // Simulate data for offRamp transaction to get gas estimate
  const { data: offRampSimulate, error: offRampSimulateError } = useSimulateContract({
    address: FIATSEND_ADDRESS,
    abi: FiatSendABI.abi,
    functionName: "offRamp",
    args: [amount],
    account: address,
    query: {
      enabled: amount > BigInt(0),
    },
  });

  const gasFeeEstimate = offRampSimulate?.request?.gasPrice ? formatUnits(offRampSimulate.request.gasPrice * (offRampSimulate.request.gas ?? BigInt(0)), 18) : "N/A";
  const estimatedTime = "~25s"; // Still hardcoded, no dynamic source identified yet
  const merchantFee = "N/A"; // No dynamic source identified yet
  const protocolFee = "N/A"; // No dynamic source identified yet
  const totalFees = gasFeeEstimate !== "N/A" ? gasFeeEstimate : "N/A"; // Simple total for now

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

  // Calculate if we need approval
  const needsApproval = usdtAllowance < (usdtAmount ? parseUnits(usdtAmount, 18) : BigInt(0));

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

        // Use 6 decimals for USDT instead of 18
        const parsedAmount = parseUnits(usdtAmount, 18);
        
        // Log the approval attempt for debugging
        console.log("Attempting to approve USDT:", {
          amount: usdtAmount,
          parsedAmount: parsedAmount.toString(),
          spender: FIATSEND_ADDRESS
        });

        await setApproval({
          address: USDT_ADDRESS,
          abi: TetherTokenABI.abi,
          functionName: "approve",
          args: [FIATSEND_ADDRESS, parsedAmount],
        });
      } catch (error: any) {
        console.error("Approval error:", error);
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

        // Use the actual transaction hash
        setTxHash(tx);
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

        if (offRampSimulateError) {
          console.error("OffRamp simulation error:", offRampSimulateError);
          // Optionally display an error to the user
        }

      } catch (error) {
        console.error("An unexpected error occurred:", error);
      }
    };

    fetchData();
  }, [currentusdtAllowance, AllowanceError, offRampSimulate, offRampSimulateError]);

  const handleTransactionError = (error: any, toastId: string) => {
    console.error("Transaction error:", error);
    
    if (error.message?.includes("user rejected")) {
      toast.error("Transaction cancelled by user", { id: toastId });
    } else if (error.message?.includes("insufficient funds")) {
      toast.error("Insufficient funds for transaction", { id: toastId });
    } else if (error.message?.includes("execution reverted")) {
      toast.error("Transaction reverted. Please check your balance and try again", { id: toastId });
    } else if (error.message?.includes("gas required exceeds allowance")) {
      toast.error("Insufficient gas for transaction", { id: toastId });
    } else {
      toast.error(`Transaction failed: ${error.message || "Please try again"}`, { id: toastId });
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

  // Only show transaction status if we have a valid transaction hash
  if (showStatus && txHash && txHash !== "0x123...") {
    return (
      <TransactionStatus
        txHash={txHash}
        onComplete={() => {
          setShowStatus(false);
          setTxHash(null);
          setTransactionStatus("completed");
        }}
      />
    );
  }

  return (
    <>
      {transactionStatus === "completed" && <SuccessScreen />}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100"
      >
        {/* Header with Gradient */}
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/10" />
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Send with Wallet</h2>
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
            <p className="mt-2 text-white/80">
              Convert your USDT to GHS directly from your wallet
            </p>

            {/* Exchange Rate Cards */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-800">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-white/20"
              >
                <h3 className="text-xs font-medium text-gray-600">Exchange Rate</h3>
                <p className="text-lg font-bold mt-1">
                  1 USDT = {exchangeRate} GHS
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-white/20"
              >
                <h3 className="text-xs font-medium text-gray-600">Protocol Reserves</h3>
                <p className="text-lg font-bold mt-1">
                  {reserve.toLocaleString()} GHSFIAT
                </p>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="p-8 space-y-8">
          {/* Amount Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center font-bold text-lg">
                1
              </div>
              <h2 className="text-xl font-semibold">Enter Amount</h2>
            </div>
            <div className="relative rounded-xl shadow-sm">
              <input
                type="number"
                id="ghs-amount"
                className="block w-full pl-12 pr-20 py-3 border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                placeholder="Enter amount in GHS"
                value={ghsAmount}
                onChange={(e) => handleGhsAmountChange(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7l4-4m0 0l4 4m-4-4v16m0-16l-.01 0.01M12 4v16"
                  />
                </svg>
              </div>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">GHS</span>
              </div>
            </div>
            {usdtAmount && ( // Display converted USDT amount only if ghsAmount is entered
              <p className="mt-2 text-sm text-gray-600">
                Equivalent to: {usdtAmount} USDT
              </p>
            )}
          </motion.div>

          {/* Select Token */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center font-bold text-lg">
                2
              </div>
              <h2 className="text-xl font-semibold">Select Token</h2>
            </div>
            <div className="space-y-2">
              {stablecoins.map((token) => (
                <motion.div
                  key={token.symbol}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`bg-white rounded-xl p-4 border shadow-sm flex items-center justify-between cursor-pointer ${
                    selectedQuoteToken.symbol === token.symbol
                      ? "border-purple-500"
                      : "border-gray-200"
                  }`}
                  onClick={() => !token.disabled && setSelectedQuoteToken(token)}
                >
                  <div className="flex items-center space-x-3">
                    <Image
                      src={token.icon}
                      width={32}
                      height={32}
                      alt={token.name}
                      className="rounded-full"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{token.name}</p>
                      <p className="text-sm text-gray-500">{token.symbol}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {usdtBalance ? Number(formatUnits(usdtBalance as bigint, 18)).toFixed(2) : "0.00"} {token.symbol}
                    </p>
                    {token.disabled && (
                      <span className="text-xs font-medium text-gray-500">Coming Soon</span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Approve & Send */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-4"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center font-bold text-lg">
                3
              </div>
              <h2 className="text-xl font-semibold">Approve & Send</h2>
            </div>

            <div className="space-y-4">
              {needsApproval ? (
                <motion.button
                  onClick={handleApprove}
                  disabled={transactionStatus === "approving"}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full py-4 rounded-xl font-medium transition-all ${
                    transactionStatus === "approving"
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700"
                  }`}
                >
                  {transactionStatus === "approving" ? (
                    <div className="flex items-center justify-center space-x-2">
                      <ArrowPathIcon className="w-5 h-5 animate-spin" />
                      <span>Approving...</span>
                    </div>
                  ) : (
                    "Approve USDT"
                  )}
                </motion.button>
              ) : (
                <motion.button
                  onClick={handleSendFiat}
                  disabled={
                    transactionStatus === "converting" ||
                    !ghsAmount ||
                    !usdtAmount
                  }
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full py-4 rounded-xl font-medium transition-all ${
                    transactionStatus === "converting" ||
                    !ghsAmount ||
                    !usdtAmount
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700"
                  }`}
                >
                  {transactionStatus === "converting" ? (
                    <div className="flex items-center justify-center space-x-2">
                      <ArrowPathIcon className="w-5 h-5 animate-spin" />
                      <span>Converting...</span>
                    </div>
                  ) : (
                    "Convert to GHS"
                  )}
                </motion.button>
              )}

              <div className="mt-4">
                <TransactionDetails
                  isOpen={showTransactionDetails}
                  onToggle={() => setShowTransactionDetails(!showTransactionDetails)}
                  gasFee={gasFeeEstimate !== "N/A" ? `$${parseFloat(gasFeeEstimate).toFixed(6)}` : "N/A"}
                  merchantFee={merchantFee !== "N/A" ? `$${merchantFee}` : "N/A"}
                  protocolFee={protocolFee !== "N/A" ? `$${protocolFee}` : "N/A"}
                  totalFees={totalFees !== "N/A" ? `$${totalFees}` : "N/A"}
                  estimatedTime={estimatedTime}
                />
              </div>
              {address && (
                <KYCLimitWarning
                  address={address}
                  amount={Number(ghsAmount) || 0}
                />
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
      {showHistory && (
        <TransactionHistory onClose={() => setShowHistory(false)} />
      )}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </>
  );
};

const Transfer = withChainEnforcement(TransferBase);

export default Transfer;
