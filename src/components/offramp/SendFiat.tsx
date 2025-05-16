import React, { useState, useEffect } from "react";
import { useAccount, useWriteContract, useReadContract } from "wagmi";
import { toast } from "react-hot-toast";
import { formatUnits, parseUnits } from "viem";
import FiatSendABI from "@/abis/FiatSend.json";
import TetherTokenABI from "@/abis/TetherToken.json";
import { withChainEnforcement } from "@/hocs/with-chain-enforcement";

const FIATSEND_ADDRESS = "0x1D683929B76cA50217C3B9C8CE4CcA9a0454a13d";
const USDT_ADDRESS = "0xAE134a846a92CA8E7803CA075A1a0EE854Cd6168";

interface SendFiatProps {
  remainingLimit: number;
  isCorrectChain: boolean;
  handleAction: (action: () => Promise<void>) => Promise<void>;
}

const SendFiatBase: React.FC<SendFiatProps> = ({ remainingLimit, handleAction }) => {
  const [ghsAmount, setGhsAmount] = useState("");
  const [usdtAmount, setUsdtAmount] = useState("");
  const [allowance, setAllowance] = useState<bigint>(BigInt(0));
  const [isProcessing, setIsProcessing] = useState(false);
  const { address } = useAccount();

  const { writeContractAsync: approve } = useWriteContract();
  const { writeContractAsync: sendFiat } = useWriteContract();

  // Read USDT balance
  const { data: usdtBalance } = useReadContract({
    address: USDT_ADDRESS,
    abi: TetherTokenABI.abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });

  // Read USDT allowance
  const { data: currentAllowance } = useReadContract({
    address: USDT_ADDRESS,
    abi: TetherTokenABI.abi,
    functionName: "allowance",
    args: address ? [address, FIATSEND_ADDRESS] : undefined,
  });

  useEffect(() => {
    if (currentAllowance) {
      setAllowance(currentAllowance as bigint);
    }
  }, [currentAllowance]);

  const handleApprove = async () => {
    if (!address) {
      toast.error("Please connect your wallet");
      return;
    }

    await handleAction(async () => {
      try {
        setIsProcessing(true);
        const toastId = toast.loading("Approving USDT...");

        const parsedAmount = parseUnits(usdtAmount, 18);
        await approve({
          address: USDT_ADDRESS,
          abi: TetherTokenABI.abi,
          functionName: "approve",
          args: [FIATSEND_ADDRESS, parsedAmount],
        });

        toast.success("USDT approved successfully!", { id: toastId });
      } catch (error: any) {
        handleTransactionError(error);
      } finally {
        setIsProcessing(false);
      }
    });
  };

  const handleSendFiat = async () => {
    if (!address) {
      toast.error("Please connect your wallet");
      return;
    }

    await handleAction(async () => {
      try {
        setIsProcessing(true);
        const toastId = toast.loading("Converting USDT to GHS...");

        const parsedAmount = parseUnits(usdtAmount, 18);
        await sendFiat({
          address: FIATSEND_ADDRESS,
          abi: FiatSendABI.abi,
          functionName: "offRamp",
          args: [parsedAmount],
        });

        toast.success("Successfully converted USDT to GHS!", { id: toastId });
        setGhsAmount("");
        setUsdtAmount("");
      } catch (error: any) {
        handleTransactionError(error);
      } finally {
        setIsProcessing(false);
      }
    });
  };

  const handleTransactionError = (error: any) => {
    if (error.message?.includes("user rejected")) {
      toast.error("Transaction cancelled by user");
    } else if (error.message?.includes("insufficient funds")) {
      toast.error("Insufficient funds for transaction");
    } else {
      toast.error("Transaction failed. Please try again");
    }
  };

  return (
    <div>
      {/* Add your JSX here */}
    </div>
  );
};

export const SendFiat = withChainEnforcement(SendFiatBase);
