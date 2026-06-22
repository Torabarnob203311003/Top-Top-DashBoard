import React, { useEffect, useState } from "react";
import { Loader, Percent, RefreshCw, Save } from "lucide-react";
import toast from "react-hot-toast";

const API_BASE = "/api/v1";

function TransactionFees() {
  const [setting, setSetting] = useState(null);
  const [percentage, setPercentage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const headers = () => {
    const token = localStorage.getItem("accessToken");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: token }),
    };
  };

  const fetchSetting = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/transaction-fees/global`, {
        headers: headers(),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to load transaction fee setting");
      }
      setSetting(result.data || null);
      setPercentage(result.data?.percentage ?? "");
    } catch (error) {
      toast.error(error.message || "Failed to load transaction fees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSetting();
  }, []);

  const saveSetting = async () => {
    try {
      const numericPercentage = Number(percentage || 0);
      if (!Number.isFinite(numericPercentage) || numericPercentage < 0) {
        throw new Error("Percentage must be a non-negative number");
      }

      setSaving(true);
      const response = await fetch(`${API_BASE}/transaction-fees/global`, {
        method: setting ? "PATCH" : "POST",
        headers: headers(),
        body: JSON.stringify({ percentage: numericPercentage }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to save transaction fee setting");
      }

      setSetting(result.data);
      setPercentage(result.data?.percentage ?? numericPercentage);
      toast.success(setting ? "Transaction fee updated" : "Transaction fee created");
    } catch (error) {
      toast.error(error.message || "Failed to save transaction fee setting");
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
    <div className="max-w-3xl mx-auto">
      <section className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Transaction Fees</h1>
            <p className="text-sm text-gray-500">Global percentage applied to online payments.</p>
          </div>
          <button
            onClick={fetchSetting}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Global percentage
            </label>
            <div className="relative">
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-green-400"
                type="number"
                min="0"
                step="0.01"
                value={percentage}
                onChange={(event) => setPercentage(event.target.value)}
                placeholder="0"
              />
              <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="text-sm text-gray-600">
              Current status:{" "}
              <span className="font-semibold text-gray-900">
                {setting ? `${setting.percentage}%` : "No global fee record created"}
              </span>
            </p>
          </div>

          <button
            onClick={saveSetting}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500 text-white font-medium hover:bg-green-600 disabled:opacity-60"
          >
            {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {setting ? "Update" : "Create"}
          </button>
        </div>
      </section>
    </div>
  );
}

export default TransactionFees;
