import { useEffect, useState } from "react";
import { useAccount, useSwitchChain } from "wagmi";
import { liskSepolia } from "viem/chains";
import { toast } from "react-hot-toast";
import React from "react";

export const useEnforceChain = () => {
  const { chain } = useAccount();
  const { switchChain } = useSwitchChain();
  const [hasSwitchedChain, setHasSwitchedChain] = useState(false);

  useEffect(() => {
    if (chain && chain.id !== liskSepolia.id) {
      toast.error(
        React.createElement(
          "div",
          { className: "flex flex-col gap-2" },
          React.createElement("span", null, "Please switch to Lisk Sepolia network"),
          React.createElement(
            "button",
            {
              onClick: async () => {
                try {
                  await switchChain({ chainId: liskSepolia.id });
                  setHasSwitchedChain(true);
                } catch (error) {
                  console.error("Failed to switch chain:", error);
                  toast.error("Failed to switch to Lisk Sepolia network");
                }
              },
              className: "bg-indigo-600 text-white px-4 py-2 rounded-md text-sm",
            },
            "Switch Network"
          )
        ),
        {
          duration: 5000,
          position: "top-center",
        }
      );
    }
  }, [chain, switchChain, hasSwitchedChain]);

  const isCorrectChain = chain?.id === liskSepolia.id;

  return {
    isCorrectChain,
    hasSwitchedChain,
    switchToLiskSepolia: async () => {
      try {
        await switchChain({ chainId: liskSepolia.id });
        setHasSwitchedChain(true);
        return true;
      } catch (error) {
        console.error("Failed to switch chain:", error);
        toast.error("Failed to switch to Lisk Sepolia network");
        return false;
      }
    },
  };
}; 