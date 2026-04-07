import prisma from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Building2, Phone, Mail, MessageSquare } from "lucide-react";
import ResellerStatusSelect from "./status-select";

const statusConfig: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  pending: { label: "En attente", variant: "outline" },
  contacted: { label: "Contacté", variant: "secondary" },
  approved: { label: "Approuvé", variant: "default" },
  rejected: { label: "Rejeté", variant: "destructive" },
};

export default async function ResellersPage() {
  const requests = await prisma.resellerRequest.findMany({
    orderBy: { createdAt: "desc" },
  });

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          Demandes revendeurs
        </h2>
        <p className="text-sm text-muted-foreground">
          {requests.length} demande{requests.length !== 1 && "s"} ·{" "}
          {pendingCount > 0 && (
            <span className="text-[#FF6400] font-medium">
              {pendingCount} en attente
            </span>
          )}
          {pendingCount === 0 && "Aucune en attente"}
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          {requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-4">
                <Building2 className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">Aucune demande</p>
              <p className="text-sm text-muted-foreground mt-1">
                Les demandes de revendeurs apparaîtront ici.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Société</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead className="hidden md:table-cell">Notes</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="hidden sm:table-cell">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((req) => {
                  const cfg = statusConfig[req.status] || statusConfig.pending;
                  return (
                    <TableRow key={req.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="font-medium">{req.companyName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-sm">
                            <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                            <a
                              href={`tel:${req.phone}`}
                              className="hover:underline"
                            >
                              {req.phone}
                            </a>
                          </div>
                          {req.email && (
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                              <Mail className="h-3.5 w-3.5" />
                              <a
                                href={`mailto:${req.email}`}
                                className="hover:underline"
                              >
                                {req.email}
                              </a>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {req.notes ? (
                          <p className="text-sm text-muted-foreground max-w-xs truncate">
                            {req.notes}
                          </p>
                        ) : (
                          <span className="text-muted-foreground/50">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <ResellerStatusSelect
                          id={req.id}
                          currentStatus={req.status}
                        />
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                        {new Date(req.createdAt).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
