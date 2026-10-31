"use client";

import { useEffect, useState } from "react";

interface Section {
  id: string;
  title: string;
  content: string;
}

interface LegalData {
  version: string;
  lastUpdated: string;
  title: string;
  summary: string;
  sections: Section[];
}

interface LegalModalProps {
  type: "terms" | "privacy";
  isOpen: boolean;
  onClose: () => void;
}

export function LegalModal({ type, isOpen, onClose }: LegalModalProps) {
  const [data, setData] = useState<LegalData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    setError("");

    const endpoint = type === "terms" ? "/api/legal/terms" : "/api/legal/privacy";

    fetch(endpoint)
      .then((res) => {
        if (!res.ok) throw new Error("Gagal memuat dokumen legal.");
        return res.json();
      })
      .then((json: LegalData) => {
        setData(json);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isOpen, type]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {data?.title || (type === "terms" ? "Ketentuan Layanan" : "Kebijakan Privasi")}
            </h3>
            {data?.version && (
              <p className="text-xs text-gray-500">
                Versi {data.version} • Terakhir diperbarui: {data.lastUpdated}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Tutup"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-gray-700 text-sm leading-relaxed">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <div className="w-8 h-8 border-3 border-[#7960D7] border-t-transparent rounded-full animate-spin mb-3"></div>
              <span>Memuat dokumen...</span>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          {!loading && data && (
            <>
              {data.summary && (
                <div className="p-4 bg-purple-50/60 rounded-xl border border-purple-100 text-purple-900 font-medium text-xs leading-normal">
                  {data.summary}
                </div>
              )}

              <div className="space-y-4">
                {data.sections.map((section) => (
                  <div key={section.id} className="space-y-1">
                    <h4 className="font-semibold text-gray-900">{section.title}</h4>
                    <p className="text-gray-600 leading-normal">{section.content}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-white bg-[#7960D7] hover:bg-[#6950c7] rounded-lg transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

