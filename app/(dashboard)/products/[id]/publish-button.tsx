"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Globe, FileEdit, Loader2 } from "lucide-react";
import { publishProduct, unpublishProduct } from "../actions";

export default function PublishButton({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    startTransition(async () => {
      if (status === "published") {
        await unpublishProduct(id);
      } else {
        await publishProduct(id);
      }
    });
  }

  if (status === "published") {
    return (
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5"
        onClick={handleToggle}
        disabled={isPending}
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FileEdit className="h-4 w-4" />
        )}
        Dépublier
      </Button>
    );
  }

  return (
    <Button
      size="sm"
      className="gap-1.5"
      onClick={handleToggle}
      disabled={isPending}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Globe className="h-4 w-4" />
      )}
      Publier
    </Button>
  );
}
