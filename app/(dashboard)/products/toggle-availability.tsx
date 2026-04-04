"use client";

import { useTransition } from "react";
import { toggleProductAvailability } from "./actions";

export default function ToggleAvailability({
  id,
  isAvailable,
}: {
  id: string;
  isAvailable: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    startTransition(async () => {
      await toggleProductAvailability(id);
    });
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className="inline-flex items-center gap-1.5 disabled:opacity-50"
      title={isAvailable ? "Marquer indisponible" : "Marquer disponible"}
    >
      <span
        className={`inline-flex h-5 w-9 items-center rounded-full px-0.5 transition-colors ${
          isAvailable ? "bg-emerald-500" : "bg-slate-300"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
            isAvailable ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </span>
    </button>
  );
}
