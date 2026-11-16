// src/components/home/CatalogoInteractivoLanding.tsx
"use client";

import { useState, useRef, useMemo } from "react";
import Link from "next/link";
import {
  Landmark,
  HardHat,
  HeartPulse,
  GraduationCap,
  Calculator,
  Cpu,
  PackageCheck,
  Briefcase,
  ShieldAlert,
  Sprout,
  Search,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  Award,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  PlayCircle,
  BookOpen,
  ClipboardCheck,
  Crown,
  MonitorPlay,
  X,
  UserCheck,
} from "lucide-react";

export interface ProgramaItemLanding {
  id: string;
  codigoInterno: string;
  titulo: string;
  slug: string;
  areaSlug: string;
  areaNombre: string;
  subcategoriaEtiqueta: string;
  tipoPrograma: "CURSO" | "DIPLOMADO" | "DIPLOMA" | "ESPECIALIZACION" | "TALLER" | "CAPACITACION";
  modalidad: "SINCRONO" | "ASINCRONO" | "HIBRIDO";
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

interface AreaPrincipalCard {
  slug: string;
  nombre: string;
  subtituloCorto: string;
  subcategorias: string[];
  colorBorde: string;
  colorFondoIcono: string;
  colorTextoIcono: string;
  badgeColor: string;
  Icono: typeof Landmark;
  principalCuatro: boolean;
}

export const AREAS_FORMACION: AreaPrincipalCard[] = [
  {
    slug: "gestion-publica",
    nombre: "Gestión Pública",
    subtituloCorto: "Sistemas Administrativos del Estado y Ley N.° 32069",
    subcategorias: [
      "Contrataciones Públicas (Ley 32069)",
      "Presupuesto Público",
      "SIAF SP-WEB",
      "SIGA MEF",
      "SEACE 3.0 y PLADICOP",
      "Invierte.pe",
      "Control Gubernamental",
    ],
    colorBorde: "hover:border-[#003399]",
    colorFondoIcono: "bg-[#003399]/10",
    colorTextoIcono: "text-[#003399]",
    badgeColor: "bg-[#003399] text-white",
    Icono: Landmark,
    principalCuatro: true,
  },
  {
    slug: "ingenieria",
    nombre: "Ingeniería",
    subtituloCorto: "Proyectos, Obras Públicas, BIM, Costos y Supervisión",
    subcategorias: [
      "Ingeniería Civil y Vial",
      "Ejecución y Liquidación de Obras",
      "Metodología BIM",
      "Costos, Presupuestos y Metrados",
      "Supervisión de Obras",
      "Ingeniería Ambiental e Industrial",
    ],
    colorBorde: "hover:border-amber-600",
    colorFondoIcono: "bg-amber-500/10",
    colorTextoIcono: "text-amber-700",
    badgeColor: "bg-amber-600 text-white",
    Icono: HardHat,
    principalCuatro: true,
  },
  {
    slug: "salud",
    nombre: "Salud",
    subtituloCorto: "Gestión Sanitaria, Salud Ocupacional y Práctica Clínica",
    subcategorias: [
      "Gestión Sanitaria y Hospitalaria",
      "Salud Ocupacional",
      "Auditoría Médica y Calidad en Salud",
      "Actualización Clínica",
      "Programas Presupuestales en Salud",
    ],
    colorBorde: "hover:border-emerald-600",
    colorFondoIcono: "bg-emerald-500/10",
    colorTextoIcono: "text-emerald-700",
    badgeColor: "bg-emerald-600 text-white",
    Icono: HeartPulse,
    principalCuatro: true,
  },
  {
    slug: "educacion",
    nombre: "Educación",
    subtituloCorto: "Docencia, Gestión Educativa, Currículo y TIC",
    subcategorias: [
      "Docencia Universitaria y Pedagógica",
      "Gestión y Dirección Educativa",
      "Evaluación por Competencias",
      "Tecnologías Educativas e IA en el Aula",
      "Psicopedagogía e Inclusión",
    ],
    colorBorde: "hover:border-indigo-600",
    colorFondoIcono: "bg-indigo-500/10",
    colorTextoIcono: "text-indigo-700",
    badgeColor: "bg-indigo-600 text-white",
    Icono: GraduationCap,
    principalCuatro: true,
  },
  // 6 áreas complementarias de la Tabla 3 (Catálogo completo de cursos y diplomados)
  {
    slug: "contabilidad-finanzas",
    nombre: "Contabilidad y Finanzas",
    subtituloCorto: "Tributación, contabilidad gubernamental, NICSP, planillas",
    subcategorias: ["Tributación", "Contabilidad Gubernamental", "NICSP", "PCGE", "Planillas"],
    colorBorde: "hover:border-sky-600",
    colorFondoIcono: "bg-sky-500/10",
    colorTextoIcono: "text-sky-700",
    badgeColor: "bg-sky-600 text-white",
    Icono: Calculator,
    principalCuatro: false,
  },
  {
    slug: "tecnologia-ia",
    nombre: "Tecnología e IA",
    subtituloCorto: "Inteligencia artificial, Excel avanzado, Power BI, programación",
    subcategorias: ["Inteligencia Artificial", "Excel Profesional", "Power BI y Analítica", "Programación"],
    colorBorde: "hover:border-violet-600",
    colorFondoIcono: "bg-violet-500/10",
    colorTextoIcono: "text-violet-700",
    badgeColor: "bg-violet-600 text-white",
    Icono: Cpu,
    principalCuatro: false,
  },
  {
    slug: "logistica-abastecimiento",
    nombre: "Logística y Abastecimiento",
    subtituloCorto: "Compras públicas, Perú Compras, almacenes e inventarios",
    subcategorias: ["Perú Compras", "Almacenes e Inventarios", "Cadena de Suministro", "Abastecimiento"],
    colorBorde: "hover:border-orange-600",
    colorFondoIcono: "bg-orange-500/10",
    colorTextoIcono: "text-orange-700",
    badgeColor: "bg-orange-600 text-white",
    Icono: PackageCheck,
    principalCuatro: false,
  },
  {
    slug: "administracion-empresas",
    nombre: "Administración y Empresas",
    subtituloCorto: "Recursos humanos, SERVIR, liderazgo y gestión por procesos",
    subcategorias: ["Recursos Humanos y SERVIR", "Liderazgo Directivo", "Marketing", "Emprendimiento"],
    colorBorde: "hover:border-blue-600",
    colorFondoIcono: "bg-blue-500/10",
    colorTextoIcono: "text-blue-700",
    badgeColor: "bg-blue-600 text-white",
    Icono: Briefcase,
    principalCuatro: false,
  },
  {
    slug: "seguridad-salud-trabajo",
    nombre: "Seguridad y Salud en el Trabajo",
    subtituloCorto: "IPERC, prevención de riesgos laborales y auditoría SST",
    subcategorias: ["Matriz IPERC", "Prevención de Riesgos", "Fiscalización SUNAFIL", "Auditoría SST"],
    colorBorde: "hover:border-rose-600",
    colorFondoIcono: "bg-rose-500/10",
    colorTextoIcono: "text-rose-700",
    badgeColor: "bg-rose-600 text-white",
    Icono: ShieldAlert,
    principalCuatro: false,
  },
  {
    slug: "agricultura-medio-ambiente",
    nombre: "Agricultura y Medio Ambiente",
    subtituloCorto: "Agronomía, gestión ambiental, OEFA y recursos naturales",
    subcategorias: ["Agronomía", "Gestión y Fiscalización Ambiental", "Recursos Naturales", "Saneamiento"],
    colorBorde: "hover:border-teal-600",
    colorFondoIcono: "bg-teal-500/10",
    colorTextoIcono: "text-teal-700",
    badgeColor: "bg-teal-600 text-white",
    Icono: Sprout,
    principalCuatro: false,
  },
];

interface Props {
  programas: ProgramaItemLanding[];
}

export default function CatalogoInteractivoLanding({ programas }: Props) {
  const [busqueda, setBusqueda] = useState("");
  const [areaSeleccionada, setAreaSeleccionada] = useState<string>("TODAS");
  const [subcategoriaSeleccionada, setSubcategoriaSeleccionada] = useState<string>("TODAS");
  const [tipoFiltro, setTipoFiltro] = useState<
    "TODOS" | "CURSOS" | "DIPLOMAS" | "ESPECIALIZACIONES" | "GRABADOS"
  >("TODOS");
  const [programaModal, setProgramaModal] = useState<ProgramaItemLanding | null>(null);

  const carruselRef = useRef<HTMLDivElement | null>(null);
  const catalogoSectionRef = useRef<HTMLElement | null>(null);

  const desplazarCarrusel = (direccion: "izq" | "der") => {
    if (!carruselRef.current) return;
    const desplazamiento = 310;
    carruselRef.current.scrollBy({
      left: direccion === "izq" ? -desplazamiento : desplazamiento,
      behavior: "smooth",
    });
  };

  const seleccionarEspecialidad = (slug: string) => {
    setAreaSeleccionada(slug);
    setSubcategoriaSeleccionada("TODAS");
    if (catalogoSectionRef.current) {
      catalogoSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const aplicarChipBusqueda = (termino: string) => {
    setBusqueda(termino);
    setAreaSeleccionada("TODAS");
    if (catalogoSectionRef.current) {
      catalogoSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const areaActivaObj = useMemo(
    () => AREAS_FORMACION.find((a) => a.slug === areaSeleccionada) || null,
    [areaSeleccionada]
  );

  const programasFiltrados = useMemo(() => {
    return programas.filter((item) => {
      const coincideArea =
        areaSeleccionada === "TODAS" || item.areaSlug === areaSeleccionada;

      const coincideSubcategoria =
        subcategoriaSeleccionada === "TODAS" ||
        item.subcategoriaEtiqueta.toLowerCase().includes(subcategoriaSeleccionada.toLowerCase()) ||
        item.titulo.toLowerCase().includes(subcategoriaSeleccionada.toLowerCase());

      const coincideTipo =
        tipoFiltro === "TODOS"
          ? true
          : tipoFiltro === "CURSOS"
          ? item.tipoPrograma === "CURSO" || item.tipoPrograma === "TALLER" || item.tipoPrograma === "CAPACITACION"
          : tipoFiltro === "DIPLOMAS"
          ? item.tipoPrograma === "DIPLOMA" || item.tipoPrograma === "DIPLOMADO"
          : tipoFiltro === "ESPECIALIZACIONES"
          ? item.tipoPrograma === "ESPECIALIZACION"
          : item.modalidad === "ASINCRONO";

      const texto = busqueda.trim().toLowerCase();
      const coincideTexto =
        !texto ||
        item.titulo.toLowerCase().includes(texto) ||
        item.subcategoriaEtiqueta.toLowerCase().includes(texto) ||
        item.areaNombre.toLowerCase().includes(texto) ||
        item.codigoInterno.toLowerCase().includes(texto);

      return coincideArea && coincideSubcategoria && coincideTipo && coincideTexto;
    });
  }, [programas, areaSeleccionada, subcategoriaSeleccionada, tipoFiltro, busqueda]);

  const cuatroAreasPrincipales = AREAS_FORMACION.filter((a) => a.principalCuatro);
  const seisAreasComplementarias = AREAS_FORMACION.filter((a) => !a.principalCuatro);

  return (
    <>
      {/* =================================================================== */}
      {/* 1. HERO INSTITUCIONAL CON BUSCADOR EN VIVO Y PRÓXIMOS INICIOS       */}
      {/* =================================================================== */}
      <section
        id="inicio"
        className="relative overflow-hidden text-white"
        style={{
          backgroundColor: "#00294D",
          backgroundImage:
            "radial-gradient(circle at 85% 15%, rgba(0, 82, 204, 0.55), rgba(0, 41, 77, 0) 60%), linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "100% 100%, 44px 44px, 44px 44px",
        }}
      >
        <div className="mx-auto max-w-7xl px-4 pt-10 pb-12 sm:px-6 lg:px-8 lg:pt-14 lg:pb-16">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
            {/* Columna Izquierda: Propuesta de Valor + Buscador + Chips */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex flex-wrap items-center gap-2.5 rounded-xl border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
                <span className="rounded-md bg-[#FFB800] px-2 py-0.5 text-[11px] font-extrabold text-[#00294D]">
                  ISO 9001:2015
                </span>
                <span>FORMACIÓN PROFESIONAL • PERÚ • CERTIFICADOS CON CÓDIGO QR</span>
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl sm:leading-[1.12]">
                Impulsa tu carrera con{" "}
                <span className="text-[#FFB800]">
                  Cursos, Diplomados y Simuladores
                </span>{" "}
                de alto nivel
              </h1>

              <p className="max-w-2xl text-base leading-relaxed text-[#E9EDF4] sm:text-lg">
                Programas 100% aplicables en Gestión Pública, Ingeniería, Salud y
                Educación, dictados en vivo por especialistas y con certificación válida
                para convocatorias del sector público (SERVIR / OECE) y privado.
              </p>

              {/* Buscador principal (Maqueta 2 + Desarrollo Global) */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (catalogoSectionRef.current) {
                    catalogoSectionRef.current.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="max-w-2xl space-y-3"
              >
                <div className="flex flex-col gap-2 rounded-2xl bg-white p-2 shadow-xl sm:flex-row sm:items-center">
                  <div className="flex flex-1 items-center gap-2.5 pl-3">
                    <Search className="h-5 w-5 shrink-0 text-slate-400" />
                    <input
                      type="search"
                      value={busqueda}
                      onChange={(e) => setBusqueda(e.target.value)}
                      placeholder="¿Qué deseas aprender? SIAF, SEACE, Ley 32069, Obras BIM, Salud, Educación..."
                      className="w-full bg-transparent py-2 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      className="w-full sm:w-auto rounded-xl bg-[#003399] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#002266]"
                    >
                      Explorar cursos
                    </button>
                    <a
                      href="#simulador-oece"
                      className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-slate-100 px-4 py-3 text-sm font-bold text-[#00294D] transition hover:bg-slate-200"
                    >
                      <ClipboardCheck className="h-4 w-4 text-[#003399]" />
                      <span>Simulador OECE</span>
                    </a>
                  </div>
                </div>

                {/* Chips de Más Buscados */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-semibold text-[#C9D4EC]">Más buscados:</span>
                  {[
                    "SIAF WEB",
                    "SEACE 3.0",
                    "Ley N° 32069",
                    "Perú Compras",
                    "Invierte.pe",
                    "Metodología BIM",
                    "Salud Ocupacional",
                    "Gestión Educativa",
                  ].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => aplicarChipBusqueda(chip)}
                      className="rounded-full border border-white/20 bg-white/10 px-3 py-1 font-medium text-white transition hover:border-[#FFB800] hover:bg-[#FFB800] hover:text-[#00294D]"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </form>

              <p className="text-sm text-[#C9D4EC]">
                ¿No sabes qué programa elegir?{" "}
                <a
                  href="https://wa.me/51983495578?text=Hola%2C%20deseo%20asesor%C3%ADa%20sobre%20los%20cursos%20y%20diplomados"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-[#FFB800] underline underline-offset-4 hover:text-white"
                >
                  Habla con un asesor académico por WhatsApp →
                </a>
              </p>
            </div>

            {/* Columna Derecha: Tarjeta Destacada Próximos Inicios en Vivo */}
            <div className="lg:col-span-5">
              <div className="rounded-3xl border border-white/15 bg-gradient-to-br from-[#003399] to-[#001F3F] p-6 shadow-2xl">
                <div className="flex items-center justify-between border-b border-white/15 pb-4">
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#FFB800] px-3 py-1 text-xs font-extrabold text-[#00294D]">
                    <Sparkles className="h-3.5 w-3.5" />
                    PRÓXIMOS INICIOS EN VIVO
                  </span>
                  <span className="text-xs font-semibold text-[#C9D4EC]">
                    Vacantes limitadas
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  {programas.slice(0, 3).map((prog) => (
                    <div
                      key={prog.id}
                      className="group rounded-2xl border border-white/10 bg-white/5 p-3.5 transition hover:border-[#FFB800]/60 hover:bg-white/10"
                    >
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className="text-[#FFB800]">
                          {prog.tipoPrograma} • {prog.areaNombre.toUpperCase()}
                        </span>
                        <span className="rounded bg-white/15 px-2 py-0.5 text-white">
                          Inicio: {prog.fechaInicioTexto}
                        </span>
                      </div>
                      <h3 className="mt-1.5 text-sm font-bold text-white group-hover:text-[#FFB800]">
                        {prog.titulo}
                      </h3>
                      <div className="mt-2.5 flex items-center justify-between text-xs text-[#C9D4EC]">
                        <span>
                          {prog.horasAcademicas} hrs • {prog.creditos} créditos
                        </span>
                        <button
                          type="button"
                          onClick={() => setProgramaModal(prog)}
                          className="font-bold text-white underline decoration-[#FFB800] underline-offset-4 hover:text-[#FFB800]"
                        >
                          Ver sílabo →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex items-center justify-between rounded-2xl bg-[#001830] px-4 py-3 text-xs">
                  <div>
                    <span className="block font-bold text-white">
                      Simulador Examen OECE 2026
                    </span>
                    <span className="text-[#C9D4EC]">
                      Planes Básico, Plus y Premium disponibles
                    </span>
                  </div>
                  <a
                    href="#simulador-oece"
                    className="rounded-xl bg-[#FFB800] px-3.5 py-2 font-extrabold text-[#00294D] hover:bg-amber-400"
                  >
                    Practicar
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Barra de Respaldo Institucional (En cifras) */}
          <div className="mt-12 grid grid-cols-2 gap-4 rounded-2xl border border-white/15 bg-white/5 p-5 backdrop-blur-sm sm:grid-cols-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FFB800]/20 text-[#FFB800]">
                <UserCheck className="h-6 w-6" />
              </div>
              <div>
                <p className="text-lg font-extrabold text-white">+50,000</p>
                <p className="text-xs text-[#C9D4EC]">Alumnos certificados</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FFB800]/20 text-[#FFB800]">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <p className="text-lg font-extrabold text-white">+15 años</p>
                <p className="text-xs text-[#C9D4EC]">Capacitando profesionales</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FFB800]/20 text-[#FFB800]">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <p className="text-lg font-extrabold text-white">ISO 9001:2015</p>
                <p className="text-xs text-[#C9D4EC]">Calidad certificada con QR</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FFB800]/20 text-[#FFB800]">
                <PlayCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-lg font-extrabold text-white">Aula 24/7</p>
                <p className="text-xs text-[#C9D4EC]">Clases en vivo y grabadas</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================================== */}
      {/* 2. CINTILLO DE ENTIDADES Y ACCESOS RÁPIDOS (MAQUETA SECCIÓN 2)      */}
      {/* =================================================================== */}
      <section className="border-b border-slate-200 bg-white py-5">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
            Capacitamos a servidores de:
          </span>
          <div className="flex flex-wrap items-center gap-6 text-xs font-extrabold tracking-wide text-slate-600">
            <span className="rounded-lg bg-slate-100 px-3 py-1.5">MEF • SIAF</span>
            <span className="rounded-lg bg-slate-100 px-3 py-1.5">MINEDU</span>
            <span className="rounded-lg bg-slate-100 px-3 py-1.5">OECE / SEACE</span>
            <span className="rounded-lg bg-slate-100 px-3 py-1.5">ESSALUD / MINSA</span>
            <span className="rounded-lg bg-slate-100 px-3 py-1.5">SUNARP</span>
            <span className="rounded-lg bg-slate-100 px-3 py-1.5">OSINERGMIN</span>
            <span className="rounded-lg bg-slate-100 px-3 py-1.5">GOBIERNOS REGIONALES</span>
          </div>
        </div>
      </section>

      {/* 4 Accesos Rápidos (Maqueta Página de Inicio: Estudiar, Practicar, Membresía, Aula Virtual) */}
      <section className="bg-slate-50 pt-10 pb-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <a
              href="#cursos-y-diplomados"
              className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-[#003399] hover:shadow-md"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#003399] group-hover:bg-[#003399] group-hover:text-white transition">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Cursos y diplomados
                </h3>
                <p className="mt-0.5 text-xs text-slate-600">
                  Aprende a tu ritmo o en vivo por especialidad.
                </p>
              </div>
            </a>

            <a
              href="#simulador-oece"
              className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-600 hover:shadow-md"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition">
                <ClipboardCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Simulador OECE
                </h3>
                <p className="mt-0.5 text-xs text-slate-600">
                  Practica tus conocimientos con banco actualizado.
                </p>
              </div>
            </a>

            <a
              href="#membresias"
              className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-amber-500 hover:shadow-md"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition">
                <Crown className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Membresía Anual / Semestral
                </h3>
                <p className="mt-0.5 text-xs text-slate-600">
                  Accede a todos los cursos y beneficios exclusivos.
                </p>
              </div>
            </a>

            <Link
              href="/login"
              className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-violet-600 hover:shadow-md"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600 group-hover:bg-violet-600 group-hover:text-white transition">
                <MonitorPlay className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Aula virtual
                </h3>
                <p className="mt-0.5 text-xs text-slate-600">
                  Continúa tus capacitaciones, exámenes y diplomas.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* =================================================================== */}
      {/* 3. SECCIÓN PRINCIPAL: "CURSOS Y DIPLOMADOS" CON 4 TARJETAS          */}
      {/*    DESLIZABLES (MÓVIL) / CUADRÍCULA DE 4 (ESCRITORIO)               */}
      {/* =================================================================== */}
      <section
        id="cursos-y-diplomados"
        ref={catalogoSectionRef}
        className="scroll-mt-20 bg-slate-50 py-12"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Cabecera de Especialidades + Controles de Deslizador Móvil */}
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#003399]">
                Áreas de Especialización Académica
              </span>
              <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                CURSOS Y DIPLOMADOS POR ESPECIALIDAD
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Selecciona una de nuestras 4 áreas principales o desliza para filtrar
                inmediatamente la oferta académica disponible.
              </p>
            </div>

            {/* Botones de desplazamiento para celulares / tablets */}
            <div className="flex items-center gap-2 lg:hidden">
              <span className="text-xs font-semibold text-slate-500 mr-1">
                Deslizar áreas:
              </span>
              <button
                type="button"
                onClick={() => desplazarCarrusel("izq")}
                aria-label="Anterior especialidad"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 shadow-sm hover:bg-slate-100"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => desplazarCarrusel("der")}
                aria-label="Siguiente especialidad"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 shadow-sm hover:bg-slate-100"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* 4 TARJETAS CON ÍCONOS: GESTIÓN PÚBLICA, INGENIERÍA, SALUD Y EDUCACIÓN */}
          {/* En móvil: Carrusel horizontal deslizable (snap-x). En PC (lg): Cuadrícula de 4 columnas */}
          <div
            ref={carruselRef}
            className="mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 lg:grid lg:grid-cols-4 lg:overflow-visible lg:pb-0"
          >
            {cuatroAreasPrincipales.map((area) => {
              const IconoArea = area.Icono;
              const activa = areaSeleccionada === area.slug;
              const cantidadCursosArea = programas.filter(
                (p) => p.areaSlug === area.slug
              ).length;

              return (
                <button
                  key={area.slug}
                  type="button"
                  onClick={() =>
                    seleccionarEspecialidad(activa ? "TODAS" : area.slug)
                  }
                  className={`group min-w-[285px] snap-start text-left rounded-2xl border-2 p-5 transition-all flex flex-col justify-between lg:min-w-0 ${
                    activa
                      ? "border-[#003399] bg-[#00294D] text-white shadow-xl"
                      : `border-slate-200 bg-white text-slate-900 shadow-sm ${area.colorBorde} hover:shadow-md`
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <div
                        className={`flex h-13 w-13 items-center justify-center rounded-2xl p-3 transition ${
                          activa
                            ? "bg-[#FFB800] text-[#00294D]"
                            : `${area.colorFondoIcono} ${area.colorTextoIcono}`
                        }`}
                      >
                        <IconoArea className="h-7 w-7" />
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-extrabold ${
                          activa
                            ? "bg-white/15 text-[#FFB800]"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {cantidadCursosArea} programas
                      </span>
                    </div>

                    <h3
                      className={`mt-4 text-lg font-extrabold ${
                        activa ? "text-white" : "text-slate-900"
                      }`}
                    >
                      {area.nombre}
                    </h3>
                    <p
                      className={`mt-1 text-xs leading-relaxed ${
                        activa ? "text-slate-200" : "text-slate-600"
                      }`}
                    >
                      {area.subtituloCorto}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {area.subcategorias.slice(0, 3).map((sub) => (
                        <span
                          key={sub}
                          className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${
                            activa
                              ? "bg-white/10 text-slate-200"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div
                    className={`mt-5 flex items-center justify-between border-t pt-3 text-xs font-bold ${
                      activa
                        ? "border-white/15 text-[#FFB800]"
                        : "border-slate-100 text-[#003399]"
                    }`}
                  >
                    <span>
                      {activa ? "Mostrando especialidad" : "Ver cursos y diplomas"}
                    </span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Explorador adicional con las otras 6 áreas de la Tabla 3 */}
          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Más áreas de capacitación:
              </span>
              {areaSeleccionada !== "TODAS" && (
                <button
                  type="button"
                  onClick={() => {
                    setAreaSeleccionada("TODAS");
                    setSubcategoriaSeleccionada("TODAS");
                  }}
                  className="text-xs font-bold text-rose-600 hover:underline"
                >
                  Restablecer filtro de especialidad ✕
                </button>
              )}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
              {seisAreasComplementarias.map((area) => {
                const IconoComp = area.Icono;
                const activa = areaSeleccionada === area.slug;
                return (
                  <button
                    key={area.slug}
                    type="button"
                    onClick={() =>
                      seleccionarEspecialidad(activa ? "TODAS" : area.slug)
                    }
                    className={`flex items-center gap-2.5 rounded-xl border p-2.5 text-left text-xs font-bold transition ${
                      activa
                        ? "border-[#003399] bg-[#00294D] text-white"
                        : "border-slate-200 bg-slate-50 text-slate-800 hover:border-slate-300 hover:bg-white"
                    }`}
                  >
                    <IconoComp
                      className={`h-4 w-4 shrink-0 ${
                        activa ? "text-[#FFB800]" : area.colorTextoIcono
                      }`}
                    />
                    <span className="line-clamp-1">{area.nombre}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subcategorías desplegables cuando hay un área seleccionada (Maqueta 3) */}
          {areaActivaObj && (
            <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-blue-200 bg-blue-50/70 px-4 py-3">
              <span className="text-xs font-extrabold text-[#00294D]">
                Subcategorías en {areaActivaObj.nombre}:
              </span>
              <button
                type="button"
                onClick={() => setSubcategoriaSeleccionada("TODAS")}
                className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                  subcategoriaSeleccionada === "TODAS"
                    ? "bg-[#003399] text-white"
                    : "bg-white text-slate-700 hover:bg-slate-100"
                }`}
              >
                Todas
              </button>
              {areaActivaObj.subcategorias.map((sub) => (
                <button
                  key={sub}
                  type="button"
                  onClick={() => setSubcategoriaSeleccionada(sub)}
                  className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                    subcategoriaSeleccionada === sub
                      ? "bg-[#003399] text-white"
                      : "bg-white text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          )}

          {/* Barra de Pestañas por Tipo de Programa (Todos / Cursos / Diplomas / Especializaciones / Grabados) */}
          <div className="mt-8 flex flex-col justify-between gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-center">
            <div
              role="group"
              aria-label="Filtrar por tipo de programa"
              className="inline-flex flex-wrap gap-1.5 rounded-xl bg-slate-200/80 p-1.5"
            >
              {(
                [
                  { id: "TODOS", label: "Todos los programas" },
                  { id: "CURSOS", label: "Cursos especializados" },
                  { id: "DIPLOMAS", label: "Diplomados y Diplomas" },
                  { id: "ESPECIALIZACIONES", label: "Especializaciones" },
                  { id: "GRABADOS", label: "24/7 Grabados" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setTipoFiltro(tab.id)}
                  className={`rounded-lg px-4 py-2 text-xs font-extrabold transition ${
                    tipoFiltro === tab.id
                      ? "bg-[#00294D] text-white shadow-sm"
                      : "text-slate-700 hover:bg-white/60"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <p className="text-sm font-bold text-slate-700">
              Mostrando{" "}
              <span className="text-[#003399]">{programasFiltrados.length}</span>{" "}
              programas disponibles
            </p>
          </div>

          {/* GRILLA DE TARJETAS DEL CATÁLOGO POR ESPECIALIDAD */}
          {programasFiltrados.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-12 text-center">
              <p className="text-base font-bold text-slate-900">
                No encontramos programas que coincidan exactamente con tu filtro.
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Prueba seleccionando &ldquo;Todos los programas&rdquo; o cambiando de área de
                especialidad.
              </p>
              <button
                type="button"
                onClick={() => {
                  setAreaSeleccionada("TODAS");
                  setSubcategoriaSeleccionada("TODAS");
                  setTipoFiltro("TODOS");
                  setBusqueda("");
                }}
                className="mt-4 rounded-xl bg-[#003399] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#002266]"
              >
                Ver todo el catálogo académico
              </button>
            </div>
          ) : (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {programasFiltrados.map((prog) => (
                <article
                  key={prog.id}
                  className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-[#003399]/50 hover:shadow-xl"
                >
                  <div>
                    {/* Cabecera visual de la tarjeta del curso/diplomado */}
                    <div
                      className="relative p-5 text-white"
                      style={{
                        background:
                          prog.tipoPrograma === "DIPLOMADO" ||
                          prog.tipoPrograma === "DIPLOMA"
                            ? "linear-gradient(135deg, #00294D 0%, #004182 100%)"
                            : prog.areaSlug === "ingenieria"
                            ? "linear-gradient(135deg, #1E293B 0%, #334155 100%)"
                            : prog.areaSlug === "salud"
                            ? "linear-gradient(135deg, #064E3B 0%, #047857 100%)"
                            : prog.areaSlug === "educacion"
                            ? "linear-gradient(135deg, #312E81 0%, #4338CA 100%)"
                            : "linear-gradient(135deg, #003399 0%, #00294D 100%)",
                      }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="rounded-md bg-[#FFB800] px-2.5 py-0.5 text-[11px] font-extrabold text-[#00294D]">
                          {prog.tipoPrograma}
                        </span>
                        <span className="rounded-md bg-white/15 px-2.5 py-0.5 text-[11px] font-semibold text-white">
                          {prog.modalidad === "SINCRONO"
                            ? "EN VIVO + GRABADO"
                            : prog.modalidad === "HIBRIDO"
                            ? "HÍBRIDO"
                            : "24/7 ASÍNCRONO"}
                        </span>
                      </div>

                      <p className="mt-3 text-xs font-bold uppercase tracking-wider text-amber-300">
                        {prog.areaNombre} • {prog.subcategoriaEtiqueta}
                      </p>
                      <h3 className="mt-1 line-clamp-2 text-lg font-extrabold leading-snug text-white">
                        {prog.titulo}
                      </h3>
                    </div>

                    {/* Cuerpo con especificaciones requeridas: Modalidad, Duración, Fechas, Docente y Certificación */}
                    <div className="p-5 space-y-3">
                      <p className="line-clamp-2 text-xs leading-relaxed text-slate-600">
                        {prog.resumen}
                      </p>

                      <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-700">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4 shrink-0 text-[#003399]" />
                          <span>
                            <strong>{prog.horasAcademicas} hrs</strong> ({prog.creditos}{" "}
                            créd.)
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4 shrink-0 text-[#003399]" />
                          <span>Inicio: {prog.fechaInicioTexto}</span>
                        </div>
                        <div className="col-span-2 flex items-center gap-1.5 pt-1 border-t border-slate-200/70">
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                          <span>
                            Certificado verificable con QR • Válido SERVIR / OECE
                          </span>
                        </div>
                      </div>

                      <div className="text-xs text-slate-600">
                        <span className="font-semibold text-slate-800">Docente:</span>{" "}
                        {prog.docenteNombre}
                      </div>
                    </div>
                  </div>

                  {/* Pie de tarjeta: Precio y Botones de Inscripción / Ver Programa */}
                  <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-4 flex items-center justify-between gap-2">
                    <div>
                      {prog.precioOferta ? (
                        <div>
                          <span className="block text-[11px] text-slate-400 line-through">
                            Normal: S/ {prog.precioBase.toFixed(2)}
                          </span>
                          <span className="text-xl font-extrabold text-[#00294D]">
                            S/ {prog.precioOferta.toFixed(2)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xl font-extrabold text-[#00294D]">
                          S/ {prog.precioBase.toFixed(2)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setProgramaModal(prog)}
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
                      >
                        Ver programa
                      </button>
                      <Link
                        href={`/checkout?curso=${prog.slug}`}
                        className="rounded-xl bg-[#003399] px-4 py-2 text-xs font-extrabold text-white shadow-sm transition hover:bg-[#002266]"
                      >
                        Inscribirme
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* =================================================================== */}
      {/* MODAL DE VISTA RÁPIDA DE SÍLABO Y TEMARIO DEL PROGRAMA              */}
      {/* =================================================================== */}
      {programaModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
        >
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
            <button
              type="button"
              onClick={() => setProgramaModal(null)}
              className="absolute right-5 top-5 rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-slate-200"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
              <span className="rounded-md bg-[#00294D] px-2.5 py-1 text-white">
                {programaModal.tipoPrograma}
              </span>
              <span className="rounded-md bg-blue-50 px-2.5 py-1 text-[#003399]">
                {programaModal.areaNombre} • {programaModal.subcategoriaEtiqueta}
              </span>
              <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-emerald-700">
                Código: {programaModal.codigoInterno}
              </span>
            </div>

            <h3 className="mt-3 text-2xl font-extrabold text-slate-900">
              {programaModal.titulo}
            </h3>
            <p className="mt-2 text-sm text-slate-600">{programaModal.resumen}</p>

            <div className="mt-5 grid grid-cols-2 gap-3 rounded-2xl bg-slate-50 p-4 text-xs sm:grid-cols-4">
              <div>
                <span className="block text-slate-500">Duración</span>
                <strong className="text-slate-900">
                  {programaModal.horasAcademicas} horas académicas
                </strong>
              </div>
              <div>
                <span className="block text-slate-500">Inicio de clases</span>
                <strong className="text-slate-900">
                  {programaModal.fechaInicioTexto}
                </strong>
              </div>
              <div>
                <span className="block text-slate-500">Horario</span>
                <strong className="text-slate-900">
                  {programaModal.horarioTexto}
                </strong>
              </div>
              <div>
                <span className="block text-slate-500">Certificación</span>
                <strong className="text-emerald-700">Digital y Físico con QR</strong>
              </div>
            </div>

            <div className="mt-5">
              <h4 className="text-sm font-extrabold uppercase tracking-wider text-slate-900">
                Módulos y Contenido Temático:
              </h4>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                {programaModal.modulosPrincipales.map((mod, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 rounded-xl border border-slate-200/80 bg-slate-50/50 p-3"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#003399] text-[11px] font-bold text-white">
                      {idx + 1}
                    </span>
                    <span className="font-medium">{mod}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-5 sm:flex-row">
              <div>
                <span className="block text-xs text-slate-500">
                  Inversión promocional (Acepta Tarjeta, Yape, Plin o Depósito):
                </span>
                <span className="text-2xl font-extrabold text-[#00294D]">
                  S/{" "}
                  {(programaModal.precioOferta ?? programaModal.precioBase).toFixed(2)}
                </span>
              </div>
              <div className="flex w-full gap-3 sm:w-auto">
                <Link
                  href={`/checkout?curso=${programaModal.slug}`}
                  className="flex-1 sm:flex-initial rounded-xl bg-[#003399] px-6 py-3 text-center text-sm font-extrabold text-white hover:bg-[#002266]"
                >
                  Inscribirme ahora
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}