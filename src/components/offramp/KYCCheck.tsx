import React from "react";
import { useReadContract } from "wagmi";
import FiatSendABI from "@/abis/FiatSend.json";
import { formatUnits } from "viem";

interface KYCCheckProps {
  address: `0x${string}`;
  amount: string;
  onKYCStatus: (isVerified: boolean, limit: number) => void;
}

const FIATSEND_ADDRESS = "0x1731D34B07CA2235E668c7B0941d4BfAB370a2d0";

// KYC levels and their corresponding limits in USDT
const KYC_LIMITS = {
  0: 0, // No KYC
  1: 100, // Level 1: $100
  2: 1000, // Level 2: $1,000
  3: 10000, // Level 3: $10,000
  4: 100000, // Level 4: $100,000
};

export const KYCCheck: React.FC<KYCCheckProps> = ({
  address,
  amount,
  onKYCStatus,
}) => {
  // Read KYC level from contract
  const { data: kycLevel } = useReadContract({
    address: FIATSEND_ADDRESS,
    abi: FiatSendABI.abi,
    functionName: "kycLevel",
    args: [address],
  });

  // Read monthly spent amount
  const { data: monthlySpent } = useReadContract({
    address: FIATSEND_ADDRESS,
    abi: FiatSendABI.abi,
    functionName: "monthlySpent",
    args: [address],
  });

  React.useEffect(() => {
    if (!kycLevel || !monthlySpent) return;

    const level = Number(kycLevel);
    const spent = Number(formatUnits(monthlySpent as bigint, 6));
    const limit = KYC_LIMITS[level as keyof typeof KYC_LIMITS] || 0;
    const remainingLimit = limit - spent;
    const amountNum = Number(amount);

    // Check if user has KYC and if amount is within limits
    const isVerified = level > 0 && amountNum <= remainingLimit;

    onKYCStatus(isVerified, remainingLimit);
  }, [kycLevel, monthlySpent, amount, onKYCStatus]);

  if (!kycLevel) return null;

  const level = Number(kycLevel);
  const limit = KYC_LIMITS[level as keyof typeof KYC_LIMITS] || 0;

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-900">KYC Status</h3>
          <p className="text-sm text-gray-500">
            Level {level} - Limit: ${limit.toLocaleString()} USDT
          </p>
        </div>
        <div
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            level > 0
              ? "bg-green-100 text-green-600"
              : "bg-yellow-100 text-yellow-600"
          }`}
        >
          {level > 0 ? "Verified" : "Not Verified"}
        </div>
      </div>
    </div>
  );
}; 