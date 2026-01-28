'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

import ClientOverview from '@/components/clients/analytics/ClientOverview';
import DesignOverview from '@/components/clients/analytics/DesignOverview';
import LatestUpdates from '@/components/clients/analytics/LatestUpdates';
import RiskBlockage from '@/components/clients/analytics/RiskBlockage';
import Milestones from '@/components/clients/analytics/Milestones';
import BudgetAndDocs from '@/components/clients/analytics/BudgetAndDocs';
import DesignPreviewSection from '@/components/clients/analytics/DesignPreviewSection';
import Loader from '@/components/common/Loading';
import { AlertCircle, Calendar, Filter, Search, Users } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  summary: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  basicDetails: string;
  membersCount: number;
  progress: number;
  budget: number;
  projectType: string;
  startDate: string;
  deadline: string;
  createdAt: string;
}

const ClientAnalyticsDashboard = () => {
  const [clientId, setClientId] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [allData, setAllData] = useState<any>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [showProjects, setShowProjects] = useState(true);
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchClientId = async () => {
      try {
        const response = await fetch('/api/auth/me');
        const result = await response.json();

        if (result.success && result.user) {
          setClientId(result.user.id);
          
          // Get client's projects
          const projectsResponse = await fetch(`/api/project?userOnly=true`);
          const projectsResult = await projectsResponse.json();
          
          if (projectsResult.success && projectsResult.projects.length > 0) {
            setProjects(projectsResult.projects);
            // Set first project as default if no projectId in URL
            const urlProjectId = new URLSearchParams(window.location.search).get('projectId');
            setProjectId(urlProjectId || projectsResult.projects[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    fetchClientId();
  }, [searchParams]);

  useEffect(() => {
    if (!clientId || !projectId) return;

    const fetchAllData = async () => {
      try {

        const [updatesRes, risksRes, milestonesRes, budgetRes, designRes, overviewRes, designOverviewRes] = await Promise.all([
          fetch(`/api/client/analytics/updates?clientId=${clientId}&projectId=${projectId}`),
          fetch(`/api/client/analytics/risk-blockage?clientId=${clientId}&projectId=${projectId}`),
          fetch(`/api/client/analytics/milestone?clientId=${clientId}&projectId=${projectId}`),
          fetch(`/api/client/analytics/budget?clientId=${clientId}&projectId=${projectId}`),
          fetch(`/api/client/analytics/design-preview?clientId=${clientId}&projectId=${projectId}`),
          fetch(`/api/client/analytics/overview?clientId=${clientId}&projectId=${projectId}`),
          fetch(`/api/client/analytics/design?clientId=${clientId}&projectId=${projectId}`)
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
  }, [clientId, projectId]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-500/20 text-red-500';
      case 'MEDIUM': return 'bg-yellow-500/20 text-yellow-500';
      case 'LOW': return 'bg-green-500/20 text-green-500';
      default: return 'bg-gray-100/20 text-gray-500';
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = priorityFilter === 'ALL' || project.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!clientId) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-lg text-red-600 dark:text-red-400">
          Client ID not found
        </div>
      </div>
    );
  }

  // Show project selection if no projectId or showProjects is true
  if (!projectId || showProjects) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Projects</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Select a project to view analytics
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-row gap-4 p-4 rounded-lg">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div className="relative w-8">
              <Filter size={25} className="text-gray-500 items-center cursor-pointer" />
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="ALL">All</option>
                <option value="HIGH">High Priority</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="LOW">Low Priority</option>
              </select>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No projects found</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {projects.length === 0 ? "You haven't been assigned to any projects yet." : "No projects match your search criteria."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                onClick={() => {
                  setProjectId(project.id);
                  setShowProjects(false);
                  window.history.pushState({}, '', `?projectId=${project.id}`);
                }}
                className="group block cursor-pointer"
              >
                <div className="relative bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-200 group-hover:border-blue-300 dark:group-hover:border-blue-600">
                  {/* Project Header */}
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                      {project.name}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(project.priority)}`}>
                      {project.priority}
                    </span>
                  </div>

                  {/* Project Summary */}
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                    {project.summary || 'No summary available'}
                  </p>

                  {/* Project Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar size={16} />
                      <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                      <span>{project.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full transition-all"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Basic Details Preview */}
                  {project.basicDetails && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                      {project.basicDetails}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (!allData) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-lg text-red-600 dark:text-red-400">
          Loading project data...
        </div>
      </div>
    );
  }

  const currentProject = projects.find(p => p.id === projectId);

  return (
    <div className="space-y-10">
      {/* Project Header with Switch Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {currentProject?.name || 'Project Analytics'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Analytics dashboard for your project
          </p>
        </div>
        <button
          onClick={() => setShowProjects(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Switch Project
        </button>
      </div>

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
          remainingProgress={allData.budget.remainingProgress}
          docs={allData.budget.docs || []}
        />
      )}

      <DesignPreviewSection data={allData.design} />
    </div>
  );
};

const ClientPage = () => {
  return (
    <Suspense fallback={<div className="min-h-screen p-6 flex items-center justify-center"><Loader /></div>}>
      <ClientAnalyticsDashboard />
    </Suspense>
  );
};

export default ClientPage;