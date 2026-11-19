// src/app/aula-virtual/page.tsx
"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import VisorSeccionAula from "@/components/aula/VisorSeccionAula";
import ReproductorSimulador from "@/components/aula/ReproductorSimulador";
import {
    LayoutGrid,
    BookOpen,
    ClipboardCheck,
    Award,
    CreditCard,
    UserCircle,
    ExternalLink,
    Crown,
    QrCode,
    ArrowRight,
    Settings,
} from "lucide-react";

type SeccionMenuAula =
    | "mis_cursos"
    | "simuladores"
    | "certificados"
    | "membresia_pagos";

function AulaVirtualContenido() {
    const searchParams = useSearchParams();
    const seccionQueryId = searchParams.get("seccion");

    const [tabActiva, setTabActiva] = useState<SeccionMenuAula>("mis_cursos");
    const [cargando, setCargando] = useState(true);
    const [datos, setDatos] = useState<any>(null);
    const [seccionAbiertaId, setSeccionAbiertaId] = useState<string | null>(
        seccionQueryId
    );

    async function cargarAula() {
        setCargando(true);
        try {
            const url = seccionQueryId
                ? `/api/aula-virtual?seccion=${encodeURIComponent(seccionQueryId)}`
                : "/api/aula-virtual";
            const res = await fetch(url);
            if (res.ok) {
                const json = await res.json();
                setDatos(json);
                if (
                    seccionQueryId &&
                    json.seccionesActivas?.some((s: any) => s.id === seccionQueryId)
                ) {
                    setSeccionAbiertaId(seccionQueryId);
                }
            }
        } finally {
            setCargando(false);
        }
    }

    useEffect(() => {
        cargarAula();
    }, [seccionQueryId]);

    async function ejecutarAccionAula(accion: string, payload: any) {
        const res = await fetch("/api/aula-virtual", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ accion, datos: payload }),
        });
        const json = await res.json();
        if (res.ok && json.ok) {
            await cargarAula();
            return json.resultado || true;
        }
        alert(json.error || "No se pudo completar la acción");
        return null;
    }

    if (cargando && !datos) {
        return (
            <div className="min-h-screen bg-zinc-50 flex items-center justify-center text-xs font-bold text-zinc-600">
                Cargando tus cursos, membresías y simuladores activos...
            </div>
        );
    }

    if (!datos?.usuario) {
        return (
            <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
                <div className="max-w-md w-full rounded-2xl border border-zinc-200 bg-white p-8 text-center space-y-4 shadow-sm">
                    <h1 className="text-lg font-extrabold">
                        Inicia sesión para ingresar al Aula Virtual
                    </h1>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 rounded-xl bg-zinc-950 px-5 py-2.5 text-xs font-extrabold text-white"
                    >
                        Ir al Inicio e Iniciar Sesión con Google
                    </Link>
                </div>
            </div>
        );
    }

    const seccionAbierta = datos.seccionesActivas?.find(
        (s: any) => s.id === seccionAbiertaId
    );

    return (
        <div className="min-h-screen flex bg-zinc-50 text-zinc-950">
            {/* MENÚ LATERAL DEL AULA VIRTUAL (BLANCO Y NEGRO NEUTRO) */}
            <aside className="w-64 bg-zinc-950 text-white flex flex-col justify-between shrink-0 border-r border-zinc-800">
                <div>
                    <div className="p-5 border-b border-zinc-800 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                            Aula Virtual
                        </span>
                        <div className="text-sm font-extrabold truncate">
                            {datos.usuario.nombres
                                ? `${datos.usuario.nombres} ${datos.usuario.apellidos || ""}`
                                : datos.usuario.name}
                        </div>
                        <div className="text-[11px] text-zinc-400 truncate">
                            DNI: {datos.usuario.dni || "Sin DNI"} • {datos.usuario.rol}
                        </div>
                    </div>

                    <nav className="p-3 space-y-1 text-xs font-semibold">
                        {[
                            {
                                id: "mis_cursos",
                                label: `Mis Cursos y Secciones (${datos.seccionesActivas?.length || 0
                                    })`,
                                icon: BookOpen,
                            },
                            {
                                id: "simuladores",
                                label: `Mis Simuladores (${datos.simuladoresActivos?.length || 0
                                    })`,
                                icon: ClipboardCheck,
                            },
                            {
                                id: "certificados",
                                label: `Mis Certificados (${datos.certificadosAlumno?.length || 0
                                    })`,
                                icon: Award,
                            },
                            {
                                id: "membresia_pagos",
                                label: "Mi Membresía y Pagos",
                                icon: CreditCard,
                            },
                        ].map((item) => {
                            const Icon = item.icon;
                            const activo = tabActiva === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        setTabActiva(item.id as SeccionMenuAula);
                                        setSeccionAbiertaId(null);
                                    }}
                                    className={`w-full flex items-center gap-3 rounded-xl px-3.5 py-3 text-left transition ${activo
                                            ? "bg-white text-zinc-950 font-extrabold"
                                            : "text-zinc-300 hover:bg-zinc-900 hover:text-white"
                                        }`}
                                >
                                    <Icon className="h-4 w-4 shrink-0" />
                                    <span>{item.label}</span>
                                </button>
                            );
                        })}
                    </nav>
                </div>

                <div className="p-4 border-t border-zinc-800 space-y-2 text-xs">
                    {datos.usuario.rol === "ADMINISTRADOR" && (
                        <Link
                            href="/admin/configuracion"
                            className="flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 font-extrabold text-zinc-950"
                        >
                            <Settings className="h-4 w-4" />
                            <span>Volver a Configuración</span>
                        </Link>
                    )}
                    <Link
                        href="/?vista=publica"
                        className="flex items-center justify-center gap-2 rounded-xl border border-zinc-700 px-4 py-2 font-bold text-zinc-200 hover:bg-zinc-900"
                    >
                        <span>Explorar más cursos</span>
                    </Link>
                </div>
            </aside>

            {/* CONTENIDO PRINCIPAL */}
            <main className="flex-1 p-6 sm:p-8 space-y-6">
                {/* Resumen superior de Membresía(s) Activa(s) */}
                {datos.suscripcionesActivas?.length > 0 && !seccionAbierta && (
                    <div className="rounded-2xl bg-zinc-950 text-white p-5 flex flex-wrap items-center justify-between gap-4 shadow">
                        <div className="flex items-center gap-3">
                            <Crown className="h-6 w-6 text-amber-400 shrink-0" />
                            <div>
                                <span className="text-[10px] font-bold uppercase text-zinc-400">
                                    Plan de Suscripción Activo
                                </span>
                                <div className="text-sm font-extrabold">
                                    {datos.suscripcionesActivas
                                        .map((s: any) => s.planSuscripcion?.nombre)
                                        .join(" + ")}
                                </div>
                            </div>
                        </div>
                        <div className="text-xs text-zinc-300">
                            Vence:{" "}
                            <strong>
                                {datos.suscripcionesActivas[0].fechaVencimiento
                                    ? new Date(
                                        datos.suscripcionesActivas[0].fechaVencimiento
                                    ).toLocaleDateString("es-PE")
                                    : "Vigente"}
                            </strong>
                        </div>
                    </div>
                )}

                {/* VISTA 1: MIS CURSOS / SECCIONES ACTIVAS (O EL VISOR DE LA SECCIÓN ABIERTA) */}
                {tabActiva === "mis_cursos" && (
                    <>
                        {seccionAbierta ? (
                            <VisorSeccionAula
                                seccion={seccionAbierta}
                                leccionesCompletadasIds={datos.leccionesCompletadasIds || []}
                                onVolver={() => setSeccionAbiertaId(null)}
                                onToggleCompletada={async (secId, lecId, comp) => {
                                    await ejecutarAccionAula("MARCAR_SESION_COMPLETADA", {
                                        seccionId: secId,
                                        leccionId: lecId,
                                        completada: comp,
                                    });
                                }}
                                onEnviarCuestionario={async (evalId, secId, resp) =>
                                    ejecutarAccionAula("ENVIAR_CUESTIONARIO", {
                                        evaluacionId: evalId,
                                        seccionId: secId,
                                        respuestas: resp,
                                        esModoPractica: false,
                                    })
                                }
                                onPublicarForo={async (secId, msg) => {
                                    await ejecutarAccionAula("PUBLICAR_FORO", {
                                        seccionId: secId,
                                        mensaje: msg,
                                    });
                                }}
                            />
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <h1 className="text-xl font-extrabold">
                                        Mis Cursos y Secciones Activas
                                    </h1>
                                    <p className="text-xs text-zinc-500">
                                        Aquí aparecen únicamente las secciones habilitadas por tus
                                        pagos individuales, tu membresía vigente o invitaciones a tu
                                        correo Gmail.
                                    </p>
                                </div>

                                {datos.seccionesActivas?.length > 0 ? (
                                    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                                        {datos.seccionesActivas.map((sec: any) => (
                                            <div
                                                key={sec.id}
                                                className="rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-sm flex flex-col justify-between"
                                            >
                                                <div className="p-5 space-y-3">
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {sec.origenesAcceso?.map((origen: string) => (
                                                            <span
                                                                key={origen}
                                                                className="rounded bg-zinc-950 px-2 py-0.5 text-[10px] font-extrabold text-white"
                                                            >
                                                                {origen}
                                                            </span>
                                                        ))}
                                                        <span className="rounded bg-zinc-100 border border-zinc-200 px-2 py-0.5 text-[10px] font-bold text-zinc-700">
                                                            {sec.temporada?.nombre}
                                                        </span>
                                                    </div>

                                                    <h3 className="text-sm font-extrabold text-zinc-950 leading-snug">
                                                        {sec.curso?.titulo}
                                                    </h3>
                                                    <p className="text-xs font-semibold text-zinc-500">
                                                        {sec.nombreSeccion} •{" "}
                                                        {sec.progreso?.totalSesiones || 0} sesiones
                                                        habilitadas
                                                    </p>

                                                    {/* Mini barra de progreso */}
                                                    <div className="space-y-1 pt-2">
                                                        <div className="flex justify-between text-[11px] font-bold">
                                                            <span>Progreso</span>
                                                            <span>{sec.progreso?.porcentaje || 0}%</span>
                                                        </div>
                                                        <div className="h-2 rounded-full bg-zinc-100 overflow-hidden">
                                                            <div
                                                                className="h-full bg-zinc-950 transition-all"
                                                                style={{
                                                                    width: `${sec.progreso?.porcentaje || 0}%`,
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="border-t border-zinc-100 p-4 bg-zinc-50">
                                                    <button
                                                        onClick={() => setSeccionAbiertaId(sec.id)}
                                                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-950 py-2.5 text-xs font-extrabold text-white hover:bg-zinc-800"
                                                    >
                                                        <span>Ingresar a la Sección</span>
                                                        <ArrowRight className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-10 text-center space-y-3">
                                        <h3 className="text-sm font-extrabold">
                                            No tienes cursos ni secciones activas por el momento
                                        </h3>
                                        <p className="text-xs text-zinc-500 max-w-md mx-auto">
                                            Cuando adquieras un curso, actives una membresía o recibas
                                            una invitación a tu correo Gmail, tus secciones aparecerán
                                            aquí automáticamente.
                                        </p>
                                        <Link
                                            href="/?vista=publica"
                                            className="inline-flex items-center gap-2 rounded-xl bg-zinc-950 px-5 py-2.5 text-xs font-extrabold text-white"
                                        >
                                            Ver Cursos y Membresías Disponibles
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}

                {/* VISTA 2: MIS SIMULADORES ACTIVOS */}
                {tabActiva === "simuladores" && (
                    <ReproductorSimulador
                        simuladoresActivos={datos.simuladoresActivos || []}
                        intentosEvaluacion={datos.intentosEvaluacion || []}
                        onEnviarSimulador={async (evalId, resp, esPractica) =>
                            ejecutarAccionAula("ENVIAR_CUESTIONARIO", {
                                evaluacionId: evalId,
                                respuestas: resp,
                                esModoPractica: esPractica,
                            })
                        }
                    />
                )}

                {/* VISTA 3: MIS CERTIFICADOS QR */}
                {tabActiva === "certificados" && (
                    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
                        <h2 className="text-base font-extrabold">
                            Mis Certificados y Credenciales QR ({datos.certificadosAlumno?.length || 0})
                        </h2>
                        {datos.certificadosAlumno?.length > 0 ? (
                            <div className="divide-y divide-zinc-200 text-xs">
                                {datos.certificadosAlumno.map((c: any) => (
                                    <div
                                        key={c.id}
                                        className="py-3.5 flex flex-wrap items-center justify-between gap-4"
                                    >
                                        <div>
                                            <span className="font-mono font-bold text-zinc-500">
                                                [{c.codigoUnico}]
                                            </span>{" "}
                                            <strong className="text-sm">
                                                {c.nombreProgramaImpreso}
                                            </strong>
                                            <div className="text-[11px] text-zinc-500 mt-0.5">
                                                {c.temporadaNombreImpreso} • {c.horasAcademicas} horas
                                            </div>
                                        </div>
                                        <Link
                                            href={`/verificar/${encodeURIComponent(c.codigoUnico)}`}
                                            target="_blank"
                                            className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-950 px-4 py-2 text-xs font-extrabold text-white"
                                        >
                                            <QrCode className="h-4 w-4" />
                                            <span>Ver / Imprimir Credencial</span>
                                            <ExternalLink className="h-3.5 w-3.5" />
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-zinc-500">
                                Aún no tienes certificados emitidos asociados a tu cuenta o DNI.
                            </p>
                        )}
                    </div>
                )}

                {/* VISTA 4: MI MEMBRESÍA Y PAGOS */}
                {tabActiva === "membresia_pagos" && (
                    <div className="space-y-6">
                        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-3">
                            <h2 className="text-base font-extrabold">
                                Estado de tus Membresías Activas
                            </h2>
                            {datos.suscripcionesActivas?.length > 0 ? (
                                datos.suscripcionesActivas.map((s: any) => (
                                    <div
                                        key={s.id}
                                        className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 flex items-center justify-between text-xs"
                                    >
                                        <div>
                                            <div className="font-extrabold text-sm">
                                                {s.planSuscripcion?.nombre}
                                            </div>
                                            <div className="text-zinc-500">
                                                Estado: <strong>{s.estado}</strong>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div>
                                                Vencimiento:{" "}
                                                <strong>
                                                    {s.fechaVencimiento
                                                        ? new Date(s.fechaVencimiento).toLocaleDateString(
                                                            "es-PE"
                                                        )
                                                        : "Sin límite"}
                                                </strong>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-zinc-500">
                                    No cuentas con una membresía activa actualmente.
                                </p>
                            )}
                        </div>

                        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-3">
                            <h3 className="text-sm font-extrabold">
                                Historial de Pedidos y Pagos
                            </h3>
                            {datos.pedidosAlumno?.length > 0 ? (
                                <div className="divide-y divide-zinc-200 text-xs">
                                    {datos.pedidosAlumno.map((p: any) => (
                                        <div
                                            key={p.id}
                                            className="py-3 flex items-center justify-between"
                                        >
                                            <div>
                                                <span className="font-mono font-bold">
                                                    Pedido #{p.numeroPedido}
                                                </span>{" "}
                                                —{" "}
                                                {p.items?.map((i: any) => i.descripcionItem).join(", ")}
                                            </div>
                                            <div className="font-extrabold">
                                                S/ {Number(p.total).toFixed(2)} • [{p.estado}]
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-zinc-500">
                                    No registras pedidos realizados aún.
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default function AulaVirtualPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-zinc-50 flex items-center justify-center text-xs font-bold">
                    Cargando Aula Virtual...
                </div>
            }
        >
            <AulaVirtualContenido />
        </Suspense>
    );
}