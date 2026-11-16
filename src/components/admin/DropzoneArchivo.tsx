// src/components/admin/DropzoneArchivo.tsx
"use client";

import React, { useState } from "react";
import { UploadCloud, CheckCircle2, Loader2, Link2 } from "lucide-react";

interface DropzoneArchivoProps {
    label: string;
    carpeta:
    | "empresa"
    | "sliders"
    | "cursos"
    | "membresias"
    | "materiales"
    | "firmas";
    valorActual: string;
    onChangeUrl: (nuevaUrl: string) => void;
    accept?: string;
    permitirLinkDrive?: boolean;
}

export default function DropzoneArchivo({
    label,
    carpeta,
    valorActual,
    onChangeUrl,
    accept = "image/*,.pdf,.pptx,.ppt,.doc,.docx,.txt,.mp4",
    permitirLinkDrive = true,
}: DropzoneArchivoProps) {
    const [subiendo, setSubiendo] = useState(false);
    const [arrastrando, setArrastrando] = useState(false);

    async function procesarArchivo(file: File) {
        setSubiendo(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("carpeta", carpeta);

            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            if (res.ok && data.url) {
                onChangeUrl(data.url);
            } else {
                alert(data.error || "Error al subir archivo");
            }
        } catch {
            alert("Error de conexión al subir el archivo");
        } finally {
            setSubiendo(false);
        }
    }

    return (
        <div className="space-y-1.5">
            <label className="block text-xs font-bold text-zinc-800">{label}</label>

            <div
                onDragOver={(e) => {
                    e.preventDefault();
                    setArrastrando(true);
                }}
                onDragLeave={() => setArrastrando(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    setArrastrando(false);
                    const f = e.dataTransfer.files?.[0];
                    if (f) procesarArchivo(f);
                }}
                className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-3 text-center transition ${arrastrando
                        ? "border-zinc-950 bg-zinc-100"
                        : "border-zinc-300 bg-zinc-50 hover:border-zinc-500"
                    }`}
            >
                <input
                    type="file"
                    accept={accept}
                    onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) procesarArchivo(f);
                    }}
                    className="absolute inset-0 cursor-pointer opacity-0"
                />

                {subiendo ? (
                    <div className="flex items-center gap-2 text-xs font-bold text-zinc-700">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Subiendo archivo al servidor...</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 text-xs text-zinc-600">
                        <UploadCloud className="h-4 w-4 text-zinc-900 shrink-0" />
                        <span>
                            <strong>Arrastra tu archivo aquí</strong> o haz clic para subir
                        </span>
                    </div>
                )}
            </div>

            {permitirLinkDrive && (
                <div className="flex items-center gap-1.5">
                    <Link2 className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                    <input
                        value={valorActual || ""}
                        onChange={(e) => onChangeUrl(e.target.value)}
                        placeholder="Ruta del archivo subido o pega aquí el link de Google Drive..."
                        className="w-full rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-xs"
                    />
                    {valorActual && (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    )}
                </div>
            )}
        </div>
    );
}