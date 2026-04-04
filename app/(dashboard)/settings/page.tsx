import { auth } from "@/lib/auth-helpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function ParametresPage() {
  const session = await auth();

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Compte administrateur</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Nom</span>
            <span className="font-medium">{session?.user?.name || "—"}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Email</span>
            <span className="font-medium">{session?.user?.email || "—"}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Rôle</span>
            <Badge variant="secondary">Administrateur</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informations système</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Application</span>
            <span className="font-medium">Admin Rongta Maroc v0.1.0</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Framework</span>
            <span className="font-medium">Next.js 16 (App Router)</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Base de données</span>
            <span className="font-medium">MongoDB Atlas</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
