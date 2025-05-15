import React, { useState } from "react";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { toast } from "react-hot-toast";
import { useCheckNFTByMobile } from "@/utils/helpers/num-check";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { formatUnits, parseUnits } from "viem";
import GHSFIATABI from "@/abis/GHSFIAT.json";
import MomoNFTABI from "@/abis/MomoNFT.json";
import { withChainEnforcement } from "@/hocs/with-chain-enforcement";

const GHSFIAT_ADDRESS = "0x84Fd74850911d28C4B8A722b6CE8Aa0Df802f08A";
const NFT_CONTRACT_ADDRESS = "0x063EC4E9d7C55A572d3f24d600e1970df75e84cA";
const MAX_TRANSFER_AMOUNT = 25000;

interface NFTTransferProps {
  isCorrectChain: boolean;
  handleAction: (action: () => Promise<void>) => Promise<void>;
}

const NFTTransferBase: React.FC<NFTTransferProps> = ({ isCorrectChain, handleAction }) => {
  const [recipientNumber, setRecipientNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { address } = useAccount();

  // Check if recipient has Fiatsend NFT
  const hasNFT = useCheckNFTByMobile(recipientNumber);

  // Get recipient's wallet address
  const { data: recipientAddress } = useReadContract({
    address: NFT_CONTRACT_ADDRESS,
    abi: MomoNFTABI.abi,
    functionName: "getWalletByMobile",
    args: [recipientNumber],
  });

  // Check user's GHSFIAT balance
  const { data: balance } = useReadContract({
    address: GHSFIAT_ADDRESS,
    abi: GHSFIATABI.abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });

  const { writeContractAsync: transfer } = useWriteContract();

  const userBalance = balance ? Number(formatUnits(balance as bigint, 18)) : 0;
  const transferAmount = amount ? Number(amount) : 0;
  const hasEnoughBalance = userBalance >= transferAmount;
  const isWithinLimit = transferAmount <= MAX_TRANSFER_AMOUNT;
  const isSelfTransfer = address?.toLowerCase() === (recipientAddress as string)?.toLowerCase();

  const validatePhoneNumber = (number: string) => {
    const phoneNumberObj = parsePhoneNumberFromString(number);
    return phoneNumberObj?.isValid() || false;
  };

  const handleTransfer = async () => {
    if (!recipientNumber || !amount) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!validatePhoneNumber(recipientNumber)) {
      toast.error("Please enter a valid phone number");
      return;
    }

    if (!hasNFT) {
      toast.error("Recipient does not have a Fiatsend Account");
      return;
    }

    if (!hasEnoughBalance) {
      toast.error("Insufficient balance");
      return;
    }

    if (!isWithinLimit) {
      toast.error(`Maximum transfer amount is ${MAX_TRANSFER_AMOUNT.toLocaleString()} GHS`);
      return;
    }

    if (isSelfTransfer) {
      toast.error("Cannot transfer to your own account");
      return;
    }

    setShowConfirmation(true);
  };

  const confirmTransfer = async () => {
    if (!recipientAddress) {
      toast.error("Could not resolve recipient address");
      return;
    }

    await handleAction(async () => {
      setIsLoading(true);
      try {
        const parsedAmount = parseUnits(amount, 18);
        await transfer({
          address: GHSFIAT_ADDRESS,
          abi: GHSFIATABI.abi,
          functionName: "transfer",
          args: [recipientAddress, parsedAmount],
        });
        toast.success("Transfer successful!");
        setShowConfirmation(false);
        setAmount("");
        setRecipientNumber("");
      } catch (error) {
        console.error("Transfer failed:", error);
        toast.error("Transfer failed. Please try again.");
      } finally {
        setIsLoading(false);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Amount Input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Amount
        </label>
        <div>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount in GHS"
            className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
          />
          <div className="flex justify-between mt-1">
            <span className="text-gray-500">GHS</span>
            <span className="text-sm text-gray-500">
              Balance: {userBalance.toLocaleString()} GHS
            </span>
          </div>
        </div>
        {amount && (
          <div className="mt-1">
            {!hasEnoughBalance && (
              <p className="text-sm text-red-600">Insufficient balance</p>
            )}
            {!isWithinLimit && (
              <p className="text-sm text-red-600">
                Maximum transfer amount is {MAX_TRANSFER_AMOUNT.toLocaleString()} GHS
              </p>
            )}
          </div>
        )}
      </div>

      {/* Recipient Input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Recipient Number
        </label>
        <div className="relative">
          <input
            type="tel"
            value={recipientNumber}
            onChange={(e) => setRecipientNumber(e.target.value)}
            placeholder="Enter recipient's phone number"
            className={`w-full px-4 py-3 rounded-lg border-2 transition-colors ${
              recipientNumber && !validatePhoneNumber(recipientNumber)
                ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                : "border-gray-200 focus:border-purple-500 focus:ring-purple-500"
            }`}
          />
        </div>
        {recipientNumber && (
          <div className="mt-1">
            {!validatePhoneNumber(recipientNumber) && (
              <p className="text-sm text-red-600">Please enter a valid phone number</p>
            )}
            {validatePhoneNumber(recipientNumber) && (
              <>
                <p className={`text-sm ${hasNFT ? "text-green-600" : "text-red-600"}`}>
                  {hasNFT ? "✓ Valid Fiatsend Account" : "✗ No Fiatsend Account found"}
                </p>
                {isSelfTransfer && (
                  <p className="text-sm text-red-600">Cannot transfer to your own account</p>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Transfer Button */}
      <button
        onClick={handleTransfer}
        disabled={
          isLoading ||
          !hasNFT ||
          !validatePhoneNumber(recipientNumber) ||
          !hasEnoughBalance ||
          !isWithinLimit ||
          isSelfTransfer
        }
        className={`w-full py-3 rounded-xl font-medium transition-all ${
          isLoading ||
          !hasNFT ||
          !validatePhoneNumber(recipientNumber) ||
          !hasEnoughBalance ||
          !isWithinLimit ||
          isSelfTransfer
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700"
        }`}
      >
        {isLoading ? "Processing..." : "Transfer"}
      </button>

      {/* Help Text */}
      <p className="text-xs text-gray-500 text-center">
        You can only transfer to phone numbers with a Fiatsend Account
      </p>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-lg font-semibold">Confirm Transfer</h3>
            <div className="space-y-2">
              <p className="text-gray-600">
                You are about to transfer{" "}
                <span className="font-semibold">{Number(amount).toLocaleString()} GHS</span>
              </p>
              <p className="text-gray-600">
                To: <span className="font-semibold">{recipientNumber}</span>
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowConfirmation(false)}
                className="flex-1 py-2 rounded-lg border-2 border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmTransfer}
                disabled={isLoading}
                className="flex-1 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50"
              >
                {isLoading ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default withChainEnforcement(NFTTransferBase);
