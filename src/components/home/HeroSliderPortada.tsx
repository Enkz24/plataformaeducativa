// src/components/home/HeroSliderPortada.tsx
"use client";

import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ArrowRight, PlayCircle } from "lucide-react";

export interface SliderItemPortada {
    id: string;
    titulo: string;
    subtitulo: string | null;
    etiquetaSuperior: string | null;
    imagenFondoUrl: string;
    textoBotonPrincipal: string;
    enlaceBotonPrincipal: string;
    textoBotonSecundario: string | null;
    enlaceBotonSecundario: string | null;
}

function esUrlVideo(url: string) {
    const limpia = (url || "").toLowerCase().split("?")[0];
    return (
        limpia.endsWith(".mp4") ||
        limpia.endsWith(".webm") ||
        limpia.endsWith(".mov") ||
        limpia.endsWith(".ogg")
    );
}

export default function HeroSliderPortada({
    sliders,
    nombreEmpresa,
    slogan,
}: {
    sliders: SliderItemPortada[];
    nombreEmpresa: string;
    slogan?: string | null;
}) {
    const [indiceActivo, setIndiceActivo] = useState(0);

    useEffect(() => {
        if (sliders.length <= 1) return;
        const intervalo = setInterval(() => {
            setIndiceActivo((prev) => (prev + 1) % sliders.length);
        }, 6500);
        return () => clearInterval(intervalo);
    }, [sliders.length]);

    if (sliders.length === 0) {
        return (
            <section className="relative overflow-hidden bg-zinc-950 text-white border-b border-zinc-800">
                <div className="mx-auto max-w-7xl px-4 py-16 sm:py-24 sm:px-6 lg:px-8">
                    <div className="max-w-3xl space-y-5">
                        <span className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-3.5 py-1 text-xs font-extrabold text-zinc-950">
                            FORMACIÓN PROFESIONAL • PERÚ
                        </span>
                        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
                            {slogan || `Impulsa tu carrera profesional con ${nombreEmpresa}`}
                        </h1>
                        <p className="text-sm sm:text-base text-zinc-300 max-w-2xl">
                            Cursos especializados, diplomados, membresías y simuladores OECE
                            con certificación verificable mediante código QR.
                        </p>
                        <div className="flex flex-wrap gap-3 pt-2">
                            <a
                                href="#cursos-y-diplomados"
                                className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-6 py-3.5 text-xs sm:text-sm font-extrabold text-zinc-950 shadow-lg hover:bg-amber-300 transition"
                            >
                                <span>Explorar Cursos</span>
                                <ArrowRight className="h-4 w-4" />
                            </a>
                            <a
                                href="#simulador-oece"
                                className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-6 py-3.5 text-xs sm:text-sm font-bold text-white hover:bg-white/20 transition"
                            >
                                <span>Simulador OECE</span>
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    const actual = sliders[indiceActivo] || sliders[0];
    const esVideo = esUrlVideo(actual.imagenFondoUrl);

    return (
        <section className="relative w-full min-h-[440px] sm:min-h-[520px] lg:min-h-[560px] overflow-hidden bg-zinc-950 text-white flex items-center">
            {/* Fondo Full-Bleed: Video o Imagen */}
            <div className="absolute inset-0 z-0">
                {esVideo ? (
                    <video
                        key={actual.id}
                        src={actual.imagenFondoUrl}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <img
                        key={actual.id}
                        src={actual.imagenFondoUrl}
                        alt={actual.titulo}
                        className="h-full w-full object-cover object-center transition-all duration-700"
                    />
                )}
                {/* Degradado oscuro profesional para legibilidad perfecta en PC y celular */}
                <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/90 via-zinc-950/65 to-zinc-950/30" />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent" />
            </div>

            {/* Contenido sobre el Slider */}
            <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="max-w-2xl space-y-5">
                    {actual.etiquetaSuperior && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400 px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-zinc-950 shadow">
                            {esVideo && <PlayCircle className="h-3.5 w-3.5" />}
                            {actual.etiquetaSuperior}
                        </span>
                    )}

                    <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.12] drop-shadow">
                        {actual.titulo}
                    </h1>

                    {actual.subtitulo && (
                        <p className="text-sm sm:text-base text-zinc-200 leading-relaxed max-w-xl">
                            {actual.subtitulo}
                        </p>
                    )}

                    <div className="flex flex-wrap gap-3 pt-2">
                        <a
                            href={actual.enlaceBotonPrincipal || "#cursos-y-diplomados"}
                            className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-6 py-3.5 text-xs sm:text-sm font-extrabold text-zinc-950 shadow-xl hover:bg-amber-300 transition"
                        >
                            <span>{actual.textoBotonPrincipal || "Explorar cursos"}</span>
                            <ArrowRight className="h-4 w-4" />
                        </a>

                        {actual.textoBotonSecundario && actual.enlaceBotonSecundario && (
                            <a
                                href={actual.enlaceBotonSecundario}
                                className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 backdrop-blur-sm px-6 py-3.5 text-xs sm:text-sm font-bold text-white hover:bg-white/20 transition"
                            >
                                <span>{actual.textoBotonSecundario}</span>
                            </a>
                        )}
                    </div>
                </div>
            </div>

            {/* Flechas de navegación y Puntos (solo si hay más de 1 slider) */}
            {sliders.length > 1 && (
                <>
                    <button
                        type="button"
                        aria-label="Anterior"
                        onClick={() =>
                            setIndiceActivo(
                                (prev) => (prev - 1 + sliders.length) % sliders.length
                            )
                        }
                        className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm border border-white/20 hover:bg-black/80 transition"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>

                    <button
                        type="button"
                        aria-label="Siguiente"
                        onClick={() =>
                            setIndiceActivo((prev) => (prev + 1) % sliders.length)
                        }
                        className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm border border-white/20 hover:bg-black/80 transition"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>

                    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
                        {sliders.map((s, i) => (
                            <button
                                key={s.id}
                                type="button"
                                aria-label={`Ir al slide ${i + 1}`}
                                onClick={() => setIndiceActivo(i)}
                                className={`h-2.5 rounded-full transition-all ${i === indiceActivo
                                        ? "w-8 bg-amber-400"
                                        : "w-2.5 bg-white/40 hover:bg-white/75"
                                    }`}
                            />
                        ))}
                    </div>
                </>
            )}
        </section>
    );
}