// src/components/home/HeaderPublico.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import AuthHeaderActions from "@/components/auth/AuthHeaderActions";
import {
    GraduationCap,
    ShieldCheck,
    Menu,
    X,
    BookOpen,
    ClipboardCheck,
    Crown,
    MonitorPlay,
    PhoneCall,
} from "lucide-react";

interface HeaderPublicoProps {
    nombreEmpresa: string;
    subtituloEmpresa: string;
    logoUrl: string | null;
}

export default function HeaderPublico({
    nombreEmpresa,
    subtituloEmpresa,
    logoUrl,
}: HeaderPublicoProps) {
    const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);
    const [errorLogo, setErrorLogo] = useState(false);

    const mostrarImagenLogo = Boolean(logoUrl) && !errorLogo;

    return (
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-sm">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
                {/* Logo + Nombre de la Empresa */}
                <div className="flex items-center gap-6">
                    <Link href="/" className="flex items-center gap-3 shrink-0">
                        {mostrarImagenLogo ? (
                            <img
                                src={logoUrl!}
                                alt={nombreEmpresa}
                                onError={() => setErrorLogo(true)}
                                className="h-11 w-auto max-w-[150px] rounded-lg object-contain"
                            />
                        ) : (
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-950 text-white shadow-sm">
                                <GraduationCap className="h-6 w-6" />
                            </div>
                        )}
                        <div className="leading-tight">
                            <span className="block text-sm sm:text-base font-extrabold tracking-tight text-zinc-950">
                                {nombreEmpresa}
                            </span>
                            <span className="hidden sm:block text-[11px] font-semibold text-zinc-500">
                                {subtituloEmpresa}
                            </span>
                        </div>
                    </Link>

                    {/* Menú Escritorio */}
                    <nav
                        aria-label="Menú Principal"
                        className="hidden xl:flex xl:items-center xl:gap-5 text-sm font-bold text-zinc-700"
                    >
                        <a
                            href="#cursos-y-diplomados"
                            className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-100 px-3 py-1.5 text-zinc-950 hover:bg-zinc-200 transition"
                        >
                            Cursos y Diplomados
                        </a>
                        <a
                            href="#simulador-oece"
                            className="hover:text-zinc-950 transition"
                        >
                            Simulador OECE
                        </a>
                        <a href="#membresias" className="hover:text-zinc-950 transition">
                            Membresías
                        </a>
                        <Link
                            href="/aula-virtual"
                            className="hover:text-zinc-950 transition"
                        >
                            Aula Virtual
                        </Link>
                        <a
                            href="#diplomas-verificacion"
                            className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 transition"
                        >
                            <ShieldCheck className="h-4 w-4" />
                            <span>Certificados QR</span>
                        </a>
                        <a
                            href="#contacto-soporte"
                            className="hover:text-zinc-950 transition"
                        >
                            Ayuda
                        </a>
                    </nav>
                </div>

                {/* Botones de Sesión + Botón Menú Móvil */}
                <div className="flex items-center gap-2">
                    <AuthHeaderActions />
                    <button
                        type="button"
                        onClick={() => setMenuMovilAbierto(!menuMovilAbierto)}
                        aria-label="Abrir menú de navegación"
                        className="xl:hidden inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900 hover:bg-zinc-100"
                    >
                        {menuMovilAbierto ? (
                            <X className="h-5 w-5" />
                        ) : (
                            <Menu className="h-5 w-5" />
                        )}
                    </button>
                </div>
            </div>

            {/* Menú Desplegable para Celulares y Tablets */}
            {menuMovilAbierto && (
                <div className="xl:hidden border-t border-zinc-200 bg-white px-4 py-4 shadow-lg space-y-1.5 text-sm font-bold text-zinc-800">
                    <a
                        href="#cursos-y-diplomados"
                        onClick={() => setMenuMovilAbierto(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-zinc-100"
                    >
                        <BookOpen className="h-4 w-4 text-zinc-950" />
                        <span>Cursos y Diplomados</span>
                    </a>
                    <a
                        href="#simulador-oece"
                        onClick={() => setMenuMovilAbierto(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-zinc-100"
                    >
                        <ClipboardCheck className="h-4 w-4 text-zinc-950" />
                        <span>Simulador OECE</span>
                    </a>
                    <a
                        href="#membresias"
                        onClick={() => setMenuMovilAbierto(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-zinc-100"
                    >
                        <Crown className="h-4 w-4 text-amber-600" />
                        <span>Planes de Membresía</span>
                    </a>
                    <Link
                        href="/aula-virtual"
                        onClick={() => setMenuMovilAbierto(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-zinc-100"
                    >
                        <MonitorPlay className="h-4 w-4 text-zinc-950" />
                        <span>Ingresar al Aula Virtual</span>
                    </Link>
                    <a
                        href="#diplomas-verificacion"
                        onClick={() => setMenuMovilAbierto(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-emerald-700 hover:bg-emerald-50"
                    >
                        <ShieldCheck className="h-4 w-4" />
                        <span>Verificar Certificados / QR</span>
                    </a>
                    <a
                        href="#contacto-soporte"
                        onClick={() => setMenuMovilAbierto(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-zinc-100"
                    >
                        <PhoneCall className="h-4 w-4 text-zinc-950" />
                        <span>Soporte y Cambio de Correo</span>
                    </a>
                </div>
            )}
        </header>
    );
}