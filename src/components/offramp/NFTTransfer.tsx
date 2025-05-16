import React, { useState } from "react";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { toast } from "react-hot-toast";
import { useCheckNFTByMobile } from "@/utils/helpers/num-check";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { formatUnits, parseUnits } from "viem";
import GHSFIATABI from "@/abis/GHSFIAT.json";
import MomoNFTABI from "@/abis/MomoNFT.json";
import { withChainEnforcement } from "@/hocs/with-chain-enforcement";
import Image from "next/image";
import { Country } from "@/components/onboarding/CountrySelection";

const GHSFIAT_ADDRESS = "0x84Fd74850911d28C4B8A722b6CE8Aa0Df802f08A";
const NFT_CONTRACT_ADDRESS = "0x063EC4E9d7C55A572d3f24d600e1970df75e84cA";
const MAX_TRANSFER_AMOUNT = 25000;

interface NFTTransferProps {
  isCorrectChain: boolean;
  handleAction: (action: () => Promise<void>) => Promise<void>;
}

const NFTTransferBase: React.FC<NFTTransferProps> = ({ isCorrectChain, handleAction }) => {
  const [recipientNumber, setRecipientNumber] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<Country | null>({
    code: "+233",
    name: "Ghana",
    flag: "/images/flags/ghana.png"
  });
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const { address } = useAccount();

  const countries: Country[] = [
    { code: "+233", name: "Ghana", flag: "/images/flags/ghana.png" },
    { code: "+254", name: "Kenya", flag: "/images/flags/kenya.png" },
    { code: "+255", name: "Tanzania", flag: "/images/flags/tanzania.png" },
    { code: "+256", name: "Uganda", flag: "/images/flags/uganda.png" },
  ];

  // Check if recipient has Fiatsend NFT
  const fullNumber = selectedCountry ? `${selectedCountry.code}${recipientNumber.replace(/^0+/, "")}` : recipientNumber;
  const hasNFT = useCheckNFTByMobile(fullNumber);

  // Get recipient's wallet address
  const { data: recipientAddress } = useReadContract({
    address: NFT_CONTRACT_ADDRESS,
    abi: MomoNFTABI.abi,
    functionName: "getWalletByMobile",
    args: [fullNumber],
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
    if (!selectedCountry) return false;
    const fullNumber = selectedCountry.code + number.replace(/^0+/, "");
    const phoneNumberObj = parsePhoneNumberFromString(fullNumber);
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
          {/* Country Selector */}
          <div className="relative mb-2">
            <button
              onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
              className="flex items-center justify-between w-full p-3 border rounded-lg bg-white shadow-sm hover:border-purple-500 transition-colors"
            >
              <div className="flex items-center">
                {selectedCountry && (
                  <>
                    <Image
                      width={25}
                      height={25}
                      src={selectedCountry.flag}
                      alt={selectedCountry.name}
                      className="w-6 h-6 mr-2"
                    />
                    <span className="text-gray-700">
                      {selectedCountry.name} ({selectedCountry.code})
                    </span>
                  </>
                )}
              </div>
              <svg
                className={`w-5 h-5 text-gray-400 transition-transform ${
                  isCountryDropdownOpen ? "transform rotate-180" : ""
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
            </button>
            {isCountryDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg">
                {countries.map((country) => (
                  <button
                    key={country.code}
                    onClick={() => {
                      setSelectedCountry(country);
                      setIsCountryDropdownOpen(false);
                    }}
                    className="flex items-center w-full p-3 hover:bg-gray-50"
                  >
                    <Image
                      width={25}
                      height={25}
                      src={country.flag}
                      alt={country.name}
                      className="w-6 h-6 mr-2"
                    />
                    <span className="text-gray-700">
                      {country.name} ({country.code})
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Phone Number Input */}
          <div className="relative">
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
                  d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </div>
            <input
              type="tel"
              value={recipientNumber}
              onChange={(e) => setRecipientNumber(e.target.value)}
              placeholder="Enter recipient's phone number"
              className={`w-full pl-10 pr-4 py-3 rounded-lg border-2 transition-colors ${
                recipientNumber && !validatePhoneNumber(recipientNumber)
                  ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                  : "border-gray-200 focus:border-purple-500 focus:ring-purple-500"
              }`}
            />
          </div>
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
                To: <span className="font-semibold">{fullNumber}</span>
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
