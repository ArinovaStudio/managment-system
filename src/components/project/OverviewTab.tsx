"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ArrowUp, CheckCheck, LucideCheckCheck, LucideCopy, LucideEdit3, LucideTrash, User, X, DollarSign, Palette, ArrowRight } from "lucide-react";

import toast, { Toaster } from "react-hot-toast";
import LatestUpdates from "./LatestUpdates";
import { useRouter } from "next/navigation";
import BudgetModal from "./BudgetModal";


type Member = {
  user: {
    id: string;
    name: string;
    email: string;
    image: string;
    role: string;
    isLogin: boolean;
  }
  role?: string;
  isLeader: boolean;
};

type Project = {
  id: string;
  name: string;
  repository: string;
  summary: string;
  priority: "HIGH" | "MEDIUM" | "LOW" | string;
  basicDetails: string | null;
  membersCount: number;
  members: Member[];
  progress?: number;
  ongoingMilestones?: number;
  totalMilestones?: number;
  projectInfo?: {
    budget?: number;
    startDate?: string;
    deadline?: string;
    projectType?: string;
  };
};

interface OverviewTabProps {
  project: Project;
}


// Handles comma-separated string arrays (e.g., Colors, Themes)
const ArrayInput = ({ label, value = [], onChange, placeholder }) => {
  const handleChange = (e) => {
    const val = e.target.value;
    // Allow typing by updating if it ends with a comma or has content
    if (val.endsWith(', ') || !val.includes(',')) {
      onChange(val.split(',').map(s => s.trim()).filter(Boolean));
    } else {
      // Just pass the raw split for immediate updates, 
      // but strictly this logic relies on the parent handling the array.
      // For a perfect UX, we'd use local state, but mimicking original logic:
      onChange(val.split(',').map(s => s.trim()));
    }
  };

  // Format array back to string for display
  const displayValue = Array.isArray(value) ? value.join(', ') : '';

  return (
    <div>
      <label className="block text-sm font-medium mb-2 dark:text-white">{label}</label>
      <input
        type="text"
        value={displayValue}
        onChange={handleChange} // Simplified for smoother typing
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
        placeholder={placeholder}
      />
    </div>
  );
};

// Handles JSON objects with validation (Fonts, Layouts)
const JsonInput = ({ label, value, onChange, placeholder }) => {
  // Local state is required to allow the user to type "invalid" JSON temporarily (like opening a brace)
  const [localString, setLocalString] = useState('');

  // Sync local state when prop changes externally (e.g., on load)
  useEffect(() => {
    setLocalString(JSON.stringify(value || {}, null, 2));
  }, [value]);

  const handleChange = (e) => {
    const newVal = e.target.value;
    setLocalString(newVal); // Always update UI immediately

    try {
      const parsed = JSON.parse(newVal);
      onChange(parsed); // Only update parent state if valid JSON
    } catch (err) {
      // Invalid JSON: do not update parent state yet
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-2 dark:text-white">{label}</label>
      <textarea
        value={localString}
        onChange={handleChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm font-mono"
        rows={3}
        placeholder={placeholder}
      />
    </div>
  );
};

// --- 2. Main Component ---

const DesignerModal = ({ showModal, projectData, currentUser }) => {
  const [loading, setLoading] = useState(false);
  const [designSystemData, setDesignSystemData] = useState({
    brandName: '', brandFeel: '', colors: [], fonts: {},
    designType: [], layoutStyle: {}, contentTone: [],
    visualGuidelines: {}, theme: [], keyPages: [], uniqueness: {}
  });

  // Helper to safely parse API response
  const parseDesignData = (data) => {
    const ensureArray = (arr) => Array.isArray(arr) ? arr.filter(i => i && i !== 'null') : [];
    const ensureObject = (obj) => (typeof obj === 'object' && obj !== null) ? obj : {};

    return {
      brandName: data.brandName || '',
      brandFeel: (data.brandFeel && data.brandFeel !== 'null') ? data.brandFeel : '',
      colors: ensureArray(data.colors),
      designType: ensureArray(data.designType),
      contentTone: ensureArray(data.contentTone),
      theme: ensureArray(data.theme),
      keyPages: ensureArray(data.keyPages),
      fonts: ensureObject(data.fonts),
      layoutStyle: ensureObject(data.layoutStyle),
      visualGuidelines: ensureObject(data.visualGuidelines),
      uniqueness: ensureObject(data.uniqueness)
    };
  };

  const fetchDesignData = useCallback(async () => {
    if (!projectData.id) return;

    try {
      const clientMember = projectData.members?.find(m => m.user.role === 'CLIENT');
      const clientId = clientMember?.user.id;

      if (clientId) {
        const response = await fetch(`/api/client/analytics/design?clientId=${clientId}&projectId=${projectData.id}`);
        const result = await response.json();

        if (result.success && result.data) {
          setDesignSystemData(parseDesignData(result.data));
        }
      }
    } catch (error) {
      console.error('Failed to fetch design data:', error);
      toast.error("Failed to load design data");
    }
  }, [projectData]);

  useEffect(() => {
    fetchDesignData();
  }, [fetchDesignData]);


  // Generic handler for design system updates
  const updateDesignSystem = (field, value) => {
    setDesignSystemData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const clientMember = projectData.members?.find(m => m.user.role === 'CLIENT');
      const clientId = clientMember?.user.id;

      if (!clientId) throw new Error("Client not found for this project");

      const headers = { 'Content-Type': 'application/json' };

      await Promise.all([
        fetch('/api/design-system', {
          method: 'POST',
          headers,
          body: JSON.stringify({ projectId: projectData.id, ...designSystemData })
        })
      ]);

      toast.success("Design data updated successfully");
      showModal(false);
    } catch (err) {
      console.error("Failed to update:", err);
      toast.error(err.message || "Failed to update design data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-100 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-3xl max-h-[80vh] overflow-y-auto no-scrollbar">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold dark:text-white">Designer Dashboard</h2>
            <button onClick={() => showModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <X size={20} className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* --- Design System Section --- */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-lg font-semibold dark:text-white">Design System</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-white">Brand Name</label>
                  <input
                    type="text" value={designSystemData.brandName}
                    onChange={(e) => updateDesignSystem('brandName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                    placeholder="Enter brand name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-white">Brand Feel</label>
                  <input
                    type="text" value={designSystemData.brandFeel}
                    onChange={(e) => updateDesignSystem('brandFeel', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                    placeholder="e.g., Modern, Professional"
                  />
                </div>
              </div>

              {/* Refactored Array Inputs */}
              <ArrayInput
                label="Colors (comma-separated hex codes)"
                value={designSystemData.colors}
                onChange={(val) => updateDesignSystem('colors', val)}
                placeholder="#FF5733,#33FF57"
              />
              <ArrayInput
                label="Design Type (comma-separated)"
                value={designSystemData.designType}
                onChange={(val) => updateDesignSystem('designType', val)}
                placeholder="Minimalist, Corporate"
              />
              <ArrayInput
                label="Content Tone (comma-separated)"
                value={designSystemData.contentTone}
                onChange={(val) => updateDesignSystem('contentTone', val)}
                placeholder="Professional, Friendly"
              />
              <ArrayInput
                label="Theme (comma-separated)"
                value={designSystemData.theme}
                onChange={(val) => updateDesignSystem('theme', val)}
                placeholder="Dark, Light"
              />
              <ArrayInput
                label="Key Pages (comma-separated)"
                value={designSystemData.keyPages}
                onChange={(val) => updateDesignSystem('keyPages', val)}
                placeholder="Home, About, Contact"
              />

              {/* Refactored JSON Inputs */}
              <JsonInput
                label='Fonts (JSON format: {"primary": "Arial"})'
                value={designSystemData.fonts}
                onChange={(val) => updateDesignSystem('fonts', val)}
                placeholder='{"primary": "Inter", "secondary": "Roboto"}'
              />
              <JsonInput
                label='Layout Style (JSON format: {"grid": "12-column"})'
                value={designSystemData.layoutStyle}
                onChange={(val) => updateDesignSystem('layoutStyle', val)}
                placeholder='{"grid": "12-column", "spacing": "8px"}'
              />
              <JsonInput
                label='Visual Guidelines (JSON format: {"shadows": "soft"})'
                value={designSystemData.visualGuidelines}
                onChange={(val) => updateDesignSystem('visualGuidelines', val)}
                placeholder='{"shadows": "subtle", "borderRadius": "8px"}'
              />
              <JsonInput
                label='Uniqueness (JSON format: {"feature": "value"})'
                value={designSystemData.uniqueness}
                onChange={(val) => updateDesignSystem('uniqueness', val)}
                placeholder='{"feature": "innovative UI", "approach": "unique"}'
              />
            </div>

            {/* Footer Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button" onClick={() => showModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-white"
              >
                Cancel
              </button>
              <button
                type="submit" disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Updating...</>
                ) : (
                  <><CheckCheck size={16} /> Update Design Data</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};


const EditModal = ({ showModel, projectData }) => {
  const [loading, setLoading] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [techStack, setTechStack] = useState([]);
  const [newTech, setNewTech] = useState({ key: '', value: '' });
  const [customCategory, setCustomCategory] = useState("");
  const [currentPhase, setCurrentPhase] = useState('');

  const [formData, setFormData] = useState({
    name: projectData.name,
    summary: projectData.summary,
    priority: projectData.priority,
    repository: projectData.repository,
    basicDetails: projectData.basicDetails,
    budget: projectData.projectInfo.budget,
    projectType: projectData.projectInfo.projectType,
    startDate: projectData.projectInfo.startDate,
    deadline: projectData.projectInfo.deadline,
    supervisorAdmin: projectData.projectInfo.supervisorAdmin
  });

  const predefinedTech = [
    { key: 'Design', options: ['Figma', 'Adobe XD', 'Sketch', 'Canva'] },
    { key: 'Frontend', options: ['React', 'Next.js', 'Vue.js', 'Angular'] },
    { key: 'Backend', options: ['Node.js', 'Python', 'Java', 'PHP'] },
    { key: 'Database', options: ['PostgreSQL', 'MongoDB', 'MySQL', 'Redis'] },
    { key: 'Hosting', options: ['Vercel', 'AWS', 'Netlify', 'Heroku'] }
  ];

  const fetchTechnology = async () => {
    try {
      // First try to get client ID from project members
      const clientMember = projectData.members?.find(member => member.user.role === 'CLIENT');
      const clientId = clientMember?.user.id;

      if (clientId) {
        const response = await fetch(`/api/client/analytics/design?clientId=${clientId}&projectId=${projectData.id}`);
        const data = await response.json();
        if (data.success && data.data.technology && Array.isArray(data.data.technology)) {
          setTechStack(data.data.technology);
        }
        // Set current phase from the same API
        if (data.success && data.data.projectPhase && data.data.projectPhase.current) {
          setCurrentPhase(data.data.projectPhase.current);
        }
      } else {
        // Fallback to project technology API
        const response = await fetch(`/api/project/technology?projectId=${projectData.id}`);
        const data = await response.json();
        if (data.success && data.data && data.data.tech) {
          setTechStack(data.data.tech);
        }
      }
    } catch (error) {
      console.error('Failed to fetch technology:', error);
    }
  };

  const addTech = () => {
    if (newTech.key && newTech.value) {
      setTechStack([...techStack, newTech]);
      setNewTech({ key: '', value: '' });
    }
  };

  const removeTech = (index) => {
    setTechStack(techStack.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/project', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: projectData.id,
          name: formData.name,
          summary: formData.summary,
          priority: formData.priority,
          basicDetails: formData.basicDetails,
          budget: formData.budget,
          repository: formData.repository,
          projectType: formData.projectType,
          startDate: formData.startDate,
          deadline: formData.deadline,
          supervisorAdmin: formData.supervisorAdmin
        })
      });

      // Update technology stack
      await fetch('/api/project/technology', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: projectData.id, tech: techStack })
      });

      // Update project phase
      if (currentPhase) {
        // Update via the same analytics API by sending the phase data
        const clientMember = projectData.members?.find(member => member.user.role === 'CLIENT');
        const clientId = clientMember?.user.id;

        if (clientId) {
          await fetch('/api/client/analytics/design', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              clientId,
              projectId: projectData.id,
              currentPhase
            })
          });
        }
      }

      const result = await response.json();
      if (result.success) {
        toast.success("Project updated successfully");
        showModel(false)
      } else {
        toast.error("Failed to update project");
      }
    } catch (err) {
      console.error("Failed to create project:", err);
      toast.error("Failed to create project");
    }
    finally {
      setLoading(false);
      window.location.reload()
    }
  }

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/adminOnly');
      const data = await response.json();
      if (data.success) {
        setAdmins(data.users);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
    if (projectData.id) {
      fetchTechnology();
    }
  }, [projectData.id])

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-100 p-4 ">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-4xl max-h-[80vh] overflow-y-auto   [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold dark:text-white">Create New Project</h2>
            <button
              onClick={() => showModel(false)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <X size={20} className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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
                  value={formData.startDate.split("T")[0]}
                  min={new Date().toISOString().split("T")[0]}
                  disabled
                  // onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
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
                  value={formData.deadline.split("T")[0]}
                  min={formData.startDate.split("T")[0]}
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
                  <option value="" disabled={loading}>{loading ? "Loading..." : "Select supervisor"}</option>
                  {admins.length > 0 ? admins.map((admin) => (
                    <option key={admin.id} value={admin.id}>
                      {admin.name} - {admin.workingAs || 'Admin'}
                    </option>
                  )) : (<option value="" disabled>No admins available</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 dark:text-white">
                  Repository
                </label>
                <input
                  type="text"
                  value={formData.repository || ""}
                  onChange={(e) => setFormData({ ...formData, repository: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Make sure URL contains .git"
                // required
                />
              </div>
            </div>

            {/* Technology Stack Section */}
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-white">
                Technology Stack
              </label>

              {/* Current Tech Stack */}
              <div className="mb-4">
                {techStack.length > 0 ? (
                  <div className="space-y-2 mb-4">
                    {techStack.map((tech, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-2 rounded">
                        <span className="text-sm dark:text-white">
                          <strong>{tech.key}:</strong> {tech.value}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeTech(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    No technology stack configured yet
                  </div>
                )}
              </div>

              {/* Add New Tech */}
              <div className="grid grid-cols-3 gap-2">
                <select
                  value={newTech.key}
                  onChange={(e) => setNewTech({ ...newTech, key: e.target.value, value: '' })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                >
                  <option value="">Select category</option>
                  {predefinedTech.map((cat) => (
                    <option key={cat.key} value={cat.key}>{cat.key}</option>
                  ))}
                  <option value="custom">Custom</option>
                </select>

                {newTech.key === 'custom' ? (
                  <input
                    type="text"
                    placeholder="Enter custom category"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                  />
                ) : newTech.key && predefinedTech.find(cat => cat.key === newTech.key) ? (
                  <select
                    value={newTech.value}
                    onChange={(e) => setNewTech({ ...newTech, value: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                  >
                    <option value="">Select technology</option>
                    {predefinedTech.find(cat => cat.key === newTech.key)?.options.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                    <option value="other">Other</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder="Enter technology"
                    value={newTech.value}
                    onChange={(e) => setNewTech({ ...newTech, value: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                  />
                )}

                {newTech.key === 'custom' && (
                  <input
                    type="text"
                    placeholder="Enter technology"
                    value={newTech.value}
                    onChange={(e) => setNewTech({ ...newTech, value: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                  />
                )}

                <button
                  type="button"
                  onClick={() => {
                    if (newTech.key === 'custom' && customCategory && newTech.value) {
                      setTechStack([...techStack, { key: customCategory, value: newTech.value }]);
                      setNewTech({ key: '', value: '' });
                      setCustomCategory('');
                    } else if (newTech.key && newTech.value) {
                      setTechStack([...techStack, newTech]);
                      setNewTech({ key: '', value: '' });
                    }
                  }}
                  disabled={newTech.key === 'custom' ? (!customCategory || !newTech.value) : (!newTech.key || !newTech.value)}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Project Phase Section */}
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-white">
                Current Project Phase
              </label>
              <select
                value={currentPhase}
                onChange={(e) => setCurrentPhase(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">Select current phase</option>
                <option value="Design">Design</option>
                <option value="Code">Code</option>
                <option value="Testing">Testing</option>
                <option value="Deployment">Deployment</option>
              </select>
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


            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => showModel(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <CheckCheck size={16} />
                    Update Project
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

const ProgressGauge = ({ progress }: { progress?: number }) => {
  const circumference = 2 * Math.PI * 45;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - ((progress || 0) / 100) * circumference;

  return (
    <div className="relative w-32 h-32">
      <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="#e5e7eb"
          strokeWidth="8"
          fill="none"
        />
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="#8b5cf6"
          strokeWidth="8"
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-300"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-3xl font-bold text-gray-900 dark:text-white">{progress || 0}%</span>
      </div>
    </div>
  );
};

const TeamMemberCard = ({ member }: { member: Member }) => (
  <div className="bg-white border border-gray-300 dark:bg-gray-900 dark:border-gray-600 rounded-xl p-4 mt-3">
    <div className="flex items-center gap-3">
      <div className="w-14 h-14 bg-gray-300 dark:bg-gray-700 rounded-full flex items-center justify-center">
        {member.user.image ? (
          <div className="w-14 h-14 relative">
            <div className={`absolute w-3 h-3 rounded-full ${member.user.isLogin ? "bg-green-400" : "bg-gray-400"} right-0 bottom-1 z-50`}></div>
            <img src={member.user.image} alt={member.user.name} className="w-full h-full rounded-full object-cover" />
          </div>
        ) : (
          <div className="w-14 h-14 relative flex items-center justify-center">
            <div className={`absolute w-3 h-3 rounded-full ${member.user.isLogin ? "bg-green-400" : "bg-gray-400"} right-0 bottom-1 z-50`}></div>
            <User size={28} className="text-gray-500 dark:text-gray-400" />
          </div>
        )}
      </div>
      <div>
        <h3 className="font-semibold text-gray-900 dark:text-white">{member.user.name}</h3>
        <p className="text-sm text-gray-500">{member.role || 'Team Member'}</p>
      </div>
    </div>
  </div>
);

export default function OverviewTab({ project }: OverviewTabProps) {
  const [milestones, setMilestones] = useState({ ongoing: 0, total: 0 });
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [newProgress, setNewProgress] = useState(project?.progress || 0);
  const [currentProgress, setCurrentProgress] = useState(project?.progress || 0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editModel, setEditModel] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [isLeader, setIsLeader] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isEmployee, setEmployee] = useState(false)
  // const [customCategory, setCustomCategory] = useState('');
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [budgetData, setBudgetData] = useState({
    scopeTitle: '',
    paidAmount: 0,
    totalBudget: project?.projectInfo?.budget || 0,
    docs: []
  });
  const [clientId, setClientId] = useState<string | null>(null);
  const [showDesignerModal, setShowDesignerModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isDesigner, setIsDesigner] = useState(false);
  const [designSystemInfo, setDesignSystemInfo] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const copyTextToClipboard = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const router = useRouter();

  useEffect(() => {
    if (!project?.id) return;
    setNewProgress(project.progress || 0);
    setCurrentProgress(project.progress || 0);

    const checkUserRole = async () => {
      try {
        const response = await fetch('/api/user');

        const data = await response.json();

        setCurrentUser(data.user);

        project.members.filter((v: any) => v.user.id === data.user.id).map((e) => {
          setIsLeader(e.isLeader);
          // Check if user is a UI/UX designer
          if (e.role && (e.role.toLowerCase().includes('designer') || e.role.toLowerCase().includes('designer'))) {
            setIsDesigner(true);
          }
        });

        if (data.user && data.user.role === "EMPLOYEE") {
          setEmployee(true);
        }

        if (data.user && data.user.role === 'ADMIN') {
          setIsAdmin(true);
        }

        // Find client member to get clientId and fetch budget data
        const clientMember = project.members?.find(member => member.user.role === 'CLIENT');
        if (clientMember) {
          setClientId(clientMember.user.id);

          // Fetch budget data to get current values and docs
          try {
            const budgetResponse = await fetch(`/api/client/analytics/budget?clientId=${clientMember.user.id}&projectId=${project.id}`);
            const budgetResult = await budgetResponse.json();
            if (budgetResult.success) {
              setBudgetData({
                scopeTitle: budgetResult.data.scopeTitle || '',
                paidAmount: budgetResult.data.paidAmount || 0,
                totalBudget: budgetResult.data.totalBudget || 0,
                docs: budgetResult.data.docs || []
              });
            }
          } catch (error) {
            console.error('Failed to fetch budget data:', error);
          }

          // Fetch design system info for display
          try {
            const designResponse = await fetch(`/api/client/analytics/design?clientId=${clientMember.user.id}&projectId=${project.id}`);
            const designResult = await designResponse.json();
            if (designResult.success) {
              setDesignSystemInfo(designResult.data);
            }
          } catch (error) {
            console.error('Failed to fetch design system info:', error);
          }
        }
      } catch (error) {
        console.error('Failed to check user role:', error);
      }
    };

    const fetchMilestones = async () => {
      try {
        const res = await fetch(`/api/project/milestone?projectId=${project.id}`);
        const data = await res.json();
        if (data.success && data.milestones) {
          const total = data.milestones.length;
          const ongoing = data.milestones.filter((milestone: any) =>
            milestone.status === 'PENDING' || milestone.status === 'IN_PROGRESS'
          ).length;

          setMilestones({ ongoing, total });
        }
      } catch (err) {
        console.error("Failed to fetch milestones:", err);
      }
    };

    checkUserRole();
    fetchMilestones();
  }, [project]);

  const handleProgressUpdate = async () => {
    if (newProgress < 0 || newProgress > 100) {
      toast.error('Progress must be between 0 and 100');
      return;
    }

    setUpdating(true);
    try {
      const response = await fetch(`/api/project/progress?id=${project.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progress: newProgress }),
      });

      if (response.ok) {
        toast.success('Progress updated successfully');
        setShowProgressModal(false);
        setCurrentProgress(newProgress);
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to update progress');
      }
    } catch (error) {
      toast.error('Failed to update progress');
    } finally {
      setUpdating(false);
    }
  };
  const deleteProject = async (projectId: string) => {
    if (!confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`/api/project?projectId=${projectId}`, {
        method: 'DELETE',

      })
      const data = await response.json();
      if (data.success) {
        toast.success('Project deleted successfully');
        router.back();
      } else {
        toast.error(data.message || 'Failed to delete project');
      }
    } catch (e) {
      toast.error('Failed to delete project', e);
    } finally {

    }
  }

  if (!project) return null;

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 relative">
        {
          editModel && <EditModal showModel={setEditModel} projectData={project} />
        }
        {
          showDesignerModal && <DesignerModal showModal={setShowDesignerModal} projectData={project} currentUser={currentUser} />
        }
        {/* Left Column */}
        <div className="space-y-6">
          {/* Top Row - Progress and Milestones side by side */}
          <div className="grid grid-cols-2 gap-6">
            {/* Overall Progress */}
            <div className="bg-white border border-gray-300 dark:bg-gray-900 dark:border-gray-600 rounded-2xl p-6 flex flex-col items-center justify-center">
              <ProgressGauge progress={currentProgress} />
              <h3 className="mt-4 text-base font-semibold text-gray-900 dark:text-white">
                Overall Progress
              </h3>
              {(isAdmin || isLeader) && (
                <button
                  onClick={() => {
                    setNewProgress(project.progress || 0);
                    setShowProgressModal(true);
                  }}
                  className="right-6 bottom-6 mt-2 px-4 py-1 bg-purple-600 text-white text-sm rounded-full hover:bg-purple-700 transition-colors"
                >
                  <ArrowUp size={16} className="inline-block mr-1" />
                </button>
              )}
            </div>

            {/* Ongoing Milestones */}
            <div className="bg-gradient-to-br from-white to-purple-700 rounded-2xl p-6 flex flex-col items-center justify-center text-white">
              <div className="text-center">
                <div className="text-5xl font-bold mb-2">
                  {milestones.ongoing}
                  <span className="text-3xl font-normal">/{milestones.total}</span>
                </div>
                <p className="text-white/90 text-sm">Ongoing Milestones</p>
              </div>
            </div>
          </div>
          {
            project?.repository && (
              <div className="">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Repository</h2>
                <div className="w-full h-28 bg-blue-400/10 border border-blue-500 rounded-lg px-4 py-4">
                  <p className="text-xs text-gray-400">{project.repository?.split("/")[4]?.split(".git")[0]}</p>
                  <div className="my-1 w-full h-11 rounded-lg relative px-1 border border-blue-600/80 bg-blue-400/20 flex items-center justify-between">
                    <p className="font-mono px-2 font-medium">{project.repository}</p>
                    <div onClick={() => { isCopied ? () => { } : copyTextToClipboard(project.repository) }} className={`w-8 h-8 cursor-pointer bg-blue-500 rounded-sm grid place-items-center transition-all`}>
                      {
                        isCopied ? <LucideCheckCheck className={`${isCopied ? "opacity-100" : "opacity-0"} transition-all`} size={16} /> : <LucideCopy className={`${isCopied ? "opacity-0" : "opacity-100"} transition-all`} size={16} />
                      }
                    </div>
                  </div>
                  <p className="text-xs text-gray-200 text-right w-full">Clone the Repository</p>
                </div>
              </div>
            )
          }

          {/* Team Members - Full width below */}
          <div className="">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Team Members</h2>
            </div>
            {project.members && project.members.length > 0 ? (
              project.members.map((member) => {
                if (isEmployee && member.user.role === "CLIENT") {
                  return null;
                }
                return (
                  <TeamMemberCard key={member.user.id} member={member} />
                )
              }

              )
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No team members assigned</p>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Project Information */}
          <div className="bg-white border border-gray-300 dark:bg-gray-900 dark:border-gray-600 rounded-2xl p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Project Information
              </h2>
              {
                isAdmin && (
                  <div className="flex gap-2 justify-center items-center">
                    {(isAdmin || isDesigner) && (
                      <button
                        onClick={() => setShowDesignerModal(true)}
                        className="text-gray-500 hover:text-blue-400  cursor-pointer "                      >
                        <Palette size={16} />
                      </button>
                    )}
                    <div onClick={() => { setShowBudgetModal(true) }} className="text-gray-500 hover:text-green-400 cursor-pointer" title="Edit Budget">
                      <DollarSign size={18} />
                    </div>
                    <div onClick={() => { setEditModel(true) }} className="text-gray-500 hover:text-blue-400  cursor-pointer ">
                      <LucideEdit3 size={18} />
                    </div>
                    <div
                      onClick={() => deleteProject(project.id)}
                      className="w-8 h-8 text-gray-500 hover:text-red-400 transition-all cursor-pointer rounded-full grid place-items-center"><LucideTrash size={18} /></div>
                  </div>
                )
              }
            </div>
            <div className="space-y-4">
              <div>
                <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${project.priority === 'HIGH' ? 'bg-red-500/20 text-red-500' :
                  project.priority === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-500' :
                    'bg-green-500/20 text-green-500'
                  }`}>
                  {project.priority} Priority
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {project.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {project.summary}
                </p>
              </div>


              {isAdmin && project.projectInfo?.budget && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                    Budget
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    ₹ {project.projectInfo.budget.toLocaleString()}
                  </p>
                </div>
              )}

              {project.projectInfo?.startDate && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                    Start Date
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(project.projectInfo.startDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}

              {project.projectInfo?.deadline && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                    Deadline
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(project.projectInfo.deadline).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}

              {project.basicDetails && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                    Details
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {project.basicDetails}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Work Done History */}
          <div className="bg-white border border-gray-300 dark:bg-gray-900 dark:border-gray-600 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Work Done History
            </h2>
            <LatestUpdates projectId={project.id} />
          </div>
        </div>

        {/* Budget Modal */}
        {showBudgetModal && clientId && (
          <BudgetModal
            isOpen={showBudgetModal}
            onClose={() => setShowBudgetModal(false)}
            clientId={clientId}
            projectId={project.id}
            currentData={budgetData}
            onUpdate={() => {
              // Refresh project data or handle update
              window.location.reload();
            }}
          />
        )}

        {/* Progress Update Modal with Slider */}
        {showProgressModal && isAdmin && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold dark:text-white">Update Progress</h2>
                <button
                  onClick={() => setShowProgressModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="block text-sm font-medium dark:text-white">
                      Progress Percentage
                    </label>
                    <span className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                      {newProgress}%
                    </span>
                  </div>

                  {/* Custom Slider */}
                  <div className="relative">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={newProgress}
                      onChange={(e) => setNewProgress(Number(e.target.value))}
                      className="w-full h-3 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${newProgress}%, #e5e7eb ${newProgress}%, #e5e7eb 100%)`
                      }}
                    />
                  </div>

                  {/* Percentage markers */}
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2 px-1">
                    <span>0%</span>
                    <span>25%</span>
                    <span>50%</span>
                    <span>75%</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Progress visualization */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-4">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-purple-600 h-4 rounded-full transition-all duration-300"
                      style={{ width: `${newProgress}%` }}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowProgressModal(false)}
                    className="flex-1 px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleProgressUpdate}
                    disabled={updating}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 font-medium transition-all"
                  >
                    {updating ? 'Updating...' : 'Update Progress'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Design System Info - FULL WIDTH FIX */}
      {designSystemInfo && (
        <div className="w-full">
          <div className="flex justify-between w-full gap-6">

            {/* Design System Card */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border-2 border-blue-200 dark:border-blue-800 relative w-100">
              <div className="absolute -top-3 right-16">
                <span className="bg-blue-500 text-white px-4 py-1 rounded-sm text-sm font-medium">
                  Design System
                </span>
              </div>

              <div className="mt-4 space-y-6">
                {/* Colors */}
                {designSystemInfo.colors && designSystemInfo.colors.length > 0 && designSystemInfo.colors[0] !== 'null' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Colors
                    </h3>
                    <div className="flex gap-2 flex-wrap">
                      {designSystemInfo.colors.map((color, index) => (
                        <div
                          key={index}
                          className="group flex items-center h-8 w-8 hover:w-24 px-2 rounded-full border-2 border-gray-200 dark:border-gray-600 transition-all duration-300 ease-out cursor-pointer overflow-hidden"
                          style={{ backgroundColor: color }}
                        >
                          <span className="ml-2 text-xs font-semibold text-white opacity-0 group-hover:opacity-100 translate-x-[-6px] group-hover:translate-x-0 transition-all duration-300 whitespace-nowrap">
                            {color.toUpperCase()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Design Language - Sliding Content */}
                <div className="overflow-hidden relative h-40">
                  <div
                    className="flex transition-transform duration-500 ease-out"
                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                  >
                    {/* Slide 1 */}
                    <div className="min-w-full space-y-4">
                      {designSystemInfo.brandName && designSystemInfo.brandName !== 'Not set' && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Brand Name</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white max-w-32 truncate" title={designSystemInfo.brandName}>
                            {designSystemInfo.brandName}
                          </span>
                        </div>
                      )}

                      {designSystemInfo.designType && designSystemInfo.designType.length > 0 && designSystemInfo.designType[0] !== 'null' && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Design Type</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white max-w-32 truncate" title={designSystemInfo.designType.join(", ")}>
                            {designSystemInfo.designType.join(", ")}
                          </span>
                        </div>
                      )}

                      {designSystemInfo.brandFeel && designSystemInfo.brandFeel !== 'null' && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Brand Feel</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white max-w-32 truncate" title={designSystemInfo.brandFeel}>
                            {designSystemInfo.brandFeel}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Slide 2 */}
                    <div className="min-w-full space-y-4">
                      {designSystemInfo.contentTone && designSystemInfo.contentTone.length > 0 && designSystemInfo.contentTone[0] !== 'null' && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Content Tone</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white max-w-32 truncate" title={designSystemInfo.contentTone.join(", ")}>
                            {designSystemInfo.contentTone.join(", ")}
                          </span>
                        </div>
                      )}

                      {designSystemInfo.theme && designSystemInfo.theme.length > 0 && designSystemInfo.theme[0] !== 'null' && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Theme</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white max-w-32 truncate" title={designSystemInfo.theme.join(", ")}>
                            {designSystemInfo.theme.join(", ")}
                          </span>
                        </div>
                      )}

                      {designSystemInfo.keyPages && designSystemInfo.keyPages.length > 0 && designSystemInfo.keyPages[0] !== 'null' && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Key Pages</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white max-w-32 truncate" title={designSystemInfo.keyPages.join(", ")}>
                            {designSystemInfo.keyPages.join(", ")}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Slide 3 */}
                    <div className="min-w-full space-y-4">
                      {designSystemInfo.fonts && Object.keys(designSystemInfo.fonts).length > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Fonts</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white max-w-32 truncate" title={Object.keys(designSystemInfo.fonts).join(", ")}>
                            {Object.keys(designSystemInfo.fonts).join(", ")}
                          </span>
                        </div>
                      )}

                      {designSystemInfo.layoutStyle && Object.keys(designSystemInfo.layoutStyle).length > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Layout Style</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white max-w-32 truncate" title={Object.keys(designSystemInfo.layoutStyle).join(", ")}>
                            {Object.keys(designSystemInfo.layoutStyle).join(", ")}
                          </span>
                        </div>
                      )}

                      {designSystemInfo.visualGuidelines && Object.keys(designSystemInfo.visualGuidelines).length > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Visual Guidelines</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white max-w-32 truncate" title={Object.keys(designSystemInfo.visualGuidelines).join(", ")}>
                            {Object.keys(designSystemInfo.visualGuidelines).join(", ")}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Slide 4 */}
                    <div className="min-w-full space-y-4">
                      {designSystemInfo.uniqueness && Object.keys(designSystemInfo.uniqueness).length > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Uniqueness</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white max-w-32 truncate" title={Object.keys(designSystemInfo.uniqueness).join(", ")}>
                            {Object.keys(designSystemInfo.uniqueness).join(", ")}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Navigation Button */}
                <div className="flex justify-end items-center">
                  <button
                    onClick={() => setCurrentSlide((prev) => (prev + 1) % 4)}
                    className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400 py-1 px-4 rounded-full flex items-center gap-2 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                  >
                    <span className="font-medium">Fonts</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Unified Card */}
            <div className="w-full bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-300/50 dark:border-gray-700 flex overflow-hidden relative">

              {/* Current Phase */}
              <div className="flex-1 p-6 relative overflow-hidden min-w-0">
                <div className="relative mb-5 flex flex-col items-start">
                  <h3 className="text-xl text-gray-700/60 dark:text-gray-300 mb-4">
                    Current Phase
                  </h3>
                  <div className="h-1 w-full absolute -left-10 top-8 bg-gray-300 dark:bg-gray-600"></div>
                </div>

                <div className="space-y-3 pb-8">
                  {designSystemInfo.projectPhase?.phases?.map((phase) => {
                    const isActive = phase.name === designSystemInfo.projectPhase.current;
                    return (
                      <div
                        key={phase.name}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-lg font-medium transition-all
                    ${isActive ? "bg-purple-500 text-white shadow-lg" : "text-gray-600 dark:text-gray-400"}`}
                      >
                        {phase.name}
                      </div>
                    );
                  }) || (
                      <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-lg font-medium bg-purple-500 text-white shadow-lg">
                        {designSystemInfo.projectPhase?.current || 'Design'}
                      </div>
                    )}
                </div>

                {/* Bottom Inner Shadow */}
                {/* <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-gray-300/60 dark:from-gray-700/40 to-transparent"></div> */}
              </div>

              {/* Divider */}
              <div className="h-full w-1 bg-gray-300 dark:bg-gray-600 flex-shrink-0"></div>

              {/* Technology Used */}
              <div className="flex-1 p-6 relative overflow-hidden min-w-0">
                <div className="relative flex flex-col mb-5 items-start">
                  <h3 className="text-xl text-gray-700/60 dark:text-gray-300 mb-6">
                    Technology Used
                  </h3>
                  <div className="h-1 w-[calc(100%+40px)] absolute -left-10 top-8 bg-gray-300 dark:bg-gray-600"></div>
                </div>

                {/* Scrollable area */}
                {designSystemInfo.technology && designSystemInfo.technology.length > 0 ? (
                  <div className="space-y-5 text-sm overflow-y-auto max-h-[260px] pr-2" style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                  }}>
                    {designSystemInfo.technology.map((item, index) => (
                      <div key={index} className="flex justify-between items-center gap-4">
                        <span className="text-gray-500 dark:text-gray-400 flex-shrink-0">{item.key}</span>
                        <span className="font-medium text-gray-900 dark:text-white text-right">
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500 dark:text-gray-400 text-sm text-center py-8">
                    No technology stack configured
                  </div>
                )}

                {/* Bottom Inner Shadow */}
                {/* <div className="pointer-events-none absolute inset-x-0 bottom-0 h-30 bg-gradient-to-t from-gray-300/60 dark:from-gray-700/40 to-transparent"></div> */}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}