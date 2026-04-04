"use client";

import { usePathname } from "next/navigation";
import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const pageTitles: Record<string, string> = {
  "/": "Tableau de bord",
  "/products": "Produits",
  "/products/new": "Nouveau produit",
  "/categories": "Catégories",
  "/categories/new": "Nouvelle catégorie",
  "/settings": "Paramètres",
};

export default function AdminHeader({
  userName,
}: {
  userName?: string | null;
}) {
  const pathname = usePathname();

  const title =
    pageTitles[pathname] ||
    Object.entries(pageTitles).find(
      ([key]) => key !== "/" && pathname.startsWith(key),
    )?.[1] ||
    "Administration";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-white/80 px-6 backdrop-blur-sm">
      <div>
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher..."
            className="h-9 w-64 pl-9 text-sm"
          />
        </div>

        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-2.5 border-l border-border pl-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FF6400] text-xs font-semibold text-white">
            {userName
              ? userName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
              : "A"}
          </div>
          <span className="hidden text-sm font-medium md:block">
            {userName || "Admin"}
          </span>
        </div>
      </div>
    </header>
  );
}
