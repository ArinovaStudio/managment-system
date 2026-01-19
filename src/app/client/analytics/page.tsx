'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ClientOverview from '@/components/clients/analytics/ClientOverview';
import DesignOverview from '@/components/clients/analytics/DesignOverview';
import Loader from '@/components/common/Loading';

const ClientAnalyticsDashboard = () => {
  const [clientId, setClientId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchClientId = async () => {
      try {
        const response = await fetch('/api/auth/me');
        const result = await response.json();
        if (result.success && result.user) {
          setClientId(result.user.id);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClientId();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!clientId) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-lg text-red-600">Client ID not found</div>
      </div>
    );
  }

  return (
    <>
      <ClientOverview clientId={clientId} />
      <DesignOverview clientId={clientId} />
    </>
  )
};

export default ClientAnalyticsDashboard;