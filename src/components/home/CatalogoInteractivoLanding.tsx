// src/components/home/CatalogoInteractivoLanding.tsx
"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  Clock,
  Award,
  BookOpen,
  ClipboardCheck,
  Crown,
  MonitorPlay,
  ArrowRight,
  Calendar,
  User,
} from "lucide-react";

export interface ProgramaItemLanding {
  id: string;
  seccionId?: string | null;
  codigoInterno: string;
  titulo: string;
  slug: string;
  imagenPortada: string | null;
  areaSlug: string;
  areaNombre: string;
  subcategoriaEtiqueta: string;
  tipoPrograma: string;
  modalidad: string;
  horasAcademicas: number;
  creditos: number;
  precioBase: number;
  precioOferta: number | null;
  fechaInicioTexto: string;
  horarioTexto: string;
  docenteNombre: string;
  docenteCargo: string;
  resumen: string;
  modulosPrincipales: string[];
}

export default function CatalogoInteractivoLanding({
  programas,
}: {
  programas: ProgramaItemLanding[];
}) {
  const [busqueda, setBusqueda] = useState("");
  const [areaSeleccionada, setAreaSeleccionada] = useState("TODAS");

  // Extrae automáticamente las áreas únicas presentes en tus cursos configurados
  const areasDisponibles = useMemo(() => {
    const mapa = new Map<string, string>();
    for (const p of programas) {
      if (!mapa.has(p.areaSlug)) {
        mapa.set(p.areaSlug, p.areaNombre);
      }
    }
    return Array.from(mapa.entries()).map(([slug, nombre]) => ({
      slug,
      nombre,
    }));
  }, [programas]);

  const programasFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return programas.filter((p) => {
      const coincideArea =
        areaSeleccionada === "TODAS" || p.areaSlug === areaSeleccionada;
      const coincideTexto =
        !q ||
        p.titulo.toLowerCase().includes(q) ||
        p.areaNombre.toLowerCase().includes(q) ||
        p.subcategoriaEtiqueta.toLowerCase().includes(q) ||
        p.resumen.toLowerCase().includes(q);
      return coincideArea && coincideTexto;
    });
  }, [programas, busqueda, areaSeleccionada]);

  return (
    <section
      id="cursos-y-diplomados"
      className="scroll-mt-20 bg-white border-b border-zinc-200"
    >
      {/* 4 Accesos Rápidos (Responsive: 2x2 en celular, 4 columnas en PC) */}
      <div className="border-b border-zinc-100 bg-zinc-50/70">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <a
              href="#catalogo-cursos"
              className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm hover:border-zinc-950 transition"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-950 text-white">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-extrabold text-zinc-950">
                  Cursos y Diplomados
                </div>
                <div className="text-[11px] text-zinc-500">
                  Aprende a tu ritmo
                </div>
              </div>
            </a>

            <a
              href="#simulador-oece"
              className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm hover:border-zinc-950 transition"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-950 text-amber-400">
                <ClipboardCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-extrabold text-zinc-950">
                  Simulador OECE
                </div>
                <div className="text-[11px] text-zinc-500">
                  Practica y evalúate
                </div>
              </div>
            </a>

            <a
              href="#membresias"
              className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm hover:border-zinc-950 transition"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-950 text-amber-400">
                <Crown className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-extrabold text-zinc-950">
                  Membresías
                </div>
                <div className="text-[11px] text-zinc-500">
                  Beneficios exclusivos
                </div>
              </div>
            </a>

            <Link
              href="/aula-virtual"
              className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm hover:border-zinc-950 transition"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-950 text-white">
                <MonitorPlay className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-extrabold text-zinc-950">
                  Aula Virtual
                </div>
                <div className="text-[11px] text-zinc-500">
                  Continúa tus clases
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Buscador + Filtro de Categorías (Carrusel horizontal en celular) */}
      <div
        id="catalogo-cursos"
        className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-8"
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-500">
              Programas Habilitados
            </span>
            <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold text-zinc-950">
              Cursos, Diplomados y Especializaciones
            </h2>
          </div>

          <div className="relative w-full md:w-96">
            <Search className="h-4 w-4 absolute left-3.5 top-3 text-zinc-400" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="¿Qué deseas aprender? Ej: SIAF, SEACE, Obras..."
              className="w-full rounded-xl border border-zinc-300 bg-zinc-50 pl-10 pr-4 py-2.5 text-xs sm:text-sm focus:border-zinc-950 focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {/* Pestañas de Áreas (Deslizable horizontalmente en celular) */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          <button
            type="button"
            onClick={() => setAreaSeleccionada("TODAS")}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-extrabold transition ${areaSeleccionada === "TODAS"
                ? "bg-zinc-950 text-white shadow"
                : "border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100"
              }`}
          >
            Todas las áreas ({programas.length})
          </button>

          {areasDisponibles.map((area) => (
            <button
              key={area.slug}
              type="button"
              onClick={() => setAreaSeleccionada(area.slug)}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-extrabold transition ${areaSeleccionada === area.slug
                  ? "bg-zinc-950 text-white shadow"
                  : "border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100"
                }`}
            >
              {area.nombre}
            </button>
          ))}
        </div>

        {/* Cuadrícula de Tarjetas de Cursos con su IMAGEN REAL */}
        {programasFiltrados.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {programasFiltrados.map((prog) => {
              const precioFinal = prog.precioOferta ?? prog.precioBase;
              const checkoutUrl = prog.seccionId
                ? `/checkout?seccion=${encodeURIComponent(prog.seccionId)}`
                : `/checkout?curso=${encodeURIComponent(prog.id)}`;

              return (
                <article
                  key={prog.id}
                  className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:shadow-xl hover:border-zinc-400"
                >
                  <div>
                    {/* Imagen Portada del Curso */}
                    <div className="relative h-48 w-full overflow-hidden bg-zinc-900">
                      {prog.imagenPortada ? (
                        <img
                          src={prog.imagenPortada}
                          alt={prog.titulo}
                          className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-800 text-zinc-500">
                          <BookOpen className="h-12 w-12" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                        <span className="rounded-md bg-zinc-950/90 px-2.5 py-1 text-[10px] font-extrabold uppercase text-amber-400 backdrop-blur-sm">
                          {prog.tipoPrograma}
                        </span>
                        <span className="rounded-md bg-white/95 px-2.5 py-1 text-[10px] font-extrabold text-zinc-900">
                          {prog.modalidad}
                        </span>
                      </div>
                      <span className="absolute bottom-3 left-3 text-[11px] font-bold text-white drop-shadow">
                        {prog.areaNombre}
                      </span>
                    </div>

                    {/* Detalle */}
                    <div className="p-5 space-y-3">
                      <span className="block text-[11px] font-bold text-zinc-500">
                        {prog.subcategoriaEtiqueta}
                      </span>
                      <h3 className="text-base font-extrabold text-zinc-950 leading-snug line-clamp-2">
                        {prog.titulo}
                      </h3>
                      <p className="text-xs text-zinc-600 line-clamp-2">
                        {prog.resumen}
                      </p>

                      <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] font-semibold text-zinc-600 border-t border-zinc-100">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-zinc-900 shrink-0" />
                          <span>{prog.horasAcademicas} horas</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-zinc-900 shrink-0" />
                          <span className="truncate">
                            {prog.fechaInicioTexto}
                          </span>
                        </div>
                        <div className="col-span-2 flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-zinc-900 shrink-0" />
                          <span className="truncate">{prog.docenteNombre}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Precio y Botón Inscribirme */}
                  <div className="border-t border-zinc-100 bg-zinc-50 p-4 flex items-center justify-between gap-3">
                    <div>
                      {prog.precioOferta &&
                        prog.precioOferta < prog.precioBase && (
                          <span className="block text-[11px] text-zinc-400 line-through">
                            S/ {prog.precioBase.toFixed(2)}
                          </span>
                        )}
                      <span className="text-xl font-extrabold text-zinc-950">
                        S/ {precioFinal.toFixed(2)}
                      </span>
                    </div>

                    <Link
                      href={checkoutUrl}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-950 px-4 py-2.5 text-xs font-extrabold text-white hover:bg-zinc-800 transition"
                    >
                      <span>Inscribirme</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-zinc-300 p-10 text-center text-xs text-zinc-500">
            No encontramos programas que coincidan con &ldquo;{busqueda}&rdquo;.
          </div>
        )}
      </div>
    </section>
  );
}