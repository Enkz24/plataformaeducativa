// src/app/api/certificados/verificar/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim();

    if (!query || query.length < 3) {
      return NextResponse.json(
        { error: "Ingresa un número de DNI o código único de certificado válido." },
        { status: 400 }
      );
    }

    const certificados = await prisma.certificado.findMany({
      where: {
        anulado: false,
        OR: [
          { codigoUnico: { equals: query, mode: "insensitive" } },
          { codigoVerificacionQR: { equals: query, mode: "insensitive" } },
          { dniTitular: { equals: query } },
        ],
      },
      orderBy: {
        fechaEmision: "desc",
      },
      select: {
        id: true,
        codigoUnico: true,
        codigoVerificacionQR: true,
        dniTitular: true,
        nombreCompletoTitular: true,
        nombreProgramaImpreso: true,
        tipoProgramaImpreso: true,
        horasAcademicas: true,
        notaObtenida: true,
        fechaEmision: true,
        archivoPdfUrl: true,
      },
    });

    return NextResponse.json({
      encontrados: certificados.length,
      certificados,
    });
  } catch (error) {
    console.error("Error al verificar certificados:", error);
    return NextResponse.json(
      { error: "Ocurrió un error al consultar el registro de certificados." },
      { status: 500 }
    );
  }
}