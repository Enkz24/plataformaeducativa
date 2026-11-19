// src/components/aula/VisorSeccionAula.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    CheckCircle2,
    Circle,
    PlayCircle,
    FileText,
    ExternalLink,
    HelpCircle,
    Award,
    MessageSquare,
    MessageCircle,
    Video,
    Send,
} from "lucide-react";

interface VisorSeccionAulaProps {
    seccion: any;
    leccionesCompletadasIds: string[];
    onVolver: () => void;
    onToggleCompletada: (
        seccionId: string,
        leccionId: string,
        completada: boolean
    ) => Promise<void>;
    onEnviarCuestionario: (
        evaluacionId: string,
        seccionId: string,
        respuestas: Record<string, string>
    ) => Promise<any>;
    onPublicarForo: (seccionId: string, mensaje: string) => Promise<void>;
}

export default function VisorSeccionAula({
    seccion,
    leccionesCompletadasIds,
    onVolver,
    onToggleCompletada,
    onEnviarCuestionario,
    onPublicarForo,
}: VisorSeccionAulaProps) {
    const [subVista, setSubVista] = useState<
        "clases" | "calificaciones" | "foro"
    >("clases");
    const [evaluacionAbierta, setEvaluacionAbierta] = useState<any | null>(null);
    const [respuestasQuiz, setRespuestasQuiz] = useState<Record<string, string>>(
        {}
    );
    const [resultadoQuiz, setResultadoQuiz] = useState<any | null>(null);
    const [nuevoMensajeForo, setNuevoMensajeForo] = useState("");

    // Agrupamos las sesiones habilitadas de esta sección según numeroClaseAgrupada (Clase 1, Clase 2...)
    const gruposPorClase: Record<number, any[]> = {};
    for (const item of seccion.sesionesHabilitadas || []) {
        const numClase = item.numeroClaseAgrupada || 1;
        if (!gruposPorClase[numClase]) gruposPorClase[numClase] = [];
        gruposPorClase[numClase].push(item);
    }
    const clasesOrdenadas = Object.keys(gruposPorClase)
        .map(Number)
        .sort((a, b) => a - b);

    const etapa = seccion.progreso?.etapaActual || 0;
    const porcentaje = seccion.progreso?.porcentaje || 0;

    return (
        <div className="space-y-6">
            {/* Cabecera de la Sección */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-1.5">
                        <button
                            onClick={onVolver}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-950"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            <span>Volver a Mis Secciones Activas</span>
                        </button>

                        <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded bg-zinc-950 px-2.5 py-0.5 text-[10px] font-extrabold text-white">
                                {seccion.temporada?.nombre}
                            </span>
                            {seccion.origenesAcceso?.map((orig: string) => (
                                <span
                                    key={orig}
                                    className="rounded border border-zinc-300 bg-zinc-100 px-2.5 py-0.5 text-[10px] font-bold text-zinc-800"
                                >
                                    Acceso: {orig}
                                </span>
                            ))}
                        </div>

                        <h2 className="text-xl font-extrabold text-zinc-950">
                            {seccion.curso?.titulo} — {seccion.nombreSeccion}
                        </h2>
                        <p className="text-xs text-zinc-600">
                            {seccion.llevaDocente
                                ? `Docente: ${seccion.docente?.name ||
                                seccion.correoDocenteAsignado ||
                                "Especialista asignado"
                                }`
                                : "Modalidad Autoaprendizaje (Videos grabados y materiales)"}{" "}
                            • {seccion.horarioSeccionTexto || "Disponible 24/7"}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {seccion.enlaceGrupoWhatsapp && (
                            <a
                                href={seccion.enlaceGrupoWhatsapp}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-2 text-xs font-extrabold hover:bg-zinc-100"
                            >
                                <MessageCircle className="h-4 w-4 text-emerald-600" />
                                <span>Grupo WhatsApp del Curso</span>
                            </a>
                        )}
                    </div>
                </div>

                {/* LÍNEA DE PROGRESO 1 - 2 - 3 - 4 - 5 + ACCESO A CREDENCIAL QR */}
                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <span className="font-extrabold">
                            Tu Progreso en esta Sección: {porcentaje}% (
                            {seccion.progreso?.completadasEnSeccion || 0} de{" "}
                            {seccion.progreso?.totalSesiones || 0} sesiones completadas)
                        </span>
                        {seccion.progreso?.habilitadoCertificado && (
                            <Link
                                href={
                                    seccion.certificadoEmitido
                                        ? `/verificar/${encodeURIComponent(
                                            seccion.certificadoEmitido.codigoUnico
                                        )}`
                                        : "#certificado-listo"
                                }
                                className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-950 px-3.5 py-1.5 text-xs font-extrabold text-white"
                            >
                                <Award className="h-4 w-4 text-amber-400" />
                                <span>
                                    {seccion.certificadoEmitido
                                        ? "Imprimir mi Credencial QR"
                                        : "Sección Completada (Credencial Habilitada)"}
                                </span>
                            </Link>
                        )}
                    </div>

                    <div className="grid grid-cols-5 gap-2">
                        {[1, 2, 3, 4, 5].map((paso) => {
                            const completado = etapa >= paso;
                            return (
                                <div key={paso} className="space-y-1 text-center">
                                    <div
                                        className={`h-2.5 rounded-full transition-all ${completado ? "bg-zinc-950" : "bg-zinc-200"
                                            }`}
                                    />
                                    <div
                                        className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-extrabold ${completado
                                                ? "bg-zinc-950 text-white"
                                                : "bg-white border border-zinc-300 text-zinc-400"
                                            }`}
                                    >
                                        {paso}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Sub-navegación interna de la Sección */}
                <div className="flex flex-wrap gap-2 border-t border-zinc-100 pt-3 text-xs font-bold">
                    <button
                        onClick={() => setSubVista("clases")}
                        className={`rounded-lg px-4 py-2 ${subVista === "clases"
                                ? "bg-zinc-950 text-white"
                                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                            }`}
                    >
                        Clases, Materiales y Cuestionarios
                    </button>
                    <button
                        onClick={() => setSubVista("calificaciones")}
                        className={`rounded-lg px-4 py-2 ${subVista === "calificaciones"
                                ? "bg-zinc-950 text-white"
                                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                            }`}
                    >
                        Notas y Comentarios ({seccion.notasAlumno?.length || 0})
                    </button>
                    {seccion.foroHabilitado && (
                        <button
                            onClick={() => setSubVista("foro")}
                            className={`rounded-lg px-4 py-2 ${subVista === "foro"
                                    ? "bg-zinc-950 text-white"
                                    : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                                }`}
                        >
                            Foro de la Sección ({seccion.mensajesForo?.length || 0})
                        </button>
                    )}
                </div>
            </div>

            {/* =================================================================== */}
            {/* MODAL / PANEL DE CUESTIONARIO AUTOCALIFICABLE EN VIVO               */}
            {/* =================================================================== */}
            {evaluacionAbierta && (
                <div className="rounded-2xl border-2 border-zinc-950 bg-white p-6 shadow-lg space-y-5">
                    <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
                        <div>
                            <span className="text-[10px] font-extrabold uppercase text-zinc-500">
                                Evaluación Autocalificable
                            </span>
                            <h3 className="text-base font-extrabold">
                                {evaluacionAbierta.titulo}
                            </h3>
                        </div>
                        <button
                            onClick={() => {
                                setEvaluacionAbierta(null);
                                setResultadoQuiz(null);
                                setRespuestasQuiz({});
                            }}
                            className="text-xs font-bold underline"
                        >
                            Cerrar evaluación
                        </button>
                    </div>

                    {!resultadoQuiz ? (
                        <div className="space-y-5">
                            {evaluacionAbierta.preguntas?.map((p: any, idx: number) => (
                                <div
                                    key={p.id}
                                    className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 space-y-2.5"
                                >
                                    <p className="text-xs font-extrabold text-zinc-950">
                                        {idx + 1}. {p.enunciado}
                                    </p>
                                    <div className="space-y-1.5">
                                        {p.opciones?.map((op: any) => (
                                            <label
                                                key={op.id}
                                                className={`flex items-center gap-2.5 rounded-lg border p-2.5 text-xs cursor-pointer transition ${respuestasQuiz[p.id] === op.id
                                                        ? "border-zinc-950 bg-white font-bold"
                                                        : "border-zinc-200 bg-white hover:border-zinc-400"
                                                    }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name={`preg-${p.id}`}
                                                    checked={respuestasQuiz[p.id] === op.id}
                                                    onChange={() =>
                                                        setRespuestasQuiz({
                                                            ...respuestasQuiz,
                                                            [p.id]: op.id,
                                                        })
                                                    }
                                                />
                                                <span>
                                                    <strong>{op.letraOpcion}.</strong> {op.textoOpcion}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            <button
                                onClick={async () => {
                                    const res = await onEnviarCuestionario(
                                        evaluacionAbierta.id,
                                        seccion.id,
                                        respuestasQuiz
                                    );
                                    if (res) setResultadoQuiz(res);
                                }}
                                className="rounded-xl bg-zinc-950 px-6 py-3 text-xs font-extrabold text-white hover:bg-zinc-800"
                            >
                                Finalizar y Ver mi Nota Automática
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="rounded-xl bg-zinc-950 text-white p-5 flex flex-wrap items-center justify-between gap-4">
                                <div>
                                    <span className="text-[11px] uppercase text-zinc-400 font-bold">
                                        Resultado Automático
                                    </span>
                                    <div className="text-2xl font-extrabold">
                                        Nota: {resultadoQuiz.notaObtenida} / 20 (
                                        {resultadoQuiz.porcentajeAciertos}%)
                                    </div>
                                    <p className="text-xs text-zinc-300">
                                        Aciertos: {resultadoQuiz.correctas} de{" "}
                                        {resultadoQuiz.totalPreguntas} preguntas • Estado:{" "}
                                        <strong>
                                            {resultadoQuiz.aprobado ? "APROBADO" : "DESAPROBADO"}
                                        </strong>
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                {resultadoQuiz.detalleCorreccion?.map((d: any, i: number) => (
                                    <div
                                        key={i}
                                        className={`rounded-xl border p-3 text-xs ${d.acerto
                                                ? "border-emerald-200 bg-emerald-50/50"
                                                : "border-red-200 bg-red-50/50"
                                            }`}
                                    >
                                        <div className="font-bold">
                                            {i + 1}. {d.enunciado}
                                        </div>
                                        <div className="mt-1 text-[11px]">
                                            <strong>Respuesta correcta:</strong>{" "}
                                            {d.opcionCorrectaTexto}
                                        </div>
                                        {d.explicacionSolucion && (
                                            <div className="mt-1 text-[11px] text-zinc-700">
                                                <strong>Sustento:</strong> {d.explicacionSolucion}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* =================================================================== */}
            {/* SUB-VISTA 1: CLASES AGRUPADAS, VIDEOS, MATERIALES DRIVE Y EXÁMENES  */}
            {/* =================================================================== */}
            {subVista === "clases" && (
                <div className="space-y-5">
                    {/* Enlaces de clases en vivo Meet si existen */}
                    {seccion.clasesVivoMeet?.length > 0 && (
                        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm space-y-3">
                            <h3 className="text-sm font-extrabold flex items-center gap-2">
                                <Video className="h-4 w-4" />
                                <span>Sesiones en Vivo Programadas (Google Meet)</span>
                            </h3>
                            <div className="grid gap-3 sm:grid-cols-2">
                                {seccion.clasesVivoMeet.map((cm: any) => (
                                    <div
                                        key={cm.id}
                                        className="rounded-xl border border-zinc-200 bg-zinc-50 p-3.5 flex items-center justify-between text-xs"
                                    >
                                        <div>
                                            <div className="font-extrabold">{cm.tituloClase}</div>
                                            <div className="text-zinc-500">
                                                {new Date(cm.fechaHoraInicio).toLocaleString("es-PE")}
                                            </div>
                                        </div>
                                        {cm.enlaceGoogleMeet && (
                                            <a
                                                href={cm.enlaceGoogleMeet}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="rounded-lg bg-zinc-950 px-3 py-1.5 text-[11px] font-extrabold text-white"
                                            >
                                                Entrar a Meet
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Clases agrupadas según configuración de esta Sección */}
                    {clasesOrdenadas.map((numClase) => (
                        <div
                            key={numClase}
                            className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-4"
                        >
                            <h3 className="text-sm font-extrabold uppercase tracking-wide border-b border-zinc-100 pb-2">
                                Clase {numClase} — Materiales y Sesiones Asignadas
                            </h3>

                            <div className="space-y-3">
                                {gruposPorClase[numClase].map((item: any) => {
                                    const lec = item.leccion;
                                    const completada = leccionesCompletadasIds.includes(
                                        item.leccionId
                                    );
                                    // Respeta el material/video sobrescrito específicamente para esta sección
                                    const enlacePrincipal =
                                        item.materialDriveUrlOverride ||
                                        item.videoUrlOverrideSeccion ||
                                        lec?.videoUrl;
                                    const evaluacionSesion = lec?.evaluaciones?.[0];

                                    return (
                                        <div
                                            key={item.id}
                                            className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 space-y-3"
                                        >
                                            <div className="flex flex-wrap items-center justify-between gap-3">
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() =>
                                                            onToggleCompletada(
                                                                seccion.id,
                                                                item.leccionId,
                                                                !completada
                                                            )
                                                        }
                                                        title="Marcar sesión como completada"
                                                        className="shrink-0"
                                                    >
                                                        {completada ? (
                                                            <CheckCircle2 className="h-5 w-5 text-zinc-950" />
                                                        ) : (
                                                            <Circle className="h-5 w-5 text-zinc-400 hover:text-zinc-900" />
                                                        )}
                                                    </button>
                                                    <div>
                                                        <div className="text-xs font-extrabold text-zinc-950">
                                                            {item.tituloPersonalizadoSeccion || lec?.titulo}
                                                        </div>
                                                        <div className="text-[11px] text-zinc-500">
                                                            {lec?.modulo?.titulo} •{" "}
                                                            {completada ? "Completada" : "Pendiente"}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-2">
                                                    {enlacePrincipal && (
                                                        <a
                                                            href={enlacePrincipal}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-950 px-3 py-1.5 text-[11px] font-extrabold text-white hover:bg-zinc-800"
                                                        >
                                                            <PlayCircle className="h-3.5 w-3.5" />
                                                            <span>Abrir Video / Material</span>
                                                            <ExternalLink className="h-3 w-3" />
                                                        </a>
                                                    )}

                                                    {item.requiereExamenEnSesion &&
                                                        evaluacionSesion &&
                                                        evaluacionSesion.preguntas?.length > 0 && (
                                                            <button
                                                                onClick={() => {
                                                                    setEvaluacionAbierta(evaluacionSesion);
                                                                    setResultadoQuiz(null);
                                                                    setRespuestasQuiz({});
                                                                }}
                                                                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-950 bg-white px-3 py-1.5 text-[11px] font-extrabold text-zinc-950 hover:bg-zinc-100"
                                                            >
                                                                <HelpCircle className="h-3.5 w-3.5" />
                                                                <span>
                                                                    Rendir Cuestionario (
                                                                    {evaluacionSesion.preguntas.length} preg.)
                                                                </span>
                                                            </button>
                                                        )}
                                                </div>
                                            </div>

                                            {/* Recursos adjuntos de la sesión (PPT, PDF, Drive) */}
                                            {lec?.recursosAdjuntos?.length > 0 && (
                                                <div className="pl-8 flex flex-wrap gap-2">
                                                    {lec.recursosAdjuntos.map((rec: any) => (
                                                        <a
                                                            key={rec.id}
                                                            href={rec.archivoUrl}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 py-1 text-[11px] font-bold hover:bg-zinc-100"
                                                        >
                                                            <FileText className="h-3.5 w-3.5" />
                                                            <span>
                                                                [{rec.tipoArchivo}] {rec.titulo}
                                                            </span>
                                                        </a>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* =================================================================== */}
            {/* SUB-VISTA 2: CALIFICACIONES Y RETROALIMENTACIÓN DEL DOCENTE         */}
            {/* =================================================================== */}
            {subVista === "calificaciones" && (
                <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
                    <h3 className="text-sm font-extrabold">
                        Tus Notas y Comentarios del Docente en esta Sección
                    </h3>
                    {seccion.notasAlumno?.length > 0 ? (
                        <div className="divide-y divide-zinc-200 text-xs">
                            {seccion.notasAlumno.map((n: any) => (
                                <div
                                    key={n.id}
                                    className="py-3 flex flex-wrap items-center justify-between gap-4"
                                >
                                    <div>
                                        <div className="font-extrabold">{n.conceptoEvaluado}</div>
                                        {n.comentarioDocente && (
                                            <p className="text-zinc-600 mt-0.5">
                                                Comentario: {n.comentarioDocente}
                                            </p>
                                        )}
                                    </div>
                                    <span className="rounded-xl bg-zinc-950 px-3.5 py-1.5 text-sm font-extrabold text-white">
                                        {Number(n.nota).toFixed(2)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-zinc-500">
                            Aún no se registran calificaciones del docente en esta sección.
                        </p>
                    )}
                </div>
            )}

            {/* =================================================================== */}
            {/* SUB-VISTA 3: FORO DE LA SECCIÓN                                     */}
            {/* =================================================================== */}
            {subVista === "foro" && (
                <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
                    <h3 className="text-sm font-extrabold flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        <span>Foro de Consultas de la Sección</span>
                    </h3>

                    <div className="flex gap-2">
                        <input
                            value={nuevoMensajeForo}
                            onChange={(e) => setNuevoMensajeForo(e.target.value)}
                            placeholder="Escribe tu duda o comentario para el docente y compañeros..."
                            className="flex-1 rounded-xl border border-zinc-300 px-3.5 py-2 text-xs"
                        />
                        <button
                            onClick={async () => {
                                if (!nuevoMensajeForo.trim()) return;
                                await onPublicarForo(seccion.id, nuevoMensajeForo);
                                setNuevoMensajeForo("");
                            }}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-950 px-4 py-2 text-xs font-extrabold text-white"
                        >
                            <Send className="h-3.5 w-3.5" />
                            <span>Publicar</span>
                        </button>
                    </div>

                    <div className="space-y-3 pt-2">
                        {seccion.mensajesForo?.length > 0 ? (
                            seccion.mensajesForo.map((m: any) => (
                                <div
                                    key={m.id}
                                    className="rounded-xl border border-zinc-200 bg-zinc-50 p-3.5 text-xs space-y-1"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-extrabold">
                                            {m.autor?.name || m.autor?.nombres || "Participante"}{" "}
                                            <span className="font-normal text-zinc-500">
                                                ({m.autor?.rol})
                                            </span>
                                        </span>
                                        <span className="text-[10px] text-zinc-400">
                                            {new Date(m.createdAt).toLocaleString("es-PE")}
                                        </span>
                                    </div>
                                    <p className="text-zinc-700">{m.mensaje}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-xs text-zinc-500">
                                Aún no hay mensajes en el foro. Sé el primero en participar.
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}