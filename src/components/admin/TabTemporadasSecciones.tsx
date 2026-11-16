// src/components/admin/TabTemporadasSecciones.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Edit3, Trash2, ExternalLink, Sliders, MailCheck } from "lucide-react";

interface TabTemporadasSeccionesProps {
    subTabActiva: string;
    setSubTabActiva: (tab: string) => void;
    temporadas: any[];
    secciones: any[];
    cursos: any[];
    membresias: any[];
    simuladores: any[];
    onEjecutarAccion: (
        accion: string,
        datos: any,
        msgExito: string
    ) => Promise<void>;
}

export default function TabTemporadasSecciones({
    subTabActiva,
    setSubTabActiva,
    temporadas,
    secciones,
    cursos,
    membresias,
    simuladores,
    onEjecutarAccion,
}: TabTemporadasSeccionesProps) {
    const [seccionSeleccionadaId, setSeccionSeleccionadaId] = useState<string>(
        secciones?.[0]?.id || ""
    );
    const [sesionesSeccionEditables, setSesionesSeccionEditables] = useState<
        any[]
    >(secciones?.[0]?.sesionesHabilitadas || []);

    useEffect(() => {
        if (secciones.length > 0) {
            const actual =
                secciones.find((s) => s.id === seccionSeleccionadaId) || secciones[0];
            setSeccionSeleccionadaId(actual.id);
            setSesionesSeccionEditables(actual.sesionesHabilitadas || []);
        }
    }, [secciones]);

    const [formTemporada, setFormTemporada] = useState({
        id: "",
        codigo: "TEMP-2026-I",
        nombre: "Temporada Académica 2026-I",
        fechaInicio: "2026-11-15",
        fechaFin: "2027-03-30",
        activa: true,
    });

    const [formSeccion, setFormSeccion] = useState({
        id: "",
        codigoSeccion: "SEC-01",
        nombreSeccion: "Sección A",
        temporadaId: "",
        cursoId: "",
        permiteInscripcionPagoDirecto: true,
        precioSeccion: 320,
        membresiasIds: [] as string[],
        simuladoresIds: [] as string[],
        visibleEnInicio: true,
        cerradoSoloInvitados: false,
        correosInvitadosTexto: "",
        llevaDocente: true,
        correoDocenteAsignado: "",
        permisoDocenteEditarCurso: false,
        modoCuestionariosSeccion: "POR_SESION",
        modoTareas: "TAREA_POR_SESION",
        tipoAcreditacion: "POR_DEFECTO_CURSO",
    });

    function toggleCheckbox(arr: string[], id: string) {
        return arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id];
    }

    // 1. TEMPORADAS (LISTAR, CREAR, EDITAR Y ELIMINAR)
    if (subTabActiva === "sec_temporadas") {
        return (
            <div className="space-y-6">
                <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-base font-extrabold">
                            {formTemporada.id
                                ? `Editando Temporada: ${formTemporada.nombre}`
                                : "1. Crear Nueva Temporada / Periodo Académico"}
                        </h3>
                        {formTemporada.id && (
                            <button
                                onClick={() =>
                                    setFormTemporada({
                                        id: "",
                                        codigo: "TEMP-2026",
                                        nombre: "",
                                        fechaInicio: "2026-11-15",
                                        fechaFin: "2027-03-30",
                                        activa: true,
                                    })
                                }
                                className="text-xs font-bold underline"
                            >
                                Cancelar edición
                            </button>
                        )}
                    </div>

                    <div className="grid gap-3 sm:grid-cols-4">
                        <input
                            placeholder="Código (TEMP-2026-I)"
                            value={formTemporada.codigo}
                            onChange={(e) =>
                                setFormTemporada({ ...formTemporada, codigo: e.target.value })
                            }
                            className="rounded-lg border border-zinc-300 px-3 py-2 text-xs"
                        />
                        <input
                            placeholder="Nombre de la Temporada"
                            value={formTemporada.nombre}
                            onChange={(e) =>
                                setFormTemporada({ ...formTemporada, nombre: e.target.value })
                            }
                            className="rounded-lg border border-zinc-300 px-3 py-2 text-xs"
                        />
                        <input
                            type="date"
                            value={formTemporada.fechaInicio}
                            onChange={(e) =>
                                setFormTemporada({
                                    ...formTemporada,
                                    fechaInicio: e.target.value,
                                })
                            }
                            className="rounded-lg border border-zinc-300 px-3 py-2 text-xs"
                        />
                        <input
                            type="date"
                            value={formTemporada.fechaFin}
                            onChange={(e) =>
                                setFormTemporada({ ...formTemporada, fechaFin: e.target.value })
                            }
                            className="rounded-lg border border-zinc-300 px-3 py-2 text-xs"
                        />
                    </div>

                    <button
                        onClick={async () => {
                            await onEjecutarAccion(
                                "GUARDAR_TEMPORADA",
                                formTemporada,
                                formTemporada.id
                                    ? "Temporada actualizada"
                                    : "Temporada agregada"
                            );
                            setFormTemporada({
                                id: "",
                                codigo: "TEMP-2026",
                                nombre: "",
                                fechaInicio: "2026-11-15",
                                fechaFin: "2027-03-30",
                                activa: true,
                            });
                        }}
                        className="inline-flex items-center gap-2 rounded-xl bg-zinc-950 px-5 py-2.5 text-xs font-extrabold text-white"
                    >
                        <Plus className="h-4 w-4" />
                        <span>
                            {formTemporada.id
                                ? "Guardar Cambios de Temporada"
                                : "Agregar Temporada"}
                        </span>
                    </button>
                </div>

                <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-3">
                    <h4 className="text-sm font-extrabold">
                        Temporadas Existentes ({temporadas.length})
                    </h4>
                    <div className="divide-y divide-zinc-200 text-xs">
                        {temporadas.map((t) => (
                            <div
                                key={t.id}
                                className="py-3 flex flex-wrap items-center justify-between gap-4"
                            >
                                <div>
                                    <span className="font-mono font-bold text-zinc-500">
                                        [{t.codigo}]
                                    </span>{" "}
                                    <strong className="text-sm">{t.nombre}</strong>{" "}
                                    <span className="text-zinc-500">
                                        ({new Date(t.fechaInicio).toLocaleDateString("es-PE")} al{" "}
                                        {new Date(t.fechaFin).toLocaleDateString("es-PE")} •{" "}
                                        {t._count?.secciones || 0} secciones)
                                    </span>
                                </div>
                                <div className="flex gap-3 font-bold">
                                    <button
                                        onClick={() =>
                                            setFormTemporada({
                                                id: t.id,
                                                codigo: t.codigo,
                                                nombre: t.nombre,
                                                fechaInicio: new Date(t.fechaInicio)
                                                    .toISOString()
                                                    .slice(0, 10),
                                                fechaFin: new Date(t.fechaFin)
                                                    .toISOString()
                                                    .slice(0, 10),
                                                activa: t.activa,
                                            })
                                        }
                                        className="inline-flex items-center gap-1 underline"
                                    >
                                        <Edit3 className="h-3.5 w-3.5" />
                                        <span>Editar Nombre / Fechas</span>
                                    </button>
                                    <button
                                        onClick={() =>
                                            onEjecutarAccion(
                                                "ELIMINAR_TEMPORADA",
                                                { id: t.id },
                                                "Temporada eliminada"
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

    // 2. CREAR / EDITAR / ELIMINAR SECCIÓN POR TEMPORADA
    if (subTabActiva === "sec_crear") {
        return (
            <div className="space-y-6">
                <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-5">
                    <div className="flex items-center justify-between">
                        <h3 className="text-base font-extrabold">
                            {formSeccion.id
                                ? `Editando Sección: ${formSeccion.nombreSeccion}`
                                : "2. Configurar Sección en una Temporada (Checkboxes de Membresías, Simuladores, Costo, Docente y Gmail)"}
                        </h3>
                        {formSeccion.id && (
                            <button
                                onClick={() =>
                                    setFormSeccion({
                                        id: "",
                                        codigoSeccion: "SEC-01",
                                        nombreSeccion: "Sección A",
                                        temporadaId: "",
                                        cursoId: "",
                                        permiteInscripcionPagoDirecto: true,
                                        precioSeccion: 320,
                                        membresiasIds: [],
                                        simuladoresIds: [],
                                        visibleEnInicio: true,
                                        cerradoSoloInvitados: false,
                                        correosInvitadosTexto: "",
                                        llevaDocente: true,
                                        correoDocenteAsignado: "",
                                        permisoDocenteEditarCurso: false,
                                        modoCuestionariosSeccion: "POR_SESION",
                                        modoTareas: "TAREA_POR_SESION",
                                        tipoAcreditacion: "POR_DEFECTO_CURSO",
                                    })
                                }
                                className="text-xs font-bold underline"
                            >
                                Cancelar edición
                            </button>
                        )}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-4">
                        <select
                            value={formSeccion.temporadaId}
                            onChange={(e) =>
                                setFormSeccion({ ...formSeccion, temporadaId: e.target.value })
                            }
                            className="rounded-lg border border-zinc-300 px-3 py-2 text-xs"
                        >
                            <option value="">-- Seleccionar Temporada --</option>
                            {temporadas.map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.nombre}
                                </option>
                            ))}
                        </select>

                        <select
                            value={formSeccion.cursoId}
                            onChange={(e) =>
                                setFormSeccion({ ...formSeccion, cursoId: e.target.value })
                            }
                            className="rounded-lg border border-zinc-300 px-3 py-2 text-xs"
                        >
                            <option value="">-- Seleccionar Curso --</option>
                            {cursos.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.titulo}
                                </option>
                            ))}
                        </select>

                        <input
                            placeholder="Código Sección (SEC-01)"
                            value={formSeccion.codigoSeccion}
                            onChange={(e) =>
                                setFormSeccion({
                                    ...formSeccion,
                                    codigoSeccion: e.target.value,
                                })
                            }
                            className="rounded-lg border border-zinc-300 px-3 py-2 text-xs"
                        />

                        <input
                            placeholder="Nombre Sección (Sección A)"
                            value={formSeccion.nombreSeccion}
                            onChange={(e) =>
                                setFormSeccion({
                                    ...formSeccion,
                                    nombreSeccion: e.target.value,
                                })
                            }
                            className="rounded-lg border border-zinc-300 px-3 py-2 text-xs"
                        />
                    </div>

                    {/* Check de Inscripción y Costo en esta Sección */}
                    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 space-y-3 text-xs">
                        <label className="flex items-center gap-2 font-extrabold cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formSeccion.permiteInscripcionPagoDirecto}
                                onChange={(e) =>
                                    setFormSeccion({
                                        ...formSeccion,
                                        permiteInscripcionPagoDirecto: e.target.checked,
                                    })
                                }
                            />
                            <span>
                                Permitir inscripción pagando desde la plataforma en esta Sección
                            </span>
                        </label>
                        {formSeccion.permiteInscripcionPagoDirecto && (
                            <div className="flex items-center gap-3 pl-6">
                                <span className="font-bold">
                                    Costo del Curso en esta Sección (S/):
                                </span>
                                <input
                                    type="number"
                                    value={formSeccion.precioSeccion}
                                    onChange={(e) =>
                                        setFormSeccion({
                                            ...formSeccion,
                                            precioSeccion: Number(e.target.value),
                                        })
                                    }
                                    className="w-32 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 font-extrabold"
                                />
                            </div>
                        )}
                    </div>

                    {/* Checkboxes de Membresías */}
                    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 space-y-2 text-xs">
                        <span className="font-extrabold block">
                            Checkboxes de Membresías habilitadas para esta Sección:
                        </span>
                        <div className="flex flex-wrap gap-3">
                            {membresias.map((m) => (
                                <label
                                    key={m.id}
                                    className="flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 font-bold cursor-pointer"
                                >
                                    <input
                                        type="checkbox"
                                        checked={formSeccion.membresiasIds.includes(m.id)}
                                        onChange={() =>
                                            setFormSeccion({
                                                ...formSeccion,
                                                membresiasIds: toggleCheckbox(
                                                    formSeccion.membresiasIds,
                                                    m.id
                                                ),
                                            })
                                        }
                                    />
                                    <span>{m.nombre}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Checkboxes de Simuladores */}
                    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 space-y-2 text-xs">
                        <span className="font-extrabold block">
                            Checkboxes de Simuladores incluidos en esta Sección:
                        </span>
                        <div className="flex flex-wrap gap-3">
                            {simuladores.map((s) => (
                                <label
                                    key={s.id}
                                    className="flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 font-bold cursor-pointer"
                                >
                                    <input
                                        type="checkbox"
                                        checked={formSeccion.simuladoresIds.includes(s.id)}
                                        onChange={() =>
                                            setFormSeccion({
                                                ...formSeccion,
                                                simuladoresIds: toggleCheckbox(
                                                    formSeccion.simuladoresIds,
                                                    s.id
                                                ),
                                            })
                                        }
                                    />
                                    <span>{s.nombre}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Docente por Gmail vs Videos Grabados, Mostrar en Inicio e Invitados Gmail */}
                    <div className="grid gap-4 sm:grid-cols-2 text-xs">
                        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 space-y-2">
                            <label className="flex items-center gap-2 font-extrabold cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formSeccion.llevaDocente}
                                    onChange={(e) =>
                                        setFormSeccion({
                                            ...formSeccion,
                                            llevaDocente: e.target.checked,
                                        })
                                    }
                                />
                                <span>
                                    Lleva Docente (Si quitas el check, va 100% con videos grabados)
                                </span>
                            </label>
                            {formSeccion.llevaDocente && (
                                <div className="space-y-2 pt-1">
                                    <input
                                        placeholder="Correo Gmail del Docente (docente@gmail.com)"
                                        value={formSeccion.correoDocenteAsignado}
                                        onChange={(e) =>
                                            setFormSeccion({
                                                ...formSeccion,
                                                correoDocenteAsignado: e.target.value,
                                            })
                                        }
                                        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2"
                                    />
                                    <label className="flex items-center gap-2 font-semibold">
                                        <input
                                            type="checkbox"
                                            checked={formSeccion.permisoDocenteEditarCurso}
                                            onChange={(e) =>
                                                setFormSeccion({
                                                    ...formSeccion,
                                                    permisoDocenteEditarCurso: e.target.checked,
                                                })
                                            }
                                        />
                                        <span>Permitir al docente editar materiales/exámenes</span>
                                    </label>
                                </div>
                            )}
                        </div>

                        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 space-y-2">
                            <label className="flex items-center gap-2 font-extrabold cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formSeccion.visibleEnInicio}
                                    onChange={(e) =>
                                        setFormSeccion({
                                            ...formSeccion,
                                            visibleEnInicio: e.target.checked,
                                        })
                                    }
                                />
                                <span>Mostrar en la Página Principal</span>
                            </label>

                            <label className="flex items-center gap-2 font-extrabold cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formSeccion.cerradoSoloInvitados}
                                    onChange={(e) =>
                                        setFormSeccion({
                                            ...formSeccion,
                                            cerradoSoloInvitados: e.target.checked,
                                            visibleEnInicio: e.target.checked
                                                ? false
                                                : formSeccion.visibleEnInicio,
                                        })
                                    }
                                />
                                <span>Cerrar sección solo para Invitados por Correo Gmail</span>
                            </label>

                            <textarea
                                rows={2}
                                placeholder="Correos Gmail invitados separados por coma..."
                                value={formSeccion.correosInvitadosTexto}
                                onChange={(e) =>
                                    setFormSeccion({
                                        ...formSeccion,
                                        correosInvitadosTexto: e.target.value,
                                    })
                                }
                                className="w-full rounded-lg border border-zinc-300 bg-white p-2"
                            />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3 text-xs">
                        <div>
                            <label className="font-bold block mb-1">
                                Cuestionarios en esta Sección
                            </label>
                            <select
                                value={formSeccion.modoCuestionariosSeccion}
                                onChange={(e) =>
                                    setFormSeccion({
                                        ...formSeccion,
                                        modoCuestionariosSeccion: e.target.value,
                                    })
                                }
                                className="w-full rounded-lg border border-zinc-300 px-3 py-2"
                            >
                                <option value="POR_SESION">En cada sesión</option>
                                <option value="INTERMEDIO_Y_FINAL">Intermedio y Final</option>
                                <option value="SOLO_FINAL">Solo al Final</option>
                                <option value="SIN_CUESTIONARIOS">Sin cuestionarios</option>
                            </select>
                        </div>

                        <div>
                            <label className="font-bold block mb-1">
                                Tareas en esta Sección
                            </label>
                            <select
                                value={formSeccion.modoTareas}
                                onChange={(e) =>
                                    setFormSeccion({ ...formSeccion, modoTareas: e.target.value })
                                }
                                className="w-full rounded-lg border border-zinc-300 px-3 py-2"
                            >
                                <option value="TAREA_POR_SESION">Tarea por sesión</option>
                                <option value="TAREA_GENERAL_UNICA">Tarea general única</option>
                                <option value="SIN_TAREAS">Sin tareas</option>
                            </select>
                        </div>

                        <div>
                            <label className="font-bold block mb-1">
                                Tipo de Credencial de esta Sección
                            </label>
                            <select
                                value={formSeccion.tipoAcreditacion}
                                onChange={(e) =>
                                    setFormSeccion({
                                        ...formSeccion,
                                        tipoAcreditacion: e.target.value,
                                    })
                                }
                                className="w-full rounded-lg border border-zinc-300 px-3 py-2"
                            >
                                <option value="POR_DEFECTO_CURSO">Por defecto del curso</option>
                                <option value="CERTIFICADO_PARTICIPACION">
                                    Certificado de Participación
                                </option>
                                <option value="CERTIFICADO_CAPACITACION">
                                    Certificado de Capacitación
                                </option>
                                <option value="DIPLOMA_ESPECIALIZACION">
                                    Diploma de Especialización
                                </option>
                            </select>
                        </div>
                    </div>

                    <button
                        onClick={() =>
                            onEjecutarAccion(
                                "GUARDAR_SECCION_TEMPORADA",
                                formSeccion,
                                formSeccion.id ? "Sección actualizada" : "Sección creada"
                            )
                        }
                        className="inline-flex items-center gap-2 rounded-xl bg-zinc-950 px-6 py-3 text-xs font-extrabold text-white"
                    >
                        <Plus className="h-4 w-4" />
                        <span>
                            {formSeccion.id ? "Guardar Cambios de Sección" : "Crear Sección"}
                        </span>
                    </button>
                </div>

                <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-3">
                    <h4 className="text-sm font-extrabold">
                        Secciones Creadas ({secciones.length})
                    </h4>
                    <div className="divide-y divide-zinc-200 text-xs">
                        {secciones.map((s) => (
                            <div
                                key={s.id}
                                className="py-3 flex flex-wrap items-center justify-between gap-4"
                            >
                                <div>
                                    <span className="font-mono font-bold text-zinc-500">
                                        [{s.codigoSeccion}]
                                    </span>{" "}
                                    <strong className="text-sm">
                                        {s.curso?.titulo} — {s.nombreSeccion}
                                    </strong>{" "}
                                    <span className="text-zinc-500">
                                        ({s.temporada?.nombre} • S/{" "}
                                        {Number(s.precioSeccion).toFixed(2)})
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 font-bold">
                                    <button
                                        onClick={() => {
                                            setSeccionSeleccionadaId(s.id);
                                            setSesionesSeccionEditables(s.sesionesHabilitadas || []);
                                            setSubTabActiva("sec_adecuar");
                                        }}
                                        className="rounded-lg bg-zinc-950 text-white px-3 py-1.5"
                                    >
                                        Adecuar Materiales / Aula
                                    </button>
                                    <button
                                        onClick={() =>
                                            setFormSeccion({
                                                id: s.id,
                                                codigoSeccion: s.codigoSeccion,
                                                nombreSeccion: s.nombreSeccion,
                                                temporadaId: s.temporadaId,
                                                cursoId: s.cursoId,
                                                permiteInscripcionPagoDirecto:
                                                    s.permiteInscripcionPagoDirecto,
                                                precioSeccion: Number(s.precioSeccion),
                                                membresiasIds:
                                                    s.planesMembresiaPermitidos?.map(
                                                        (p: any) => p.planSuscripcionId
                                                    ) || [],
                                                simuladoresIds:
                                                    s.simuladoresPermitidos?.map(
                                                        (sim: any) => sim.planSimulacroId
                                                    ) || [],
                                                visibleEnInicio: s.visibleEnInicio,
                                                cerradoSoloInvitados: s.cerradoSoloInvitados,
                                                correosInvitadosTexto: "",
                                                llevaDocente: s.llevaDocente,
                                                correoDocenteAsignado: s.correoDocenteAsignado || "",
                                                permisoDocenteEditarCurso: s.permisoDocenteEditarCurso,
                                                modoCuestionariosSeccion: s.modoCuestionariosSeccion,
                                                modoTareas: s.modoTareas,
                                                tipoAcreditacion: s.tipoAcreditacion,
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
                                                "ELIMINAR_SECCION_TEMPORADA",
                                                { id: s.id },
                                                "Sección eliminada"
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

    // 3. ADECUAR MATERIALES POR SECCIÓN Y AGRUPAR CLASES
    const seccionActual =
        secciones.find((s) => s.id === seccionSeleccionadaId) || secciones?.[0];

    return (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h3 className="text-base font-extrabold">
                        3. Adecuar Materiales y Agrupar Sesiones para una Sección Específica
                    </h3>
                    <p className="text-xs text-zinc-500">
                        Elige qué sesiones van en esta sección, agrupa varias sesiones en
                        una sola clase (ej. Clase 1) o cambia el link del material solo para
                        esta sección.
                    </p>
                </div>

                <select
                    value={seccionActual?.id || ""}
                    onChange={(e) => {
                        const id = e.target.value;
                        setSeccionSeleccionadaId(id);
                        const sec = secciones.find((s) => s.id === id);
                        setSesionesSeccionEditables(sec?.sesionesHabilitadas || []);
                    }}
                    className="rounded-xl border-2 border-zinc-950 px-4 py-2 text-xs font-extrabold"
                >
                    {secciones.map((s) => (
                        <option key={s.id} value={s.id}>
                            {s.codigoSeccion} — {s.curso?.titulo} ({s.nombreSeccion})
                        </option>
                    ))}
                </select>
            </div>

            {seccionActual ? (
                <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-zinc-100 p-4 text-xs">
                        <div>
                            <strong>
                                {seccionActual.curso?.titulo} — {seccionActual.nombreSeccion}
                            </strong>
                            <div className="text-zinc-600 mt-0.5">
                                Temporada: {seccionActual.temporada?.nombre} • Costo: S/{" "}
                                {Number(seccionActual.precioSeccion).toFixed(2)}
                            </div>
                        </div>
                        <Link
                            href={`/aula-virtual?seccion=${seccionActual.id}`}
                            className="inline-flex items-center gap-2 rounded-xl bg-zinc-950 px-4 py-2.5 text-xs font-extrabold text-white"
                        >
                            <ExternalLink className="h-4 w-4" />
                            <span>Entrar al Aula Virtual de esta Sección</span>
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="border-b border-zinc-200 bg-zinc-50 font-extrabold">
                                    <th className="p-2.5">Habilitada</th>
                                    <th className="p-2.5">Sesión del Curso</th>
                                    <th className="p-2.5">Agrupar en N° de Clase</th>
                                    <th className="p-2.5">
                                        Link Material / Video Propio para esta Sección (Opcional)
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-200">
                                {sesionesSeccionEditables.map((item, idx) => (
                                    <tr key={item.id}>
                                        <td className="p-2.5">
                                            <input
                                                type="checkbox"
                                                checked={item.habilitada}
                                                onChange={(e) => {
                                                    const c = [...sesionesSeccionEditables];
                                                    c[idx] = { ...c[idx], habilitada: e.target.checked };
                                                    setSesionesSeccionEditables(c);
                                                }}
                                            />
                                        </td>
                                        <td className="p-2.5 font-bold">{item.leccion?.titulo}</td>
                                        <td className="p-2.5">
                                            <input
                                                type="number"
                                                min={1}
                                                value={item.numeroClaseAgrupada || 1}
                                                onChange={(e) => {
                                                    const c = [...sesionesSeccionEditables];
                                                    c[idx] = {
                                                        ...c[idx],
                                                        numeroClaseAgrupada: Number(e.target.value),
                                                    };
                                                    setSesionesSeccionEditables(c);
                                                }}
                                                className="w-16 rounded border border-zinc-300 px-2 py-1 font-bold"
                                            />
                                        </td>
                                        <td className="p-2.5">
                                            <input
                                                placeholder={
                                                    item.leccion?.videoUrl ||
                                                    "Por defecto usa el material del curso maestro..."
                                                }
                                                value={item.materialDriveUrlOverride || ""}
                                                onChange={(e) => {
                                                    const c = [...sesionesSeccionEditables];
                                                    c[idx] = {
                                                        ...c[idx],
                                                        materialDriveUrlOverride: e.target.value,
                                                    };
                                                    setSesionesSeccionEditables(c);
                                                }}
                                                className="w-full rounded border border-zinc-300 px-2.5 py-1"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <button
                        onClick={() =>
                            onEjecutarAccion(
                                "GUARDAR_ADECUACION_SESIONES_SECCION",
                                {
                                    seccionId: seccionActual.id,
                                    sesionesConfig: sesionesSeccionEditables,
                                },
                                "Adecuación de sección guardada"
                            )
                        }
                        className="inline-flex items-center gap-2 rounded-xl bg-zinc-950 px-5 py-2.5 text-xs font-extrabold text-white"
                    >
                        <Sliders className="h-4 w-4" />
                        <span>Guardar Adecuación de Sección</span>
                    </button>
                </div>
            ) : (
                <p className="text-xs text-zinc-500">
                    Primero crea una sección en la pestaña anterior.
                </p>
            )}
        </div>
    );
}