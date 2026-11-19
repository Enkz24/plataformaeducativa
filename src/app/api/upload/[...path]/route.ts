// src/app/api/uploads/[...path]/route.ts
import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

const MIME_TYPES: Record<string, string> = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".mov": "video/quicktime",
    ".pdf": "application/pdf",
    ".pptx":
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ".ppt": "application/vnd.ms-powerpoint",
    ".txt": "text/plain; charset=utf-8",
};

export async function GET(
    _request: Request,
    { params }: { params: { path: string[] } }
) {
    try {
        const segmentos = (params.path || []).filter(
            (s) => s && !s.includes("..") && !s.includes("\\")
        );
        const rutaArchivo = path.join(
            process.cwd(),
            "public",
            "uploads",
            ...segmentos
        );

        const archivo = await readFile(rutaArchivo);
        const ext = path.extname(rutaArchivo).toLowerCase();
        const contentType = MIME_TYPES[ext] || "application/octet-stream";

        return new NextResponse(archivo, {
            status: 200,
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "public, max-age=3600",
            },
        });
    } catch {
        return NextResponse.json(
            { error: "Archivo no encontrado" },
            { status: 404 }
        );
    }
}