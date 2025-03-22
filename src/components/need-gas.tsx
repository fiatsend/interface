import Link from "next/link";
import React, { useState } from "react";
import { useAccount } from "wagmi";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";

const NeedGas: React.FC = () => {
  const [isRequesting, setIsRequesting] = useState(false);
  const { address } = useAccount();
  const [walletAddress, setWalletAddress] = useState(address);

  const handleRequestGas = () => {
    const tweetText = `I am requesting extra 0.002 ETH on @fiatsend offramp.fiatsend.com on @LiskHQ Sepolia chain. My address: ${address}`;
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      tweetText
    )}`;
    window.open(tweetUrl, "_blank");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (inputValue.startsWith("0x") || inputValue === "") {
      setWalletAddress(inputValue as `0x${string}` | undefined);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Need More Gas?</h2>
          <p className="text-sm text-gray-600 mt-1">
            Get testnet ETH to pay for transaction fees
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {/* Bridge Option */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 sm:p-6 border border-blue-100">
          <div className="flex items-start justify-between mb-3 sm:mb-4">
            <div>
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                Bridge ETH
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">
                Bridge ETH from Lisk mainnet
              </p>
            </div>
            <ArrowTopRightOnSquareIcon className="w-5 h-5 text-blue-500" />
          </div>
          <Link
            href="https://sepolia-bridge.lisk.com/bridge/lisk-sepolia-testnet"
            target="_blank"
            className="w-full inline-flex items-center justify-center px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Bridge Now
          </Link>
        </div>

        {/* Request Option */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900">Request ETH</h3>
              <p className="text-sm text-gray-600 mt-1">
                Request testnet ETH via Twitter
              </p>
            </div>
            <svg
              className="w-5 h-5 text-purple-500"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
            </svg>
          </div>
          <button
            onClick={() => setIsRequesting(!isRequesting)}
            className="w-full px-4 py-2.5 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
          >
            Request Extra ETH
          </button>
        </div>
      </div>

      {/* Request Form */}
      {isRequesting && (
        <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 space-y-3 sm:space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Request Details</h3>
            <button
              onClick={() => setIsRequesting(false)}
              className="text-gray-400 hover:text-gray-500"
            >
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          <div className="space-y-2">
            <label className="block text-xs sm:text-sm font-medium text-gray-700">
              Wallet Address
            </label>
            <input
              type="text"
              value={walletAddress}
              onChange={handleInputChange}
              placeholder="Enter your address (0x...)"
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:ring-purple-500 transition-colors"
            />
          </div>

          <button
            onClick={handleRequestGas}
            disabled={!address}
            className={`w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              address
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            Tweet Request
          </button>
        </div>
      )}
    </div>
  );
};

export default NeedGas;
