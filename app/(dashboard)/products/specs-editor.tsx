"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  X,
  GripVertical,
  FolderPlus,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

type SpecItem = { key: string; value: string };
type SpecGroup = { group: string; items: SpecItem[]; collapsed?: boolean };

function parseDefault(
  val: Record<string, string> | SpecGroup[] | undefined
): SpecGroup[] {
  if (!val) return [{ group: "", items: [{ key: "", value: "" }] }];

  // New format: array of groups
  if (Array.isArray(val)) return val.length > 0 ? val : [{ group: "", items: [{ key: "", value: "" }] }];

  // Old format: flat object — convert to single ungrouped group
  const items = Object.entries(val).map(([key, value]) => ({ key, value }));
  return items.length > 0
    ? [{ group: "", items }]
    : [{ group: "", items: [{ key: "", value: "" }] }];
}

export default function SpecsEditor({
  defaultValue,
}: {
  defaultValue?: Record<string, string> | SpecGroup[];
}) {
  const [groups, setGroups] = useState<SpecGroup[]>(() =>
    parseDefault(defaultValue)
  );

  // ── Group operations ──

  function addGroup() {
    setGroups((prev) => [
      ...prev,
      { group: "", items: [{ key: "", value: "" }] },
    ]);
  }

  function removeGroup(gi: number) {
    setGroups((prev) => {
      if (prev.length <= 1)
        return [{ group: "", items: [{ key: "", value: "" }] }];
      return prev.filter((_, i) => i !== gi);
    });
  }

  function updateGroupName(gi: number, name: string) {
    setGroups((prev) =>
      prev.map((g, i) => (i === gi ? { ...g, group: name } : g))
    );
  }

  function toggleCollapse(gi: number) {
    setGroups((prev) =>
      prev.map((g, i) =>
        i === gi ? { ...g, collapsed: !g.collapsed } : g
      )
    );
  }

  // ── Item operations ──

  function addItem(gi: number) {
    setGroups((prev) =>
      prev.map((g, i) =>
        i === gi ? { ...g, items: [...g.items, { key: "", value: "" }] } : g
      )
    );
  }

  function removeItem(gi: number, ii: number) {
    setGroups((prev) =>
      prev.map((g, i) => {
        if (i !== gi) return g;
        const items =
          g.items.length <= 1
            ? [{ key: "", value: "" }]
            : g.items.filter((_, j) => j !== ii);
        return { ...g, items };
      })
    );
  }

  function updateItem(
    gi: number,
    ii: number,
    field: "key" | "value",
    val: string
  ) {
    setGroups((prev) =>
      prev.map((g, i) => {
        if (i !== gi) return g;
        const items = g.items.map((item, j) =>
          j === ii ? { ...item, [field]: val } : item
        );
        return { ...g, items };
      })
    );
  }

  // ── Serialize ──

  function toJson(): string {
    const cleaned = groups
      .map((g) => ({
        group: g.group.trim(),
        items: g.items.filter(
          (item) => item.key.trim() && item.value.trim()
        ),
      }))
      .filter((g) => g.items.length > 0);

    return JSON.stringify(cleaned);
  }

  return (
    <div className="space-y-4">
      <input type="hidden" name="specs" value={toJson()} />

      {groups.map((group, gi) => (
        <div
          key={gi}
          className={cn(
            "rounded-lg border border-border overflow-hidden",
            group.group && "border-muted-foreground/20"
          )}
        >
          {/* Group header */}
          <div className="flex items-center gap-2 bg-muted/30 px-3 py-2">
            <button
              type="button"
              onClick={() => toggleCollapse(gi)}
              className="flex h-5 w-5 items-center justify-center rounded hover:bg-muted transition-colors"
            >
              {group.collapsed ? (
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              )}
            </button>
            <Input
              value={group.group}
              onChange={(e) => updateGroupName(gi, e.target.value)}
              placeholder="Nom du groupe (optionnel, ex: Imprimer)"
              className="h-7 border-0 bg-transparent px-1 text-sm font-medium shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/50 placeholder:font-normal"
            />
            <span className="text-xs text-muted-foreground shrink-0">
              {group.items.filter((i) => i.key.trim()).length} spec
              {group.items.filter((i) => i.key.trim()).length !== 1 && "s"}
            </span>
            {groups.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-red-600 shrink-0"
                onClick={() => removeGroup(gi)}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>

          {/* Items */}
          {!group.collapsed && (
            <div className="p-3 space-y-2">
              {/* Column headers */}
              <div className="grid grid-cols-[1fr_1fr_32px] gap-2 px-1">
                <span className="text-[11px] font-medium text-muted-foreground">
                  Caractéristique
                </span>
                <span className="text-[11px] font-medium text-muted-foreground">
                  Valeur
                </span>
                <span />
              </div>

              {group.items.map((item, ii) => (
                <div
                  key={ii}
                  className="group/row grid grid-cols-[1fr_1fr_32px] gap-2 items-start"
                >
                  <Input
                    placeholder="ex: Largeur papier"
                    value={item.key}
                    onChange={(e) =>
                      updateItem(gi, ii, "key", e.target.value)
                    }
                    className="h-9 text-sm"
                  />
                  <textarea
                    placeholder="ex: 80mm"
                    value={item.value}
                    onChange={(e) =>
                      updateItem(gi, ii, "value", e.target.value)
                    }
                    rows={1}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none overflow-hidden"
                    onInput={(e) => {
                      const t = e.target as HTMLTextAreaElement;
                      t.style.height = "36px";
                      t.style.height = `${Math.max(36, t.scrollHeight)}px`;
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-muted-foreground opacity-0 group-hover/row:opacity-100 transition-opacity hover:text-red-600"
                    onClick={() => removeItem(gi, ii)}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}

              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="gap-1.5 text-xs text-muted-foreground"
                onClick={() => addItem(gi)}
              >
                <Plus className="h-3 w-3" />
                Ajouter une ligne
              </Button>
            </div>
          )}
        </div>
      ))}

      {/* Add group button */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-1.5 text-xs"
        onClick={addGroup}
      >
        <FolderPlus className="h-3.5 w-3.5" />
        Ajouter un groupe
      </Button>
    </div>
  );
}