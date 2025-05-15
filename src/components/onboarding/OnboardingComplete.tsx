import Image from "next/image";
import React, { useEffect, useState } from "react";
import MomoNFTABI from "@/abis/MomoNFT.json"; // Import your NFT contract ABI
import { toast } from "react-hot-toast";
import FlipCard, { BackCard, FrontCard } from "../nft/flipcard";
import {
  useAccount,
  useWriteContract,
  useSimulateContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { withChainEnforcement } from "@/hocs/with-chain-enforcement";

interface OnboardingCompleteProps {
  onContinue: () => void;
  mobileNumber: string;
  isCorrectChain: boolean;
  handleAction: (action: () => Promise<void>) => Promise<void>;
}

const NFTContract = "0x063EC4E9d7C55A572d3f24d600e1970df75e84cA";

const OnboardingCompleteBase: React.FC<OnboardingCompleteProps> = ({
  onContinue,
  mobileNumber,
  handleAction,
}) => {
  // const [nftMinted, setNftMinted] = useState(false);
  const { address } = useAccount();

  // const simulatedResult = useSimulateContract({
  //   address: NFTContract,
  //   abi: MomoNFTABI.abi,
  //   functionName: "registerMobile",
  // });

  const {
    data: mintData,
    writeContract: mint,
    isPending: isMintLoading,
    isSuccess: isMintStarted,
    error: mintError,
  } = useWriteContract();

  const {
    data: txData,
    isSuccess: txSuccess,
    error: txError,
  } = useWaitForTransactionReceipt({
    hash: mintData,
  });

  const isMinted = txSuccess;

  const handleMintNFT = async () => {
    if (!address) {
      toast.error("Please connect your wallet to mint");
      return;
    }

    await handleAction(async () => {
      try {
        await mint({
          address: NFTContract,
          abi: MomoNFTABI.abi,
          functionName: "registerMobile",
          args: [
            mobileNumber,
            "https://teal-improved-leech-539.mypinata.cloud/ipfs/bafybeicgeixpawvoztmgdcgyidadg74bxz3nyr4fiiz6cmkh3e7qbxjlkq",
          ],
        });
      } catch (error: any) {
        handleError(error);
      }
    });
  };

  useEffect(() => {
    if (isMintStarted) {
      toast.loading("Minting your NFT...", { id: "mint" });
    }
  }, [isMintStarted]);

  useEffect(() => {
    if (txSuccess) {
      toast.success("NFT minted successfully!", { id: "mint" });
    }
  }, [txSuccess]);

  useEffect(() => {
    if (mintError || txError) {
      handleError(mintError || txError);
    }
  }, [mintError, txError]);

  const handleError = (error: any) => {
    if (error?.message?.includes("user rejected")) {
      toast.error("Transaction cancelled", { id: "mint" });
    } else if (error?.message?.includes("insufficient funds")) {
      toast.error("Insufficient funds for transaction", { id: "mint" });
    } else {
      toast.error("Failed to mint NFT. Please try again", { id: "mint" });
    }
    console.error("Minting error:", error);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
          {isMinted ? "Setup Complete!" : "One Last Step"}
        </h1>
        <p className="text-sm text-gray-600">
          {isMinted
            ? "Your Fiatsend Account NFT has been created"
            : "Mint your Account NFT to start using Fiatsend"}
        </p>
      </div>

      {/* NFT Card */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 blur-3xl" />
        <div className="relative bg-white rounded-2xl p-6 border border-gray-200 shadow-xl">
          <FlipCard>
            <FrontCard isCardFlipped={isMinted}>
              <div className="relative w-full pb-[100%] rounded-xl overflow-hidden bg-gradient-to-br from-purple-50 to-indigo-50">
                <div className="absolute inset-0 flex items-center justify-center p-8">
                  <Image
                    src="/images/mobile-NFT.webp"
                    alt="Fiatsend NFT"
                    fill
                    className="object-contain hover:scale-105 transition-transform duration-500"
                    style={{
                      filter: "drop-shadow(0 0 30px rgba(168, 85, 247, 0.2))",
                    }}
                    priority
                  />
                </div>
              </div>
            </FrontCard>

            <BackCard isCardFlipped={isMinted}>
              <div className="p-6 text-center bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl">
                <div className="relative w-32 h-32 mx-auto mb-6">
                  <Image
                    src="/images/mobile-NFT.webp"
                    alt="Fiatsend NFT"
                    fill
                    className="object-contain"
                    style={{
                      filter: "drop-shadow(0 0 20px rgba(168, 85, 247, 0.2))",
                    }}
                  />
                </div>
                <h2 className="text-xl font-bold mb-2 text-gray-900">
                  NFT Minted Successfully!
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                  Your NFT will appear in your wallet shortly
                </p>
                <div className="space-y-3">
                  <a
                    href={`https://sepolia-blockscout.lisk.com/tx/${mintData}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-purple-600 hover:text-purple-500 transition-colors"
                  >
                    View on Blockscout →
                  </a>
                  <a
                    href={`https://rarible.com/token/lisk-sepolia/${NFTContract}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-purple-600 hover:text-purple-500 transition-colors"
                  >
                    View on Rarible →
                  </a>
                </div>
              </div>
            </BackCard>
          </FlipCard>

          {!isMinted && (
            <button
              onClick={handleMintNFT}
              disabled={!mint || isMintLoading || isMintStarted}
              className={`w-full py-4 mt-6 rounded-xl font-medium text-sm transition-all ${
                isMintLoading || isMintStarted
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700"
              }`}
            >
              {isMintLoading
                ? "Waiting for approval..."
                : isMintStarted
                ? "Minting..."
                : "Mint Account NFT"}
            </button>
          )}
        </div>
      </div>

      {/* Account Benefits */}
      {isMinted && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-100">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center">
                  <span className="text-lg text-white">✓</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Account Ready</h3>
                  <p className="text-sm text-gray-600">
                    Start sending and converting with ease
                  </p>
                </div>
              </div>

              <div className="space-y-3 mt-4">
                <div className="flex items-center space-x-2 text-sm text-gray-700">
                  <span className="text-purple-600">•</span>
                  <span>Send up to 5000.00 GHS for free monthly</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-700">
                  <span className="text-purple-600">•</span>
                  <span>Send 1000.00 GHS now without KYC verification</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-700">
                  <span className="text-purple-600">•</span>
                  <span>Verify your account to enjoy full benefits</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={onContinue}
            className="w-full py-4 rounded-xl font-medium text-sm bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 transition-all"
          >
            Continue to Dashboard
          </button>
        </div>
      )}
    </div>
  );
};

export const OnboardingComplete = withChainEnforcement(OnboardingCompleteBase);
