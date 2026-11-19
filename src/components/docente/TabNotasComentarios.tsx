// src/components/docente/TabNotasComentarios.tsx
"use client";

import React, { useState } from "react";
import { Save, Printer, Award } from "lucide-react";

interface TabNotasComentariosProps {
    seccion: any;
    onEjecutarAccion: (
        accion: string,
        datos: any,
        msgExito: string
    ) => Promise<void>;
}

export default function TabNotasComentarios({
    seccion,
    onEjecutarAccion,
}: TabNotasComentariosProps) {
    const modulos = seccion.curso?.modulos || [];
    const opcionesConcepto = [
        ...modulos.map((m: any) => ({ id: m.id, label: m.titulo })),
        { id: "NOTA_FINAL", label: "Evaluación Final / Promedio" },
        { id: "TRABAJO_PRACTICO", label: "Trabajo Práctico / Tarea General" },
    ];

    const [conceptoSeleccionado, setConceptoSeleccionado] = useState<string>(
        opcionesConcepto[0]?.label || "Módulo 1"
    );

    const alumnos = seccion.estudiantesSeccion || [];

    return (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h3 className="text-base font-extrabold flex items-center gap-2">
                        <Award className="h-5 w-5" />
                        <span>Registro Intuitivo de Calificaciones y Comentarios</span>
                    </h3>
                    <p className="text-xs text-zinc-500">
                        Elige el módulo o evaluación, digita la nota (0 a 20) y escribe una
                        observación directa para cada alumno.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <select
                        value={conceptoSeleccionado}
                        onChange={(e) => setConceptoSeleccionado(e.target.value)}
                        className="rounded-xl border-2 border-zinc-950 px-3.5 py-2 text-xs font-extrabold"
                    >
                        {opcionesConcepto.map((op) => (
                            <option key={op.id} value={op.label}>
                                {op.label}
                            </option>
                        ))}
                    </select>

                    <button
                        onClick={() => window.print()}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-2 text-xs font-extrabold hover:bg-zinc-100"
                    >
                        <Printer className="h-4 w-4" />
                        <span>Imprimir Acta de Notas</span>
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                    <thead>
                        <tr className="border-b border-zinc-200 bg-zinc-50 font-extrabold">
                            <th className="p-3">Estudiante (DNI)</th>
                            <th className="p-3 w-28">Nota (0 - 20)</th>
                            <th className="p-3">Comentario / Retroalimentación del Docente</th>
                            <th className="p-3 w-32">Guardar</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200">
                        {alumnos.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="p-6 text-center text-zinc-500">
                                    No hay alumnos inscritos en esta sección todavía.
                                </td>
                            </tr>
                        ) : (
                            alumnos.map((al: any) => {
                                const califExistente = seccion.calificaciones?.find(
                                    (c: any) =>
                                        c.estudianteId === al.id &&
                                        c.conceptoEvaluado === conceptoSeleccionado
                                );
                                return (
                                    <FilaNotaAlumno
                                        key={`${al.id}-${conceptoSeleccionado}`}
                                        alumno={al}
                                        notaInicial={
                                            califExistente ? String(califExistente.nota) : ""
                                        }
                                        comentarioInicial={califExistente?.comentarioDocente || ""}
                                        onGuardar={(nota, comentario) =>
                                            onEjecutarAccion(
                                                "GUARDAR_CALIFICACION",
                                                {
                                                    seccionId: seccion.id,
                                                    estudianteId: al.id,
                                                    conceptoEvaluado: conceptoSeleccionado,
                                                    nota: Number(nota),
                                                    comentarioDocente: comentario,
                                                },
                                                `Nota guardada para ${al.name || al.nombres}`
                                            )
                                        }
                                    />
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function FilaNotaAlumno({
    alumno,
    notaInicial,
    comentarioInicial,
    onGuardar,
}: {
    alumno: any;
    notaInicial: string;
    comentarioInicial: string;
    onGuardar: (nota: string, comentario: string) => Promise<void>;
}) {
    const [nota, setNota] = useState(notaInicial);
    const [comentario, setComentario] = useState(comentarioInicial);

    return (
        <tr>
            <td className="p-3">
                <div className="font-bold">
                    {alumno.nombres
                        ? `${alumno.nombres} ${alumno.apellidos || ""}`
                        : alumno.name || alumno.email}
                </div>
                <div className="text-[11px] text-zinc-500">
                    DNI: {alumno.dni || "-"} • {alumno.origen}
                </div>
            </td>
            <td className="p-3">
                <input
                    type="number"
                    min={0}
                    max={20}
                    step="0.5"
                    placeholder="00"
                    value={nota}
                    onChange={(e) => setNota(e.target.value)}
                    className="w-20 rounded-lg border border-zinc-300 px-2.5 py-1.5 text-center font-extrabold"
                />
            </td>
            <td className="p-3">
                <input
                    placeholder="Ej: Excelente participación en el caso práctico..."
                    value={comentario}
                    onChange={(e) => setComentario(e.target.value)}
                    className="w-full rounded-lg border border-zinc-300 px-3 py-1.5"
                />
            </td>
            <td className="p-3">
                <button
                    disabled={nota === ""}
                    onClick={() => onGuardar(nota, comentario)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-950 px-3.5 py-1.5 text-xs font-extrabold text-white hover:bg-zinc-800 disabled:opacity-40"
                >
                    <Save className="h-3.5 w-3.5" />
                    <span>Guardar</span>
                </button>
            </td>
        </tr>
    );
}