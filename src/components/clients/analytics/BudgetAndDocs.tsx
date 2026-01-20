'use client';

import { Download, FileText, Receipt, Wallet, ArrowDownCircle } from 'lucide-react';

const BudgetAndDocs = ({
  scopeTitle,
  scopeDate,
  paymentDate,
  invoiceName,
  paidAmount,
  remainingAmount,
  totalBudget,
  progress,
}: {
  scopeTitle: string;
  scopeDate: string;
  paymentDate: string;
  invoiceName: string;
  paidAmount: number;
  remainingAmount: number;
  totalBudget: number;
  progress: number; // percent remaining
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-10">

      {/* LEFT CARDS */}
      <div className="col-span-1 space-y-4">

        {/* Scope of Work */}
        <div
          className="
            bg-purple-100 dark:bg-purple-900 
            border border-gray-200 dark:border-gray-700 
            rounded-2xl p-5 flex justify-between items-center
          "
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-200 dark:bg-purple-800 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-purple-700 dark:text-purple-300" />
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {scopeTitle}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Uploaded at {scopeDate}
              </p>
            </div>
          </div>

          <Download className="w-6 h-6 text-purple-600 dark:text-purple-300 cursor-pointer" />
        </div>

        {/* Payment History */}
        <div
          className="
            bg-blue-100 dark:bg-blue-900 
            border border-gray-200 dark:border-gray-700 
            rounded-2xl p-5 flex justify-between items-center
          "
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-200 dark:bg-blue-800 rounded-xl flex items-center justify-center">
              <Receipt className="w-6 h-6 text-blue-700 dark:text-blue-300" />
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Payment History
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Paid on {paymentDate}
              </p>
            </div>
          </div>

          <ArrowDownCircle className="w-6 h-6 text-blue-600 dark:text-blue-300 cursor-pointer" />
        </div>

        {/* Latest Invoice */}
        <div
          className="
            bg-green-100 dark:bg-green-900 
            border border-gray-200 dark:border-gray-700 
            rounded-2xl p-5 flex justify-between items-center
          "
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-200 dark:bg-green-800 rounded-xl flex items-center justify-center">
              <Wallet className="w-6 h-6 text-green-700 dark:text-green-300" />
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Latest invoice
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {invoiceName}
              </p>
            </div>
          </div>

          <Download className="w-6 h-6 text-green-600 dark:text-green-300 cursor-pointer" />
        </div>
      </div>

      {/* RIGHT SIDE — BUDGET OVERVIEW */}
      <div
        className="
          col-span-2 bg-white dark:bg-gray-800 
          rounded-2xl p-8 border border-gray-200 dark:border-gray-700
          flex items-center justify-between
        "
      >
        {/* LEFT INFO */}
        <div className="space-y-5 w-1/2">

          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Budget Overview
          </h2>

          {/* Info Bars */}
          <div className="space-y-3">

            <div className="bg-purple-600 text-white p-4 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-sm">Paid amount</p>
                <h3 className="text-2xl font-bold">{paidAmount}</h3>
              </div>
              <Receipt className="w-8 h-8 opacity-80" />
            </div>

            <div className="bg-orange-500 text-white p-4 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-sm">Remaining amount</p>
                <h3 className="text-2xl font-bold">{remainingAmount}</h3>
              </div>
              <Wallet className="w-8 h-8 opacity-80" />
            </div>

            <div className="bg-black text-white p-4 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-sm">Total Budget</p>
                <h3 className="text-2xl font-bold">{totalBudget}</h3>
              </div>
              <FileText className="w-8 h-8 opacity-80" />
            </div>

          </div>
        </div>

        {/* Donut Chart */}
        <div className="w-1/2 flex items-center justify-center">
          <div className="relative w-44 h-44">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="20"
              />

              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="#000"
                strokeWidth="20"
                strokeDasharray={`${(progress / 100) * 502} 502`}
                strokeDashoffset="0"
                className="transition-all duration-500 ease-out"
              />
            </svg>

            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                {progress}%
              </span>
              <span className="text-gray-500 dark:text-gray-400 text-sm">
                Remaining
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default BudgetAndDocs;
