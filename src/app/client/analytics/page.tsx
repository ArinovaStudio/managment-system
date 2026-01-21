'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

import ClientOverview from '@/components/clients/analytics/ClientOverview';
import DesignOverview from '@/components/clients/analytics/DesignOverview';
import LatestUpdates from '@/components/clients/analytics/LatestUpdates';
import RiskBlockage from '@/components/clients/analytics/RiskBlockage';
import Milestones from '@/components/clients/analytics/Milestones';
import BudgetAndDocs from '@/components/clients/analytics/BudgetAndDocs';
import DesignPreviewSection from '@/components/clients/analytics/DesignPreviewSection';
import Loader from '@/components/common/Loading';

const ClientAnalyticsDashboard = () => {
  const [clientId, setClientId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [allData, setAllData] = useState<any>(null);
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
      }
    };

    fetchClientId();
  }, [searchParams]);

  useEffect(() => {
    if (!clientId) return;

    const fetchAllData = async () => {
      try {
        ('Fetching data for clientId:', clientId);
        
        const [updatesRes, risksRes, milestonesRes, budgetRes, designRes, overviewRes, designOverviewRes] = await Promise.all([
          fetch(`/api/client/analytics/updates?clientId=${clientId}`),
          fetch(`/api/client/analytics/risk-blockage?clientId=${clientId}`),
          fetch(`/api/client/analytics/milestone?clientId=${clientId}`),
          fetch(`/api/client/analytics/budget?clientId=${clientId}`),
          fetch(`/api/client/analytics/design-preview?clientId=${clientId}`),
          fetch(`/api/client/analytics/overview?clientId=${clientId}`),
          fetch(`/api/client/analytics/design?clientId=${clientId}`)
        ]);

        const [updates, risks, milestones, budget, design, overview, designOverview] = await Promise.all([
          updatesRes.json(),
          risksRes.json(),
          milestonesRes.json(),
          budgetRes.json(),
          designRes.json(),
          overviewRes.json(),
          designOverviewRes.json()
        ]);

        setAllData({
          updates: updates.success ? updates.data : [],
          risks: risks.success ? risks.data.map(r => r.riskTitle) : [],
          milestones: milestones.success ? milestones.data : [],
          budget: budget.success ? budget.data : null,
          design: design.success ? design.data : null,
          overview: overview.success ? overview.data : null,
          designOverview: designOverview.success ? designOverview.data : null
        });
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [clientId]);

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!clientId || !allData) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-lg text-red-600 dark:text-red-400">
          Client ID not found
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <ClientOverview data={allData.overview} />
      <DesignOverview data={allData.designOverview} designPreview={allData.design} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <LatestUpdates updates={allData.updates} />
        </div>
        <div className="lg:col-span-1 space-y-6">
          <RiskBlockage risks={allData.risks} />
          <Milestones milestones={allData.milestones} />
        </div>
      </div>

      {allData.budget && (
        <BudgetAndDocs
          scopeTitle={allData.budget.scopeTitle}
          scopeDate={allData.budget.scopeDate}
          paymentDate={allData.budget.paymentDate}
          invoiceName={allData.budget.invoiceName}
          paidAmount={allData.budget.paidAmount}
          remainingAmount={allData.budget.remainingAmount}
          totalBudget={allData.budget.totalBudget}
          progress={allData.budget.progress}
        />
      )}

      <DesignPreviewSection data={allData.design} />
    </div>
  );
};

export default ClientAnalyticsDashboard;