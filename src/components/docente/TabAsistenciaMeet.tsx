// src/components/docente/TabAsistenciaMeet.tsx
"use client";

import React, { useState } from "react";
import {
    Video,
    Plus,
    Trash2,
    Clock,
    CheckCircle2,
    ExternalLink,
    Printer,
} from "lucide-react";

interface TabAsistenciaMeetProps {
    seccion: any;
    onEjecutarAccion: (
        accion: string,
        datos: any,
        msgExito: string
    ) => Promise<void>;
}

export default function TabAsistenciaMeet({
    seccion,
    onEjecutarAccion,
}: TabAsistenciaMeetProps) {
    const [formMeet, setFormMeet] = useState({
        numeroClase: (seccion.clasesVivoMeet?.length || 0) + 1,
        tituloClase: `Clase ${(seccion.clasesVivoMeet?.length || 0) + 1} en Vivo`,
        sesionesCubiertasNumeros: "1,2",
        fechaHoraInicio: new Date().toISOString().slice(0, 16),
        fechaHoraFin: new Date(Date.now() + 2 * 3600 * 1000)
            .toISOString()
            .slice(0, 16),
        horasTrabajoDocente: 2.5,
        enlaceGoogleMeet: "",
        enlaceGrabacionResultante: "",
    });

    const [claseParaAsistenciaId, setClaseParaAsistenciaId] = useState<string>(
        seccion.clasesVivoMeet?.[0]?.id || ""
    );

    const alumnos = seccion.estudiantesSeccion || [];
    const totalSesiones = Math.max(
        1,
        seccion.sesionesHabilitadas?.length || seccion.cantidadSesionesHabilitadas || 8
    );
    const listaNumerosSesion = Array.from(
        { length: totalSesiones },
        (_, i) => i + 1
    );

    function obtenerEstadoAsistencia(estudianteId: string, numSesion: number) {
        const reg = seccion.asistencias?.find(
            (a: any) =>
                a.estudianteId === estudianteId &&
                a.numeroSesionCubierta === numSesion
        );
        return reg?.estado || "";
    }

    async function marcarAsistenciaPorClaseAgrupada(
        estudianteId: string,
        estado: "ASISTIO" | "FALTO" | "TARDANZA" | "JUSTIFICADO"
    ) {
        const claseObj = seccion.clasesVivoMeet?.find(
            (c: any) => c.id === claseParaAsistenciaId
        );
        const nums = claseObj
            ? String(claseObj.sesionesCubiertasNumeros || "1")
                .split(",")
                .map((n: string) => Number(n.trim()))
                .filter((n: number) => !isNaN(n) && n > 0)
            : [1];

        const registros = nums.map((numSesion: number) => ({
            estudianteId,
            numeroSesionCubierta: numSesion,
            estado,
            claseMeetId: claseObj?.id || null,
        }));

        await onEjecutarAccion(
            "GUARDAR_ASISTENCIA_LOTE",
            { seccionId: seccion.id, registros },
            `Asistencia actualizada para sesiones: ${nums.join(", ")}`
        );
    }

    return (
        <div className="space-y-6">
            {/* 1. PROGRAMACIÓN DE CLASES EN VIVO MEET Y HORAS DE TRABAJO */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h3 className="text-base font-extrabold flex items-center gap-2">
                            <Video className="h-5 w-5" />
                            <span>Programación de Clases en Vivo (Google Meet) y Registro de Horas</span>
                        </h3>
                        <p className="text-xs text-zinc-500">
                            Define cuántas sesiones cubre cada clase (ej. &laquo;1,2,3&raquo;) y tus
                            horas dictadas para el reporte de trabajo docente.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-zinc-950 px-4 py-2 text-xs font-extrabold text-white">
                            Total Horas Sección: {seccion.totalHorasDictadas || 0} hrs
                        </div>
                        <button
                            onClick={() => window.print()}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-2 text-xs font-extrabold hover:bg-zinc-100"
                        >
                            <Printer className="h-4 w-4" />
                            <span>Imprimir Reporte</span>
                        </button>
                    </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-xs">
                    <div>
                        <label className="block font-bold mb-1">N° Clase y Título</label>
                        <input
                            placeholder="Ej: Clase 1 - Marco Normativo"
                            value={formMeet.tituloClase}
                            onChange={(e) =>
                                setFormMeet({ ...formMeet, tituloClase: e.target.value })
                            }
                            className="w-full rounded-lg border border-zinc-300 px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="block font-bold mb-1">
                            Sesiones que cubre (separadas por coma)
                        </label>
                        <input
                            placeholder="Ej: 1,2,3"
                            value={formMeet.sesionesCubiertasNumeros}
                            onChange={(e) =>
                                setFormMeet({
                                    ...formMeet,
                                    sesionesCubiertasNumeros: e.target.value,
                                })
                            }
                            className="w-full rounded-lg border border-zinc-300 px-3 py-2 font-mono"
                        />
                    </div>

                    <div>
                        <label className="block font-bold mb-1">Fecha y Hora Inicio</label>
                        <input
                            type="datetime-local"
                            value={formMeet.fechaHoraInicio}
                            onChange={(e) =>
                                setFormMeet({ ...formMeet, fechaHoraInicio: e.target.value })
                            }
                            className="w-full rounded-lg border border-zinc-300 px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="block font-bold mb-1">
                            Horas de Trabajo Docente
                        </label>
                        <input
                            type="number"
                            step="0.5"
                            value={formMeet.horasTrabajoDocente}
                            onChange={(e) =>
                                setFormMeet({
                                    ...formMeet,
                                    horasTrabajoDocente: Number(e.target.value),
                                })
                            }
                            className="w-full rounded-lg border border-zinc-300 px-3 py-2 font-extrabold"
                        />
                    </div>

                    <div className="sm:col-span-2">
                        <label className="block font-bold mb-1">
                            Enlace de Reunión Google Meet / Calendar
                        </label>
                        <input
                            placeholder="https://meet.google.com/xxx-xxxx-xxx"
                            value={formMeet.enlaceGoogleMeet}
                            onChange={(e) =>
                                setFormMeet({ ...formMeet, enlaceGoogleMeet: e.target.value })
                            }
                            className="w-full rounded-lg border border-zinc-300 px-3 py-2"
                        />
                    </div>

                    <div className="sm:col-span-2">
                        <label className="block font-bold mb-1">
                            Link de Grabación Resultante (Opcional, para agregar después)
                        </label>
                        <input
                            placeholder="https://drive.google.com/..."
                            value={formMeet.enlaceGrabacionResultante}
                            onChange={(e) =>
                                setFormMeet({
                                    ...formMeet,
                                    enlaceGrabacionResultante: e.target.value,
                                })
                            }
                            className="w-full rounded-lg border border-zinc-300 px-3 py-2"
                        />
                    </div>
                </div>

                <button
                    onClick={async () => {
                        await onEjecutarAccion(
                            "CREAR_CLASE_MEET",
                            { ...formMeet, seccionId: seccion.id },
                            "Clase en vivo programada en el Aula Virtual de los alumnos"
                        );
                        setFormMeet((prev) => ({
                            ...prev,
                            numeroClase: prev.numeroClase + 1,
                            tituloClase: `Clase ${prev.numeroClase + 1} en Vivo`,
                            enlaceGoogleMeet: "",
                        }));
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-zinc-950 px-5 py-2.5 text-xs font-extrabold text-white"
                >
                    <Plus className="h-4 w-4" />
                    <span>Programar Clase Meet</span>
                </button>

                {/* Listado de clases programadas */}
                {seccion.clasesVivoMeet?.length > 0 && (
                    <div className="divide-y divide-zinc-200 border-t border-zinc-200 pt-3 text-xs">
                        {seccion.clasesVivoMeet.map((c: any) => (
                            <div
                                key={c.id}
                                className="py-3 flex flex-wrap items-center justify-between gap-3"
                            >
                                <div>
                                    <span className="font-extrabold">{c.tituloClase}</span>{" "}
                                    <span className="rounded bg-zinc-100 border border-zinc-200 px-2 py-0.5 text-[10px] font-bold">
                                        Cubre Sesiones: {c.sesionesCubiertasNumeros}
                                    </span>{" "}
                                    <span className="text-zinc-500">
                                        • {new Date(c.fechaHoraInicio).toLocaleString("es-PE")} •{" "}
                                        <strong>{Number(c.horasTrabajoDocente)} hrs</strong>
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 font-bold">
                                    {c.enlaceGoogleMeet && (
                                        <a
                                            href={c.enlaceGoogleMeet}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-1 underline"
                                        >
                                            <span>Abrir Meet</span>
                                            <ExternalLink className="h-3.5 w-3.5" />
                                        </a>
                                    )}
                                    <button
                                        onClick={() =>
                                            onEjecutarAccion(
                                                "ELIMINAR_CLASE_MEET",
                                                { seccionId: seccion.id, claseId: c.id },
                                                "Clase eliminada"
                                            )
                                        }
                                        className="text-red-600 hover:underline inline-flex items-center gap-1"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                        <span>Eliminar</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 2. CONTROL DE ASISTENCIA EDITABLE POR SESIÓN O POR CLASE AGRUPADA */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h3 className="text-base font-extrabold flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5" />
                            <span>Registro Editable de Asistencia ({alumnos.length} estudiantes)</span>
                        </h3>
                        <p className="text-xs text-zinc-500">
                            Haz clic en cualquier sesión individual para alternar el estado, o
                            usa el botón rápido de clase para marcar todas las sesiones
                            cubiertas por esa clase Meet en un solo clic.
                        </p>
                    </div>

                    {seccion.clasesVivoMeet?.length > 0 && (
                        <div className="flex items-center gap-2 text-xs">
                            <span className="font-bold">Marcado rápido por Clase:</span>
                            <select
                                value={claseParaAsistenciaId}
                                onChange={(e) => setClaseParaAsistenciaId(e.target.value)}
                                className="rounded-lg border border-zinc-300 px-3 py-1.5 font-bold"
                            >
                                {seccion.clasesVivoMeet.map((c: any) => (
                                    <option key={c.id} value={c.id}>
                                        {c.tituloClase} (Ses. {c.sesionesCubiertasNumeros})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr className="border-b border-zinc-200 bg-zinc-50 font-extrabold">
                                <th className="p-2.5">Estudiante (DNI)</th>
                                {seccion.clasesVivoMeet?.length > 0 && (
                                    <th className="p-2.5">Marcar Clase Agrupada</th>
                                )}
                                {listaNumerosSesion.map((num) => (
                                    <th key={num} className="p-2.5 text-center">
                                        S{num}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200">
                            {alumnos.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={listaNumerosSesion.length + 2}
                                        className="p-6 text-center text-zinc-500"
                                    >
                                        Aún no hay estudiantes activos en esta sección.
                                    </td>
                                </tr>
                            ) : (
                                alumnos.map((al: any) => (
                                    <tr key={al.id}>
                                        <td className="p-2.5">
                                            <div className="font-bold">
                                                {al.nombres
                                                    ? `${al.nombres} ${al.apellidos || ""}`
                                                    : al.name || al.email}
                                            </div>
                                            <div className="text-[11px] text-zinc-500">
                                                DNI: {al.dni || "-"} • {al.email}
                                            </div>
                                        </td>

                                        {seccion.clasesVivoMeet?.length > 0 && (
                                            <td className="p-2.5">
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() =>
                                                            marcarAsistenciaPorClaseAgrupada(al.id, "ASISTIO")
                                                        }
                                                        className="rounded bg-zinc-950 px-2 py-1 text-[10px] font-extrabold text-white"
                                                    >
                                                        Asistió
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            marcarAsistenciaPorClaseAgrupada(al.id, "FALTO")
                                                        }
                                                        className="rounded border border-zinc-300 px-2 py-1 text-[10px] font-bold"
                                                    >
                                                        Faltó
                                                    </button>
                                                </div>
                                            </td>
                                        )}

                                        {listaNumerosSesion.map((num) => {
                                            const estadoActual = obtenerEstadoAsistencia(al.id, num);
                                            const siguienteEstado =
                                                estadoActual === "ASISTIO"
                                                    ? "TARDANZA"
                                                    : estadoActual === "TARDANZA"
                                                        ? "FALTO"
                                                        : estadoActual === "FALTO"
                                                            ? "JUSTIFICADO"
                                                            : "ASISTIO";

                                            const badgeColor =
                                                estadoActual === "ASISTIO"
                                                    ? "bg-zinc-950 text-white"
                                                    : estadoActual === "TARDANZA"
                                                        ? "bg-amber-100 text-amber-900 border border-amber-300"
                                                        : estadoActual === "FALTO"
                                                            ? "bg-red-100 text-red-800 border border-red-300"
                                                            : estadoActual === "JUSTIFICADO"
                                                                ? "bg-zinc-200 text-zinc-800"
                                                                : "bg-white border border-zinc-300 text-zinc-400";

                                            return (
                                                <td key={num} className="p-2 text-center">
                                                    <button
                                                        onClick={() =>
                                                            onEjecutarAccion(
                                                                "GUARDAR_ASISTENCIA_LOTE",
                                                                {
                                                                    seccionId: seccion.id,
                                                                    registros: [
                                                                        {
                                                                            estudianteId: al.id,
                                                                            numeroSesionCubierta: num,
                                                                            estado: siguienteEstado,
                                                                        },
                                                                    ],
                                                                },
                                                                `Sesión ${num} marcada como ${siguienteEstado}`
                                                            )
                                                        }
                                                        title="Clic para cambiar estado (Asistió / Tardanza / Faltó / Justificado)"
                                                        className={`w-8 h-7 rounded font-extrabold text-[10px] transition ${badgeColor}`}
                                                    >
                                                        {estadoActual ? estadoActual.slice(0, 1) : "-"}
                                                    </button>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}