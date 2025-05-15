"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { useReadContract, useWriteContract } from "wagmi";
import { formatUnits, parseUnits } from "viem";
import { useAccount } from "wagmi";
import FiatSendABI from "@/abis/FiatSend.json";
import toast from "react-hot-toast";
import GHSFIATABI from "@/abis/GHSFIAT.json";
import withFiatsendNFT from "@/hocs/with-account";
import { withChainEnforcement } from "@/hocs/with-chain-enforcement";

interface Token {
  symbol: string;
  name: string;
  icon: string;
  balance?: string;
  address?: string;
}

interface PriceRange {
  min: number;
  max: number;
}

// Add ERC20 ABI (only the functions we need)
const ERC20_ABI = [
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

interface PoolProps {
  isCorrectChain: boolean;
  handleAction: (action: () => Promise<void>) => Promise<void>;
}

const PoolBase: React.FC<PoolProps> = ({ handleAction }) => {
  const [activeTab, setActiveTab] = useState<"add" | "remove">("add");
  const [isAutomaticRange, setIsAutomaticRange] = useState(true);
  const [currentAllowance, setCurrentAllowance] = useState("");
  const [selectedBaseToken, setSelectedBaseToken] = useState<Token>({
    symbol: "GHSFIAT",
    name: "Ghana Fiat",
    icon: "/images/tokens/ghs.png",
  });
  const { writeContract } = useWriteContract();
  const [selectedQuoteToken, setSelectedQuoteToken] = useState<Token>({
    symbol: "USDT",
    name: "Tether USD",
    icon: "/images/tokens/usdt.png",
    address: "0xAE134a846a92CA8E7803Ca075A1a0EE854Cd6168",
  });
  const [exchangeRate, setExchangeRate] = useState<number>(0);
  const [poolBalance, setPoolBalance] = useState<number>(0);
  const FIATSEND_ADDRESS = "0xb55B7EeCB4F13C15ab545C8C49e752B396aaD0BD";
  const GHSFIAT_ADDRESS = "0x84Fd74850911d28C4B8A722b6CE8Aa0Df802f08A";
  const { address } = useAccount();

  const { data: exRates, error: exRatesError } = useReadContract({
    address: FIATSEND_ADDRESS,
    abi: FiatSendABI.abi,
    functionName: "conversionRate",
  });

  const { data: liquidity, error: liquidityError } = useReadContract({
    address: GHSFIAT_ADDRESS, // GHSFIAT token address
    abi: GHSFIATABI.abi, // ABI for GHSFIAT token
    functionName: "balanceOf",
    args: [FIATSEND_ADDRESS], // Fiatsend contract address
  });

  const { data: allowance, error: AllowanceError } = useReadContract({
    address: GHSFIAT_ADDRESS, // GHSFIAT token address
    abi: GHSFIATABI.abi, // ABI for GHSFIAT token
    functionName: "allowance",
    args: [address, FIATSEND_ADDRESS],
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

        if (allowance) {
          setCurrentAllowance(formatUnits(allowance as bigint, 0));
        } else if (AllowanceError) {
          toast.error("Error fetching allowances");
        }

        if (liquidity) {
          const formattedReserves = formatUnits(liquidity as bigint, 18); // Assuming GHSFIAT has 18 decimals
          setPoolBalance(Number(formattedReserves));
        } else if (liquidityError) {
          toast.error("Error fetching reserves");
        }
      } catch (err) {
        toast.error("Could not fetch data");
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, [
    exRates,
    exRatesError,
    liquidity,
    liquidityError,
    allowance,
    AllowanceError,
  ]);

  const [priceRange, setPriceRange] = useState<PriceRange>({
    min: exchangeRate - 0.5,
    max: exchangeRate + 0.5,
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const defaultRange = 0.5;
  const extendedRange = 2;
  const [amount, setAmount] = useState<string>("");

  const stablecoins: Token[] = [
    {
      symbol: "USDT",
      name: "Tether USD",
      icon: "/images/tokens/usdt.png",
      address: "0xAE134a846a92CA8E7803Ca075A1a0EE854Cd6168",
    },
    // {
    //   symbol: "USDC",
    //   name: "USD Coin",
    //   icon: "/images/tokens/usdc.png",
    //   address: "0x...", // Add USDC address
    // },
    // {
    //   symbol: "DAI",
    //   name: "Dai Stablecoin",
    //   icon: "/images/tokens/dai.png",
    //   address: "0x...", // Add DAI address
    // },
  ];

  // Read GHSFIAT balance
  const { data: ghsfiatBalance } = useReadContract({
    address: "0x84Fd74850911d28C4B8A722b6CE8Aa0Df802f08A",
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address as `0x${string}`] : undefined,
  });

  const formattedBalance = ghsfiatBalance
    ? Number(formatUnits(ghsfiatBalance, 18)).toFixed(2)
    : "0.00";

  const handleMaxClick = () => {
    setAmount(formattedBalance);
  };

  // Update price range when current rate changes
  useEffect(() => {
    if (isAutomaticRange) {
      setPriceRange({
        min: Number((exchangeRate - defaultRange).toFixed(2)),
        max: Number((exchangeRate + defaultRange).toFixed(2)),
      });
    }
  }, [exchangeRate, isAutomaticRange]);

  const handleRangeChange = (value: number | number[]) => {
    if (Array.isArray(value)) {
      setPriceRange({
        min: Number(value[0].toFixed(2)),
        max: Number(value[1].toFixed(2)),
      });
    }
  };

  const handleApproveAllowance = async () => {
    await handleAction(async () => {
      try {
        await writeContract({
          address: GHSFIAT_ADDRESS,
          abi: GHSFIATABI.abi,
          functionName: "approve",
          args: [FIATSEND_ADDRESS, parseUnits(amount, 18)],
        });
      } catch (error: any) {
        handleTransactionError(error);
      }
    });
  };

  const handleAddLiquidity = async () => {
    if (!amount || isNaN(Number(amount))) {
      toast.error("Please enter a valid amount");
      return;
    }

    await handleAction(async () => {
      const toastId = toast.loading("Approving GHSFIAT...");
      const parsedGHSFIATAmount = parseUnits(amount, 18);

      try {
        // Proceed with the transaction
        await writeContract({
          address: FIATSEND_ADDRESS,
          abi: FiatSendABI.abi,
          functionName: "supplyGHSFIAT",
          args: [parsedGHSFIATAmount],
        });
      } catch (error: any) {
        handleTransactionError(error, toastId);
      }
    });
  };

  const handleTransactionError = (error: any, toastId: string) => {
    if (error.message?.includes("user rejected")) {
      toast.error("Transaction cancelled by user", { id: toastId });
    } else if (error.message?.includes("insufficient funds")) {
      toast.error("Insufficient funds for transaction", { id: toastId });
    } else {
      toast.error("Transaction failed. Please try again", { id: toastId });
    }
  };

  const toggleAutomaticRange = () => {
    setIsAutomaticRange(!isAutomaticRange);
    if (!isAutomaticRange) {
      // Reset to default range when switching to automatic
      setPriceRange({
        min: exchangeRate - 0.5,
        max: exchangeRate + 0.5,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Liquidity Pools</h1>
          <p className="text-gray-600 mt-2">
            Provide single-sided liquidity and earn fees from trades
          </p>
        </div>

        {/* Main Pool Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          {/* Tab Navigation */}
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setActiveTab("add")}
              className={`px-4 py-2 rounded-lg font-medium ${
                activeTab === "add"
                  ? "bg-indigo-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Add Liquidity
            </button>
            <button
              disabled
              onClick={() => setActiveTab("remove")}
              className={`px-4 py-2 rounded-lg font-medium ${
                activeTab === "remove"
                  ? "bg-indigo-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Remove Liquidity
            </button>
          </div>

          {/* Token Pair Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Pair
            </label>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="flex items-center p-3 rounded-lg border border-gray-200">
                  <Image
                    src={selectedBaseToken.icon}
                    alt={selectedBaseToken.name}
                    width={24}
                    height={24}
                    className="mr-2"
                  />
                  <span className="font-medium">
                    {selectedBaseToken.symbol}
                  </span>
                </div>
              </div>
              <span className="text-gray-500">/</span>
              <div className="flex-1 relative">
                <div
                  className="w-full p-3 rounded-lg border border-gray-200 cursor-pointer hover:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Image
                        src={selectedQuoteToken.icon}
                        alt={selectedQuoteToken.name}
                        width={24}
                        height={24}
                        className="mr-2"
                      />
                      <span className="font-medium">
                        {selectedQuoteToken.symbol}
                      </span>
                    </div>
                    <svg
                      className={`w-5 h-5 transition-transform ${
                        isDropdownOpen ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                    {stablecoins.map((token) => (
                      <div
                        key={token.symbol}
                        className={`flex items-center p-3 hover:bg-gray-50 cursor-pointer ${
                          selectedQuoteToken.symbol === token.symbol
                            ? "bg-indigo-50"
                            : ""
                        }`}
                        onClick={() => {
                          setSelectedQuoteToken(token);
                          setIsDropdownOpen(false);
                        }}
                      >
                        <Image
                          src={token.icon}
                          alt={token.name}
                          width={24}
                          height={24}
                          className="mr-2"
                        />
                        <span className="font-medium">{token.symbol}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Price Range Section */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Price Range
              </label>
              <div className="flex items-center">
                <span className="text-sm text-gray-500 mr-2">Automatic</span>
                <button
                  onClick={toggleAutomaticRange}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isAutomaticRange ? "bg-indigo-600" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isAutomaticRange ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>

            <div
              className={
                isAutomaticRange ? "opacity-50 pointer-events-none" : ""
              }
            >
              <div className="mb-4">
                <Slider
                  range
                  min={exchangeRate - extendedRange}
                  max={exchangeRate + extendedRange}
                  value={[priceRange.min, priceRange.max]}
                  onChange={handleRangeChange}
                  disabled={isAutomaticRange}
                  step={0.01} // Allow 2 decimal places
                />
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <div>
                  Min: {priceRange.min.toFixed(2)} {selectedQuoteToken.symbol}
                  /GHS
                </div>
                <div>Current: {exchangeRate.toFixed(2)}</div>
                <div>
                  Max: {priceRange.max.toFixed(2)} {selectedQuoteToken.symbol}
                  /GHS
                </div>
              </div>
            </div>
          </div>

          {/* Pool Information */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Image
                    src={selectedBaseToken.icon}
                    alt={selectedBaseToken.name}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {selectedBaseToken.symbol} Pool
                  </h3>
                  <p className="text-sm text-gray-500">
                    Single-sided liquidity
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">APR</p>
                <p className="font-semibold text-green-600">12.45%</p>
              </div>
            </div>
          </div>

          {/* Input Section */}
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Amount</span>
                <span className="text-sm text-gray-500">
                  Balance: {formattedBalance} {selectedBaseToken.symbol}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <input
                    type="number"
                    placeholder="0.0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-transparent text-2xl font-medium focus:outline-none pr-16"
                  />
                  <button
                    onClick={handleMaxClick}
                    className="absolute right-0 top-1/2 -translate-y-1/2 px-3 py-1 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg"
                  >
                    MAX
                  </button>
                </div>
                <div className="flex items-center justify-end sm:justify-start space-x-2 bg-white rounded-lg px-3 py-2">
                  <Image
                    src={selectedBaseToken.icon}
                    alt={selectedBaseToken.name}
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                  <span className="font-medium">
                    {selectedBaseToken.symbol}
                  </span>
                </div>
              </div>
            </div>

            {/* {Number(currentAllowance) < parseUnits(amount, 18) && (
              <button
                onClick={handleApproveAllowance}
                className="w-full bg-green-600 text-white py-4 rounded-xl font-medium"
              >
                {"Set Allowance"}
              </button>
            )} */}

            {/* Action Button */}
            {/* <button
              onClick={handleAddLiquidity}
              disabled={!amount || formattedBalance < amount}
              className="w-full bg-indigo-600 text-white py-4 rounded-xl font-medium"
            >
              {Number(formattedBalance) < Number(amount)
                ? "Insufficient Balance"
                : "Add Liquidity"}
            </button> */}
            <button
              onClick={handleAddLiquidity}
              disabled
              className="w-full bg-indigo-600 text-white py-4 rounded-xl font-medium opacity-50"
            >
              Unavailable
            </button>

            {/* Pool Stats */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Pool Liquidity</span>
                <span className="font-medium">{poolBalance} GHSFIAT</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Your Pool Share</span>
                <span className="font-medium">0%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Current Price</span>
                <span className="font-medium">
                  {exchangeRate} GHSFIAT = 1.00 USDT
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Pool = withChainEnforcement(PoolBase);
