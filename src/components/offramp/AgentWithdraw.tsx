import React, { useState } from "react";
import { toast } from "react-hot-toast";

export const AgentWithdraw = () => {
  const [amount, setAmount] = useState("");
  const [agentId, setAgentId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleWithdraw = async () => {
    if (!amount || !agentId) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      // Implement withdrawal logic here
      toast.success("Withdrawal request submitted!");
    } catch (error) {
      console.error("Withdrawal failed:", error);
      toast.error("Withdrawal failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Amount Input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Amount
        </label>
        <div className="relative">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount in GHS"
            className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-500">GHS</span>
          </div>
        </div>
      </div>

      {/* Agent ID Input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Agent ID
        </label>
        <input
          type="text"
          value={agentId}
          onChange={(e) => setAgentId(e.target.value)}
          placeholder="Enter agent ID"
          className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
        />
      </div>

      {/* Withdraw Button */}
      <button
        onClick={handleWithdraw}
        disabled={isLoading}
        className={`w-full py-3 rounded-xl font-medium transition-all ${
          isLoading
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700"
        }`}
      >
        {isLoading ? "Processing..." : "Withdraw"}
      </button>

      {/* Help Text */}
      <p className="text-xs text-gray-500 text-center">
        Visit an agent with the provided ID to receive your cash
      </p>
    </div>
  );
};
