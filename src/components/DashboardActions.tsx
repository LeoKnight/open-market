"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Pencil, Trash2, CheckCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardActionsProps {
  listingId: string;
  currentStatus: string;
}

export default function DashboardActions({ listingId, currentStatus }: DashboardActionsProps) {
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
    } catch { alert("Failed to update status"); } finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this listing? This cannot be undone.")) return;
    setLoading(true);
    try {
      await fetch(`/api/listings/${listingId}`, { method: "DELETE" });
      router.refresh();
    } catch { alert("Failed to delete listing"); } finally { setLoading(false); }
  };

  return (
    <div className="flex items-center gap-2 mt-3">
      <Button variant="outline" size="sm" asChild>
        <Link href={`/listings/${listingId}/edit`}>
          <Pencil className="h-3 w-3" /> Edit
        </Link>
      </Button>

      {currentStatus === "ACTIVE" && (
        <Button variant="outline" size="sm" onClick={() => updateStatus("SOLD")} disabled={loading} className="text-green-600 hover:text-green-700 border-green-200 hover:bg-green-50">
          <CheckCircle className="h-3 w-3" /> Mark Sold
        </Button>
      )}

      {currentStatus === "SOLD" && (
        <Button variant="outline" size="sm" onClick={() => updateStatus("ACTIVE")} disabled={loading}>
          <RotateCcw className="h-3 w-3" /> Reactivate
        </Button>
      )}

      <Button variant="outline" size="sm" onClick={handleDelete} disabled={loading} className="text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/5">
        <Trash2 className="h-3 w-3" /> Delete
      </Button>
    </div>
  );
}
