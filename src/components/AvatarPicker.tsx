"use client";

import { useRef, useState } from "react";

// Downscale to 256px before storing as a data URL: the demo has no file
// storage, so the whole photo travels in the form field.
// shortcut: data URL in the DB row, upgrade to object storage when uploads grow.
const MAX_EDGE = 256;

export function AvatarPicker({
  initialUrl,
  initial,
}: {
  initialUrl: string | null;
  initial: string;
}) {
  const [preview, setPreview] = useState(initialUrl);
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, MAX_EDGE / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
      URL.revokeObjectURL(url);
      setPreview(dataUrl);
      setValue(dataUrl);
    };
    img.src = url;
  };

  return (
    <div className="flex items-center gap-5">
      <input type="hidden" name="avatarUrl" value={value} />
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview}
          alt="Foto profil"
          className="w-20 h-20 rounded-full object-cover"
        />
      ) : (
        <div className="w-20 h-20 rounded-full bg-[#7960D7] flex items-center justify-center text-white text-2xl font-bold">
          {initial}
        </div>
      )}

      <div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="px-4 py-2 border-2 border-[#7960D7] text-[#7960D7] text-sm font-semibold rounded-lg hover:bg-purple-50 transition-colors"
        >
          Ganti foto
        </button>
        <p className="mt-2 text-xs text-[#6B7280]">
          JPG atau PNG. Tanpa foto, profil memakai inisial nama.
        </p>
      </div>
    </div>
  );
}
