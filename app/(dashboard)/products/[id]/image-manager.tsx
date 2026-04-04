"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2, ImageIcon, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ImageManager({
  productId,
  images: initialImages,
}: {
  productId: string;
  images: string[];
}) {
  const [images, setImages] = useState<string[]>(initialImages);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("productId", productId);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setImages((prev) => [...prev, data.url]);
      }
    } catch {
      setError("Erreur lors de l'upload. Réessayez.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleDelete(imageUrl: string) {
    setError(null);
    setDeleting(imageUrl);

    try {
      const res = await fetch("/api/upload/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, imageUrl }),
      });

      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setImages((prev) => prev.filter((img) => img !== imageUrl));
      }
    } catch {
      setError("Erreur lors de la suppression.");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {images.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((url, index) => (
            <div
              key={url}
              className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-muted"
            >
              <img
                src={url}
                alt={`Image ${index + 1}`}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              <button
                onClick={() => handleDelete(url)}
                disabled={deleting === url}
                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-all hover:bg-red-600 group-hover:opacity-100 disabled:opacity-50"
              >
                {deleting === url ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <X className="h-4 w-4" />
                )}
              </button>
              {/* Index badge */}
              <div className="absolute left-2 bottom-2 rounded-md bg-black/60 px-2 py-0.5 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">
                {index + 1}/{images.length}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border py-12 text-muted-foreground">
          <ImageIcon className="mb-3 h-10 w-10 opacity-40" />
          <p className="text-sm font-medium">Aucune image</p>
          <p className="text-xs mt-1">
            Ajoutez des photos pour illustrer ce produit.
          </p>
        </div>
      )}

      {/* Upload area */}
      <div className="flex items-center gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleUpload}
          className="hidden"
          id="image-upload"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Upload en cours...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Ajouter une image
            </>
          )}
        </Button>
        <span className="text-xs text-muted-foreground">
          JPG, PNG ou WebP · Max 5 Mo
        </span>
      </div>
    </div>
  );
}