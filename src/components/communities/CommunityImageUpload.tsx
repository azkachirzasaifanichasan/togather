"use client";

import { useRef, useState, useCallback, useEffect } from "react";

interface CommunityImageUploadProps {
  type: "avatar" | "banner";
  value: string;
  onChange: (url: string) => void;
  onRemove: () => void;
  initials?: string;
  disabled?: boolean;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function CommunityImageUpload({
  type,
  value,
  onChange,
  onRemove,
  initials = "K",
  disabled = false,
}: CommunityImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(value);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);
  const typeRef = useRef(type);

  // Keep refs in sync with props
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    typeRef.current = type;
  }, [type]);

  const uploadFile = useCallback(async (file: File, objectUrl: string) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append(typeRef.current, file);

      const response = await fetch("/api/upload/community", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Gagal mengunggah gambar");
      }

      const uploadedUrl =
        typeRef.current === "avatar" ? data.avatarUrl : data.bannerUrl;
      if (uploadedUrl) {
        // Replace preview with the final URL (revoke object URL)
        URL.revokeObjectURL(objectUrl);
        setPreview(uploadedUrl);
        onChangeRef.current(uploadedUrl);
      } else {
        throw new Error("Server tidak mengembalikan URL gambar");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Terjadi kesalahan saat mengunggah"
      );
      // Revert preview on error
      URL.revokeObjectURL(objectUrl);
      setPreview(valueRef.current);
    } finally {
      setIsUploading(false);
    }
  }, []);

  const handleFileSelect = useCallback(
    (file: File) => {
      setError(null);

      // Validate file type
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError("Tipe file tidak didukung. Gunakan JPG, PNG, atau WebP.");
        return;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        setError("Ukuran file maksimal 5 MB.");
        return;
      }

      // Create preview immediately
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);

      // Upload to server
      uploadFile(file, objectUrl);
    },
    [uploadFile]
  );

  const handleRemove = () => {
    if (preview && preview.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
    onChange("");
    onRemove();
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    // Reset input value to allow selecting the same file again
    event.target.value = "";
  };

  const triggerFileInput = () => {
    if (!disabled) {
      inputRef.current?.click();
    }
  };

  const isInitial = !preview || preview === "";
  const displayInitials = initials.trim().charAt(0).toUpperCase() || "K";

  // Determine dimensions based on type
  const isAvatar = type === "avatar";
  const containerClass = isAvatar
    ? "relative w-16 h-16 rounded-full"
    : "relative w-64 h-36 rounded-xl"; // 16:9 aspect ratio

  const previewClass = isAvatar
    ? "w-full h-full rounded-full object-cover"
    : "w-full h-full rounded-xl object-cover";

  const placeholderClass = isAvatar
    ? "w-full h-full rounded-full flex items-center justify-center bg-[#7960D7] text-white text-2xl font-bold"
    : "w-full h-full rounded-xl flex items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300";

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        className="sr-only"
        onChange={handleInputChange}
        disabled={disabled || isUploading}
      />

      <div className={containerClass}>
        {isInitial ? (
          <div className={placeholderClass}>
            {isAvatar ? (
              displayInitials
            ) : (
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            )}
          </div>
        ) : (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt={isAvatar ? "Foto profil komunitas" : "Banner komunitas"}
              className={previewClass}
            />
            {isUploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-inherit">
                <div className="flex flex-col items-center gap-2 text-white">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span className="text-sm">Mengunggah...</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="flex items-center gap-3">
        {!isInitial && !isUploading && (
          <button
            type="button"
            onClick={handleRemove}
            disabled={disabled}
            className="px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
          >
            Hapus
          </button>
        )}

        <button
          type="button"
          onClick={triggerFileInput}
          disabled={disabled || isUploading}
          className={`px-4 py-2 border-2 text-sm font-semibold rounded-lg transition-colors ${
            disabled || isUploading
              ? "border-gray-300 text-gray-400 cursor-not-allowed"
              : "border-[#7960D7] text-[#7960D7] hover:bg-purple-50"
          }`}
        >
          {isInitial ? (isAvatar ? "Unggah foto" : "Unggah banner") : "Ganti"}
        </button>

        {error && (
          <span className="text-xs text-red-600" role="alert">
            {error}
          </span>
        )}

        {!isInitial && !error && !isUploading && (
          <span className="text-xs text-green-600">✓ Tersimpan</span>
        )}
      </div>

      {type === "banner" && (
        <p className="text-xs text-gray-500">
          Rasio yang direkomendasikan: 16:9 (misal 1280×720 px). Maksimal 5 MB.
        </p>
      )}

      {type === "avatar" && (
        <p className="text-xs text-gray-500">
          Foto profil ditampilkan bulat. Maksimal 5 MB.
        </p>
      )}
    </div>
  );
}