import React, { useState } from "react";
import { useAccount, useContractRead } from "wagmi";
import { toast } from "react-hot-toast";
import MomoNFTABI from "@/abis/MomoNFT.json";

const NFTContract = "0x063EC4E9d7C55A572d3f24d600e1970df75e84cA";

export const NFTTransfer = () => {
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { address } = useAccount();

  // Check if recipient has Fiatsend NFT
  const { data: hasNFT } = useContractRead({
    address: NFTContract,
    abi: MomoNFTABI.abi,
    functionName: "balanceOf",
    args: [recipientAddress || "0x"],
  });

  const handleTransfer = async () => {
    if (!recipientAddress || !amount) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!hasNFT) {
      toast.error("Recipient does not have a Fiatsend Account");
      return;
    }

    setIsLoading(true);
    try {
      // Implement transfer logic here
      toast.success("Transfer successful!");
    } catch (error) {
      console.error("Transfer failed:", error);
      toast.error("Transfer failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
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
          <span className="text-gray-500 ml-2">GHS</span>
        </div>
      </div>

      {/* Recipient Input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Recipient Address
        </label>
        <div className="relative">
          <input
            type="text"
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
            placeholder="Enter wallet address or ENS name"
            className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
          />
        </div>
        {recipientAddress && recipientAddress.length === 42 && (
          <p
            className={`text-sm ${
              hasNFT ? "text-green-600" : "text-red-600"
            } mt-1`}
          >
            {hasNFT
              ? "✓ Valid Fiatsend Account"
              : "✗ No Fiatsend Account found"}
          </p>
        )}
      </div>

      {/* Transfer Button */}
      <button
        onClick={handleTransfer}
        disabled={isLoading || !hasNFT}
        className={`w-full py-3 rounded-xl font-medium transition-all ${
          isLoading || !hasNFT
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700"
        }`}
      >
        {isLoading ? "Processing..." : "Transfer"}
      </button>

      {/* Help Text */}
      <p className="text-xs text-gray-500 text-center">
        You can only transfer to wallets with a Fiatsend Account
      </p>
    </div>
  );
};
