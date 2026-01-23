'use client';

import { Download, FileText, Receipt, Wallet, ArrowDownCircle } from 'lucide-react';

interface Doc {
  id: string;
  title: string;
  fileUrl: string;
  createdAt: string;
}

const BudgetAndDocs = ({
  scopeTitle,
  scopeDate,
  paymentDate,
  invoiceName,
  paidAmount,
  remainingAmount,
  totalBudget,
  remainingProgress,
  docs = [],
}: {
  scopeTitle: string;
  scopeDate: string;
  paymentDate: string;
  invoiceName: string;
  paidAmount: number;
  remainingAmount: number;
  totalBudget: number;
  remainingProgress: number;
  docs?: Doc[];
}) => {

  // Helper to find specific doc types
  const findDoc = (titlePattern: string) => {
    return docs.find(doc => doc.title.toLowerCase().includes(titlePattern.toLowerCase()));
  };

  const scopeDoc = findDoc('scope');
  const invoiceDoc = findDoc('invoice');
  const paymentHistoryDocs = docs.filter(doc =>
    doc.title.toLowerCase().includes('payment history')
  );

  // Download handler
  const handleDownload = (url: string, filename: string) => {
    window.open(url, "_blank");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 h-full gap-6 mt-10">

      {/* LEFT CARDS */}
      <div className="col-span-1 h-full flex flex-col gap-4">

        {/* Scope of Work */}
        <div className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 flex justify-between items-center flex-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-200 dark:bg-purple-800 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-purple-700 dark:text-purple-300" />
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {scopeTitle}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {scopeDoc ? `Uploaded at ${new Date(scopeDoc.createdAt).toLocaleDateString()}` : `Date: ${scopeDate}`}
              </p>
            </div>
          </div>

          {scopeDoc ? (
            <Download
              className="w-6 h-6 text-purple-600 dark:text-purple-300 cursor-pointer hover:scale-110 transition-transform"
              onClick={() => handleDownload(scopeDoc.fileUrl, scopeDoc.title)}
            />
          ) : (
            <FileText className="w-6 h-6 text-gray-400 dark:text-gray-600" />
          )}
        </div>

        {/* Payment History */}
        <div className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 flex justify-between items-center flex-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-200 dark:bg-blue-800 rounded-xl flex items-center justify-center">
              <Receipt className="w-6 h-6 text-blue-700 dark:text-blue-300" />
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Payment History
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {paymentHistoryDocs.length > 0
                  ? `${paymentHistoryDocs.length} document${paymentHistoryDocs.length > 1 ? 's' : ''}`
                  : `Paid on ${paymentDate}`
                }
              </p>
            </div>
          </div>

          {paymentHistoryDocs.length > 0 ? (
            <div className="relative group">
              <ArrowDownCircle className="w-6 h-6 text-blue-600 dark:text-blue-300 cursor-pointer hover:scale-110 transition-transform" />

              {/* Dropdown for multiple payment history files */}
              <div className="absolute right-0 top-8 w-64 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                <div className="p-2">
                  {paymentHistoryDocs.map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => handleDownload(doc.fileUrl, doc.title)}
                      className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-2 text-sm"
                    >
                      <Download className="w-4 h-4" />
                      <span className="truncate">{doc.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <Receipt className="w-6 h-6 text-gray-400 dark:text-gray-600" />
          )}
        </div>

        {/* Latest Invoice */}
        <div className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 flex justify-between items-center flex-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-200 dark:bg-green-800 rounded-xl flex items-center justify-center">
              <Wallet className="w-6 h-6 text-green-700 dark:text-green-300" />
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Latest invoice
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {invoiceDoc ? invoiceDoc.title : invoiceName}
              </p>
            </div>
          </div>

          {invoiceDoc ? (
            <Download
              className="w-6 h-6 text-green-600 dark:text-green-300 cursor-pointer hover:scale-110 transition-transform"
              onClick={() => handleDownload(invoiceDoc.fileUrl, invoiceDoc.title)}
            />
          ) : (
            <Wallet className="w-6 h-6 text-gray-400 dark:text-gray-600" />
          )}
        </div>
      </div>

      {/* RIGHT SIDE — BUDGET OVERVIEW */}
      <div className="col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 flex items-center justify-between">

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
                <h3 className="text-2xl font-bold">₹{paidAmount.toLocaleString()}</h3>
              </div>
              <span className='bg-white rounded-full bg-opacity-80 p-1'>
                <Receipt className="w-6 h-6 text-purple-600" />
              </span>
            </div>

            <div className="bg-orange-500 text-white p-4 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-sm">Remaining amount</p>
                <h3 className="text-2xl font-bold">₹{remainingAmount.toLocaleString()}</h3>
              </div>
              <span className='bg-white rounded-full bg-opacity-80 p-1'>
                <Wallet className="w-6 h-6 text-orange-500" />
              </span>
            </div>

            <div className="bg-black/90 text-white p-4 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-sm">Total Budget</p>
                <h3 className="text-2xl font-bold">₹{totalBudget.toLocaleString()}</h3>
              </div>
              <span className='bg-white rounded-full bg-opacity-80 p-1'>
                <FileText className="w-6 h-6 text-black/90" />
              </span>
            </div>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="w-1/2 flex items-center justify-center">
          <div className="relative w-75 h-75">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="#000"
                strokeWidth="20"
              />

              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="20"
                strokeDasharray={`${(remainingProgress / 100) * 502} 502`}
                strokeDashoffset="0"
                className="transition-all duration-500 ease-out"
              />
            </svg>

            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                {remainingProgress}%
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