// src/app/docente/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import TabAsistenciaMeet from "@/components/docente/TabAsistenciaMeet";
import TabNotasComentarios from "@/components/docente/TabNotasComentarios";
import TabEdicionDocente from "@/components/docente/TabEdicionDocente";
import {
    BookOpen,
    CalendarClock,
    Award,
    Edit3,
    MessageCircle,
    CheckCircle2,
    Clock,
    ExternalLink,
    Save,
} from "lucide-react";

type TabDocente = "asistencia_meet" | "notas" | "whatsapp" | "edicion";

export default function PanelDocentePage() {
    const [cargando, setCargando] = useState(true);
    const [datos, setDatos] = useState<any>(null);
    const [seccionActivaId, setSeccionActivaId] = useState<string>("");
    const [tabActiva, setTabActiva] = useState<TabDocente>("asistencia_meet");
    const [mensaje, setMensaje] = useState<string | null>(null);
    const [linkWhatsapp, setLinkWhatsapp] = useState("");
    const [horarioTexto, setHorarioTexto] = useState("");

    async function cargarPanel() {
        setCargando(true);
        try {
            const res = await fetch("/api/docente");
            if (res.ok) {
                const json = await res.json();
                setDatos(json);
                if (json.secciones?.length > 0) {
                    const actual =
                        json.secciones.find((s: any) => s.id === seccionActivaId) ||
                        json.secciones[0];
                    setSeccionActivaId(actual.id);
                    setLinkWhatsapp(actual.enlaceGrupoWhatsapp || "");
                    setHorarioTexto(actual.horarioSeccionTexto || "");
                }
            }
        } finally {
            setCargando(false);
        }
    }

    useEffect(() => {
        cargarPanel();
    }, []);

    async function ejecutarAccion(
        accion: string,
        payload: any,
        msgExito: string
    ) {
        setMensaje(null);
        const res = await fetch("/api/docente", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ accion, datos: payload }),
        });
        const json = await res.json();
        if (res.ok && json.ok) {
            setMensaje(msgExito);
            await cargarPanel();
            setTimeout(() => setMensaje(null), 4000);
        } else {
            alert(json.error || "No se pudo realizar la acción");
        }
    }

    if (cargando && !datos) {
        return (
            <div className="min-h-screen bg-zinc-50 flex items-center justify-center text-xs font-bold text-zinc-600">
                Cargando tus cursos y temporadas vigentes...
            </div>
        );
    }

    if (!datos?.docente) {
        return (
            <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
                <div className="max-w-md w-full rounded-2xl border border-zinc-200 bg-white p-8 text-center space-y-4">
                    <h1 className="text-base font-extrabold">
                        Acceso exclusivo para Docentes asignados
                    </h1>
                    <Link
                        href="/"
                        className="inline-block rounded-xl bg-zinc-950 px-5 py-2.5 text-xs font-extrabold text-white"
                    >
                        Volver al Inicio
                    </Link>
                </div>
            </div>
        );
    }

    const seccionActual = datos.secciones?.find(
        (s: any) => s.id === seccionActivaId
    );

    return (
        <div className="min-h-screen flex bg-zinc-50 text-zinc-950">
            {/* COLUMNA IZQUIERDA: SECCIONES ASIGNADAS DENTRO DE TEMPORADA VIGENTE */}
            <aside className="w-72 bg-zinc-950 text-white flex flex-col justify-between shrink-0 border-r border-zinc-800">
                <div>
                    <div className="p-5 border-b border-zinc-800 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                            Panel Docente
                        </span>
                        <h1 className="text-sm font-extrabold truncate">
                            {datos.docente.nombres
                                ? `${datos.docente.nombres} ${datos.docente.apellidos || ""}`
                                : datos.docente.name}
                        </h1>
                        <p className="text-[11px] text-zinc-400 truncate">
                            {datos.docente.email}
                        </p>
                        <div className="pt-2 flex items-center gap-1.5 text-[11px] font-bold text-amber-400">
                            <Clock className="h-3.5 w-3.5" />
                            <span>Total Horas Acumuladas: {datos.totalHorasGlobal} hrs</span>
                        </div>
                    </div>

                    <div className="p-3 space-y-1.5">
                        <span className="block px-2 text-[10px] font-bold uppercase text-zinc-500">
                            Mis Secciones Vigentes ({datos.secciones?.length || 0})
                        </span>

                        {datos.secciones?.length > 0 ? (
                            datos.secciones.map((sec: any) => {
                                const activa = sec.id === seccionActivaId;
                                return (
                                    <button
                                        key={sec.id}
                                        onClick={() => {
                                            setSeccionActivaId(sec.id);
                                            setLinkWhatsapp(sec.enlaceGrupoWhatsapp || "");
                                            setHorarioTexto(sec.horarioSeccionTexto || "");
                                            setTabActiva("asistencia_meet");
                                        }}
                                        className={`w-full rounded-xl p-3 text-left transition ${activa
                                                ? "bg-white text-zinc-950 font-extrabold"
                                                : "text-zinc-300 hover:bg-zinc-900"
                                            }`}
                                    >
                                        <div className="text-[10px] opacity-70 uppercase">
                                            {sec.temporada?.nombre}
                                        </div>
                                        <div className="text-xs font-extrabold truncate mt-0.5">
                                            {sec.curso?.titulo}
                                        </div>
                                        <div className="text-[11px] opacity-80">
                                            {sec.nombreSeccion} • {sec.estudiantesSeccion?.length || 0}{" "}
                                            alumnos
                                        </div>
                                    </button>
                                );
                            })
                        ) : (
                            <p className="px-2 py-4 text-xs text-zinc-400">
                                No tienes secciones activas en la temporada actual. Al finalizar
                                una temporada, las secciones cerradas dejan de mostrarse
                                automáticamente.
                            </p>
                        )}
                    </div>
                </div>

                <div className="p-4 border-t border-zinc-800 space-y-2 text-xs">
                    {datos.docente.rol === "ADMINISTRADOR" && (
                        <Link
                            href="/admin/configuracion"
                            className="block w-full text-center rounded-xl bg-white py-2 font-extrabold text-zinc-950"
                        >
                            Volver a Administración
                        </Link>
                    )}
                    <Link
                        href="/?vista=publica"
                        className="block w-full text-center rounded-xl border border-zinc-700 py-2 font-bold text-zinc-300 hover:bg-zinc-900"
                    >
                        Ir a la Portada
                    </Link>
                </div>
            </aside>

            {/* ÁREA DE TRABAJO DE LA SECCIÓN SELECCIONADA */}
            <div className="flex-1 flex flex-col">
                {seccionActual ? (
                    <>
                        <header className="bg-white border-b border-zinc-200 px-8 py-5">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div>
                                    <span className="text-[11px] font-bold uppercase text-zinc-500">
                                        {seccionActual.temporada?.nombre} • Vigencia:{" "}
                                        {new Date(
                                            seccionActual.temporada.fechaInicio
                                        ).toLocaleDateString("es-PE")}{" "}
                                        al{" "}
                                        {new Date(
                                            seccionActual.temporada.fechaFin
                                        ).toLocaleDateString("es-PE")}
                                    </span>
                                    <h2 className="text-xl font-extrabold text-zinc-950">
                                        {seccionActual.curso?.titulo} — {seccionActual.nombreSeccion}
                                    </h2>
                                </div>

                                <div className="flex items-center gap-3">
                                    {mensaje && (
                                        <div className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-950 px-3.5 py-2 text-xs font-bold text-white">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                            <span>{mensaje}</span>
                                        </div>
                                    )}

                                    <Link
                                        href={`/aula-virtual?seccion=${seccionActual.id}`}
                                        className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-2 text-xs font-extrabold hover:bg-zinc-100"
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                        <span>Ver como Aula Virtual</span>
                                    </Link>
                                </div>
                            </div>

                            {/* Sub-pestañas de la sección docente */}
                            <div className="mt-4 flex flex-wrap gap-2 border-t border-zinc-100 pt-3 text-xs font-bold">
                                <button
                                    onClick={() => setTabActiva("asistencia_meet")}
                                    className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 ${tabActiva === "asistencia_meet"
                                            ? "bg-zinc-950 text-white"
                                            : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                                        }`}
                                >
                                    <CalendarClock className="h-4 w-4" />
                                    <span>Clases Meet, Horas y Asistencia</span>
                                </button>

                                <button
                                    onClick={() => setTabActiva("notas")}
                                    className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 ${tabActiva === "notas"
                                            ? "bg-zinc-950 text-white"
                                            : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                                        }`}
                                >
                                    <Award className="h-4 w-4" />
                                    <span>Notas y Comentarios</span>
                                </button>

                                <button
                                    onClick={() => setTabActiva("whatsapp")}
                                    className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 ${tabActiva === "whatsapp"
                                            ? "bg-zinc-950 text-white"
                                            : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                                        }`}
                                >
                                    <MessageCircle className="h-4 w-4" />
                                    <span>Grupo WhatsApp y Horario</span>
                                </button>

                                {(seccionActual.permisoDocenteEditarCurso ||
                                    datos.docente.rol === "ADMINISTRADOR") && (
                                        <button
                                            onClick={() => setTabActiva("edicion")}
                                            className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 ${tabActiva === "edicion"
                                                    ? "bg-zinc-950 text-white"
                                                    : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                                                }`}
                                        >
                                            <Edit3 className="h-4 w-4" />
                                            <span>Editar Materiales y Exámenes</span>
                                        </button>
                                    )}
                            </div>
                        </header>

                        <main className="p-8 flex-1">
                            {tabActiva === "asistencia_meet" && (
                                <TabAsistenciaMeet
                                    seccion={seccionActual}
                                    onEjecutarAccion={ejecutarAccion}
                                />
                            )}

                            {tabActiva === "notas" && (
                                <TabNotasComentarios
                                    seccion={seccionActual}
                                    onEjecutarAccion={ejecutarAccion}
                                />
                            )}

                            {tabActiva === "whatsapp" && (
                                <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-4 max-w-2xl">
                                    <h3 className="text-base font-extrabold">
                                        Vincular Grupo de WhatsApp y Horario a esta Sección
                                    </h3>
                                    <div className="space-y-3 text-xs">
                                        <div>
                                            <label className="block font-bold mb-1">
                                                Enlace de Invitación al Grupo de WhatsApp
                                            </label>
                                            <input
                                                placeholder="https://chat.whatsapp.com/..."
                                                value={linkWhatsapp}
                                                onChange={(e) => setLinkWhatsapp(e.target.value)}
                                                className="w-full rounded-lg border border-zinc-300 px-3 py-2"
                                            />
                                        </div>
                                        <div>
                                            <label className="block font-bold mb-1">
                                                Horario Visible en el Aula Virtual
                                            </label>
                                            <input
                                                placeholder="Ej: Martes y Jueves 7:00 PM - 9:30 PM"
                                                value={horarioTexto}
                                                onChange={(e) => setHorarioTexto(e.target.value)}
                                                className="w-full rounded-lg border border-zinc-300 px-3 py-2"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        onClick={() =>
                                            ejecutarAccion(
                                                "GUARDAR_WHATSAPP_SECCION",
                                                {
                                                    seccionId: seccionActual.id,
                                                    enlaceGrupoWhatsapp: linkWhatsapp,
                                                    horarioSeccionTexto: horarioTexto,
                                                },
                                                "Grupo de WhatsApp y horario vinculados al Aula Virtual"
                                            )
                                        }
                                        className="inline-flex items-center gap-2 rounded-xl bg-zinc-950 px-5 py-2.5 text-xs font-extrabold text-white"
                                    >
                                        <Save className="h-4 w-4" />
                                        <span>Guardar Enlace de WhatsApp</span>
                                    </button>
                                </div>
                            )}

                            {tabActiva === "edicion" && (
                                <TabEdicionDocente
                                    seccion={seccionActual}
                                    onEjecutarAccion={ejecutarAccion}
                                />
                            )}
                        </main>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center p-8 text-center">
                        <div className="max-w-md space-y-2">
                            <BookOpen className="h-8 w-8 mx-auto text-zinc-400" />
                            <h2 className="text-base font-extrabold">
                                Sin secciones activas asignadas
                            </h2>
                            <p className="text-xs text-zinc-500">
                                Cuando el Administrador te asigne a una sección dentro de una
                                temporada vigente usando tu correo Gmail, aparecerá
                                automáticamente en la columna izquierda.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}