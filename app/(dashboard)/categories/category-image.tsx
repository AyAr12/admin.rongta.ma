"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDropzone } from "@/hooks/use-dropzone";
import { cn } from "@/lib/utils";

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
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  async function uploadFile(file: File) {
    setError(null);

    if (!file.type.match(/^image\/(jpeg|jpg|png|webp|svg\+xml)$/)) {
      setError("Format non supporté.");
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
      formData.append("categoryId", categoryId);

      const res = await fetch("/api/upload/category", {
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
      const res = await fetch("/api/upload/category/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId }),
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
        <div className="rounded-lg border border-red-200 bg-red-50 px-2 py-1.5 text-xs text-red-700">
          {error}
        </div>
      )}

      {currentImage ? (
        <div
          {...dropzoneProps}
          className={cn(
            "group relative w-full aspect-video rounded-lg border border-border overflow-hidden bg-muted transition-all",
            isDragging && "border-[#FF6400] border-2 ring-2 ring-orange-100",
          )}
        >
          <img
            src={currentImage}
            alt="Catégorie"
            className="h-full w-full object-cover"
          />

          {isDragging && (
            <div className="absolute inset-0 bg-orange-50/90 flex flex-col items-center justify-center pointer-events-none">
              <Upload className="h-6 w-6 text-[#FF6400] mb-1" />
              <p className="text-xs font-medium text-[#FF6400]">
                Déposez pour remplacer
              </p>
            </div>
          )}

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
          {...dropzoneProps}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "flex flex-col items-center justify-center w-full aspect-video rounded-lg border-2 border-dashed cursor-pointer transition-all",
            isDragging
              ? "border-[#FF6400] bg-orange-50"
              : "border-border hover:border-muted-foreground/50",
          )}
        >
          {uploading ? (
            <Loader2 className="h-6 w-6 text-[#FF6400] animate-spin" />
          ) : isDragging ? (
            <>
              <Upload className="h-5 w-5 text-[#FF6400] mb-1" />
              <span className="text-xs text-[#FF6400] font-medium">
                Déposez ici
              </span>
            </>
          ) : (
            <>
              <ImageIcon className="h-6 w-6 text-muted-foreground/40 mb-1" />
              <span className="text-xs text-muted-foreground">
                Glissez ou cliquez
              </span>
            </>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/svg+xml"
        onChange={handleFileInput}
        className="hidden"
      />
    </div>
  );
}
