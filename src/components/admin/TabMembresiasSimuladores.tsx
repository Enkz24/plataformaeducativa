// src/components/admin/TabMembresiasSimuladores.tsx
"use client";

import React, { useState } from "react";
import DropzoneArchivo from "@/components/admin/DropzoneArchivo";
import {
    Download,
    Upload,
    Edit3,
    Trash2,
    Plus,
    Crown,
    ClipboardCheck,
} from "lucide-react";

interface TabMembresiasSimuladoresProps {
    subTabActiva: string;
    membresias: any[];
    simuladores: any[];
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
    a.download = "plantilla_estandar_simulador.csv";
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

export default function TabMembresiasSimuladores({
    subTabActiva,
    membresias,
    simuladores,
    cursos,
    onEjecutarAccion,
}: TabMembresiasSimuladoresProps) {
    const [formMembresia, setFormMembresia] = useState({
        codigo: "normal-1mes",
        nombre: "Membresía Normal (1 Mes)",
        etiquetaDuracionTexto: "1 mes (30 días)",
        imagenPortada: "/membresias/normal.jpg",
        descripcion: "Acceso por 1 mes a los cursos y simuladores vinculados.",
        precio: 89,
        duracionDias: 30,
    });

    const [formSimulador, setFormSimulador] = useState({
        id: "",
        codigo: "simulador-oece-1",
        nombre: "Simulador 1 - Certificación OECE Ley N° 32069",
        nivel: "PREMIUM",
        imagenPortada: "/simuladores/sim1.jpg",
        descripcion:
            "Simulador con banco de preguntas oficial, cronómetro, modo práctica y retroalimentación.",
        permiteVentaIndividual: true,
        precio: 60,
        precioOferta: "",
        visibleEnInicio: true,
        duracionDiasVigencia: 30,
        intentosMaximosSimulacro: 10,
        cantidadPreguntasHabilitadas: 100,
        habilitarDemoEnInicio: true,
        cantidadPreguntasDemo: 5,
        vincularASuscripciones: true,
        membresiasIds: [] as string[],
        permitirVincularACursos: true,
        cursosIds: [] as string[],
    });

    const [simuladorDestinoExcelId, setSimuladorDestinoExcelId] = useState("");

    function toggleIdEnArray(lista: string[], id: string): string[] {
        return lista.includes(id)
            ? lista.filter((item) => item !== id)
            : [...lista, id];
    }

    function limpiarFormularioSimulador() {
        setFormSimulador({
            id: "",
            codigo: `simulador-${simuladores.length + 1}`,
            nombre: "",
            nivel: "PREMIUM",
            imagenPortada: "/simuladores/sim1.jpg",
            descripcion: "",
            permiteVentaIndividual: true,
            precio: 60,
            precioOferta: "",
            visibleEnInicio: true,
            duracionDiasVigencia: 30,
            intentosMaximosSimulacro: 10,
            cantidadPreguntasHabilitadas: 100,
            habilitarDemoEnInicio: true,
            cantidadPreguntasDemo: 5,
            vincularASuscripciones: false,
            membresiasIds: [],
            permitirVincularACursos: false,
            cursosIds: [],
        });
    }

    if (subTabActiva === "ms_membresias") {
        return (
            <div className="space-y-6">
                <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
                    <div className="flex items-center gap-2">
                        <Crown className="h-5 w-5 text-zinc-900" />
                        <h3 className="text-base font-extrabold">
                            Crear o Editar Planes de Suscripción / Membresía (Normal 1 mes, Cartón 3 meses, Premium 1 año...)
                        </h3>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div>
                            <label className="block text-xs font-bold mb-1">
                                Código Identificador Único
                            </label>
                            <input
                                placeholder="Ej: normal-1m, carton-3m, premium-1a"
                                value={formMembresia.codigo}
                                onChange={(e) =>
                                    setFormMembresia({ ...formMembresia, codigo: e.target.value })
                                }
                                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-xs"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold mb-1">
                                Nombre Visible de la Membresía
                            </label>
                            <input
                                placeholder="Ej: Membresía Cartón (3 Meses)"
                                value={formMembresia.nombre}
                                onChange={(e) =>
                                    setFormMembresia({ ...formMembresia, nombre: e.target.value })
                                }
                                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-xs"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold mb-1">
                                Precio de la Membresía (S/)
                            </label>
                            <input
                                type="number"
                                value={formMembresia.precio}
                                onChange={(e) =>
                                    setFormMembresia({
                                        ...formMembresia,
                                        precio: Number(e.target.value),
                                    })
                                }
                                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-xs font-extrabold"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold mb-1">
                                Vigencia en Días (Ej: 30, 90, 365, 730)
                            </label>
                            <input
                                type="number"
                                value={formMembresia.duracionDias}
                                onChange={(e) =>
                                    setFormMembresia({
                                        ...formMembresia,
                                        duracionDias: Number(e.target.value),
                                    })
                                }
                                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-xs"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold mb-1">
                                Etiqueta de Tiempo Visible
                            </label>
                            <input
                                placeholder="Ej: 3 meses de acceso"
                                value={formMembresia.etiquetaDuracionTexto}
                                onChange={(e) =>
                                    setFormMembresia({
                                        ...formMembresia,
                                        etiquetaDuracionTexto: e.target.value,
                                    })
                                }
                                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-xs"
                            />
                        </div>

                        <div className="sm:col-span-2 lg:col-span-3">
                            <DropzoneArchivo
                                label="Imagen de Portada de la Membresía"
                                carpeta="membresias"
                                accept="image/*"
                                valorActual={formMembresia.imagenPortada}
                                onChangeUrl={(url) =>
                                    setFormMembresia({ ...formMembresia, imagenPortada: url })
                                }
                            />
                        </div>
                    </div>

                    <textarea
                        rows={2}
                        placeholder="Descripción de beneficios de esta membresía..."
                        value={formMembresia.descripcion}
                        onChange={(e) =>
                            setFormMembresia({
                                ...formMembresia,
                                descripcion: e.target.value,
                            })
                        }
                        className="w-full rounded-lg border border-zinc-300 p-3 text-xs"
                    />

                    <button
                        onClick={() =>
                            onEjecutarAccion(
                                "GUARDAR_MEMBRESIA",
                                formMembresia,
                                "Plan de Membresía guardado correctamente"
                            )
                        }
                        className="inline-flex items-center gap-2 rounded-xl bg-zinc-950 px-5 py-2.5 text-xs font-extrabold text-white hover:bg-zinc-800"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Guardar Plan de Membresía</span>
                    </button>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                    {membresias.map((m) => (
                        <div
                            key={m.id}
                            className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm flex flex-col justify-between"
                        >
                            <div>
                                <span className="inline-block rounded bg-zinc-100 px-2.5 py-0.5 text-[10px] font-mono font-bold">
                                    {m.codigo}
                                </span>
                                <h4 className="text-base font-extrabold mt-2">{m.nombre}</h4>
                                <div className="text-xl font-extrabold mt-1">
                                    S/ {Number(m.precio).toFixed(2)}{" "}
                                    <span className="text-xs font-normal text-zinc-500">
                                        / {m.duracionDias} días ({m.etiquetaDuracionTexto})
                                    </span>
                                </div>
                                <p className="text-xs text-zinc-600 mt-2">{m.descripcion}</p>
                            </div>

                            <div className="mt-4 flex gap-3 border-t border-zinc-100 pt-3 text-xs font-bold">
                                <button
                                    onClick={() =>
                                        setFormMembresia({
                                            codigo: m.codigo,
                                            nombre: m.nombre,
                                            etiquetaDuracionTexto: m.etiquetaDuracionTexto,
                                            imagenPortada: m.imagenPortada || "",
                                            descripcion: m.descripcion || "",
                                            precio: Number(m.precio),
                                            duracionDias: m.duracionDias,
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
                                            "ELIMINAR_MEMBRESIA",
                                            { id: m.id },
                                            "Membresía eliminada"
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
        );
    }

    return (
        <div className="space-y-6">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <ClipboardCheck className="h-5 w-5 text-zinc-900" />
                        <h3 className="text-base font-extrabold">
                            {formSimulador.id
                                ? `Editando Simulador: ${formSimulador.nombre}`
                                : "1. Configurar Simulador (Precio Individual, Mostrar en Página, Vincular a Suscripciones y Cursos)"}
                        </h3>
                    </div>
                    {formSimulador.id && (
                        <button
                            onClick={limpiarFormularioSimulador}
                            className="text-xs font-bold underline"
                        >
                            Cancelar edición
                        </button>
                    )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                        <label className="block text-xs font-bold mb-1">
                            Código Único del Simulador
                        </label>
                        <input
                            value={formSimulador.codigo}
                            onChange={(e) =>
                                setFormSimulador({ ...formSimulador, codigo: e.target.value })
                            }
                            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-xs"
                        />
                    </div>

                    <div className="sm:col-span-2">
                        <label className="block text-xs font-bold mb-1">
                            Nombre Completo del Simulador
                        </label>
                        <input
                            placeholder="Ej: Simulador Oficial Examen OECE - Ley N° 32069"
                            value={formSimulador.nombre}
                            onChange={(e) =>
                                setFormSimulador({ ...formSimulador, nombre: e.target.value })
                            }
                            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-xs"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold mb-1">Nivel</label>
                        <select
                            value={formSimulador.nivel}
                            onChange={(e) =>
                                setFormSimulador({ ...formSimulador, nivel: e.target.value })
                            }
                            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-xs font-bold"
                        >
                            <option value="BASICO">BÁSICO</option>
                            <option value="PLUS">PLUS</option>
                            <option value="PREMIUM">PREMIUM</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold mb-1">
                            Preguntas Habilitadas
                        </label>
                        <input
                            type="number"
                            value={formSimulador.cantidadPreguntasHabilitadas}
                            onChange={(e) =>
                                setFormSimulador({
                                    ...formSimulador,
                                    cantidadPreguntasHabilitadas: Number(e.target.value),
                                })
                            }
                            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-xs"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold mb-1">
                            Días de Vigencia
                        </label>
                        <input
                            type="number"
                            value={formSimulador.duracionDiasVigencia}
                            onChange={(e) =>
                                setFormSimulador({
                                    ...formSimulador,
                                    duracionDiasVigencia: Number(e.target.value),
                                })
                            }
                            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-xs"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold mb-1">
                            Intentos Permitidos
                        </label>
                        <input
                            type="number"
                            value={formSimulador.intentosMaximosSimulacro}
                            onChange={(e) =>
                                setFormSimulador({
                                    ...formSimulador,
                                    intentosMaximosSimulacro: Number(e.target.value),
                                })
                            }
                            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-xs"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold mb-1">
                            Preguntas en Demo (Inicio)
                        </label>
                        <input
                            type="number"
                            value={formSimulador.cantidadPreguntasDemo}
                            onChange={(e) =>
                                setFormSimulador({
                                    ...formSimulador,
                                    cantidadPreguntasDemo: Number(e.target.value),
                                })
                            }
                            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-xs"
                        />
                    </div>
                </div>

                {/* CHECK 1: MOSTRAR EN LA PÁGINA Y PRECIO DE VENTA APARTE */}
                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 space-y-3">
                    <div className="flex flex-wrap items-center gap-6 text-xs font-extrabold">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formSimulador.visibleEnInicio}
                                onChange={(e) =>
                                    setFormSimulador({
                                        ...formSimulador,
                                        visibleEnInicio: e.target.checked,
                                    })
                                }
                            />
                            <span>Mostrar en la Página Principal</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formSimulador.permiteVentaIndividual}
                                onChange={(e) =>
                                    setFormSimulador({
                                        ...formSimulador,
                                        permiteVentaIndividual: e.target.checked,
                                    })
                                }
                            />
                            <span>Se puede vender aparte en la página (Poner Precio)</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formSimulador.habilitarDemoEnInicio}
                                onChange={(e) =>
                                    setFormSimulador({
                                        ...formSimulador,
                                        habilitarDemoEnInicio: e.target.checked,
                                    })
                                }
                            />
                            <span>Habilitar Demo Gratuita en Inicio</span>
                        </label>
                    </div>

                    {formSimulador.permiteVentaIndividual && (
                        <div className="flex flex-wrap items-center gap-4 pt-2 pl-6">
                            <div>
                                <label className="block text-xs font-bold mb-1">
                                    Precio del Simulador (S/):
                                </label>
                                <input
                                    type="number"
                                    value={formSimulador.precio}
                                    onChange={(e) =>
                                        setFormSimulador({
                                            ...formSimulador,
                                            precio: Number(e.target.value),
                                        })
                                    }
                                    className="w-36 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-extrabold"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold mb-1">
                                    Precio Oferta (Opcional S/):
                                </label>
                                <input
                                    type="number"
                                    placeholder="Opcional"
                                    value={formSimulador.precioOferta}
                                    onChange={(e) =>
                                        setFormSimulador({
                                            ...formSimulador,
                                            precioOferta: e.target.value,
                                        })
                                    }
                                    className="w-36 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* CHECK 2: VINCULAR A SUSCRIPCIONES / MEMBRESÍAS */}
                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 space-y-3">
                    <label className="flex items-center gap-2 text-xs font-extrabold cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formSimulador.vincularASuscripciones}
                            onChange={(e) =>
                                setFormSimulador({
                                    ...formSimulador,
                                    vincularASuscripciones: e.target.checked,
                                    membresiasIds: e.target.checked
                                        ? formSimulador.membresiasIds
                                        : [],
                                })
                            }
                        />
                        <span>Vincular este Simulador a alguna Suscripción / Membresía</span>
                    </label>

                    {formSimulador.vincularASuscripciones && (
                        <div className="pl-6 flex flex-wrap gap-3">
                            {membresias.map((m) => (
                                <label
                                    key={m.id}
                                    className="flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-semibold cursor-pointer"
                                >
                                    <input
                                        type="checkbox"
                                        checked={formSimulador.membresiasIds.includes(m.id)}
                                        onChange={() =>
                                            setFormSimulador({
                                                ...formSimulador,
                                                membresiasIds: toggleIdEnArray(
                                                    formSimulador.membresiasIds,
                                                    m.id
                                                ),
                                            })
                                        }
                                    />
                                    <span>
                                        {m.nombre} (S/ {Number(m.precio).toFixed(0)})
                                    </span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                {/* CHECK 3: VINCULAR A CURSOS */}
                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 space-y-3">
                    <label className="flex items-center gap-2 text-xs font-extrabold cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formSimulador.permitirVincularACursos}
                            onChange={(e) =>
                                setFormSimulador({
                                    ...formSimulador,
                                    permitirVincularACursos: e.target.checked,
                                    cursosIds: e.target.checked ? formSimulador.cursosIds : [],
                                })
                            }
                        />
                        <span>Vincular este Simulador a Cursos</span>
                    </label>

                    {formSimulador.permitirVincularACursos && (
                        <div className="pl-6 flex flex-wrap gap-3">
                            {cursos.map((c) => (
                                <label
                                    key={c.id}
                                    className="flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-semibold cursor-pointer"
                                >
                                    <input
                                        type="checkbox"
                                        checked={formSimulador.cursosIds.includes(c.id)}
                                        onChange={() =>
                                            setFormSimulador({
                                                ...formSimulador,
                                                cursosIds: toggleIdEnArray(
                                                    formSimulador.cursosIds,
                                                    c.id
                                                ),
                                            })
                                        }
                                    />
                                    <span>
                                        [{c.codigoInterno}] {c.titulo}
                                    </span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                <DropzoneArchivo
                    label="Imagen de Portada del Simulador"
                    carpeta="cursos"
                    accept="image/*"
                    valorActual={formSimulador.imagenPortada}
                    onChangeUrl={(url) =>
                        setFormSimulador({ ...formSimulador, imagenPortada: url })
                    }
                />

                <button
                    onClick={async () => {
                        await onEjecutarAccion(
                            "GUARDAR_SIMULADOR_OECE",
                            formSimulador,
                            formSimulador.id
                                ? "Simulador actualizado"
                                : "Simulador creado correctamente"
                        );
                        limpiarFormularioSimulador();
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-zinc-950 px-6 py-3 text-xs font-extrabold text-white"
                >
                    <Plus className="h-4 w-4" />
                    <span>
                        {formSimulador.id
                            ? "Guardar Cambios del Simulador"
                            : "Guardar Simulador"}
                    </span>
                </button>
            </div>

            {/* LISTA DE SIMULADORES */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
                <h4 className="text-sm font-extrabold">
                    Simuladores Registrados ({simuladores.length})
                </h4>
                <div className="grid gap-4 md:grid-cols-2">
                    {simuladores.map((sim) => (
                        <div
                            key={sim.id}
                            className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 flex flex-col justify-between space-y-3"
                        >
                            <div>
                                <div className="flex justify-between items-center">
                                    <span className="rounded bg-zinc-900 px-2 py-0.5 text-[10px] font-extrabold text-white">
                                        {sim.codigo}
                                    </span>
                                    <span className="text-xs font-extrabold">
                                        S/ {Number(sim.precio).toFixed(2)} •{" "}
                                        {sim.visibleEnInicio ? "Visible en Página" : "Oculto"}
                                    </span>
                                </div>
                                <h5 className="font-extrabold text-sm mt-2">{sim.nombre}</h5>
                                <p className="text-xs text-zinc-600 mt-1">
                                    {sim.cantidadPreguntasHabilitadas} preg. habilitadas •{" "}
                                    {sim.evaluacionesSimulacro?.[0]?.preguntas?.length || 0} en
                                    banco
                                </p>
                            </div>

                            <div className="flex gap-4 border-t border-zinc-200 pt-3 text-xs font-bold">
                                <button
                                    onClick={() =>
                                        setFormSimulador({
                                            id: sim.id,
                                            codigo: sim.codigo,
                                            nombre: sim.nombre,
                                            nivel: sim.nivel,
                                            imagenPortada: sim.imagenPortada || "",
                                            descripcion: sim.descripcion || "",
                                            permiteVentaIndividual:
                                                sim.permiteVentaIndividual ?? true,
                                            precio: Number(sim.precio),
                                            precioOferta: sim.precioOferta
                                                ? String(sim.precioOferta)
                                                : "",
                                            visibleEnInicio: sim.visibleEnInicio ?? true,
                                            duracionDiasVigencia: sim.duracionDiasVigencia,
                                            intentosMaximosSimulacro: sim.intentosMaximosSimulacro,
                                            cantidadPreguntasHabilitadas:
                                                sim.cantidadPreguntasHabilitadas,
                                            habilitarDemoEnInicio: sim.habilitarDemoEnInicio,
                                            cantidadPreguntasDemo: sim.cantidadPreguntasDemo,
                                            vincularASuscripciones:
                                                (sim.membresiasDondeSeIncluye?.length || 0) > 0,
                                            membresiasIds:
                                                sim.membresiasDondeSeIncluye?.map(
                                                    (m: any) => m.planSuscripcionId
                                                ) || [],
                                            permitirVincularACursos:
                                                sim.permitirVincularACursos ?? true,
                                            cursosIds:
                                                sim.cursosVinculados?.map((c: any) => c.cursoId) || [],
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
                                            "ELIMINAR_SIMULADOR",
                                            { id: sim.id },
                                            "Simulador eliminado"
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

            {/* SUBIR EXCEL DE PREGUNTAS AL SIMULADOR */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <h4 className="text-sm font-extrabold">
                        2. Descargar Plantilla Excel y Subir Preguntas al Simulador
                    </h4>
                    <button
                        onClick={descargarPlantillaPreguntasCSV}
                        className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-2 text-xs font-extrabold"
                    >
                        <Download className="h-4 w-4" />
                        <span>1. Descargar Plantilla Excel/CSV</span>
                    </button>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <select
                        value={simuladorDestinoExcelId}
                        onChange={(e) => setSimuladorDestinoExcelId(e.target.value)}
                        className="rounded-lg border border-zinc-300 px-3 py-2 text-xs font-bold"
                    >
                        <option value="">-- 2. Elegir Simulador Destino --</option>
                        {simuladores.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.nombre}
                            </option>
                        ))}
                    </select>

                    <label className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-zinc-950 px-5 py-2.5 text-xs font-extrabold text-white">
                        <Upload className="h-4 w-4" />
                        <span>3. Subir Excel/CSV Relleno</span>
                        <input
                            type="file"
                            accept=".csv,.tsv,.txt"
                            onChange={async (e) => {
                                if (!simuladorDestinoExcelId) {
                                    alert("Primero selecciona el Simulador destino");
                                    return;
                                }
                                const f = e.target.files?.[0];
                                if (!f) return;
                                const txt = await f.text();
                                const pregs = parsearCSVAPreguntas(txt);
                                await onEjecutarAccion(
                                    "IMPORTAR_PREGUNTAS_LOTE",
                                    {
                                        planSimulacroId: simuladorDestinoExcelId,
                                        preguntas: pregs,
                                    },
                                    `${pregs.length} preguntas cargadas al Simulador`
                                );
                            }}
                            className="hidden"
                        />
                    </label>
                </div>
            </div>
        </div>
    );
}