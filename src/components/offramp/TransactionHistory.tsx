import React from "react";
import { XMarkIcon } from "@heroicons/react/24/solid";

interface Transaction {
  orderId: string;
  from: string;
  to: string;
  method: string;
  status: "Pending" | "Completed" | "Claimed" | "Placed";
  amount: string;
  time: string;
}

interface TransactionHistoryProps {
  onClose: () => void;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  onClose,
}) => {
  // Mock data - replace with real data later
  const transactions: Transaction[] = [
    {
      orderId: "0x1f08...e367",
      from: "USDT",
      to: "GHS",
      method: "Offramp",
      status: "Pending",
      amount: "100.00",
      time: "27 mins ago",
    },
    {
      orderId: "0x1e73...f1ef",
      from: "USDT",
      to: "GHS",
      method: "Offramp",
      status: "Completed",
      amount: "50.00",
      time: "19 hrs ago",
    },
    // Add more mock transactions as needed
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl mx-4">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Your transactions</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-6 gap-4 text-sm text-gray-500 pb-2">
            <div>Order ID</div>
            <div>From / To</div>
            <div>Method</div>
            <div>Status</div>
            <div>Amount</div>
            <div>Time</div>
          </div>

          <div className="space-y-2">
            {transactions.map((tx) => (
              <div
                key={tx.orderId}
                className="grid grid-cols-6 gap-4 py-3 text-sm border-t border-gray-100"
              >
                <div className="text-blue-500">{tx.orderId}</div>
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs">
                    {tx.from[0]}
                  </span>
                  <span className="text-gray-400">→</span>
                  <span className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center text-xs">
                    {tx.to[0]}
                  </span>
                </div>
                <div className="text-gray-700">{tx.method}</div>
                <div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      tx.status === "Pending"
                        ? "bg-purple-100 text-purple-600"
                        : tx.status === "Completed"
                        ? "bg-green-100 text-green-600"
                        : tx.status === "Claimed"
                        ? "bg-blue-100 text-blue-600"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {tx.status}
                  </span>
                </div>
                <div className="text-gray-700">
                  {tx.amount} {tx.from}
                </div>
                <div className="text-gray-500">{tx.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
