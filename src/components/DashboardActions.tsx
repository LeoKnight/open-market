"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Pencil, Trash2, CheckCircle, RotateCcw } from "lucide-react";

interface DashboardActionsProps {
  listingId: string;
  currentStatus: string;
}

export default function DashboardActions({
  listingId,
  currentStatus,
}: DashboardActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const updateStatus = async (status: string) => {
    setLoading(true);
    try {
      await fetch(`/api/listings/${listingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      router.refresh();
    } catch {
      alert("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this listing? This cannot be undone.")) {
      return;
    }

    setLoading(true);
    try {
      await fetch(`/api/listings/${listingId}`, { method: "DELETE" });
      router.refresh();
    } catch {
      alert("Failed to delete listing");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2 mt-3">
      <Link
        href={`/listings/${listingId}/edit`}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
      >
        <Pencil className="w-3 h-3" />
        Edit
      </Link>

      {currentStatus === "ACTIVE" && (
        <button
          onClick={() => updateStatus("SOLD")}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors disabled:opacity-50"
        >
          <CheckCircle className="w-3 h-3" />
          Mark Sold
        </button>
      )}

      {currentStatus === "SOLD" && (
        <button
          onClick={() => updateStatus("ACTIVE")}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50"
        >
          <RotateCcw className="w-3 h-3" />
          Reactivate
        </button>
      )}

      <button
        onClick={handleDelete}
        disabled={loading}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
      >
        <Trash2 className="w-3 h-3" />
        Delete
      </button>
    </div>
  );
}
