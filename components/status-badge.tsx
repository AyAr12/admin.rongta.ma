import { Badge } from "@/components/ui/badge";
import { FileEdit, Globe } from "lucide-react";

export default function StatusBadge({ status }: { status: string }) {
  if (status === "published") {
    return (
      <Badge className="gap-1 bg-emerald-50 text-emerald-700 border-emerald-200">
        <Globe className="h-3 w-3" />
        Publié
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className="gap-1">
      <FileEdit className="h-3 w-3" />
      Brouillon
    </Badge>
  );
}
