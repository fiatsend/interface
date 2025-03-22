import {
  useWriteContract,
  useReadContract,
  useWatchContractEvent,
} from "wagmi";
import { Address, Abi } from "viem";
import TokenFaucetABI from "@/abis/TokenFaucet.json";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { toast } from "react-hot-toast";
import { usePrivy } from "@privy-io/react-auth";

const FAUCET_CONTRACT_ADDRESS =
  "0x811468d8b88a8eee5C396B2A2Cb3b4Aa06295Bc8" as Address;

const COOLDOWN_TIME = 86400; // 24 hours in seconds

export function useTokenFaucet() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [formattedTime, setFormattedTime] = useState<string>("");
  const { user } = usePrivy();

  const address = user?.wallet?.address;

  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    }
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };

  // Read last request timestamp
  const { data: lastRequestTime } = useReadContract({
    address: FAUCET_CONTRACT_ADDRESS,
    abi: TokenFaucetABI.abi as Abi,
    functionName: "lastRequestTime",
    args: [address],
  });

  useEffect(() => {
    const updateTimeRemaining = () => {
      if (!lastRequestTime) return;

      const lastRequest = Number(lastRequestTime) * 1000;
      const cooldown = COOLDOWN_TIME * 1000;
      const now = Date.now();
      const nextRequestTime = lastRequest + cooldown;
      const remaining = nextRequestTime - now;

      const newTimeRemaining = remaining > 0 ? remaining : 0;
      setTimeRemaining(newTimeRemaining);
      setFormattedTime(formatTime(newTimeRemaining));
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [lastRequestTime]);

  const { writeContract, isPending, error } = useWriteContract();

  const claimTokens = async () => {
    try {
      await writeContract({
        address: FAUCET_CONTRACT_ADDRESS,
        abi: TokenFaucetABI.abi as Abi,
        functionName: "requestTokens",
      });
    } catch (err) {
      console.error("Failed to claim tokens:", err);
      toast.error("Failed to claim tokens. Please try again.");
    }
  };

  // Watch for successful claims
  useWatchContractEvent({
    address: FAUCET_CONTRACT_ADDRESS,
    abi: TokenFaucetABI.abi as Abi,
    eventName: "TokensRequested",
    onLogs() {
      setIsSuccess(true);
      toast.success("Tokens claimed successfully!");
      setTimeout(() => setIsSuccess(false), 5000);
    },
  });

  return {
    claimTokens,
    isClaimLoading: isPending,
    claimError: error,
    isSuccess,
    canClaim: timeRemaining === 0 || timeRemaining === null,
    timeRemaining,
    formattedTime,
  };
}
