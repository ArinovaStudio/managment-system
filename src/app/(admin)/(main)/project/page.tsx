"use client";
import React, { useState, useEffect } from 'react';
import { Users, Calendar, AlertCircle, Plus, Search, Filter, X, ArrowLeft, LucideEye, LucideEdit2, LucideTrash } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

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

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [admins, setAdmins] = useState<any[]>([]);
  const [isClientSelected, setClientSelected] = useState<boolean>(false);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    summary: '',
    priority: 'MEDIUM',
    basicDetails: '',
    budget: '',
    projectType: '',
    startDate: '',
    deadline: '',
    supervisorAdmin: '',
    client: '',
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchUser, setSearchUser] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetchUserProjects();
    fetchUsers();
  }, []);




  const fetchUserProjects = async () => {
    try {
      const userResponse = await fetch('/api/user');
      const userData = await userResponse.json();

      const adminStatus = userData.user && userData.user.role === 'ADMIN';
      setIsAdmin(adminStatus);

      const response = await fetch(`/api/project${adminStatus ? '' : '?userOnly=true'}`);
      const data = await response.json();
      if (data.success) {
        setProjects(data.projects);
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/user?all=true');
      const data = await response.json();
      if (data.success) {
        setUsers(data.users.filter((user: any) => user.role !== 'ADMIN'));
        setAdmins(data.users.filter((user: any) => user.role === 'ADMIN'));
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.projectType || !formData.budget || !formData.startDate || !formData.deadline || !formData.supervisorAdmin) {
      toast.error('Please fill all required fields');
      return;
    }

    setCreateLoading(true);
    try {
      const response = await fetch('/api/project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          budget: parseFloat(formData.budget),
          startDate: new Date(formData.startDate),
          deadline: new Date(formData.deadline),
          memberIds: selectedMembers
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Project created successfully');
        setShowCreateModal(false);
        setFormData({ name: '', summary: '', priority: 'MEDIUM', basicDetails: '', budget: '', projectType: '', startDate: '', deadline: '', supervisorAdmin: '', client: '' });
        setSelectedMembers([]);
        fetchUserProjects();
      } else {
        toast.error(data.message || 'Failed to create project');
      }
    } catch (error) {
      toast.error('Failed to create project');
    } finally {
      setCreateLoading(false);
    }
  };

  const toggleMember = (userId: string, isClientSelected: boolean) => {
    if (isClientSelected) {
      setClientSelected(true)
    }
    setSelectedMembers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-500/20 text-red-500 ';
      case 'MEDIUM': return 'bg-yellow-500/20 text-yellow-500 ';
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchUser.toLowerCase())
  );


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-row sm:items-center sm:justify-between gap-4">

        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Projects</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage and track your assigned projects
          </p>
        </div>


        {/* Filters */}
        <div className="flex flex-row  gap-4  p-4 rounded-lg ">

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
          {isAdmin && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="w-auto inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              New Project
            </button>
          )}

          <div className="relative w-8">
            {/* The displayed filter icon */}
            <Filter size={25} className="text-gray-500 items-center cursor-pointer" />

            {/* Invisible select overlay */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer 
              px-3 py-2 g focus:ring-2 focus:ring-blue-500 focus:border-transparent 
              dark:bg-gray-700 dark:text-white
              "
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
            <Link
              key={project.id}
              href={`/project/${project.id}`}
              className="group block"
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
                    <Users size={16} />
                    <span>{project.membersCount} members</span>
                  </div>
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
            </Link>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-100 p-4 ">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-4xl max-h-[80vh] overflow-y-auto   [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold dark:text-white">Create New Project</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X size={20} className="text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleCreateProject} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 dark:text-white">
                      Project Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Enter project name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 dark:text-white">
                      Project Type *
                    </label>
                    <select
                      value={formData.projectType}
                      onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required
                    >
                      <option value="">Select project type</option>
                      <option value="saas">Ai</option>
                      <option value="e-commerce">Cyber Security</option>
                      <option value="saas">SaaS</option>
                      <option value="static">Static Website</option>
                      <option value="e-commerce">E-commerce</option>
                      <option value="web-app">Web Application</option>
                      <option value="mobile-app">Mobile App</option>
                      <option value="web-app">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 dark:text-white">
                      Priority
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 dark:text-white">
                      Budget *
                    </label>
                    <input
                      type="number"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Enter budget amount"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 dark:text-white">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 dark:text-white">
                      Deadline *
                    </label>
                    <input
                      type="date"
                      value={formData.deadline}
                      min={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 dark:text-white">
                      Supervisor Admin *
                    </label>
                    <select
                      value={formData.supervisorAdmin}
                      onChange={(e) => setFormData({ ...formData, supervisorAdmin: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required
                    >
                      <option value="">Select supervisor</option>
                      {admins.map((admin) => (
                        <option key={admin.id} value={admin.id}>
                          {admin.name} - {admin.workingAs || 'Admin'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-white">
                    Summary
                  </label>
                  <textarea
                    value={formData.summary}
                    onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Brief project summary"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-white">
                    Basic Details
                  </label>
                  <textarea
                    value={formData.basicDetails}
                    onChange={(e) => setFormData({ ...formData, basicDetails: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Detailed project description"
                    rows={4}
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Users size={20} className="text-gray-600 dark:text-gray-400" />
                    <label className="text-sm font-medium dark:text-white">
                      Team Members ({selectedMembers.length} selected)
                    </label>
                  </div>

                  {/* DROPDOWN BUTTON */}
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full text-left px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {selectedMembers.length > 0
                      ? `${selectedMembers.length} user(s) selected`
                      : "Select Members"} ↓
                  </button>

                  {isDropdownOpen && (

                    <div className="mt-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 p-2 max-h-64 overflow-y-auto">

                      {/* SEARCH INPUT */}
                      <input
                        type="text"
                        placeholder="Search users..."
                        value={searchUser}
                        onChange={(e) => setSearchUser(e.target.value)}
                        className="w-full mb-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                      />
                      {/* USER LIST */}
                      {filteredUsers.length === 0 ? (
                        <p className="text-sm text-gray-500 px-2">No users found</p>
                      ) : (
                        filteredUsers.map((user) => (
                          <div
                            key={user.id}
                            onClick={isClientSelected && user.role === "CLIENT" ? () => {} : () => toggleMember(user.id, user.role === "CLIENT" ? true : false)}
                            className={`${isClientSelected && user.role === "CLIENT" ? "opacity-40 cursor-not-allowed hover:bg-transparent dark:hover:bg-transparent" : "cursor-pointer"} flex items-center justify-between px-3 py-2 rounded-lg transition-all mb-1
              ${selectedMembers.includes(user.id)
                                ? "bg-blue-100 dark:bg-blue-900/30"
                                : "hover:bg-gray-100 dark:hover:bg-gray-700"
                              }
            `}
                          >
                            <div>
                              <p className="text-sm font-medium dark:text-white">
                                {user.name}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {/* {|| "Employee"} */}
                                {user.role === "CLIENT" ? `Client - ${user.email}` : `${user.workingAs} - ${user.department}` || "Employee"}
                              </p>
                            </div>
                            {selectedMembers.includes(user.id) && (
                              <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                <svg
                                  className="w-3 h-3 text-white"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createLoading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {createLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus size={16} />
                        Create Project
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div >
      )
      }
    </div >
  );
}