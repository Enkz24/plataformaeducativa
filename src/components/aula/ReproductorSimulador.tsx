// src/components/aula/ReproductorSimulador.tsx
"use client";

import React, { useEffect, useState } from "react";
import { ClipboardCheck, Clock, BookOpenCheck, CheckCircle2 } from "lucide-react";

interface ReproductorSimuladorProps {
    simuladoresActivos: any[];
    intentosEvaluacion: any[];
    onEnviarSimulador: (
        evaluacionId: string,
        respuestas: Record<string, string>,
        esModoPractica: boolean
    ) => Promise<any>;
}

export default function ReproductorSimulador({
    simuladoresActivos,
    intentosEvaluacion,
    onEnviarSimulador,
}: ReproductorSimuladorProps) {
    const [simuladorActivo, setSimuladorActivo] = useState<any | null>(null);
    const [modoPractica, setModoPractica] = useState<boolean>(true);
    const [segundosRestantes, setSegundosRestantes] = useState<number>(3600);
    const [respuestas, setRespuestas] = useState<Record<string, string>>({});
    const [resultado, setResultado] = useState<any | null>(null);

    useEffect(() => {
        if (!simuladorActivo || modoPractica || resultado) return;
        const timer = setInterval(() => {
            setSegundosRestantes((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, [simuladorActivo, modoPractica, resultado]);

    const evaluacionActual = simuladorActivo?.evaluacionesSimulacro?.[0];
    const preguntasMostrar = evaluacionActual?.preguntas?.slice(
        0,
        simuladorActivo?.cantidadPreguntasHabilitadas || 100
    );

    if (simuladorActivo && evaluacionActual) {
        const mins = Math.floor(segundosRestantes / 60);
        const segs = segundosRestantes % 60;

        return (
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 pb-4">
                    <div>
                        <span className="rounded bg-zinc-950 px-2.5 py-0.5 text-[10px] font-extrabold text-white">
                            {modoPractica ? "MODO PRÁCTICA" : "SIMULACRO CRONOMETRADO"}
                        </span>
                        <h3 className="text-lg font-extrabold mt-1">
                            {simuladorActivo.nombre}
                        </h3>
                    </div>

                    <div className="flex items-center gap-4">
                        {!modoPractica && !resultado && (
                            <div className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-100 px-3.5 py-2 text-xs font-mono font-extrabold">
                                <Clock className="h-4 w-4" />
                                <span>
                                    {String(mins).padStart(2, "0")}:
                                    {String(segs).padStart(2, "0")}
                                </span>
                            </div>
                        )}
                        <button
                            onClick={() => {
                                setSimuladorActivo(null);
                                setResultado(null);
                                setRespuestas({});
                            }}
                            className="text-xs font-bold underline"
                        >
                            Salir del Simulador
                        </button>
                    </div>
                </div>

                {!resultado ? (
                    <div className="space-y-4">
                        {preguntasMostrar?.length > 0 ? (
                            preguntasMostrar.map((p: any, idx: number) => (
                                <div
                                    key={p.id}
                                    className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 space-y-2"
                                >
                                    <div className="flex justify-between text-[11px] text-zinc-500 font-bold">
                                        <span>
                                            Pregunta {idx + 1} de {preguntasMostrar.length}
                                        </span>
                                        <span>{p.categoriaTematica || "General"}</span>
                                    </div>
                                    <p className="text-xs font-extrabold text-zinc-950">
                                        {p.enunciado}
                                    </p>
                                    <div className="space-y-1.5 pt-1">
                                        {p.opciones?.map((op: any) => (
                                            <label
                                                key={op.id}
                                                className={`flex items-center gap-2 rounded-lg border p-2.5 text-xs cursor-pointer ${respuestas[p.id] === op.id
                                                        ? "border-zinc-950 bg-white font-bold"
                                                        : "border-zinc-200 bg-white"
                                                    }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name={`sim-${p.id}`}
                                                    checked={respuestas[p.id] === op.id}
                                                    onChange={() =>
                                                        setRespuestas({ ...respuestas, [p.id]: op.id })
                                                    }
                                                />
                                                <span>
                                                    <strong>{op.letraOpcion}.</strong> {op.textoOpcion}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-xs text-zinc-500">
                                Este simulador aún no tiene preguntas cargadas en su banco.
                            </p>
                        )}

                        {preguntasMostrar?.length > 0 && (
                            <button
                                onClick={async () => {
                                    const res = await onEnviarSimulador(
                                        evaluacionActual.id,
                                        respuestas,
                                        modoPractica
                                    );
                                    if (res) setResultado(res);
                                }}
                                className="rounded-xl bg-zinc-950 px-6 py-3 text-xs font-extrabold text-white"
                            >
                                Finalizar y Calificar Simulador
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-5">
                        <div className="rounded-2xl bg-zinc-950 text-white p-6 space-y-1">
                            <div className="text-2xl font-extrabold">
                                Puntaje: {resultado.notaObtenida} / 20 (
                                {resultado.porcentajeAciertos}% de aciertos)
                            </div>
                            <p className="text-xs text-zinc-300">
                                Respondiste correctamente {resultado.correctas} de{" "}
                                {resultado.totalPreguntas} preguntas.
                            </p>
                        </div>

                        {resultado.temasReforzar?.length > 0 && (
                            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 space-y-2">
                                <h4 className="text-xs font-extrabold uppercase">
                                    Temas que debes reforzar según tus errores:
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {resultado.temasReforzar.map((t: any, i: number) => (
                                        <span
                                            key={i}
                                            className="rounded-lg border border-red-200 bg-white px-3 py-1 text-xs font-bold text-red-700"
                                        >
                                            {t.tema} ({t.errores} errores)
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            {resultado.detalleCorreccion?.map((d: any, i: number) => (
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
                                        <strong>Correcta:</strong> {d.opcionCorrectaTexto}
                                    </div>
                                    {d.referenciaNormativa && (
                                        <div className="text-[11px] text-zinc-600">
                                            <strong>Norma:</strong> {d.referenciaNormativa}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
                <h3 className="text-base font-extrabold flex items-center gap-2">
                    <ClipboardCheck className="h-5 w-5" />
                    <span>Mis Simuladores Habilitados ({simuladoresActivos.length})</span>
                </h3>

                {simuladoresActivos.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2">
                        {simuladoresActivos.map((sim) => (
                            <div
                                key={sim.id}
                                className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 flex flex-col justify-between space-y-4"
                            >
                                <div>
                                    <span className="rounded bg-zinc-950 px-2.5 py-0.5 text-[10px] font-extrabold text-white">
                                        NIVEL {sim.nivel}
                                    </span>
                                    <h4 className="text-sm font-extrabold mt-2">{sim.nombre}</h4>
                                    <p className="text-xs text-zinc-600 mt-1">
                                        {sim.cantidadPreguntasHabilitadas} preguntas habilitadas •{" "}
                                        {sim.evaluacionesSimulacro?.[0]?.preguntas?.length || 0}{" "}
                                        disponibles en banco
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => {
                                            setModoPractica(true);
                                            setSimuladorActivo(sim);
                                            setResultado(null);
                                            setRespuestas({});
                                        }}
                                        className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-950 bg-white px-3.5 py-2 text-xs font-extrabold hover:bg-zinc-100"
                                    >
                                        <BookOpenCheck className="h-4 w-4" />
                                        <span>Modo Práctica</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            setModoPractica(false);
                                            setSegundosRestantes(
                                                (sim.evaluacionesSimulacro?.[0]?.duracionMinutos || 60) *
                                                60
                                            );
                                            setSimuladorActivo(sim);
                                            setResultado(null);
                                            setRespuestas({});
                                        }}
                                        className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-950 px-3.5 py-2 text-xs font-extrabold text-white hover:bg-zinc-800"
                                    >
                                        <Clock className="h-4 w-4" />
                                        <span>Simulacro por Tiempo</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-xs text-zinc-500">
                        Aún no tienes simuladores activos. Puedes adquirir uno aparte o
                        activar una membresía que lo incluya.
                    </p>
                )}
            </div>

            {/* Historial de Intentos */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-3">
                <h4 className="text-sm font-extrabold">
                    Historial de Intentos y Evolución
                </h4>
                {intentosEvaluacion.length > 0 ? (
                    <div className="divide-y divide-zinc-200 text-xs">
                        {intentosEvaluacion.map((it) => (
                            <div
                                key={it.id}
                                className="py-2.5 flex flex-wrap items-center justify-between gap-2"
                            >
                                <div>
                                    <span className="font-bold">
                                        {it.evaluacion?.titulo || "Evaluación"}
                                    </span>{" "}
                                    <span className="text-zinc-500">
                                        (Intento #{it.numeroIntento} •{" "}
                                        {new Date(it.fechaInicio).toLocaleDateString("es-PE")})
                                    </span>
                                </div>
                                <span className="font-extrabold">
                                    Nota: {Number(it.puntajeObtenido).toFixed(2)} (
                                    {Number(it.porcentajeAciertos).toFixed(0)}%)
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-xs text-zinc-500">
                        Todavía no has rendido evaluaciones ni simulacros.
                    </p>
                )}
            </div>
        </div>
    );
}