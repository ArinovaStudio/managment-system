"use client";

import { useEffect, useState } from "react";
import { Image, FileArchive, FileText, Plus, Loader2, Eye, Download, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export default function AssetsTab({ projectId }: { projectId: string }) {
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState("image");
  const [title, setTitle] = useState("");

    const checkUserRole = async () => {
    try {
      const response = await fetch('/api/user');
      const data = await response.json();
      if (data.user && data.user.role === 'ADMIN') {
        setIsAdmin(true);
      }
    } catch (error) {
      console.error('Failed to check user role:', error);
    }
  };

  useEffect(() => {
    checkUserRole();
    fetchAssets();
  }, [projectId]);



  const fetchAssets = async () => {
    try {
      const res = await fetch(`/api/project/assets?projectId=${projectId}`);
      const data = await res.json();

      if (data.success) setAssets(data.assets);
    } catch (err) {
      console.error("Asset fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const uploadAsset = async () => {
    if (!file) {
      toast.error("Please select a file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("projectId", projectId);
    formData.append("type", type);
    formData.append("title", title || file.name);

    try {
      setUploading(true);
      const res = await fetch("/api/project/assets", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setOpen(false);
        setFile(null);
        setTitle("");
        await fetchAssets();
        toast.success("Asset uploaded successfully!");
      } else {
        toast.error(data.message || "Upload failed");
      }
    } catch (error) {
      console.error(error);
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const deleteAsset = async (assetId: string) => {
    if (!confirm('Are you sure you want to delete this asset?')) return;
    
    try {
      const res = await fetch('/api/project/assets', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetId }),
      });
      
      const data = await res.json();
      if (data.success) {
        await fetchAssets();
        toast.success('Asset deleted successfully!');
      } else {
        toast.error(data.message || 'Failed to delete asset');
      }
    } catch (error) {
      toast.error('Failed to delete asset');
    }
  };

  const getIcon = (type: string) => {
    if (type === "image") return <Image className="text-blue-500" size={24} />;
    if (type === "zip") return <FileArchive className="text-yellow-500" size={24} />;
    return <FileText className="text-gray-400" size={24} />;
  };

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold dark:text-white">Assets</h2>

      {
        isAdmin && (
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
        >
          <Plus size={18} /> Upload Asset
        </button>
        )
      }

      </div>

      {/* EMPTY STATE */}
      {loading ? (
        <div className="text-gray-400">Loading...</div>
      ) : assets.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          No assets uploaded yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assets.map((a) => (
            <div
              key={a.id}
              className="p-4 border rounded-xl bg-white dark:bg-gray-800 dark:border-gray-700 flex gap-4 items-center"
            >
              {/* Thumbnail */}
              <div className="w-32 h-32 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                {a.type === "image" ? (
                  <img src={a.url} className="object-cover w-full h-full" />
                ) : (
                  getIcon(a.type)
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <p className="font-semibold dark:text-white">{a.title}</p>
                <p className="text-xs text-gray-500 mt-1">
                  UpdatedBy: {a.updatedBy || "Admin"} 
                </p>
              </div>

              {/* View & Delete */}
              <div className="flex gap-2">
                <button
                  onClick={() => window.open(a.url, '_blank')}
                  className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg"
                  title="View asset"
                >
                  <Eye className="text-blue-500" size={18} />
                </button>
                <button
                  onClick={() => deleteAsset(a.id)}
                  className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"
                  title="Delete asset"
                >
                  <Trash2 className="text-red-500" size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* UPLOAD MODAL */}
      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl max-w-md w-full border dark:border-gray-700">
            <h2 className="text-lg font-semibold dark:text-white mb-4">
              Upload Asset
            </h2>

            {/* File */}
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="mb-3"
            />

            {/* Type */}
            <label className="text-sm text-gray-600 dark:text-gray-400">
              Select Type
            </label>
            <select
              className="w-full p-2 rounded-lg bg-gray-100 dark:bg-gray-800 mb-3"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="image">Image</option>
              <option value="zip">Zip</option>
              <option value="document">Document</option>
            </select>

            {/* Title */}
            <input
              type="text"
              placeholder="Title (optional)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 rounded-lg bg-gray-100 dark:bg-gray-800 mb-4"
            />

            {/* Buttons */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg"
              >
                Cancel
              </button>

              <button
                disabled={uploading}
                onClick={uploadAsset}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2"
              >
                {uploading && <Loader2 className="animate-spin" size={16} />}
                {uploading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
