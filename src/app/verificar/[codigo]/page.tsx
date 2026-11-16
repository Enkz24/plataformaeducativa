// src/app/verificar/[codigo]/page.tsx
import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ShieldCheck, Award, Printer, ArrowLeft, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function VerificarCertificadoQrPage({
    params,
}: {
    params: { codigo: string };
}) {
    const codigoDecodificado = decodeURIComponent(params.codigo);

    const [certificado, configSitio] = await Promise.all([
        prisma.certificado.findFirst({
            where: {
                OR: [
                    { codigoUnico: codigoDecodificado },
                    { codigoVerificacionQR: codigoDecodificado },
                ],
            },
        }),
        prisma.configuracionSitio.findUnique({ where: { clave: "PRINCIPAL" } }),
    ]);

    if (!certificado) {
        return (
            <div className="min-h-screen bg-zinc-100 flex items-center justify-center p-6">
                <div className="max-w-md w-full rounded-2xl border border-zinc-200 bg-white p-8 text-center space-y-4 shadow">
                    <h1 className="text-lg font-extrabold text-zinc-950">
                        Credencial no encontrada
                    </h1>
                    <p className="text-xs text-zinc-600">
                        El código <strong>{codigoDecodificado}</strong> no registra un
                        certificado emitido en el sistema.
                    </p>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 rounded-xl bg-zinc-950 px-5 py-2.5 text-xs font-extrabold text-white"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Volver al Inicio</span>
                    </Link>
                </div>
            </div>
        );
    }

    const metadatos = (certificado.detalleModulosYNotasReverso as any) || {};
    const esSoloAnverso =
        certificado.esMigradoExcel || Boolean(metadatos.esSoloAnversoHistorico);

    const urlQrImagen = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
        `https://aulaprofesional.pe/verificar/${certificado.codigoUnico}`
    )}`;

    return (
        <div className="min-h-screen bg-zinc-100 py-10 px-4">
            <div className="mx-auto max-w-5xl space-y-6">
                {/* Barra superior de verificación válida */}
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-zinc-950 p-4 text-white shadow">
                    <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                        <div>
                            <span className="text-xs font-extrabold block">
                                CREDENCIAL OFICIAL VERIFICADA — ESTADO:{" "}
                                {certificado.anulado ? "ANULADO" : "ACTIVO"}
                            </span>
                            <span className="text-[11px] text-zinc-400">
                                Código Único de Registro: {certificado.codigoUnico} • DNI
                                Titular: {certificado.dniTitular}
                            </span>
                        </div>
                    </div>

                    <Link
                        href="/"
                        className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2 text-xs font-bold hover:bg-zinc-800"
                    >
                        Volver a la Plataforma
                    </Link>
                </div>

                {/* CARA FRONTAL (ANVERSO) DEL CERTIFICADO */}
                <div className="relative overflow-hidden rounded-3xl border-8 border-double border-zinc-900 bg-white p-8 sm:p-14 shadow-2xl text-center space-y-6">
                    <div className="flex items-center justify-between border-b border-zinc-200 pb-6">
                        <div className="text-left">
                            <span className="text-xs font-extrabold uppercase tracking-widest text-zinc-500">
                                {configSitio?.nombreEmpresa || "AULA PROFESIONAL"}
                            </span>
                            <h2 className="text-sm font-bold text-zinc-700">
                                {configSitio?.subtituloEmpresa ||
                                    "Escuela de Gestión y Especialización"}
                            </h2>
                        </div>
                        <div className="text-right text-[11px] font-mono text-zinc-600">
                            <div>REGISTRO N°: {certificado.codigoUnico}</div>
                            <div>{certificado.codigoCertificacionIso}</div>
                        </div>
                    </div>

                    <div className="space-y-2 py-2">
                        <span className="text-xs font-extrabold uppercase tracking-widest text-zinc-500">
                            Otorga el presente
                        </span>
                        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 uppercase">
                            {certificado.temporadaNombreImpreso || "CERTIFICADO DE ESPECIALIZACIÓN"}
                        </h1>
                        <p className="text-xs font-semibold text-zinc-500">A:</p>
                        <div className="text-2xl sm:text-3xl font-extrabold text-zinc-950 border-b-2 border-zinc-900 inline-block px-8 pb-1">
                            {certificado.nombreCompletoTitular}
                        </div>
                        <p className="text-xs text-zinc-500">
                            Identificado(a) con DNI N° <strong>{certificado.dniTitular}</strong>
                        </p>
                    </div>

                    <p className="mx-auto max-w-3xl text-sm leading-relaxed text-zinc-700">
                        Por haber culminado satisfactoriamente el{" "}
                        <strong>
                            {metadatos.categoriaOriginal ||
                                certificado.temporadaNombreImpreso ||
                                "Programa Académico"}
                        </strong>{" "}
                        en:
                    </p>

                    <div className="mx-auto max-w-3xl rounded-2xl bg-zinc-50 border border-zinc-200 p-4 text-lg sm:text-xl font-extrabold text-zinc-950 uppercase">
                        &ldquo;{certificado.nombreProgramaImpreso}&rdquo;
                    </div>

                    <div className="text-xs text-zinc-700 space-y-1">
                        <p>
                            Desarrollado{" "}
                            {certificado.fechaInicioCurso
                                ? `del ${new Date(
                                    certificado.fechaInicioCurso
                                ).toLocaleDateString("es-PE")}`
                                : ""}{" "}
                            {certificado.fechaTerminoCurso
                                ? `al ${new Date(
                                    certificado.fechaTerminoCurso
                                ).toLocaleDateString("es-PE")}`
                                : ""}
                            , con una duración total de{" "}
                            <strong>
                                {certificado.horasAcademicas} horas{" "}
                                {metadatos.tipoHorasOriginal || "Lectivas"}
                            </strong>
                            .
                        </p>
                        {metadatos.docenteOriginal && (
                            <p className="text-zinc-600">
                                Ponente / Especialista:{" "}
                                <strong>{metadatos.docenteOriginal}</strong>
                            </p>
                        )}
                    </div>

                    {/* Pie de firma y Código QR Único */}
                    <div className="pt-8 grid grid-cols-1 sm:grid-cols-3 items-end gap-6 border-t border-zinc-200">
                        <div className="flex flex-col items-center">
                            <img
                                src={urlQrImagen}
                                alt="Código QR de Verificación"
                                className="h-28 w-28 rounded-lg border border-zinc-300 p-1"
                            />
                            <span className="mt-1 text-[10px] font-mono text-zinc-500">
                                QR ID: {certificado.codigoUnico}
                            </span>
                        </div>

                        <div className="flex flex-col items-center">
                            {certificado.incluirFirmaDigital &&
                                configSitio?.firmaDirectorUrl && (
                                    <img
                                        src={configSitio.firmaDirectorUrl}
                                        alt="Firma"
                                        className="h-14 object-contain mb-1"
                                    />
                                )}
                            <div className="w-48 border-t border-zinc-800 pt-1 text-xs font-extrabold">
                                {configSitio?.nombreDirector || "Dirección Académica"}
                            </div>
                            <span className="text-[11px] text-zinc-500">
                                {configSitio?.nombreEmpresa || "Aula Profesional"}
                            </span>
                        </div>

                        <div className="flex flex-col items-center justify-center text-xs text-zinc-600">
                            <ShieldCheck className="h-8 w-8 text-zinc-900 mb-1" />
                            <span className="font-bold">Verificación Pública QR</span>
                            <span className="text-[10px]">
                                Válido para expedientes y escalafón
                            </span>
                        </div>
                    </div>
                </div>

                {/* REVERSO: Solo se muestra si el certificado pertenece a una sección con desglose de módulos (No se muestra en los 4,200 históricos) */}
                {!esSoloAnverso && Array.isArray(metadatos.modulos) && (
                    <div className="rounded-3xl border-2 border-zinc-900 bg-white p-8 shadow-xl space-y-4">
                        <h3 className="text-sm font-extrabold uppercase">
                            Reverso — Temario, Módulos y Calificaciones
                        </h3>
                        <ul className="list-disc pl-5 text-xs space-y-1">
                            {metadatos.modulos.map((m: any, i: number) => (
                                <li key={i}>
                                    <strong>{m.titulo}</strong> {m.nota ? `— Nota: ${m.nota}` : ""}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}