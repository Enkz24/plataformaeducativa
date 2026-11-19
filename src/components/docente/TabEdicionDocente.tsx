// src/components/docente/TabEdicionDocente.tsx
"use client";

import React, { useState } from "react";
import DropzoneArchivo from "@/components/admin/DropzoneArchivo";
import { HelpCircle, Plus } from "lucide-react";

interface TabEdicionDocenteProps {
    seccion: any;
    onEjecutarAccion: (
        accion: string,
        datos: any,
        msgExito: string
    ) => Promise<void>;
}

export default function TabEdicionDocente({
    seccion,
    onEjecutarAccion,
}: TabEdicionDocenteProps) {
    const [preguntaAbiertaLecId, setPreguntaAbiertaLecId] = useState<string | null>(
        null
    );
    const [enunciado, setEnunciado] = useState("");
    const [opcionA, setOpcionA] = useState("");
    const [opcionB, setOpcionB] = useState("");
    const [opcionC, setOpcionC] = useState("");
    const [opcionD, setOpcionD] = useState("");
    const [correcta, setCorrecta] = useState("A");

    return (
        <div className="space-y-5">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-2">
                <h3 className="text-base font-extrabold">
                    Edición Habilitada por el Administrador — Materiales y Exámenes
                </h3>
                <p className="text-xs text-zinc-500">
                    Puedes actualizar PPTs, PDFs, enlaces de Google Drive o agregar nuevas
                    preguntas a los cuestionarios de este curso.
                </p>
            </div>

            {seccion.curso?.modulos?.map((mod: any) => (
                <div
                    key={mod.id}
                    className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-4"
                >
                    <h4 className="text-sm font-extrabold uppercase">{mod.titulo}</h4>

                    <div className="grid gap-4 md:grid-cols-2">
                        {mod.lecciones?.map((lec: any) => (
                            <div
                                key={lec.id}
                                className="rounded-xl border border-zinc-300 bg-zinc-50 p-4 space-y-3"
                            >
                                <div className="font-extrabold text-xs">{lec.titulo}</div>

                                <DropzoneArchivo
                                    label="Subir nuevo PPT/PDF o pegar Link de Google Drive"
                                    carpeta="materiales"
                                    valorActual={lec.videoUrl || ""}
                                    onChangeUrl={(url) =>
                                        onEjecutarAccion(
                                            "DOCENTE_EDITAR_MATERIAL",
                                            {
                                                seccionId: seccion.id,
                                                leccionId: lec.id,
                                                videoUrl: url,
                                                tituloMaterial: `Actualización Docente - ${lec.titulo}`,
                                                archivoUrl: url,
                                            },
                                            "Material actualizado correctamente"
                                        )
                                    }
                                />

                                <button
                                    onClick={() =>
                                        setPreguntaAbiertaLecId(
                                            preguntaAbiertaLecId === lec.id ? null : lec.id
                                        )
                                    }
                                    className="inline-flex items-center gap-1 text-xs font-bold underline"
                                >
                                    <HelpCircle className="h-3.5 w-3.5" />
                                    <span>
                                        Agregar pregunta al examen (
                                        {lec.evaluaciones?.[0]?.preguntas?.length || 0} actuales)
                                    </span>
                                </button>

                                {preguntaAbiertaLecId === lec.id && (
                                    <div className="rounded-lg border border-zinc-300 bg-white p-3 space-y-2 text-xs">
                                        <input
                                            placeholder="Pregunta..."
                                            value={enunciado}
                                            onChange={(e) => setEnunciado(e.target.value)}
                                            className="w-full rounded border border-zinc-300 px-2 py-1"
                                        />
                                        <div className="grid grid-cols-2 gap-1.5">
                                            <input
                                                placeholder="Opción A"
                                                value={opcionA}
                                                onChange={(e) => setOpcionA(e.target.value)}
                                                className="rounded border border-zinc-300 px-2 py-1"
                                            />
                                            <input
                                                placeholder="Opción B"
                                                value={opcionB}
                                                onChange={(e) => setOpcionB(e.target.value)}
                                                className="rounded border border-zinc-300 px-2 py-1"
                                            />
                                            <input
                                                placeholder="Opción C"
                                                value={opcionC}
                                                onChange={(e) => setOpcionC(e.target.value)}
                                                className="rounded border border-zinc-300 px-2 py-1"
                                            />
                                            <input
                                                placeholder="Opción D"
                                                value={opcionD}
                                                onChange={(e) => setOpcionD(e.target.value)}
                                                className="rounded border border-zinc-300 px-2 py-1"
                                            />
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <select
                                                value={correcta}
                                                onChange={(e) => setCorrecta(e.target.value)}
                                                className="rounded border border-zinc-300 px-2 py-1 font-bold"
                                            >
                                                <option value="A">Correcta: A</option>
                                                <option value="B">Correcta: B</option>
                                                <option value="C">Correcta: C</option>
                                                <option value="D">Correcta: D</option>
                                            </select>
                                            <button
                                                onClick={async () => {
                                                    await onEjecutarAccion(
                                                        "DOCENTE_AGREGAR_PREGUNTA",
                                                        {
                                                            seccionId: seccion.id,
                                                            leccionId: lec.id,
                                                            enunciado,
                                                            opcionA,
                                                            opcionB,
                                                            opcionC,
                                                            opcionD,
                                                            correcta,
                                                        },
                                                        "Pregunta agregada al examen"
                                                    );
                                                    setEnunciado("");
                                                    setOpcionA("");
                                                    setOpcionB("");
                                                    setOpcionC("");
                                                    setOpcionD("");
                                                }}
                                                className="inline-flex items-center gap-1 rounded bg-zinc-950 px-3 py-1 text-[11px] font-extrabold text-white"
                                            >
                                                <Plus className="h-3 w-3" />
                                                <span>Guardar</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}