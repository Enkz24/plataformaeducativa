// src/components/home/BotonesFlotantesAyuda.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
    MessageCircle,
    Bot,
    X,
    Sparkles,
    BookOpen,
    ClipboardCheck,
    ShieldCheck,
    HelpCircle,
} from "lucide-react";

interface BotonesFlotantesAyudaProps {
    telefonoWhatsapp: string;
    nombreEmpresa: string;
}

export default function BotonesFlotantesAyuda({
    telefonoWhatsapp,
    nombreEmpresa,
}: BotonesFlotantesAyudaProps) {
    const [chatIaAbierto, setChatIaAbierto] = useState(false);

    const linkWhatsapp = `https://wa.me/${telefonoWhatsapp}?text=${encodeURIComponent(
        `Hola ${nombreEmpresa}, necesito ayuda con los cursos, membresías o certificados.`
    )}`;

    return (
        <>
            {/* ================================================================= */}
            {/* BOTONES FLOTANTES AL COSTADO DERECHO (CHAT IA + WHATSAPP)         */}
            {/* ================================================================= */}
            <div className="fixed right-4 bottom-20 md:bottom-6 z-50 flex flex-col items-end gap-3">
                {/* Ventana emergente del Chat de IA (En construcción) */}
                {chatIaAbierto && (
                    <div className="w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl">
                        <div className="flex items-center justify-between bg-zinc-950 px-4 py-3 text-white">
                            <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400 text-zinc-950">
                                    <Bot className="h-5 w-5" />
                                </div>
                                <div>
                                    <div className="text-xs font-extrabold">
                                        Asistente Virtual IA
                                    </div>
                                    <span className="inline-block rounded bg-amber-400/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-300">
                                        En construcción
                                    </span>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setChatIaAbierto(false)}
                                aria-label="Cerrar asistente IA"
                                className="rounded-lg p-1 hover:bg-white/10"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="p-4 space-y-3 text-xs text-zinc-700">
                            <div className="rounded-xl bg-zinc-100 p-3 space-y-1.5">
                                <div className="flex items-center gap-1.5 font-extrabold text-zinc-950">
                                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                                    <span>Próximamente disponible 24/7</span>
                                </div>
                                <p className="leading-relaxed text-zinc-600">
                                    Estamos entrenando a nuestro Asistente de Inteligencia
                                    Artificial para recomendarte cursos, resolver dudas de la Ley
                                    N.° 32069 y ayudarte con tus trámites en segundos.
                                </p>
                            </div>

                            <p className="text-[11px] font-semibold text-zinc-500">
                                Mientras lo terminamos, puedes recibir atención inmediata por
                                WhatsApp:
                            </p>

                            <a
                                href={linkWhatsapp}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-xs font-extrabold text-white hover:bg-emerald-700 transition"
                            >
                                <MessageCircle className="h-4 w-4" />
                                <span>Hablar con un Asesor ahora</span>
                            </a>
                        </div>
                    </div>
                )}

                {/* Botón Flotante Asistente IA */}
                <button
                    type="button"
                    onClick={() => setChatIaAbierto(!chatIaAbierto)}
                    aria-label="Abrir chat de IA"
                    className="group flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-950 px-4 py-3 text-xs font-extrabold text-white shadow-xl hover:bg-zinc-800 transition"
                >
                    <Bot className="h-5 w-5 text-amber-400" />
                    <span className="hidden sm:inline">Asistente IA</span>
                    <span className="rounded-full bg-amber-400 px-1.5 py-0.5 text-[9px] font-extrabold text-zinc-950">
                        PRONTO
                    </span>
                </button>

                {/* Botón Flotante WhatsApp */}
                <a
                    href={linkWhatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Atención por WhatsApp"
                    className="flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-3 text-xs font-extrabold text-white shadow-xl hover:bg-emerald-700 transition"
                >
                    <MessageCircle className="h-5 w-5" />
                    <span className="hidden sm:inline">WhatsApp Ayuda</span>
                </a>
            </div>

            {/* ================================================================= */}
            {/* BARRA INFERIOR DE AYUDA Y ACCESOS RÁPIDOS EXCLUSIVA PARA CELULARES */}
            {/* ================================================================= */}
            <nav
                aria-label="Accesos rápidos móviles"
                className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-200 bg-white/95 backdrop-blur-md shadow-[0_-4px_16px_rgba(0,0,0,0.08)]"
            >
                <div className="grid grid-cols-5 py-2 text-[10px] font-bold text-zinc-700">
                    <a
                        href="#cursos-y-diplomados"
                        className="flex flex-col items-center gap-1 hover:text-zinc-950"
                    >
                        <BookOpen className="h-4 w-4" />
                        <span>Cursos</span>
                    </a>
                    <a
                        href="#simulador-oece"
                        className="flex flex-col items-center gap-1 hover:text-zinc-950"
                    >
                        <ClipboardCheck className="h-4 w-4" />
                        <span>Simulador</span>
                    </a>
                    <a
                        href="#diplomas-verificacion"
                        className="flex flex-col items-center gap-1 text-emerald-700"
                    >
                        <ShieldCheck className="h-4 w-4" />
                        <span>QR / DNI</span>
                    </a>
                    <a
                        href="#contacto-soporte"
                        className="flex flex-col items-center gap-1 hover:text-zinc-950"
                    >
                        <HelpCircle className="h-4 w-4" />
                        <span>Ayuda</span>
                    </a>
                    <a
                        href={linkWhatsapp}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center gap-1 text-emerald-600 font-extrabold"
                    >
                        <MessageCircle className="h-4 w-4" />
                        <span>WhatsApp</span>
                    </a>
                </div>
            </nav>
        </>
    );
}