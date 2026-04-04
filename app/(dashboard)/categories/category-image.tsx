"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function CategoryImage({
  categoryId,
  image,
}: {
  categoryId: string;
  image: string | null;
}) {
  const [currentImage, setCurrentImage] = useState<string | null>(image);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("categoryId", categoryId);

      const res = await fetch("/api/upload/category", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.error) {
        alert(data.error);
      } else {
        setCurrentImage(data.url);
        router.refresh();
      }
    } catch {
      alert("Erreur lors de l'upload");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch("/api/upload/category/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId }),
      });

      const data = await res.json();
      if (data.error) {
        alert(data.error);
      } else {
        setCurrentImage(null);
        router.refresh();
      }
    } catch {
      alert("Erreur lors de la suppression");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-2">
      {currentImage ? (
        <div className="group relative w-full aspect-video rounded-lg border border-border overflow-hidden bg-muted">
          <img
            src={currentImage}
            alt="Catégorie"
            className="h-full w-full object-cover"
          />
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:opacity-50"
          >
            {deleting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <X className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center justify-center w-full aspect-video rounded-lg border-2 border-dashed border-border cursor-pointer hover:border-muted-foreground/50 transition-colors"
        >
          <ImageIcon className="h-6 w-6 text-muted-foreground/40 mb-1" />
          <span className="text-xs text-muted-foreground">
            Cliquez pour ajouter
          </span>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/svg+xml"
        onChange={handleUpload}
        className="hidden"
      />

      {!currentImage && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full gap-2 text-xs"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Upload...
            </>
          ) : (
            <>
              <Upload className="h-3.5 w-3.5" />
              Ajouter une image
            </>
          )}
        </Button>
      )}
    </div>
  );
}
