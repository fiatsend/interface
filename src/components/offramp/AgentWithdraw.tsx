import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { formatUnits, parseUnits } from "viem";
import GHSFIATABI from "@/abis/GHSFIAT.json";
import MomoNFTABI from "@/abis/MomoNFT.json";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult, getAuth } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { motion, AnimatePresence } from "framer-motion";
import { FaMobileAlt, FaExchangeAlt, FaCoins } from "react-icons/fa";

const GHSFIAT_ADDRESS = "0x84Fd74850911d28C4B8A722b6CE8Aa0Df802f08A";
const NFT_CONTRACT_ADDRESS = "0x1731D34B07CA2235E668c7B0941d4BfAB370a2d0";

export const AgentWithdraw = () => {
  const [amount, setAmount] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showDifferentNumber, setShowDifferentNumber] = useState(false);
  const [newMobileNumber, setNewMobileNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const { address } = useAccount();

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
        callback: () => {
          console.log("reCAPTCHA verified!");
        },
      });
    }
  }, []);

  // Check user's GHSFIAT balance
  const { data: balance } = useReadContract({
    address: GHSFIAT_ADDRESS,
    abi: GHSFIATABI.abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });

  // Get user's mobile number from NFT contract
  const { data: userMobileNumber, isLoading: isLoadingMobile } = useReadContract({
    address: NFT_CONTRACT_ADDRESS,
    abi: MomoNFTABI.abi,
    functionName: "getMobileByWallet",
    args: address ? [address] : undefined,
  });

  useEffect(() => {
    if (userMobileNumber) {
      // Remove the country code (+233) if present
      const number = (userMobileNumber as string).replace("+233", "");
      setMobileNumber(number);
    }
  }, [userMobileNumber]);

  const { writeContractAsync: withdraw } = useWriteContract();

  const userBalance = balance ? Number(formatUnits(balance as bigint, 18)) : 0;
  const withdrawAmount = amount ? Number(amount) : 0;
  const hasEnoughBalance = userBalance >= withdrawAmount;

  const validatePhoneNumber = (number: string) => {
    const fullNumber = "+233" + number.replace(/^0+/, "");
    const phoneNumberObj = parsePhoneNumberFromString(fullNumber);
    return phoneNumberObj?.isValid() || false;
  };

  const handleSendOtp = async () => {
    if (!newMobileNumber) {
      toast.error("Please enter a mobile number");
      return;
    }

    if (!validatePhoneNumber(newMobileNumber)) {
      toast.error("Please enter a valid Ghana mobile number");
      return;
    }

    setIsLoading(true);
    try {
      const auth = getAuth();
      const appVerifier = window.recaptchaVerifier;
      const fullNumber = "+233" + newMobileNumber.replace(/^0+/, "");
      
      const result = await signInWithPhoneNumber(auth, fullNumber, appVerifier);
      setConfirmationResult(result);
      setOtpSent(true);
      toast.success("OTP sent successfully!");
    } catch (error) {
      console.error("Failed to send OTP:", error);
      toast.error("Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      toast.error("Please enter the OTP code");
      return;
    }

    if (!confirmationResult) {
      toast.error("Verification process not initialized");
      return;
    }

    setIsLoading(true);
    try {
      const result = await confirmationResult.confirm(otp);
      if (result) {
        toast.success("Number verified successfully!");
        setShowDifferentNumber(false);
        setOtp("");
        setNewMobileNumber("");
        setOtpSent(false);
        setConfirmationResult(null);
      }
    } catch (error) {
      console.error("OTP verification failed:", error);
      toast.error("Invalid OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!amount) {
      toast.error("Please enter an amount");
      return;
    }

    if (!hasEnoughBalance) {
      toast.error("Insufficient balance");
      return;
    }

    setIsLoading(true);
    try {
      const parsedAmount = parseUnits(amount, 18);
      await withdraw({
        address: GHSFIAT_ADDRESS,
        abi: GHSFIATABI.abi,
        functionName: "burn",
        args: [parsedAmount],
      });
      toast.success("Withdrawal request submitted!");
      setAmount("");
    } catch (error) {
      console.error("Withdrawal failed:", error);
      toast.error("Withdrawal failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-md mx-auto">
      {/* Balance Card */}
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 p-3 rounded-xl">
              <FaCoins className="text-purple-600 text-xl" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">Available Balance</h3>
              <p className="text-2xl font-bold text-gray-900">{userBalance.toLocaleString()} GHS</p>
            </div>
          </div>
        </div>
      </div>

      {/* Amount Input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Withdrawal Amount
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <FaExchangeAlt className="text-gray-400 group-focus-within:text-purple-500 transition-colors" />
          </div>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount in GHS"
            className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white"
          />
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
            <span className="text-gray-500 font-medium">GHS</span>
          </div>
        </div>
      </div>

      {/* Withdraw to Different Number Option */}
      <div className="space-y-4">
        <button
          onClick={() => setShowDifferentNumber(!showDifferentNumber)}
          className="w-full flex items-center justify-center space-x-2 text-sm text-purple-600 hover:text-purple-700 font-medium py-2 rounded-lg hover:bg-purple-50 transition-colors"
        >
          <FaMobileAlt />
          <span>{showDifferentNumber ? "Use registered number" : "Withdraw to different number"}</span>
        </button>

        <AnimatePresence>
          {showDifferentNumber && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="space-y-4 bg-gray-50 p-4 rounded-xl">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Mobile Money Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-gray-500">+233</span>
                    </div>
                    <input
                      type="tel"
                      value={newMobileNumber}
                      onChange={(e) => setNewMobileNumber(e.target.value)}
                      placeholder="Enter mobile number"
                      className="w-full pl-12 px-4 py-3 rounded-lg border-2 border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors bg-white"
                    />
                  </div>
                </div>

                {!otpSent ? (
                  <button
                    onClick={handleSendOtp}
                    disabled={isLoading || !newMobileNumber}
                    className="w-full py-3 rounded-lg font-medium bg-purple-100 text-purple-600 hover:bg-purple-200 transition-colors disabled:bg-gray-100 disabled:text-gray-400"
                  >
                    {isLoading ? "Sending..." : "Send OTP"}
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Enter OTP
                      </label>
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="Enter 6-digit OTP"
                        className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors bg-white"
                      />
                    </div>
                    <button
                      onClick={handleVerifyOtp}
                      disabled={isLoading || !otp}
                      className="w-full py-3 rounded-lg font-medium bg-purple-100 text-purple-600 hover:bg-purple-200 transition-colors disabled:bg-gray-100 disabled:text-gray-400"
                    >
                      {isLoading ? "Verifying..." : "Verify OTP"}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Withdraw Button */}
      <button
        onClick={handleWithdraw}
        disabled={isLoading || !hasEnoughBalance}
        className={`w-full py-4 rounded-xl font-medium transition-all ${
          isLoading || !hasEnoughBalance
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        }`}
      >
        {isLoading ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Processing...</span>
          </div>
        ) : (
          "Withdraw to Mobile Money"
        )}
      </button>

      {/* Help Text */}
      <p className="text-xs text-gray-500 text-center">
        Your GHSFIAT will be converted to GHS and sent to your MTN Mobile Money account
      </p>

      {/* reCAPTCHA Container */}
      <div id="recaptcha-container"></div>
    </div>
  );
};
