import React from "react";
import { useEnforceChain } from "@/hooks/use-enforce-chain";

// Define the props that the HOC will inject
export interface WithChainEnforcementProps {
  isCorrectChain: boolean;
  handleAction: (action: () => Promise<void>) => Promise<void>;
}

// Properly type the HOC with TypeScript generics
export const withChainEnforcement = <P extends object>(
  WrappedComponent: React.ComponentType<P & WithChainEnforcementProps>
) => {
  const ComponentWithChainEnforcement = (props: Omit<P, keyof WithChainEnforcementProps>) => {
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
        {...(props as P)}
        isCorrectChain={isCorrectChain}
        handleAction={handleAction}
      />
    );
  };

  // Add display name for better React DevTools debugging
  const name = WrappedComponent.displayName || WrappedComponent.name || "Component";
  ComponentWithChainEnforcement.displayName = `withChainEnforcement(${name})`;

  return ComponentWithChainEnforcement;
};
