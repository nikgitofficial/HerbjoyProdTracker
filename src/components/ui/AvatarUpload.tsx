"use client";

import { useState, useRef } from "react";
import { Camera, Trash2, Upload, X, CheckCircle2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface AvatarUploadProps {
  currentImage?: string | null;
  name?: string | null;
  email?: string | null;
}

export function AvatarUpload({ currentImage, name, email }: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImage ?? null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { update } = useSession();

  const initials =
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "??";

  const showToast = (type: "success" | "error", text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  const handleFile = (file: File) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      showToast("error", "Only JPEG, PNG, WebP, and GIF files are allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast("error", "File too large. Maximum size is 5MB.");
      return;
    }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", selectedFile);
      const res = await fetch("/api/user/avatar", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");

      setSelectedFile(null);
      showToast("success", "Profile picture updated!");

      // Patch the JWT token with the new image URL, then re-render server components
      await update({ image: data.imageUrl });
      router.refresh();
    } catch (err: unknown) {
      showToast("error", err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    setRemoving(true);
    try {
      const res = await fetch("/api/user/avatar", { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to remove photo");

      setPreview(null);
      setSelectedFile(null);
      showToast("success", "Profile picture removed.");

      // Clear image from JWT token, then re-render server components
      await update({ image: null });
      router.refresh();
    } catch {
      showToast("error", "Failed to remove photo. Please try again.");
    } finally {
      setRemoving(false);
    }
  };

  const cancelSelection = () => {
    setSelectedFile(null);
    setPreview(currentImage ?? null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-6">
      {/* ── Toast ── */}
      {toast && (
        <div
          className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium border animate-fade-up
            ${toast.type === "success"
              ? "bg-green-500/10 border-green-500/20 text-green-400"
              : "bg-red-500/10 border-red-500/20 text-red-400"
            }`}
        >
          {toast.type === "success"
            ? <CheckCircle2 size={15} className="flex-shrink-0" />
            : <AlertCircle size={15} className="flex-shrink-0" />
          }
          {toast.text}
        </div>
      )}

      {/* ── Avatar preview + actions ── */}
      <div className="flex items-center gap-5">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {preview ? (
            <img
              src={preview}
              alt={name ?? "Avatar"}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-surface-700 shadow-lg"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-2xl font-bold shadow-brand border-2 border-surface-700">
              {initials}
            </div>
          )}
          {/* Camera badge */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-lg bg-brand-500 hover:bg-brand-400 flex items-center justify-center text-white shadow-lg transition-colors"
            title="Change photo"
          >
            <Camera size={13} />
          </button>
        </div>

        {/* Info + quick actions */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{name}</p>
          <p className="text-xs text-surface-500 truncate mb-3">{email}</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-800 border border-surface-700 text-surface-300 hover:text-white hover:border-surface-600 transition-colors text-xs font-medium"
            >
              <Upload size={12} />
              Upload photo
            </button>
            {(preview || currentImage) && !selectedFile && (
              <button
                onClick={handleRemove}
                disabled={removing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:text-red-300 hover:bg-red-500/15 transition-colors text-xs font-medium disabled:opacity-50"
              >
                <Trash2 size={12} />
                {removing ? "Removing…" : "Remove"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Drop zone (shown when no file selected) ── */}
      {!selectedFile && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            relative flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed
            px-6 py-8 cursor-pointer transition-all duration-200
            ${dragging
              ? "border-brand-500 bg-brand-500/10 scale-[1.01]"
              : "border-surface-800 hover:border-surface-700 hover:bg-surface-800/30"
            }
          `}
        >
          <div className="w-10 h-10 rounded-xl bg-surface-800 flex items-center justify-center">
            <Upload size={18} className="text-surface-500" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-surface-300">
              Drop your photo here or <span className="text-brand-400">browse</span>
            </p>
            <p className="text-xs text-surface-600 mt-0.5">
              JPEG, PNG, WebP, GIF · Max 5 MB
            </p>
          </div>
        </div>
      )}

      {/* ── Selected file preview + confirm ── */}
      {selectedFile && (
        <div className="bg-surface-900/80 border border-surface-800 rounded-2xl p-4 flex items-center gap-4">
          <img
            src={preview!}
            alt="Preview"
            className="w-14 h-14 rounded-xl object-cover border border-surface-700 flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{selectedFile.name}</p>
            <p className="text-xs text-surface-500 mt-0.5">
              {(selectedFile.size / 1024).toFixed(0)} KB · Ready to upload
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={cancelSelection}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-surface-600 hover:text-surface-300 hover:bg-surface-800 transition-colors"
              title="Cancel"
            >
              <X size={14} />
            </button>
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-brand"
            >
              {uploading ? (
                <>
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Uploading…
                </>
              ) : (
                <>
                  <Upload size={13} />
                  Save photo
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleInputChange}
      />
    </div>
  );
}