"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDropzone } from "@/hooks/use-dropzone";
import { cn } from "@/lib/utils";

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
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  async function uploadFile(file: File) {
    setError(null);

    if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/)) {
      setError("Format non supporté. Utilisez JPG, PNG ou WebP.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Le fichier ne doit pas dépasser 5 Mo.");
      return;
    }

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
        setError(data.error);
      } else {
        setCurrentImage(data.url);
        router.refresh();
      }
    } catch {
      setError("Erreur lors de l'upload");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  const { isDragging, dropzoneProps } = useDropzone((files) => {
    if (files[0]) uploadFile(files[0]);
  });

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch("/api/upload/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, imageUrl: currentImage, type: "cover" }),
      });

      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setCurrentImage(null);
        router.refresh();
      }
    } catch {
      setError("Erreur lors de la suppression");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-2">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}

      {currentImage ? (
        <div
          {...dropzoneProps}
          className={cn(
            "group relative w-full aspect-[16/9] rounded-xl border border-border overflow-hidden bg-muted transition-all",
            isDragging && "border-[#FF6400] border-2 ring-4 ring-orange-100"
          )}
        >
          <img
            src={currentImage}
            alt="Cover"
            className="h-full w-full object-cover"
          />

          {/* Drag overlay */}
          {isDragging && (
            <div className="absolute inset-0 bg-orange-50/90 flex flex-col items-center justify-center pointer-events-none z-10">
              <Upload className="h-10 w-10 text-[#FF6400] mb-2" />
              <p className="text-sm font-medium text-[#FF6400]">
                Déposez pour remplacer
              </p>
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />

          <button
            onClick={handleDelete}
            disabled={deleting}
            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:opacity-50 z-20"
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
          {...dropzoneProps}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "flex flex-col items-center justify-center w-full aspect-[16/9] rounded-xl border-2 border-dashed cursor-pointer transition-all",
            isDragging
              ? "border-[#FF6400] bg-orange-50 scale-[1.01]"
              : "border-border hover:border-muted-foreground/50 bg-muted/30"
          )}
        >
          {uploading ? (
            <>
              <Loader2 className="h-10 w-10 text-[#FF6400] animate-spin mb-3" />
              <span className="text-sm font-medium text-muted-foreground">
                Upload en cours...
              </span>
            </>
          ) : isDragging ? (
            <>
              <Upload className="h-10 w-10 text-[#FF6400] mb-3" />
              <span className="text-sm font-medium text-[#FF6400]">
                Déposez l&apos;image ici
              </span>
            </>
          ) : (
            <>
              <ImageIcon className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <span className="text-sm font-medium text-muted-foreground">
                Glissez-déposez une image
              </span>
              <span className="text-xs text-muted-foreground/60 mt-1">
                ou cliquez pour parcourir
              </span>
              <span className="text-xs text-muted-foreground/60 mt-3">
                JPG, PNG ou WebP · Max 5 Mo
              </span>
            </>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileInput}
        className="hidden"
      />
    </div>
  );
}