// src/components/admin/TabCursosMateriales.tsx
"use client";

import React, { useState } from "react";
import DropzoneArchivo from "@/components/admin/DropzoneArchivo";
import {
    Plus,
    Edit3,
    Trash2,
    Download,
    Upload,
    FolderGit2,
    HelpCircle,
} from "lucide-react";

interface TabCursosMaterialesProps {
    subTabActiva: string;
    setSubTabActiva: (tab: string) => void;
    categorias: any[];
    cursos: any[];
    onEjecutarAccion: (
        accion: string,
        datos: any,
        msgExito: string
    ) => Promise<void>;
}

function descargarPlantillaPreguntasCSV() {
    const csv =
        "Enunciado;OpcionA;OpcionB;OpcionC;OpcionD;Correcta;Categoria;ReferenciaNormativa\n" +
        "¿Cuál es la finalidad de la Ley N° 32069?;Maximizar el valor por dinero en las contrataciones públicas;Evitar controles;Contratar sin proceso;Ninguna de las anteriores;A;Actuaciones Preparatorias;Ley N° 32069 Art. 1\n" +
        "¿Qué sistema registra los procedimientos de selección?;SIAF;SEACE 3.0;SIGA;PDT;B;Métodos de Contratación;Reglamento Ley 32069";
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "plantilla_estandar_cuestionario.csv";
    a.click();
}

function parsearCSVAPreguntas(textoCsv: string) {
    const lineas = textoCsv
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);
    const preguntas: any[] = [];

    for (const l of lineas) {
        if (l.toLowerCase().startsWith("enunciado;")) continue;
        const cols = l.includes(";") ? l.split(";") : l.split("\t");
        if (cols.length < 6) continue;
        preguntas.push({
            enunciado: cols[0]?.trim(),
            opcionA: cols[1]?.trim(),
            opcionB: cols[2]?.trim(),
            opcionC: cols[3]?.trim(),
            opcionD: cols[4]?.trim(),
            correcta: (cols[5]?.trim() || "A").toUpperCase(),
            categoriaTematica: cols[6]?.trim() || "General",
            referenciaNormativa: cols[7]?.trim() || "",
        });
    }
    return preguntas;
}

export default function TabCursosMateriales({
    subTabActiva,
    setSubTabActiva,
    categorias,
    cursos,
    onEjecutarAccion,
}: TabCursosMaterialesProps) {
    const [cursoSeleccionadoId, setCursoSeleccionadoId] = useState<string>(
        cursos?.[0]?.id || ""
    );

    const [formCategoria, setFormCategoria] = useState({
        id: "",
        nombre: "",
        subcategoriasTexto: "",
        imagenUrl: "/categorias/default.jpg",
    });

    const [formCurso, setFormCurso] = useState({
        id: "",
        codigoInterno: "CUR-2026-01",
        titulo: "",
        nombreCorto: "",
        categoriaId: "",
        resumen: "",
        imagenPortada: "/cursos/curso-1.jpg",
        videoPresentacionUrl: "",
        idioma: "Español",
        tamanoMaxArchivoEstudianteMb: 15,
        tipoPrograma: "CURSO",
        modalidad: "SINCRONO",
        horasAcademicas: 40,
        tipoHoras: "PEDAGOGICAS",
        creditos: 4,
        numeroModulosBase: 2,
        numeroSesionesBase: 8,
        precioBase: 150,
        enlaceCarpetaGoogleDrive: "",
        destacadoEnInicio: true,
    });

    const cursoMaestroActual =
        cursos.find((c) => c.id === cursoSeleccionadoId) || cursos?.[0];

    // 1. SUB-PESTAÑA CATEGORÍAS
    if (subTabActiva === "cur_categorias") {
        return (
            <div className="space-y-6">
                <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
                    <h3 className="text-base font-extrabold">
                        {formCategoria.id
                            ? `Editando Categoría: ${formCategoria.nombre}`
                            : "1. Crear Categoría / Especialidad Académica"}
                    </h3>
                    <div className="grid gap-3 sm:grid-cols-3">
                        <input
                            placeholder="Nombre (Ej: Gestión Pública, Ingeniería, Salud...)"
                            value={formCategoria.nombre}
                            onChange={(e) =>
                                setFormCategoria({ ...formCategoria, nombre: e.target.value })
                            }
                            className="rounded-lg border border-zinc-300 px-3 py-2 text-xs"
                        />
                        <input
                            placeholder="Subcategorías (SIAF, SEACE, BIM, SST...)"
                            value={formCategoria.subcategoriasTexto || ""}
                            onChange={(e) =>
                                setFormCategoria({
                                    ...formCategoria,
                                    subcategoriasTexto: e.target.value,
                                })
                            }
                            className="rounded-lg border border-zinc-300 px-3 py-2 text-xs"
                        />
                        <button
                            onClick={async () => {
                                await onEjecutarAccion(
                                    "GUARDAR_CATEGORIA",
                                    formCategoria,
                                    "Categoría guardada"
                                );
                                setFormCategoria({
                                    id: "",
                                    nombre: "",
                                    subcategoriasTexto: "",
                                    imagenUrl: "/categorias/default.jpg",
                                });
                            }}
                            className="rounded-xl bg-zinc-950 px-4 py-2 text-xs font-extrabold text-white"
                        >
                            {formCategoria.id
                                ? "Guardar Cambios"
                                : "+ Crear Categoría Académica"}
                        </button>
                    </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                    {categorias.map((c) => (
                        <div
                            key={c.id}
                            className="rounded-xl border border-zinc-200 bg-white p-4 flex items-center justify-between"
                        >
                            <div>
                                <div className="font-extrabold text-xs">{c.nombre}</div>
                                <div className="text-[11px] text-zinc-500">
                                    {c.subcategoriasTexto}
                                </div>
                            </div>
                            <div className="flex gap-2 text-xs font-bold">
                                <button
                                    onClick={() => setFormCategoria(c)}
                                    className="underline"
                                >
                                    Editar
                                </button>
                                <button
                                    onClick={() =>
                                        onEjecutarAccion(
                                            "ELIMINAR_CATEGORIA",
                                            { id: c.id },
                                            "Categoría eliminada"
                                        )
                                    }
                                    className="text-red-600"
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // 2. SUB-PESTAÑA CREAR / EDITAR / ELIMINAR CURSO MAESTRO
    if (subTabActiva === "cur_crear") {
        return (
            <div className="space-y-6">
                <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-base font-extrabold">
                            {formCurso.id
                                ? `Editando Curso Maestro: ${formCurso.titulo}`
                                : "2. Crear Nuevo Curso Maestro Completo"}
                        </h3>
                        {formCurso.id && (
                            <button
                                onClick={() =>
                                    setFormCurso({
                                        id: "",
                                        codigoInterno: "CUR-2026",
                                        titulo: "",
                                        nombreCorto: "",
                                        categoriaId: "",
                                        resumen: "",
                                        imagenPortada: "/cursos/curso-1.jpg",
                                        videoPresentacionUrl: "",
                                        idioma: "Español",
                                        tamanoMaxArchivoEstudianteMb: 15,
                                        tipoPrograma: "CURSO",
                                        modalidad: "SINCRONO",
                                        horasAcademicas: 40,
                                        tipoHoras: "PEDAGOGICAS",
                                        creditos: 4,
                                        numeroModulosBase: 2,
                                        numeroSesionesBase: 8,
                                        precioBase: 150,
                                        enlaceCarpetaGoogleDrive: "",
                                        destacadoEnInicio: true,
                                    })
                                }
                                className="text-xs font-bold underline"
                            >
                                Cancelar edición
                            </button>
                        )}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div>
                            <label className="block text-xs font-bold mb-1">
                                Número ID del Curso
                            </label>
                            <input
                                value={formCurso.codigoInterno}
                                onChange={(e) =>
                                    setFormCurso({
                                        ...formCurso,
                                        codigoInterno: e.target.value,
                                    })
                                }
                                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-xs"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold mb-1">
                                Nombre Completo del Curso
                            </label>
                            <input
                                placeholder="Ej: Diplomado en Contrataciones Públicas Ley 32069"
                                value={formCurso.titulo}
                                onChange={(e) =>
                                    setFormCurso({ ...formCurso, titulo: e.target.value })
                                }
                                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-xs"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold mb-1">
                                Nombre Corto del Curso
                            </label>
                            <input
                                placeholder="Ej: Ley 32069"
                                value={formCurso.nombreCorto}
                                onChange={(e) =>
                                    setFormCurso({ ...formCurso, nombreCorto: e.target.value })
                                }
                                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-xs"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold mb-1">Categoría</label>
                            <select
                                value={formCurso.categoriaId}
                                onChange={(e) =>
                                    setFormCurso({ ...formCurso, categoriaId: e.target.value })
                                }
                                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-xs"
                            >
                                <option value="">-- Seleccionar Categoría --</option>
                                {categorias.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold mb-1">
                                Módulos y Sesiones Base
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    placeholder="Módulos"
                                    value={formCurso.numeroModulosBase}
                                    onChange={(e) =>
                                        setFormCurso({
                                            ...formCurso,
                                            numeroModulosBase: Number(e.target.value),
                                        })
                                    }
                                    className="w-1/2 rounded-lg border border-zinc-300 px-3 py-2 text-xs"
                                />
                                <input
                                    type="number"
                                    placeholder="Sesiones"
                                    value={formCurso.numeroSesionesBase}
                                    onChange={(e) =>
                                        setFormCurso({
                                            ...formCurso,
                                            numeroSesionesBase: Number(e.target.value),
                                        })
                                    }
                                    className="w-1/2 rounded-lg border border-zinc-300 px-3 py-2 text-xs"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold mb-1">
                                Horas y Tipo (Pedagógicas / Normales)
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    value={formCurso.horasAcademicas}
                                    onChange={(e) =>
                                        setFormCurso({
                                            ...formCurso,
                                            horasAcademicas: Number(e.target.value),
                                        })
                                    }
                                    className="w-1/2 rounded-lg border border-zinc-300 px-3 py-2 text-xs"
                                />
                                <select
                                    value={formCurso.tipoHoras}
                                    onChange={(e) =>
                                        setFormCurso({ ...formCurso, tipoHoras: e.target.value })
                                    }
                                    className="w-1/2 rounded-lg border border-zinc-300 px-3 py-2 text-xs"
                                >
                                    <option value="PEDAGOGICAS">Pedagógicas</option>
                                    <option value="CRONOLOGICAS_NORMALES">Normales</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold mb-1">
                                Créditos y Máximo MB Archivos Alumno
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    value={formCurso.creditos}
                                    onChange={(e) =>
                                        setFormCurso({
                                            ...formCurso,
                                            creditos: Number(e.target.value),
                                        })
                                    }
                                    className="w-1/2 rounded-lg border border-zinc-300 px-3 py-2 text-xs"
                                />
                                <input
                                    type="number"
                                    value={formCurso.tamanoMaxArchivoEstudianteMb}
                                    onChange={(e) =>
                                        setFormCurso({
                                            ...formCurso,
                                            tamanoMaxArchivoEstudianteMb: Number(e.target.value),
                                        })
                                    }
                                    className="w-1/2 rounded-lg border border-zinc-300 px-3 py-2 text-xs"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-2">
                            <label className="block text-xs font-bold mb-1">
                                <FolderGit2 className="inline h-3.5 w-3.5 mr-1" />
                                Link Carpeta Google Drive del Curso (Segunda opción rápida sin ocupar servidor)
                            </label>
                            <input
                                placeholder="https://drive.google.com/drive/folders/..."
                                value={formCurso.enlaceCarpetaGoogleDrive}
                                onChange={(e) =>
                                    setFormCurso({
                                        ...formCurso,
                                        enlaceCarpetaGoogleDrive: e.target.value,
                                    })
                                }
                                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-xs"
                            />
                        </div>

                        <div className="sm:col-span-3">
                            <DropzoneArchivo
                                label="Subir Imagen de Portada del Curso"
                                carpeta="cursos"
                                accept="image/*"
                                valorActual={formCurso.imagenPortada}
                                onChangeUrl={(url) =>
                                    setFormCurso({ ...formCurso, imagenPortada: url })
                                }
                            />
                        </div>
                    </div>

                    <textarea
                        rows={2}
                        placeholder="Descripción general del curso..."
                        value={formCurso.resumen}
                        onChange={(e) =>
                            setFormCurso({ ...formCurso, resumen: e.target.value })
                        }
                        className="w-full rounded-lg border border-zinc-300 p-3 text-xs"
                    />

                    <button
                        onClick={() =>
                            onEjecutarAccion(
                                "GUARDAR_CURSO_MAESTRO",
                                formCurso,
                                formCurso.id
                                    ? "Curso Maestro actualizado"
                                    : "Curso Maestro creado con sus módulos y sesiones"
                            )
                        }
                        className="inline-flex items-center gap-2 rounded-xl bg-zinc-950 px-6 py-3 text-xs font-extrabold text-white"
                    >
                        <Plus className="h-4 w-4" />
                        <span>
                            {formCurso.id ? "Guardar Cambios del Curso" : "Crear Curso Maestro"}
                        </span>
                    </button>
                </div>

                {/* LISTA DE CURSOS CREADOS */}
                <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-3">
                    <h4 className="text-sm font-extrabold">
                        Cursos Maestros Registrados ({cursos.length})
                    </h4>
                    <div className="divide-y divide-zinc-200 text-xs">
                        {cursos.map((c) => (
                            <div
                                key={c.id}
                                className="py-3 flex flex-wrap items-center justify-between gap-4"
                            >
                                <div>
                                    <span className="font-mono font-bold text-zinc-500">
                                        [{c.codigoInterno}]
                                    </span>{" "}
                                    <strong className="text-sm">{c.titulo}</strong>{" "}
                                    <span className="text-zinc-500">
                                        ({c.categoria?.nombre || "Sin categoría"} •{" "}
                                        {c.horasAcademicas} hrs)
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 font-bold">
                                    <button
                                        onClick={() => {
                                            setCursoSeleccionadoId(c.id);
                                            setSubTabActiva("cur_materiales");
                                        }}
                                        className="rounded-lg bg-zinc-950 text-white px-3 py-1.5"
                                    >
                                        Armar Sesiones y Materiales
                                    </button>
                                    <button
                                        onClick={() =>
                                            setFormCurso({
                                                id: c.id,
                                                codigoInterno: c.codigoInterno,
                                                titulo: c.titulo,
                                                nombreCorto: c.nombreCorto || "",
                                                categoriaId: c.categoriaId,
                                                resumen: c.resumen || "",
                                                imagenPortada: c.imagenPortada || "",
                                                videoPresentacionUrl: c.videoPresentacionUrl || "",
                                                idioma: c.idioma || "Español",
                                                tamanoMaxArchivoEstudianteMb:
                                                    c.tamanoMaxArchivoEstudianteMb || 15,
                                                tipoPrograma: c.tipoPrograma || "CURSO",
                                                modalidad: c.modalidad || "SINCRONO",
                                                horasAcademicas: c.horasAcademicas,
                                                tipoHoras: c.tipoHoras,
                                                creditos: Number(c.creditos || 0),
                                                numeroModulosBase: c.numeroModulosBase,
                                                numeroSesionesBase: c.numeroSesionesBase,
                                                precioBase: Number(c.precioBase),
                                                enlaceCarpetaGoogleDrive:
                                                    c.enlaceCarpetaGoogleDrive || "",
                                                destacadoEnInicio: c.destacadoEnInicio,
                                            })
                                        }
                                        className="inline-flex items-center gap-1 underline"
                                    >
                                        <Edit3 className="h-3.5 w-3.5" />
                                        <span>Editar</span>
                                    </button>
                                    <button
                                        onClick={() =>
                                            onEjecutarAccion(
                                                "ELIMINAR_CURSO_MAESTRO",
                                                { id: c.id },
                                                "Curso eliminado"
                                            )
                                        }
                                        className="inline-flex items-center gap-1 text-red-600 hover:underline"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                        <span>Eliminar</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // 3. SUB-PESTAÑA ARMAR MÓDULOS, SESIONES, SUBIR MATERIALES Y CUESTIONARIOS EXCEL
    return (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h3 className="text-base font-extrabold">
                        3. Armar Módulos, Sesiones, Arrastrar Materiales (PC o Drive) y Cuestionarios por Excel o Manual
                    </h3>
                    <p className="text-xs text-zinc-500">
                        Arrastra tus archivos directamente desde tu PC o pega el link de
                        Google Drive. También puedes subir el Excel de preguntas tanto por
                        Módulo como por cada Sesión.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={descargarPlantillaPreguntasCSV}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-2 text-xs font-extrabold hover:bg-zinc-100"
                    >
                        <Download className="h-4 w-4" />
                        <span>Descargar Plantilla Excel/CSV Cuestionario</span>
                    </button>

                    <select
                        value={cursoMaestroActual?.id || ""}
                        onChange={(e) => setCursoSeleccionadoId(e.target.value)}
                        className="rounded-xl border-2 border-zinc-950 px-3.5 py-2 text-xs font-extrabold"
                    >
                        {cursos.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.codigoInterno} — {c.titulo}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {cursoMaestroActual ? (
                <div className="space-y-6 pt-3 border-t border-zinc-100">
                    <button
                        onClick={() => {
                            const titulo = prompt(
                                "Nombre del nuevo Módulo:",
                                `Módulo ${(cursoMaestroActual.modulos?.length || 0) + 1}`
                            );
                            if (titulo) {
                                onEjecutarAccion(
                                    "AGREGAR_MODULO_CURSO",
                                    {
                                        cursoId: cursoMaestroActual.id,
                                        titulo,
                                        orden: (cursoMaestroActual.modulos?.length || 0) + 1,
                                    },
                                    "Módulo agregado al curso"
                                );
                            }
                        }}
                        className="rounded-xl bg-zinc-950 px-4 py-2 text-xs font-extrabold text-white"
                    >
                        + Agregar Nuevo Módulo al Curso
                    </button>

                    {cursoMaestroActual.modulos?.map((mod: any) => (
                        <div
                            key={mod.id}
                            className="rounded-2xl border border-zinc-300 bg-zinc-50 p-5 space-y-4"
                        >
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <h4 className="text-sm font-extrabold uppercase">
                                    {mod.titulo}
                                </h4>

                                <div className="flex flex-wrap items-center gap-2">
                                    <button
                                        onClick={() => {
                                            const titulo = prompt(
                                                "Nombre de la nueva Sesión:",
                                                `Sesión ${(mod.lecciones?.length || 0) + 1}`
                                            );
                                            if (titulo) {
                                                onEjecutarAccion(
                                                    "AGREGAR_SESION_MODULO",
                                                    {
                                                        moduloId: mod.id,
                                                        titulo,
                                                        numeroSesionGlobal:
                                                            (mod.lecciones?.length || 0) + 1,
                                                    },
                                                    "Sesión agregada"
                                                );
                                            }
                                        }}
                                        className="rounded-lg bg-zinc-900 px-3 py-1.5 text-[11px] font-bold text-white"
                                    >
                                        + Agregar Sesión
                                    </button>

                                    <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-zinc-400 bg-white px-3 py-1.5 text-[11px] font-bold hover:bg-zinc-100">
                                        <Upload className="h-3.5 w-3.5" />
                                        <span>
                                            Subir Excel Cuestionario al Módulo (
                                            {mod.evaluaciones?.[0]?.preguntas?.length || 0} preg.)
                                        </span>
                                        <input
                                            type="file"
                                            accept=".csv,.tsv,.txt"
                                            onChange={async (e) => {
                                                const f = e.target.files?.[0];
                                                if (!f) return;
                                                const txt = await f.text();
                                                const pregs = parsearCSVAPreguntas(txt);
                                                await onEjecutarAccion(
                                                    "IMPORTAR_PREGUNTAS_LOTE",
                                                    {
                                                        cursoId: cursoMaestroActual.id,
                                                        moduloId: mod.id,
                                                        tituloEvaluacion: `Cuestionario ${mod.titulo}`,
                                                        preguntas: pregs,
                                                    },
                                                    `${pregs.length} preguntas cargadas en ${mod.titulo}`
                                                );
                                            }}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                {mod.lecciones?.map((lec: any) => (
                                    <TarjetaSesionEditable
                                        key={lec.id}
                                        cursoId={cursoMaestroActual.id}
                                        leccion={lec}
                                        onEjecutarAccion={onEjecutarAccion}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-xs text-zinc-500">
                    Primero crea un Curso Maestro en la pestaña anterior.
                </p>
            )}
        </div>
    );
}

function TarjetaSesionEditable({
    cursoId,
    leccion,
    onEjecutarAccion,
}: {
    cursoId: string;
    leccion: any;
    onEjecutarAccion: (a: string, d: any, m: string) => Promise<void>;
}) {
    const [tituloSesion, setTituloSesion] = useState(leccion.titulo);
    const [mostrarManualQuiz, setMostrarManualQuiz] = useState(false);
    const [enunciado, setEnunciado] = useState("");
    const [opcionA, setOpcionA] = useState("");
    const [opcionB, setOpcionB] = useState("");
    const [opcionC, setOpcionC] = useState("");
    const [opcionD, setOpcionD] = useState("");
    const [correcta, setCorrecta] = useState("A");

    return (
        <div className="rounded-xl border border-zinc-300 bg-white p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
                <input
                    value={tituloSesion}
                    onChange={(e) => setTituloSesion(e.target.value)}
                    onBlur={() =>
                        onEjecutarAccion(
                            "GUARDAR_MATERIAL_SESION",
                            { leccionId: leccion.id, tituloSesion },
                            "Nombre de sesión actualizado"
                        )
                    }
                    className="font-extrabold text-xs border-b border-zinc-300 px-1 py-0.5 w-full"
                />
                <button
                    onClick={() =>
                        onEjecutarAccion(
                            "ELIMINAR_SESION_MODULO",
                            { leccionId: leccion.id },
                            "Sesión eliminada"
                        )
                    }
                    className="text-[11px] font-bold text-red-600 shrink-0"
                >
                    Eliminar
                </button>
            </div>

            <DropzoneArchivo
                label="Arrastrar Material (PPT, PDF, Video) o pegar Link Google Drive"
                carpeta="materiales"
                valorActual={leccion.videoUrl || ""}
                onChangeUrl={(url) =>
                    onEjecutarAccion(
                        "GUARDAR_MATERIAL_SESION",
                        {
                            leccionId: leccion.id,
                            videoUrl: url,
                            tituloMaterial: `Material ${tituloSesion}`,
                            archivoUrl: url,
                        },
                        "Material guardado en la sesión"
                    )
                }
            />

            {leccion.recursosAdjuntos?.length > 0 && (
                <div className="rounded bg-zinc-50 p-2 border border-zinc-200 text-[11px] space-y-1">
                    <span className="font-bold block">Archivos adjuntos:</span>
                    {leccion.recursosAdjuntos.map((r: any) => (
                        <div key={r.id} className="flex justify-between">
                            <span className="truncate">{r.titulo}</span>
                            <a
                                href={r.archivoUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="underline font-bold ml-2"
                            >
                                Abrir
                            </a>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-100">
                <button
                    onClick={() => setMostrarManualQuiz(!mostrarManualQuiz)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold underline"
                >
                    <HelpCircle className="h-3.5 w-3.5" />
                    <span>
                        + Pregunta manual (
                        {leccion.evaluaciones?.[0]?.preguntas?.length || 0} preg.)
                    </span>
                </button>

                <label className="cursor-pointer inline-flex items-center gap-1 rounded-lg bg-zinc-950 px-3 py-1.5 text-[11px] font-extrabold text-white">
                    <Upload className="h-3 w-3" />
                    <span>Subir Excel al Cuestionario</span>
                    <input
                        type="file"
                        accept=".csv,.tsv,.txt"
                        onChange={async (e) => {
                            const f = e.target.files?.[0];
                            if (!f) return;
                            const txt = await f.text();
                            const pregs = parsearCSVAPreguntas(txt);
                            await onEjecutarAccion(
                                "IMPORTAR_PREGUNTAS_LOTE",
                                {
                                    cursoId,
                                    leccionId: leccion.id,
                                    tituloEvaluacion: `Cuestionario ${leccion.titulo}`,
                                    preguntas: pregs,
                                },
                                `${pregs.length} preguntas cargadas en ${leccion.titulo}`
                            );
                        }}
                        className="hidden"
                    />
                </label>
            </div>

            {mostrarManualQuiz && (
                <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 space-y-2 text-xs">
                    <input
                        placeholder="Pregunta..."
                        value={enunciado}
                        onChange={(e) => setEnunciado(e.target.value)}
                        className="w-full rounded border border-zinc-300 bg-white px-2 py-1"
                    />
                    <div className="grid grid-cols-2 gap-1.5">
                        <input
                            placeholder="Opción A"
                            value={opcionA}
                            onChange={(e) => setOpcionA(e.target.value)}
                            className="rounded border border-zinc-300 bg-white px-2 py-1"
                        />
                        <input
                            placeholder="Opción B"
                            value={opcionB}
                            onChange={(e) => setOpcionB(e.target.value)}
                            className="rounded border border-zinc-300 bg-white px-2 py-1"
                        />
                        <input
                            placeholder="Opción C"
                            value={opcionC}
                            onChange={(e) => setOpcionC(e.target.value)}
                            className="rounded border border-zinc-300 bg-white px-2 py-1"
                        />
                        <input
                            placeholder="Opción D"
                            value={opcionD}
                            onChange={(e) => setOpcionD(e.target.value)}
                            className="rounded border border-zinc-300 bg-white px-2 py-1"
                        />
                    </div>
                    <div className="flex justify-between items-center">
                        <select
                            value={correcta}
                            onChange={(e) => setCorrecta(e.target.value)}
                            className="rounded border border-zinc-300 bg-white px-2 py-1 font-bold"
                        >
                            <option value="A">Correcta: A</option>
                            <option value="B">Correcta: B</option>
                            <option value="C">Correcta: C</option>
                            <option value="D">Correcta: D</option>
                        </select>
                        <button
                            onClick={async () => {
                                await onEjecutarAccion(
                                    "IMPORTAR_PREGUNTAS_LOTE",
                                    {
                                        cursoId,
                                        leccionId: leccion.id,
                                        preguntas: [
                                            { enunciado, opcionA, opcionB, opcionC, opcionD, correcta },
                                        ],
                                    },
                                    "Pregunta agregada"
                                );
                                setEnunciado("");
                                setOpcionA("");
                                setOpcionB("");
                                setOpcionC("");
                                setOpcionD("");
                            }}
                            className="rounded bg-zinc-950 px-3 py-1 text-[11px] font-bold text-white"
                        >
                            Guardar Pregunta
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}