"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2, ImageIcon, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useDropzone } from "@/hooks/use-dropzone";
import { cn } from "@/lib/utils";

export default function ImageManager({
  productId,
  images: initialImages,
}: {
  productId: string;
  images: string[];
}) {
  const [images, setImages] = useState<string[]>(initialImages);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({
    current: 0,
    total: 0,
  });
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function uploadSingleFile(file: File): Promise<string | null> {
    if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/)) {
      setError(`${file.name}: format non supporté`);
      return null;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(`${file.name}: dépasse 5 Mo`);
      return null;
    }

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
      return null;
    }
    return data.url;
  }

  async function uploadFiles(files: File[]) {
    setError(null);
    setUploading(true);
    setUploadProgress({ current: 0, total: files.length });

    const newUrls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      setUploadProgress({ current: i + 1, total: files.length });
      const url = await uploadSingleFile(files[i]);
      if (url) newUrls.push(url);
    }

    if (newUrls.length > 0) {
      setImages((prev) => [...prev, ...newUrls]);
    }

    setUploading(false);
    setUploadProgress({ current: 0, total: 0 });
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const { isDragging, dropzoneProps } = useDropzone(uploadFiles);

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) uploadFiles(files);
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

      {/* Dropzone — appears even when there are images */}
      <div
        {...dropzoneProps}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-8 cursor-pointer transition-all",
          isDragging
            ? "border-[#FF6400] bg-orange-50 scale-[1.005]"
            : "border-border hover:border-muted-foreground/50 bg-muted/30",
          uploading && "pointer-events-none opacity-60",
        )}
      >
        {uploading ? (
          <>
            <Loader2 className="h-8 w-8 text-[#FF6400] animate-spin mb-2" />
            <p className="text-sm font-medium">
              Upload en cours... {uploadProgress.current}/{uploadProgress.total}
            </p>
          </>
        ) : isDragging ? (
          <>
            <Upload className="h-8 w-8 text-[#FF6400] mb-2" />
            <p className="text-sm font-medium text-[#FF6400]">
              Déposez les images ici
            </p>
          </>
        ) : (
          <>
            <Upload className="h-8 w-8 text-muted-foreground/40 mb-2" />
            <p className="text-sm font-medium text-muted-foreground">
              Glissez-déposez des images ici
            </p>
            <p className="text-xs text-muted-foreground/60 mt-0.5">
              ou cliquez pour parcourir · Plusieurs fichiers acceptés
            </p>
            <p className="text-xs text-muted-foreground/60 mt-2">
              JPG, PNG ou WebP · Max 5 Mo par fichier
            </p>
          </>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={handleFileInput}
        className="hidden"
      />

      {/* Image grid */}
      {images.length > 0 && (
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
              <div className="absolute left-2 bottom-2 rounded-md bg-black/60 px-2 py-0.5 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">
                {index + 1}/{images.length}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
