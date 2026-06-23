import React, { useEffect, useState } from "react";
import { FileText, Loader, RefreshCw, Save } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_BASE = "/api/v1";

function BookingGuidelines() {
  const [guidelines, setGuidelines] = useState(null);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const headers = () => {
    const token = localStorage.getItem("accessToken");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: token }),
    };
  };

  const fetchGuidelines = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/booking-guidelines/global`, {
        headers: headers(),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to load booking guidelines");
      }

      setGuidelines(result.data || null);
      setContent(result.data?.content ?? "");
    } catch (error) {
      toast.error(error.message || "Failed to load booking guidelines");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuidelines();
  }, []);

  const saveGuidelines = async () => {
    try {
      const normalizedContent = content.trim();
      if (!normalizedContent) {
        throw new Error("Guidelines content is required");
      }

      setSaving(true);
      const hasSavedRecord = Boolean(guidelines?._id);
      const response = await fetch(`${API_BASE}/booking-guidelines/global`, {
        method: hasSavedRecord ? "PATCH" : "POST",
        headers: headers(),
        body: JSON.stringify({ content }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to save booking guidelines");
      }

      setGuidelines(result.data);
      setContent(result.data?.content ?? content);
      toast.success(hasSavedRecord ? "Booking guidelines updated" : "Booking guidelines created");
    } catch (error) {
      toast.error(error.message || "Failed to save booking guidelines");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-6 h-6 animate-spin text-green-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <ToastContainer />
      <section className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-50">
              <FileText className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Booking Guidelines</h1>
              <p className="text-sm text-gray-500">Text shown before a player confirms a lobby booking.</p>
            </div>
          </div>
          <button
            onClick={fetchGuidelines}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Popup text
            </label>
            <textarea
              className="w-full min-h-[340px] border border-gray-300 rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-green-400 font-mono text-sm leading-6"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Enter booking guidelines"
              disabled={saving}
            />
          </div>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="text-sm text-gray-600">
              Current status:{" "}
              <span className="font-semibold text-gray-900">
                {guidelines?._id ? "Saved custom guidelines" : "Default sample guidelines"}
              </span>
            </p>
          </div>

          <button
            onClick={saveGuidelines}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500 text-white font-medium hover:bg-green-600 disabled:opacity-60"
          >
            {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {guidelines?._id ? "Update" : "Create"}
          </button>
        </div>
      </section>
    </div>
  );
}

export default BookingGuidelines;
