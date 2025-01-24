import React, { useEffect, useState } from "react";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

interface TransactionStatusProps {
  txHash: string;
  onComplete?: () => void;
}

type Step = {
  label: string;
  status: "pending" | "processing" | "completed";
};

export const TransactionStatus: React.FC<TransactionStatusProps> = ({
  txHash,
  onComplete,
}) => {
  const [steps, setSteps] = useState<Step[]>([
    { label: "Transaction Submission", status: "processing" },
    { label: "Order Processing", status: "pending" },
    { label: "Settlement", status: "pending" },
  ]);

  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    // Simulate first step completion after 15 seconds
    const timer1 = setTimeout(() => {
      setSteps((prev) =>
        prev.map((step, idx) =>
          idx === 0
            ? { ...step, status: "completed" }
            : idx === 1
            ? { ...step, status: "processing" }
            : step
        )
      );
      setCurrentStepIndex(1);
    }, 15000);

    // Simulate second step completion after 30 seconds
    const timer2 = setTimeout(() => {
      setSteps((prev) =>
        prev.map((step, idx) =>
          idx <= 1
            ? { ...step, status: "completed" }
            : idx === 2
            ? { ...step, status: "processing" }
            : step
        )
      );
      setCurrentStepIndex(2);
    }, 30000);

    // Simulate final step completion after 45 seconds
    const timer3 = setTimeout(() => {
      setSteps((prev) =>
        prev.map((step) => ({ ...step, status: "completed" }))
      );
      if (onComplete) onComplete();
    }, 45000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete]);

  return (
    <div className="max-w-md mx-auto space-y-6 p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
          Order Submitted
        </h2>
        <p className="text-gray-600">
          Your order has been successfully submitted and is now being processed.
        </p>
      </div>

      <div className="space-y-1">
        <p className="text-sm text-gray-600">
          {currentStepIndex + 1} of {steps.length} steps completed
        </p>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 transition-all duration-500"
            style={{
              width: `${((currentStepIndex + 1) / steps.length) * 100}%`,
            }}
          />
        </div>
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => (
          <div
            key={step.label}
            className="flex items-center space-x-3 text-gray-600"
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                step.status === "completed"
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                  : step.status === "processing"
                  ? "bg-purple-100 text-purple-600 animate-pulse"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              {step.status === "completed" ? (
                <CheckCircleIcon className="w-6 h-6" />
              ) : (
                index + 1
              )}
            </div>
            <div className="flex-1">
              <p
                className={`font-medium ${
                  step.status === "completed"
                    ? "text-purple-600"
                    : step.status === "processing"
                    ? "text-purple-600"
                    : "text-gray-400"
                }`}
              >
                {step.label}
              </p>
              {step.status === "processing" && (
                <p className="text-sm text-gray-500">Processing...</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {txHash && (
        <div className="text-sm text-gray-600">
          Transaction Hash:{" "}
          <a
            href={`https://sepolia-blockscout.lisk.com/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-600 hover:text-purple-700"
          >
            {txHash.slice(0, 8)}...{txHash.slice(-6)}
          </a>
        </div>
      )}

      <button
        onClick={onComplete}
        className="w-full py-3 rounded-xl font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all"
      >
        Submit a new Order
      </button>
    </div>
  );
};
