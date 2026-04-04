"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function CoverImage({
  productId,
  image,
}: {
  productId: string;
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
      formData.append("productId", productId);
      formData.append("type", "cover");

      const res = await fetch("/api/upload", {
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
      const res = await fetch("/api/upload/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          imageUrl: currentImage,
          type: "cover",
        }),
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
        <div className="group relative w-full aspect-[16/9] rounded-xl border border-border overflow-hidden bg-muted">
          <img
            src={currentImage}
            alt="Cover"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:opacity-50"
          >
            {deleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <X className="h-4 w-4" />
            )}
          </button>
          <div className="absolute left-2 bottom-2 rounded-md bg-black/60 px-2 py-0.5 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">
            Image de couverture
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center justify-center w-full aspect-[16/9] rounded-xl border-2 border-dashed border-border cursor-pointer hover:border-muted-foreground/50 transition-colors bg-muted/30"
        >
          {uploading ? (
            <Loader2 className="h-8 w-8 text-muted-foreground/40 animate-spin mb-2" />
          ) : (
            <ImageIcon className="h-8 w-8 text-muted-foreground/40 mb-2" />
          )}
          <span className="text-sm font-medium text-muted-foreground">
            {uploading
              ? "Upload en cours..."
              : "Ajouter une image de couverture"}
          </span>
          <span className="text-xs text-muted-foreground/60 mt-1">
            JPG, PNG ou WebP · Max 5 Mo
          </span>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleUpload}
        className="hidden"
      />
    </div>
  );
}
