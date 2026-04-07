"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateResellerStatus } from "./actions";
import { Loader2 } from "lucide-react";

const statuses = [
  { value: "pending", label: "En attente" },
  { value: "contacted", label: "Contacté" },
  { value: "approved", label: "Approuvé" },
  { value: "rejected", label: "Rejeté" },
];

const colorMap: Record<string, string> = {
  pending: "border-amber-300 bg-amber-50 text-amber-700",
  contacted: "border-blue-300 bg-blue-50 text-blue-700",
  approved: "border-emerald-300 bg-emerald-50 text-emerald-700",
  rejected: "border-red-300 bg-red-50 text-red-700",
};

export default function ResellerStatusSelect({
  id,
  currentStatus,
}: {
  id: string;
  currentStatus: string;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    startTransition(async () => {
      await updateResellerStatus(id, e.target.value);
      router.refresh();
    });
  }

  return (
    <div className="relative inline-flex items-center">
      <select
        value={currentStatus}
        onChange={handleChange}
        disabled={isPending}
        className={`h-8 rounded-md border px-2 pr-7 text-xs font-medium appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring ${
          colorMap[currentStatus] || colorMap.pending
        } disabled:opacity-50`}
      >
        {statuses.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
      {isPending && (
        <Loader2 className="absolute right-1.5 h-3 w-3 animate-spin text-muted-foreground" />
      )}
    </div>
  );
}
