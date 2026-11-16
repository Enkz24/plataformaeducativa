// src/components/auth/AuthHeaderActions.tsx
"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { LogIn, LogOut, ShieldCheck, UserCheck, Calculator, GraduationCap, BookOpen } from "lucide-react";

export default function AuthHeaderActions() {
  const { data: session, status } = useSession();
  const [cargandoGoogle, setCargandoGoogle] = useState(false);

  const manejarLoginGoogle = async () => {
    try {
      setCargandoGoogle(true);
      await signIn("google", { callbackUrl: "/" });
    } finally {
      setCargandoGoogle(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="h-10 w-44 animate-pulse rounded-lg bg-slate-200" />
    );
  }

  if (session?.user) {
    const { rol, name, email } = session.user;

    const configuracionPanelPorRol: Record<
      string,
      { etiqueta: string; ruta: string; color: string; Icono: typeof ShieldCheck }
    > = {
      ADMINISTRADOR: {
        etiqueta: "Panel Administrador Total",
        ruta: "/panel/administrador",
        color: "bg-indigo-600 hover:bg-indigo-700 text-white",
        Icono: ShieldCheck,
      },
      ASISTENTE_ADMINISTRATIVO: {
        etiqueta: "Panel Asistente Admin",
        ruta: "/panel/asistente",
        color: "bg-teal-600 hover:bg-teal-700 text-white",
        Icono: UserCheck,
      },
      CONTADURIA: {
        etiqueta: "Panel Contaduría y Pagos",
        ruta: "/panel/contaduria",
        color: "bg-emerald-600 hover:bg-emerald-700 text-white",
        Icono: Calculator,
      },
      PROFESOR: {
        etiqueta: "Panel Docente",
        ruta: "/panel/profesor",
        color: "bg-amber-600 hover:bg-amber-700 text-white",
        Icono: BookOpen,
      },
      ESTUDIANTE: {
        etiqueta: "Mi Aula Virtual",
        ruta: "/panel/estudiante",
        color: "bg-blue-600 hover:bg-blue-700 text-white",
        Icono: GraduationCap,
      },
    };

    const panelActual =
      configuracionPanelPorRol[rol] ?? configuracionPanelPorRol.ESTUDIANTE;
    const IconoRol = panelActual.Icono;

    return (
      <div className="flex flex-wrap items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-semibold text-slate-900">{name || email}</p>
          <span className="inline-block rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
            Rol: {rol.replace("_", " ")}
          </span>
        </div>

        <Link
          href={panelActual.ruta}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold shadow-sm transition ${panelActual.color}`}
        >
          <IconoRol className="h-4 w-4" />
          <span>{panelActual.etiqueta}</span>
        </Link>

        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          title="Cerrar sesión"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <LogOut className="h-4 w-4 text-rose-600" />
          <span className="hidden md:inline">Salir</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={manejarLoginGoogle}
        disabled={cargandoGoogle}
        className="inline-flex items-center gap-2.5 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        <span>{cargandoGoogle ? "Conectando..." : "Ingresar con Google"}</span>
      </button>

      <Link
        href="/login"
        className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
      >
        <LogIn className="h-4 w-4" />
        <span>Acceso Correo</span>
      </Link>
    </div>
  );
}