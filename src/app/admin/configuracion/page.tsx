// src/app/admin/configuracion/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import TabEmpresaSliders from "@/components/admin/TabEmpresaSliders";
import TabCursosMateriales from "@/components/admin/TabCursosMateriales";
import TabMembresiasSimuladores from "@/components/admin/TabMembresiasSimuladores";
import TabTemporadasSecciones from "@/components/admin/TabTemporadasSecciones";
import TabMigracionCertificados from "@/components/admin/TabMigracionCertificados";
import TabPagosFinanzas from "@/components/admin/TabPagosFinanzas";
import TabUsuariosCorreos from "@/components/admin/TabUsuariosCorreos";
import {
    Building2,
    BookOpen,
    Layers,
    CalendarRange,
    Award,
    CreditCard,
    Users,
    Eye,
    CheckCircle2,
} from "lucide-react";

type ModuloIzquierdo =
    | "MOD_EMPRESA"
    | "MOD_CURSOS_MATERIALES"
    | "MOD_MEMBRESIAS_SIMULADORES"
    | "MOD_TEMPORADAS_SECCIONES"
    | "MOD_CERTIFICADOS_4200"
    | "MOD_PAGOS_FINANZAS"
    | "MOD_USUARIOS";

const SUBSECCIONES_POR_MODULO: Record<
    ModuloIzquierdo,
    { id: string; label: string }[]
> = {
    MOD_EMPRESA: [
        { id: "emp_datos", label: "Datos de Empresa, RUC y Logo" },
        { id: "emp_sliders", label: "Sliders de Portada (Subir Imágenes)" },
    ],
    MOD_CURSOS_MATERIALES: [
        { id: "cur_categorias", label: "1. Categorías (Crear / Editar / Eliminar)" },
        { id: "cur_crear", label: "2. Cursos Maestros (Crear / Editar / Eliminar)" },
        {
            id: "cur_materiales",
            label:
                "3. Armar Módulos, Sesiones, Subir Materiales y Cuestionarios Excel",
        },
    ],
    MOD_MEMBRESIAS_SIMULADORES: [
        { id: "ms_membresias", label: "Planes de Membresía (Con Subida de Imagen)" },
        {
            id: "ms_simuladores",
            label:
                "Simuladores OECE (Precio, Mostrar en Página, Suscripciones, Cursos y Excel)",
        },
    ],
    MOD_TEMPORADAS_SECCIONES: [
        {
            id: "sec_temporadas",
            label: "1. Temporadas (Listar / Crear / Editar / Eliminar)",
        },
        {
            id: "sec_crear",
            label:
                "2. Secciones por Temporada (Checkboxes, Costo, Gmail, Editar/Eliminar)",
        },
        {
            id: "sec_adecuar",
            label: "3. Adecuar Materiales por Sección y Entrar al Aula Virtual",
        },
    ],
    MOD_CERTIFICADOS_4200: [
        {
            id: "cert_migracion",
            label: "Subir los 4,200 Certificados (Excel) y Verificador QR Anverso",
        },
    ],
    MOD_PAGOS_FINANZAS: [
        {
            id: "pag_bandeja",
            label: "Aprobar Pagos, Recaudación y Conectar API Pasarela",
        },
    ],
    MOD_USUARIOS: [
        { id: "usu_lista", label: "Usuarios, Roles y Cambio de Correo Gmail" },
    ],
};

export default function AdminConfiguracionPage() {
    const [moduloActivo, setModuloActivo] = useState<ModuloIzquierdo>(
        "MOD_MEMBRESIAS_SIMULADORES"
    );
    const [subTabActiva, setSubTabActiva] = useState<string>("ms_simuladores");
    const [mensajeGuardado, setMensajeGuardado] = useState<string | null>(null);

    const [adminActual, setAdminActual] = useState<any>(null);
    const [configSitio, setConfigSitio] = useState<any>(null);
    const [sliders, setSliders] = useState<any[]>([]);
    const [categorias, setCategorias] = useState<any[]>([]);
    const [cursos, setCursos] = useState<any[]>([]);
    const [temporadas, setTemporadas] = useState<any[]>([]);
    const [secciones, setSecciones] = useState<any[]>([]);
    const [membresias, setMembresias] = useState<any[]>([]);
    const [simuladores, setSimuladores] = useState<any[]>([]);
    const [configPagos, setConfigPagos] = useState<any>(null);
    const [pasarelas, setPasarelas] = useState<any[]>([]);
    const [operacionesPago, setOperacionesPago] = useState<any[]>([]);
    const [certificadosRecientes, setCertificadosRecientes] = useState<any[]>([]);
    const [totalCertificadosCount, setTotalCertificadosCount] =
        useState<number>(0);
    const [usuarios, setUsuarios] = useState<any[]>([]);

    async function cargarDatos() {
        try {
            const res = await fetch("/api/admin/configuracion");
            if (!res.ok) return;
            const data = await res.json();
            setAdminActual(data.adminActual);
            setConfigSitio(data.configSitio);
            setSliders(data.sliders || []);
            setCategorias(data.categorias || []);
            setCursos(data.cursos || []);
            setTemporadas(data.temporadas || []);
            setSecciones(data.secciones || []);
            setMembresias(data.membresias || []);
            setSimuladores(data.simuladores || []);
            setConfigPagos(data.configPagos);
            setPasarelas(data.pasarelas || []);
            setOperacionesPago(data.operacionesPago || []);
            setCertificadosRecientes(data.certificadosRecientes || []);
            setTotalCertificadosCount(data.totalCertificadosCount || 0);
            setUsuarios(data.usuarios || []);
        } catch (e) {
            console.error("Error cargando datos:", e);
        }
    }

    useEffect(() => {
        cargarDatos();
    }, []);

    async function ejecutarAccion(accion: string, datos: any, msgExito: string) {
        setMensajeGuardado(null);
        const res = await fetch("/api/admin/configuracion", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ accion, datos }),
        });
        const json = await res.json();
        if (res.ok && json.ok) {
            setMensajeGuardado(msgExito);
            await cargarDatos();
            setTimeout(() => setMensajeGuardado(null), 4000);
        } else {
            alert(json.error || "Ocurrió un error al guardar");
        }
    }

    return (
        <div className="min-h-screen flex bg-zinc-50 text-zinc-950">
            {/* COLUMNA IZQUIERDA: 7 MÓDULOS PRINCIPALES */}
            <aside className="w-64 bg-zinc-950 text-white flex flex-col justify-between shrink-0 border-r border-zinc-800">
                <div>
                    <div className="p-5 border-b border-zinc-800">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                            Panel de Administración
                        </span>
                        <h1 className="text-base font-extrabold text-white mt-0.5 truncate">
                            {configSitio?.nombreEmpresa || "AULA PROFESIONAL"}
                        </h1>
                        <p className="text-[11px] text-zinc-400 truncate mt-1">
                            {adminActual?.email || "Administrador"}
                        </p>
                    </div>

                    <nav className="p-3 space-y-1 text-xs font-semibold">
                        {[
                            {
                                id: "MOD_EMPRESA",
                                label: "1. Identidad y Portada",
                                icon: Building2,
                            },
                            {
                                id: "MOD_CURSOS_MATERIALES",
                                label: "2. Cursos y Materiales",
                                icon: BookOpen,
                            },
                            {
                                id: "MOD_MEMBRESIAS_SIMULADORES",
                                label: "3. Membresías y Simuladores",
                                icon: Layers,
                            },
                            {
                                id: "MOD_TEMPORADAS_SECCIONES",
                                label: "4. Temporadas y Secciones",
                                icon: CalendarRange,
                            },
                            {
                                id: "MOD_CERTIFICADOS_4200",
                                label: "5. Certificados QR (4,200)",
                                icon: Award,
                            },
                            {
                                id: "MOD_PAGOS_FINANZAS",
                                label: "6. Pagos y Pasarela API",
                                icon: CreditCard,
                            },
                            {
                                id: "MOD_USUARIOS",
                                label: "7. Usuarios y Correos",
                                icon: Users,
                            },
                        ].map((m) => {
                            const Icon = m.icon;
                            const activo = moduloActivo === m.id;
                            return (
                                <button
                                    key={m.id}
                                    onClick={() => {
                                        const mod = m.id as ModuloIzquierdo;
                                        setModuloActivo(mod);
                                        setSubTabActiva(SUBSECCIONES_POR_MODULO[mod][0].id);
                                    }}
                                    className={`w-full flex items-center gap-3 rounded-xl px-3.5 py-3 text-left transition ${activo
                                            ? "bg-white text-zinc-950 font-extrabold shadow-sm"
                                            : "text-zinc-300 hover:bg-zinc-900 hover:text-white"
                                        }`}
                                >
                                    <Icon className="h-4 w-4 shrink-0" />
                                    <span>{m.label}</span>
                                </button>
                            );
                        })}
                    </nav>
                </div>

                <div className="p-4 border-t border-zinc-800">
                    <Link
                        href="/?vista=publica"
                        className="flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-extrabold text-zinc-950 hover:bg-zinc-200"
                    >
                        <Eye className="h-4 w-4" />
                        <span>Ver Portada Pública</span>
                    </Link>
                </div>
            </aside>

            {/* PANEL DERECHO: SUB-PESTAÑAS Y COMPONENTE MODULAR */}
            <div className="flex-1 flex flex-col">
                <header className="bg-white border-b border-zinc-200 px-8 py-5">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <h2 className="text-lg font-extrabold text-zinc-950">
                            {
                                SUBSECCIONES_POR_MODULO[moduloActivo].find(
                                    (s) => s.id === subTabActiva
                                )?.label
                            }
                        </h2>

                        {mensajeGuardado && (
                            <div className="inline-flex items-center gap-2 rounded-xl bg-zinc-950 px-4 py-2 text-xs font-bold text-white shadow">
                                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                <span>{mensajeGuardado}</span>
                            </div>
                        )}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2 border-t border-zinc-100 pt-3">
                        {SUBSECCIONES_POR_MODULO[moduloActivo].map((sub) => (
                            <button
                                key={sub.id}
                                onClick={() => setSubTabActiva(sub.id)}
                                className={`rounded-lg px-4 py-2 text-xs font-bold transition ${subTabActiva === sub.id
                                        ? "bg-zinc-950 text-white"
                                        : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                                    }`}
                            >
                                {sub.label}
                            </button>
                        ))}
                    </div>
                </header>

                <main className="p-8 flex-1">
                    {moduloActivo === "MOD_EMPRESA" && (
                        <TabEmpresaSliders
                            subTabActiva={subTabActiva}
                            configSitio={configSitio}
                            sliders={sliders}
                            onEjecutarAccion={ejecutarAccion}
                        />
                    )}

                    {moduloActivo === "MOD_CURSOS_MATERIALES" && (
                        <TabCursosMateriales
                            subTabActiva={subTabActiva}
                            setSubTabActiva={setSubTabActiva}
                            categorias={categorias}
                            cursos={cursos}
                            onEjecutarAccion={ejecutarAccion}
                        />
                    )}

                    {moduloActivo === "MOD_MEMBRESIAS_SIMULADORES" && (
                        <TabMembresiasSimuladores
                            subTabActiva={subTabActiva}
                            membresias={membresias}
                            simuladores={simuladores}
                            cursos={cursos}
                            onEjecutarAccion={ejecutarAccion}
                        />
                    )}

                    {moduloActivo === "MOD_TEMPORADAS_SECCIONES" && (
                        <TabTemporadasSecciones
                            subTabActiva={subTabActiva}
                            setSubTabActiva={setSubTabActiva}
                            temporadas={temporadas}
                            secciones={secciones}
                            cursos={cursos}
                            membresias={membresias}
                            simuladores={simuladores}
                            onEjecutarAccion={ejecutarAccion}
                        />
                    )}

                    {moduloActivo === "MOD_CERTIFICADOS_4200" && (
                        <TabMigracionCertificados
                            certificadosRecientes={certificadosRecientes}
                            totalCertificadosCount={totalCertificadosCount}
                            onImportarLote={(filas, nombreArchivo) =>
                                ejecutarAccion(
                                    "IMPORTAR_CERTIFICADOS_EXCEL",
                                    { filas, nombreArchivo },
                                    `${filas.length} certificados importados con QR y cuenta por DNI`
                                )
                            }
                        />
                    )}

                    {moduloActivo === "MOD_PAGOS_FINANZAS" && (
                        <TabPagosFinanzas
                            configPagos={configPagos}
                            pasarelas={pasarelas}
                            operacionesPago={operacionesPago}
                            onGuardarConfigPagos={(datos) =>
                                ejecutarAccion(
                                    "GUARDAR_CONFIG_PAGOS",
                                    datos,
                                    "Configuración de pagos actualizada"
                                )
                            }
                            onGuardarPasarelaApi={(datos) =>
                                ejecutarAccion(
                                    "GUARDAR_PASARELA_API",
                                    datos,
                                    "Pasarela API actualizada"
                                )
                            }
                            onDecidirPagoManual={(operacionId, decision) =>
                                ejecutarAccion(
                                    "DECIDIR_PAGO_MANUAL",
                                    { operacionId, decision },
                                    `Pago ${decision}`
                                )
                            }
                        />
                    )}

                    {moduloActivo === "MOD_USUARIOS" && (
                        <TabUsuariosCorreos
                            usuarios={usuarios}
                            onGuardarUsuario={(datos) =>
                                ejecutarAccion(
                                    "ACTUALIZAR_USUARIO_O_CORREO",
                                    datos,
                                    "Usuario y correo actualizados"
                                )
                            }
                        />
                    )}
                </main>
            </div>
        </div>
    );
}