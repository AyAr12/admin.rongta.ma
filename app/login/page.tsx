"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    const result = await signIn("credentials", {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Email ou mot de passe incorrect.");
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left panel - branding */}
      <div className="hidden w-1/2 flex-col justify-between bg-[#1a1f2e] p-12 lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FF6400]">
            <span className="text-xl font-bold text-white">R</span>
          </div>
          <div>
            <p className="text-lg font-semibold text-white">Rongta Maroc</p>
            <p className="text-xs tracking-widest text-slate-400 uppercase">
              Administration
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <div className="h-px w-12 bg-[#FF6400]" />
            <h2 className="text-3xl font-semibold leading-tight text-white">
              Gérez votre catalogue
              <br />
              produits en toute
              <br />
              simplicité.
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-slate-400">
            Tableau de bord centralisé pour la gestion de vos catégories,
            produits et ressources du site rongta.ma
          </p>
        </div>

        <p className="text-xs text-slate-500">
          &copy; {new Date().getFullYear()} Rongta Maroc. Tous droits réservés.
        </p>
      </div>

      {/* Right panel - login form */}
      <div className="flex w-full flex-col items-center justify-center px-6 lg:w-1/2">
        <div className="mb-8 flex items-center gap-3 lg:hidden">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FF6400]">
            <span className="text-xl font-bold text-white">R</span>
          </div>
          <div>
            <p className="text-lg font-semibold">Rongta Maroc</p>
            <p className="text-xs tracking-widest text-muted-foreground uppercase">
              Administration
            </p>
          </div>
        </div>

        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">Connexion</h1>
            <p className="text-sm text-muted-foreground">
              Entrez vos identifiants pour accéder au tableau de bord.
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="admin@rongta.ma"
                required
                autoComplete="email"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="h-11"
              />
            </div>

            <Button
              type="submit"
              className="h-11 w-full text-base"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connexion...
                </>
              ) : (
                "Se connecter"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
