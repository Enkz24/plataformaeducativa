// src/app/api/upload/route.ts
import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File | null;
        const carpeta = (formData.get("carpeta") as string) || "general";

        if (!file) {
            return NextResponse.json(
                { error: "No se recibió ningún archivo" },
                { status: 400 }
            );
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const nombreLimpio = file.name
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-zA-Z0-9._-]/g, "_");

        const fileName = `${Date.now()}-${nombreLimpio}`;
        const relativeFolder = `/uploads/${carpeta}`;
        const uploadDir = path.join(process.cwd(), "public", "uploads", carpeta);

        await mkdir(uploadDir, { recursive: true });
        await writeFile(path.join(uploadDir, fileName), buffer);

        return NextResponse.json({
            ok: true,
            url: `${relativeFolder}/${fileName}`,
            nombreOriginal: file.name,
            tamanoKb: Math.round(file.size / 1024),
        });
    } catch (error: any) {
        console.error("Error subiendo archivo:", error);
        return NextResponse.json(
            { error: error?.message || "Error al subir el archivo" },
            { status: 500 }
        );
    }
}