"use client";
import { useEffect, useState } from "react";
import { Quote, Check, AlertCircle, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

interface SharedQuote {
  id: string;
  quote: string;
  author: string;
  isSelected: boolean;
  createdAt: string;
}

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<SharedQuote[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQuotes = async () => {
    const res = await fetch('/api/quotes');
    const data = await res.json();
    if (data.success) setQuotes(data.quotes);
    setLoading(false);
  };

  const selectQuote = async (quoteId: string) => {
    const res = await fetch('/api/quotes', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quoteId })
    });

    if (res.ok) {
      toast.success("Quote selected for Quote of the Day");
      fetchQuotes();
    } else {
      toast.error("Failed to select quote");
    }
  };

  const deleteQuote = async (quoteId: string) => {
    if (!confirm('Are you sure you want to delete this quote?')) return;

    const res = await fetch('/api/quotes', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quoteId })
    });

    if (res.ok) {
      toast.success("Quote deleted successfully");
      fetchQuotes();
    } else {
      toast.error("Failed to delete quote");
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Shared Quotes</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Select a quote to display on the analytics page</p>
      </div>

      {quotes.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No quotes shared yet</h3>
          <p className="text-gray-600 dark:text-gray-400">Employees can share quotes from the Well Being section</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quotes.map((q) => (
            <div
              key={q.id}
              className={`bg-white dark:bg-gray-800 rounded-lg border p-6 hover:shadow-lg transition-all ${
                q.isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex items-start gap-3 mb-4">
                <Quote size={24} className="text-blue-600 flex-shrink-0" />
                <p className="text-gray-700 dark:text-gray-300 italic">"{q.quote}"</p>
              </div>
              
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">- {q.author}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(q.createdAt).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => deleteQuote(q.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                    title="Delete quote"
                  >
                    <Trash2 size={16} />
                  </button>
                  
                  {q.isSelected ? (
                    <div className="flex items-center gap-1 text-blue-600 text-sm font-medium">
                      <Check size={16} />
                      Selected
                    </div>
                  ) : (
                    <button
                      onClick={() => selectQuote(q.id)}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Select
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
