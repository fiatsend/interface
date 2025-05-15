import React from "react";
import { useEnforceChain } from "@/hooks/use-enforce-chain";

export const withChainEnforcement = <P extends object>(
  WrappedComponent: React.ComponentType<P>
) => {
  return function WithChainEnforcement(props: P) {
    const { isCorrectChain, switchToLiskSepolia } = useEnforceChain();

    const handleAction = async (action: () => Promise<void>) => {
      if (!isCorrectChain) {
        const switched = await switchToLiskSepolia();
        if (!switched) return;
      }
      await action();
    };

    return (
      <WrappedComponent
        {...props}
        isCorrectChain={isCorrectChain}
        handleAction={handleAction}
      />
    );
  };
}; 