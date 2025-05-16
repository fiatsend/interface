import { useReadContract } from "wagmi";
import { formatUnits } from "viem";
import FiatSendABI from "@/abis/FiatSend.json";

const FIATSEND_ADDRESS = "0x1D683929B76cA50217C3B9C8CE4CcA9a0454a13d";

// KYC levels and their corresponding limits in USDT
export const KYC_LIMITS = {
  0: 100, // Unverified
  1: 10000, // Basic verification with identity
  2: 500000, // Enhanced verification with higher limits
};

export const KYC_LEVEL_DESCRIPTIONS = {
  0: "Unverified Account",
  1: "Basic Verification",
  2: "Enhanced Verification",
};

export const useKycLimits = (address: `0x${string}` | undefined) => {
  const { data: kycLevel, isLoading: isLoadingKyc } = useReadContract({
    address: FIATSEND_ADDRESS,
    abi: FiatSendABI.abi,
    functionName: "kycLevel",
    args: [address],
  });

  const { data: monthlySpent, isLoading: isLoadingSpent } = useReadContract({
    address: FIATSEND_ADDRESS,
    abi: FiatSendABI.abi,
    functionName: "monthlySpent",
    args: [address],
  });

  const level = kycLevel ? Number(kycLevel) : 0;
  const spent = monthlySpent ? Number(formatUnits(monthlySpent as bigint, 18)) : 0;
  const limit = KYC_LIMITS[level as keyof typeof KYC_LIMITS] || 0;
  const remainingLimit = limit - spent;
  const nextLevel = level + 1;
  const nextLimit = KYC_LIMITS[nextLevel as keyof typeof KYC_LIMITS] || limit;

  const isLoading = isLoadingKyc || isLoadingSpent;
  const isVerified = level > 0;
  const canUpgrade = level < 2;

  return {
    level,
    spent,
    limit,
    remainingLimit,
    nextLevel,
    nextLimit,
    isLoading,
    isVerified,
    canUpgrade,
    levelDescription: KYC_LEVEL_DESCRIPTIONS[level as keyof typeof KYC_LEVEL_DESCRIPTIONS],
    nextLevelDescription: KYC_LEVEL_DESCRIPTIONS[nextLevel as keyof typeof KYC_LEVEL_DESCRIPTIONS],
  };
}; 