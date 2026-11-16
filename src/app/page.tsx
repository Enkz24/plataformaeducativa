// src/app/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AuthHeaderActions from "@/components/auth/AuthHeaderActions";
import VerificadorCertificado from "@/components/certificados/VerificadorCertificado";
import CatalogoInteractivoLanding, {
  ProgramaItemLanding,
} from "@/components/home/CatalogoInteractivoLanding";
import {
  GraduationCap,
  ShieldCheck,
  CheckCircle,
  Layers,
  Building2,
  ClipboardCheck,
  CreditCard,
  Award,
  MessageCircle,
  ArrowRight,
  FileWarning,
  Search,
  Settings,
  Sparkles,
  BookOpen,
  KeyRound,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface HomePageProps {
  searchParams?: {
    vista?: string;
  };
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const verComoPublico = searchParams?.vista === "publica";

  // =========================================================================
  // 1. VERIFICACIÓN DE SESIÓN, ONBOARDING DE PERFIL Y REDIRECCIÓN POR ROL
  // =========================================================================
  const session = await getServerSession(authOptions);
  let usuarioActual: {
    id: string;
    rol: string;
    perfilCompletado: boolean;
    dni: string | null;
    nombres: string | null;
    apellidos: string | null;
    email: string;
  } | null = null;

  if (session?.user?.email) {
    try {
      usuarioActual = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: {
          id: true,
          rol: true,
          perfilCompletado: true,
          dni: true,
          nombres: true,
          apellidos: true,
          email: true,
        },
      });
    } catch {
      usuarioActual = null;
    }

    if (usuarioActual && !verComoPublico) {
      // A. Si es ADMINISTRADOR, va directo al módulo de Configuración General
      if (usuarioActual.rol === "ADMINISTRADOR") {
        redirect("/admin/configuracion");
      }

      // B. Todo usuario (Estudiante, Docente, Asistente) que aún no haya llenado DNI, Nombres y Apellidos debe completar su ficha primero
      const faltaDatosCertificado =
        !usuarioActual.perfilCompletado ||
        !usuarioActual.dni ||
        !usuarioActual.nombres ||
        !usuarioActual.apellidos;

      if (faltaDatosCertificado) {
        redirect("/completar-perfil");
      }

      // C. Redirección automática según el rol para que vea únicamente lo que le corresponde
      if (
        usuarioActual.rol === "ASISTENTE_ADMINISTRATIVO" ||
        usuarioActual.rol === "CONTADURIA" ||
        usuarioActual.rol === "SECRETARIA"
      ) {
        redirect("/admin");
      }

      if (usuarioActual.rol === "PROFESOR") {
        redirect("/docente");
      }

      if (usuarioActual.rol === "ESTUDIANTE") {
        redirect("/aula-virtual");
      }
    }
  }

  // =========================================================================
  // 2. CARGA DE CONFIGURACIÓN GENERAL, SLIDERS, SECCIONES/CURSOS, MEMBRESÍAS Y SIMULADORES
  // =========================================================================
  let configSitio = {
    nombreEmpresa: "AULA PROFESIONAL",
    subtituloEmpresa: "Escuela de Gestión y Especialización",
    logoUrl: "/empresa/logo.png",
    telefonoWhatsappAsesoria: "51983495578",
    telefonoWhatsappAlumnos: "51990945941",
    telefonoWhatsappCambioCorreo: "51949329563",
    mensajeBaseCambioCorreo:
      "Hola, ya no tengo acceso a mi correo Gmail registrado y solicito restaurar mi cuenta a este nuevo correo:",
    mostrarCintilloSuperior: true,
    textoCintilloSuperior:
      "Plataforma de Capacitación, Membresías y Simulador de Examen OECE (Ley N.° 32069) con Certificación QR",
  };

  let slidersActivos: {
    id: string;
    titulo: string;
    subtitulo: string | null;
    etiquetaSuperior: string | null;
    imagenFondoUrl: string;
    textoBotonPrincipal: string;
    enlaceBotonPrincipal: string;
    textoBotonSecundario: string | null;
    enlaceBotonSecundario: string | null;
  }[] = [];

  let programasParaMostrar: ProgramaItemLanding[] = [];

  let planesMembresiaBD: {
    id: string;
    codigo: string;
    nombre: string;
    periodo: string;
    etiquetaDuracionTexto: string;
    imagenPortada: string | null;
    descripcion: string;
    precio: number;
    duracionDias: number;
    incluyeSimuladorOECE: boolean;
    cantidadPreguntasSimulador: number;
    incluyeCertificados: boolean;
    destacado: boolean;
  }[] = [];

  let planesSimulacroBD: {
    id: string;
    codigo: string;
    nombre: string;
    nivel: string;
    imagenPortada: string | null;
    descripcion: string;
    precio: number;
    duracionDiasVigencia: number;
    intentosMaximosSimulacro: number;
    cantidadPreguntasHabilitadas: number;
    habilitarDemoEnInicio: boolean;
    cantidadPreguntasDemo: number;
  }[] = [];

  try {
    const [
      configEnBD,
      slidersEnBD,
      seccionesVisiblesEnBD,
      cursosSinSeccionEnBD,
      membresiasEnBD,
      simulacrosEnBD,
    ] = await Promise.all([
      prisma.configuracionSitio.findUnique({
        where: { clave: "PRINCIPAL" },
      }),
      prisma.sliderPortada.findMany({
        where: { activo: true },
        orderBy: { orden: "asc" },
      }),
      // Primero obtenemos las Secciones activas de Temporadas activas configuradas para verse en la página principal
      prisma.seccionCursoTemporada.findMany({
        where: {
          activa: true,
          visibleEnInicio: true,
          cerradoSoloInvitados: false,
          temporada: { activa: true },
        },
        include: {
          temporada: true,
          docente: {
            select: { name: true, nombres: true, apellidos: true, cargoActual: true },
          },
          curso: {
            include: {
              categoria: true,
              profesor: {
                select: {
                  name: true,
                  nombres: true,
                  apellidos: true,
                  cargoActual: true,
                },
              },
              modulos: {
                select: { titulo: true },
                orderBy: { orden: "asc" },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      // También permitimos mostrar cursos maestros publicados si el admin los marcó como destacados directamente
      prisma.cursoPrograma.findMany({
        where: {
          estado: "PUBLICADO",
          destacadoEnInicio: true,
        },
        include: {
          categoria: true,
          profesor: {
            select: { name: true, nombres: true, apellidos: true, cargoActual: true },
          },
          modulos: {
            select: { titulo: true },
            orderBy: { orden: "asc" },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.planSuscripcionCatalogo.findMany({
        where: { activo: true },
        orderBy: { orden: "asc" },
      }),
      prisma.planSimulacroOECE.findMany({
        where: { activo: true, visibleEnInicio: true },
        orderBy: { precio: "asc" },
      }),
    ]);

    if (configEnBD) {
      configSitio = {
        nombreEmpresa: configEnBD.nombreEmpresa,
        subtituloEmpresa: configEnBD.subtituloEmpresa,
        logoUrl: configEnBD.logoUrl ?? "/empresa/logo.png",
        telefonoWhatsappAsesoria: configEnBD.telefonoWhatsappAsesoria,
        telefonoWhatsappAlumnos: configEnBD.telefonoWhatsappAlumnos,
        telefonoWhatsappCambioCorreo: configEnBD.telefonoWhatsappCambioCorreo,
        mensajeBaseCambioCorreo: configEnBD.mensajeBaseCambioCorreo,
        mostrarCintilloSuperior: configEnBD.mostrarCintilloSuperior,
        textoCintilloSuperior:
          configEnBD.textoCintilloSuperior ?? configSitio.textoCintilloSuperior,
      };
    }

    slidersActivos = slidersEnBD;

    // Mapeamos las secciones configuradas por temporada (con su precio por sección, modalidad y sesiones habilitadas)
    const mapeadosDesdeSecciones: ProgramaItemLanding[] = seccionesVisiblesEnBD.map(
      (sec) => {
        const docenteObj = sec.docente ?? sec.curso.profesor;
        const nombreDocente = sec.llevaDocente
          ? docenteObj?.name ??
          (`${docenteObj?.nombres ?? ""} ${docenteObj?.apellidos ?? ""}`.trim() ||
            "Docente Especialista")
          : "Modalidad 100% Grabada (Autoaprendizaje)";

        return {
          id: sec.id,
          codigoInterno: `${sec.curso.codigoInterno} • ${sec.nombreSeccion}`,
          titulo: `${sec.curso.titulo} (${sec.nombreSeccion})`,
          slug: `${sec.curso.slug}?seccion=${sec.codigoSeccion}`,
          areaSlug: sec.curso.categoria.slug,
          areaNombre: sec.curso.categoria.nombre,
          subcategoriaEtiqueta:
            sec.curso.subcategoriaEtiqueta ??
            `${sec.temporada.nombre} • ${sec.cantidadSesionesHabilitadas} sesiones`,
          tipoPrograma:
            sec.curso.tipoPrograma === "SIMULACRO_OECE"
              ? "CURSO"
              : sec.curso.tipoPrograma,
          modalidad: sec.modalidadSeccion,
          horasAcademicas:
            sec.horasAcreditadasSeccion ?? sec.curso.horasAcademicas,
          creditos: Number(
            sec.creditosAcreditadosSeccion ?? sec.curso.creditos ?? 0
          ),
          precioBase: Number(sec.precioSeccion),
          precioOferta: sec.precioOfertaSeccion
            ? Number(sec.precioOfertaSeccion)
            : null,
          fechaInicioTexto: sec.fechaInicioSeccion
            ? new Date(sec.fechaInicioSeccion).toLocaleDateString("es-PE", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
            : sec.temporada.nombre,
          horarioTexto:
            sec.horarioSeccionTexto ??
            sec.curso.horarioTexto ??
            "Aula Virtual 24/7",
          docenteNombre: nombreDocente,
          docenteCargo: sec.llevaDocente
            ? docenteObj?.cargoActual ?? "Especialista Acreditado"
            : `${sec.cantidadSesionesHabilitadas} sesiones habilitadas`,
          resumen: sec.curso.resumen,
          modulosPrincipales:
            sec.curso.modulos.length > 0
              ? sec.curso.modulos.map((m) => m.titulo)
              : ["Temario configurado en la sección"],
        };
      }
    );

    const cursosYaIncluidosIds = new Set(
      seccionesVisiblesEnBD.map((s) => s.cursoId)
    );

    const mapeadosDesdeCursosBase: ProgramaItemLanding[] = cursosSinSeccionEnBD
      .filter((c) => !cursosYaIncluidosIds.has(c.id))
      .map((c) => ({
        id: c.id,
        codigoInterno: c.codigoInterno,
        titulo: c.titulo,
        slug: c.slug,
        areaSlug: c.categoria.slug,
        areaNombre: c.categoria.nombre,
        subcategoriaEtiqueta: c.subcategoriaEtiqueta ?? c.categoria.nombre,
        tipoPrograma:
          c.tipoPrograma === "SIMULACRO_OECE" ? "CURSO" : c.tipoPrograma,
        modalidad: c.modalidad,
        horasAcademicas: c.horasAcademicas,
        creditos: Number(c.creditos ?? 0),
        precioBase: Number(c.precioBase),
        precioOferta: c.precioOferta ? Number(c.precioOferta) : null,
        fechaInicioTexto: c.fechaInicioClases
          ? new Date(c.fechaInicioClases).toLocaleDateString("es-PE", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
          : "Próxima temporada",
        horarioTexto: c.horarioTexto ?? "Horario según sección",
        docenteNombre:
          c.profesor.name ??
          (`${c.profesor.nombres ?? ""} ${c.profesor.apellidos ?? ""}`.trim() ||
            "Especialista Acreditado"),
        docenteCargo: c.profesor.cargoActual ?? "Especialista Senior",
        resumen: c.resumen,
        modulosPrincipales:
          c.modulos.length > 0
            ? c.modulos.map((m) => m.titulo)
            : ["Módulos configurables por temporada y sección"],
      }));

    programasParaMostrar = [
      ...mapeadosDesdeSecciones,
      ...mapeadosDesdeCursosBase,
    ];

    planesMembresiaBD = membresiasEnBD.map((m) => ({
      id: m.id,
      codigo: m.codigo,
      nombre: m.nombre,
      periodo: m.periodo,
      etiquetaDuracionTexto: m.etiquetaDuracionTexto,
      imagenPortada: m.imagenPortada,
      descripcion: m.descripcion,
      precio: Number(m.precio),
      duracionDias: m.duracionDias,
      incluyeSimuladorOECE: m.incluyeSimuladorOECE,
      cantidadPreguntasSimulador: m.cantidadPreguntasSimulador,
      incluyeCertificados: m.incluyeCertificados,
      destacado: m.destacado,
    }));

    planesSimulacroBD = simulacrosEnBD.map((s) => ({
      id: s.id,
      codigo: s.codigo,
      nombre: s.nombre,
      nivel: s.nivel,
      imagenPortada: s.imagenPortada,
      descripcion: s.descripcion,
      precio: Number(s.precio),
      duracionDiasVigencia: s.duracionDiasVigencia,
      intentosMaximosSimulacro: s.intentosMaximosSimulacro,
      cantidadPreguntasHabilitadas: s.cantidadPreguntasHabilitadas,
      habilitarDemoEnInicio: s.habilitarDemoEnInicio,
      cantidadPreguntasDemo: s.cantidadPreguntasDemo,
    }));
  } catch {
    // Si aún no se ha corrido prisma db push, mantiene los arreglos vacíos sin lanzar error 500
  }

  const simulacroConDemo = planesSimulacroBD.find((s) => s.habilitarDemoEnInicio);
  const urlWhatsappCambioCorreo = `https://wa.me/${configSitio.telefonoWhatsappCambioCorreo
    }?text=${encodeURIComponent(configSitio.mensajeBaseCambioCorreo)}`;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      {/* =================================================================== */}
      {/* BARRA SUPERIOR DE PREVISUALIZACIÓN SI EL ADMIN ENTRA CON ?vista=publica */}
      {/* =================================================================== */}
      {usuarioActual?.rol === "ADMINISTRADOR" && (
        <div className="bg-emerald-900 text-white px-4 py-2 text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-300" />
            <span>
              Modo Vista Pública activo — Estás viendo la portada como visitante.
            </span>
          </div>
          <Link
            href="/admin/configuracion"
            className="inline-flex items-center gap-1.5 rounded-lg bg-amber-400 px-3 py-1 text-slate-950 font-extrabold hover:bg-amber-300"
          >
            <Settings className="h-3.5 w-3.5" />
            <span>Ir al Panel de Configuración</span>
          </Link>
        </div>
      )}

      {/* =================================================================== */}
      {/* CINTILLO SUPERIOR CONFIGURABLE                                      */}
      {/* =================================================================== */}
      {configSitio.mostrarCintilloSuperior && (
        <div className="bg-[#001830] text-white border-b border-white/10">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-2 text-xs sm:px-6 lg:px-8">
            <div className="flex items-center gap-2">
              <span className="rounded bg-[#FFB800] px-1.5 py-0.5 text-[10px] font-extrabold text-[#00294D]">
                OFICIAL
              </span>
              <span className="font-medium text-slate-200">
                {configSitio.textoCintilloSuperior}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="#membresias"
                className="inline-flex items-center gap-1 font-bold text-[#FFB800] hover:underline"
              >
                <span>Ver planes de membresía</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
              <a
                href="#diplomas-verificacion"
                className="hidden sm:inline-flex items-center gap-1 text-slate-300 hover:text-white"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>Validar Credencial / QR</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 1. MENÚ PRINCIPAL SUPERIOR                                          */}
      {/* =================================================================== */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-7">
            <Link href="/" className="flex items-center gap-3 shrink-0">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#003399] text-white shadow-sm">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <span className="block text-base font-extrabold tracking-tight text-[#00294D]">
                  {configSitio.nombreEmpresa}
                </span>
                <span className="block text-[11px] font-semibold text-slate-500">
                  {configSitio.subtituloEmpresa}
                </span>
              </div>
            </Link>

            <nav
              aria-label="Menú Principal"
              className="hidden xl:flex xl:items-center xl:gap-6 text-sm font-bold text-slate-700"
            >
              <a
                href="#cursos-y-diplomados"
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-[#003399] hover:bg-blue-100"
              >
                <span>Cursos y Diplomados</span>
              </a>
              <a
                href="#simulador-oece"
                className="hover:text-[#003399] transition"
              >
                Simulador OECE
              </a>
              <a href="#membresias" className="hover:text-[#003399] transition">
                Membresías
              </a>
              <Link
                href="/aula-virtual"
                className="hover:text-[#003399] transition"
              >
                Aula Virtual
              </Link>
              <a
                href="#diplomas-verificacion"
                className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 transition"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>Certificados y Diplomas</span>
              </a>
              <a
                href="#contacto-soporte"
                className="hover:text-[#003399] transition"
              >
                Contacto
              </a>
            </nav>
          </div>

          <AuthHeaderActions />
        </div>
      </header>

      <main className="flex-1">
        {/* =================================================================== */}
        {/* SLIDERS DE PORTADA CONFIGURADOS DESDE EL PANEL (/public/sliders/...) */}
        {/* =================================================================== */}
        {slidersActivos.length > 0 && (
          <section className="relative overflow-hidden bg-[#001830] text-white border-b border-white/10">
            <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {slidersActivos.map((slider) => (
                  <div
                    key={slider.id}
                    className="relative overflow-hidden rounded-2xl border border-white/15 bg-slate-900 p-6 shadow-xl flex flex-col justify-between min-h-[220px]"
                    style={{
                      backgroundImage: `linear-gradient(to right, rgba(0, 24, 48, 0.92), rgba(0, 41, 77, 0.75)), url('${slider.imagenFondoUrl}')`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    <div className="space-y-2">
                      {slider.etiquetaSuperior && (
                        <span className="inline-block rounded-full bg-[#FFB800] px-2.5 py-0.5 text-[10px] font-extrabold text-[#00294D]">
                          {slider.etiquetaSuperior}
                        </span>
                      )}
                      <h2 className="text-lg font-extrabold text-white">
                        {slider.titulo}
                      </h2>
                      {slider.subtitulo && (
                        <p className="text-xs text-slate-200 line-clamp-3">
                          {slider.subtitulo}
                        </p>
                      )}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <a
                        href={slider.enlaceBotonPrincipal}
                        className="rounded-lg bg-[#FFB800] px-3.5 py-2 text-xs font-extrabold text-[#00294D] hover:bg-amber-400"
                      >
                        {slider.textoBotonPrincipal}
                      </a>
                      {slider.textoBotonSecundario &&
                        slider.enlaceBotonSecundario && (
                          <a
                            href={slider.enlaceBotonSecundario}
                            className="rounded-lg border border-white/30 bg-white/10 px-3.5 py-2 text-xs font-bold text-white hover:bg-white/20"
                          >
                            {slider.textoBotonSecundario}
                          </a>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* =================================================================== */}
        {/* 2. CATÁLOGO DE CURSOS Y SECCIONES CONFIGURADAS PARA VERSE EN INICIO */}
        {/* =================================================================== */}
        {programasParaMostrar.length > 0 ? (
          <CatalogoInteractivoLanding programas={programasParaMostrar} />
        ) : (
          <section
            id="cursos-y-diplomados"
            className="py-16 bg-white border-b border-slate-200"
          >
            <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-[#003399]">
                <BookOpen className="h-8 w-8" />
              </div>
              <h2 className="mt-4 text-2xl font-extrabold text-slate-900 sm:text-3xl">
                Catálogo de Cursos, Temporadas y Secciones
              </h2>
              <p className="mt-2 text-sm text-slate-600 max-w-xl mx-auto">
                Aún no se han publicado secciones ni cursos para mostrar en la
                página principal. Una vez que el Administrador configure una
                temporada y habilite la visibilidad de las secciones, aparecerán
                automáticamente aquí con su imagen y precio correspondiente.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/admin/configuracion"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#003399] px-5 py-3 text-xs font-extrabold text-white shadow hover:bg-[#002266]"
                >
                  <Settings className="h-4 w-4" />
                  <span>Ir a Configurar Cursos y Temporadas</span>
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* =================================================================== */}
        {/* 3. SIMULADOR DE EXAMEN OECE (CON OPCIÓN DEMO CONFIGURABLE)          */}
        {/* =================================================================== */}
        <section
          id="simulador-oece"
          className="scroll-mt-20 py-16 text-white"
          style={{
            background: "linear-gradient(135deg, #00294D 0%, #001830 100%)",
          }}
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl border border-white/15 bg-[#003399]/35 p-6 sm:p-10">
              <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
                <div className="max-w-2xl space-y-2">
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#FFB800] px-3 py-1 text-xs font-extrabold text-[#00294D]">
                    <ClipboardCheck className="h-4 w-4" />
                    MÓDULO ESPECIAL • PREPARACIÓN OFICIAL
                  </span>
                  <h2 className="text-2xl font-extrabold sm:text-3xl">
                    SIMULADOR DE EXAMEN DE CERTIFICACIÓN OECE (Ley N.° 32069)
                  </h2>
                  <p className="text-sm leading-relaxed text-[#E9EDF4]">
                    Practica con banco de preguntas importado desde Excel o carga
                    manual, temporizador oficial, modo práctica sin tiempo,
                    diagnóstico de temas a reforzar y acceso Demo gratuito.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  {simulacroConDemo ? (
                    <Link
                      href={`/simulador-demo?plan=${simulacroConDemo.codigo}`}
                      className="rounded-xl bg-[#FFB800] px-5 py-3 text-sm font-extrabold text-[#00294D] shadow-lg transition hover:bg-amber-400"
                    >
                      Probar Demo Gratis ({simulacroConDemo.cantidadPreguntasDemo}{" "}
                      preguntas)
                    </Link>
                  ) : (
                    <Link
                      href="/simulador-demo"
                      className="rounded-xl bg-[#FFB800] px-5 py-3 text-sm font-extrabold text-[#00294D] shadow-lg transition hover:bg-amber-400"
                    >
                      Probar Demo de Simulador
                    </Link>
                  )}
                </div>
              </div>

              {planesSimulacroBD.length > 0 ? (
                <div className="mt-10 grid gap-6 md:grid-cols-3">
                  {planesSimulacroBD.map((plan) => (
                    <div
                      key={plan.id}
                      className="flex flex-col justify-between rounded-2xl border border-white/15 bg-white/5 p-6"
                    >
                      <div>
                        <span className="rounded-md bg-white/15 px-2.5 py-1 text-xs font-extrabold text-[#FFB800]">
                          NIVEL {plan.nivel}
                        </span>
                        <h3 className="mt-4 text-xl font-extrabold text-white">
                          {plan.nombre}
                        </h3>
                        <p className="mt-1 text-xs font-semibold text-amber-300">
                          {plan.cantidadPreguntasHabilitadas} preguntas habilitadas •{" "}
                          {plan.intentosMaximosSimulacro} intentos
                        </p>
                        <div className="mt-4 flex items-baseline gap-2">
                          <span className="text-3xl font-extrabold text-white">
                            S/ {plan.precio.toFixed(2)}
                          </span>
                          <span className="text-xs text-[#C9D4EC]">
                            / {plan.duracionDiasVigencia} días
                          </span>
                        </div>
                        <p className="mt-4 text-xs text-[#E9EDF4]">
                          {plan.descripcion}
                        </p>
                      </div>

                      <Link
                        href={`/checkout?simulacro=${plan.codigo}`}
                        className="mt-6 block w-full rounded-xl bg-[#FFB800] py-3 text-center text-xs font-extrabold text-[#00294D] hover:bg-amber-400"
                      >
                        Adquirir {plan.nombre}
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-8 rounded-2xl border border-white/15 bg-white/5 p-6 text-center text-xs text-slate-300">
                  Aún no se han configurado planes de Simulador OECE en el panel de
                  administración.
                </div>
              )}
            </div>
          </div>
        </section>

        {/* =================================================================== */}
        {/* 4. PLANES DE MEMBRESÍA CONFIGURADOS (/public/membresias/...)        */}
        {/* =================================================================== */}
        <section
          id="membresias"
          className="scroll-mt-20 py-16 bg-white border-b border-slate-200"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#003399]">
                Planes de Membresía Editables
              </span>
              <h2 className="mt-1 text-2xl font-extrabold text-slate-900 sm:text-3xl">
                Accede a nuestros cursos y simuladores con{" "}
                <span className="text-[#003399]">una membresía</span>
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Activación mediante pasarela automática o subiendo tu captura de
                Yape, Plin o Transferencia Bancaria.
              </p>
            </div>

            {planesMembresiaBD.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-3">
                {planesMembresiaBD.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col justify-between rounded-3xl border-2 p-7 transition ${m.destacado
                      ? "border-[#003399] bg-[#00294D] text-white shadow-xl"
                      : "border-slate-200 bg-slate-50 text-slate-900"
                      }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-extrabold ${m.destacado
                            ? "bg-[#FFB800] text-[#00294D]"
                            : "bg-blue-100 text-[#003399]"
                            }`}
                        >
                          {m.periodo}
                        </span>
                        <span className="text-xs font-bold opacity-80">
                          {m.duracionDias} días de vigencia
                        </span>
                      </div>

                      <h3 className="mt-4 text-xl font-extrabold">{m.nombre}</h3>
                      <div className="mt-4 flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold">
                          S/ {m.precio.toFixed(2)}
                        </span>
                        <span
                          className={`text-xs ${m.destacado ? "text-slate-300" : "text-slate-500"
                            }`}
                        >
                          / {m.etiquetaDuracionTexto}
                        </span>
                      </div>

                      <p
                        className={`mt-4 text-xs leading-relaxed ${m.destacado ? "text-slate-200" : "text-slate-600"
                          }`}
                      >
                        {m.descripcion}
                      </p>

                      <ul className="mt-5 space-y-2 text-xs">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500" />
                          <span>
                            Cursos habilitados según configuración de temporada
                          </span>
                        </li>
                        {m.incluyeSimuladorOECE && (
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500" />
                            <span>
                              Incluye Simulador OECE ({m.cantidadPreguntasSimulador}{" "}
                              preguntas)
                            </span>
                          </li>
                        )}
                        {m.incluyeCertificados && (
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500" />
                            <span>Certificados con código QR único incluidos</span>
                          </li>
                        )}
                      </ul>
                    </div>

                    <Link
                      href={`/checkout?suscripcion=${m.codigo}`}
                      className={`mt-8 block w-full rounded-xl py-3 text-center text-xs font-extrabold transition ${m.destacado
                        ? "bg-[#FFB800] text-[#00294D] hover:bg-amber-400"
                        : "bg-[#003399] text-white hover:bg-[#002266]"
                        }`}
                    >
                      Seleccionar {m.nombre}
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-xs text-slate-600">
                Aún no hay planes de membresía creados. Puedes crearlos y definir su
                nombre, vigencia (ej. 1 año, 2 años) y precio desde el panel de
                configuración.
              </div>
            )}
          </div>
        </section>

        {/* =================================================================== */}
        {/* 5. SECCIÓN DE VERIFICACIÓN Y CONSULTA DE CREDENCIALES / DIPLOMAS QR */}
        {/* =================================================================== */}
        <section
          id="diplomas-verificacion"
          className="scroll-mt-20 py-16 bg-slate-100 border-b border-slate-200"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-5 space-y-4">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-800">
                  <ShieldCheck className="h-4 w-4" />
                  VERIFICACIÓN CON CÁMARA QR Y CONSULTA POR DNI
                </span>
                <h2 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
                  Verifica o descarga tus Credenciales y Certificados
                </h2>
                <p className="text-sm leading-relaxed text-slate-600">
                  Escanea el código QR único con la cámara de tu celular para
                  comprobar al instante si una credencial existe y es válida. Para
                  consultar y descargar todos tus certificados por número de DNI (con
                  anverso y reverso detallado por temporada y sección), inicia sesión
                  con tu cuenta de Google.
                </p>
              </div>

              <div className="lg:col-span-7">
                <VerificadorCertificado />
              </div>
            </div>
          </div>
        </section>

        {/* =================================================================== */}
        {/* 6. SOPORTE Y RESTAURACIÓN DE CORREO GMAIL VÍA WHATSAPP              */}
        {/* =================================================================== */}
        <section id="contacto-soporte" className="py-16 bg-blue-50/60">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#003399]">
                Soporte y Trámites de Cuenta
              </span>
              <h2 className="mt-1 text-2xl font-extrabold text-slate-900 sm:text-3xl">
                ¿Necesitas ayuda o perdiste el acceso a tu correo Gmail?
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div>
                  <span className="text-xs font-bold uppercase text-[#003399]">
                    Inscripciones y Temporadas
                  </span>
                  <h3 className="mt-1 text-lg font-extrabold text-slate-900">
                    Información de Cursos, Secciones y Membresías
                  </h3>
                  <p className="mt-2 text-xs text-slate-600">
                    Consulta precios por sección, horarios en vivo o acceso grabado.
                  </p>
                </div>
                <a
                  href={`https://wa.me/${configSitio.telefonoWhatsappAsesoria}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-xs font-extrabold text-white hover:bg-emerald-700"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Contactar Asesoría por WhatsApp</span>
                </a>
              </div>

              <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div>
                  <span className="text-xs font-bold uppercase text-[#003399]">
                    Validación de Pagos y Certificados
                  </span>
                  <h3 className="mt-1 text-lg font-extrabold text-slate-900">
                    Atención a Estudiantes Matriculados
                  </h3>
                  <p className="mt-2 text-xs text-slate-600">
                    Seguimiento de aprobación de vouchers Yape/Transferencia y
                    emisión de credenciales.
                  </p>
                </div>
                <a
                  href={`https://wa.me/${configSitio.telefonoWhatsappAlumnos}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-xs font-extrabold text-white hover:bg-emerald-700"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Soporte Alumnos por WhatsApp</span>
                </a>
              </div>

              {/* Tarjeta especial para pedir restauración/cambio de correo sin costo de SMS */}
              <div className="flex flex-col justify-between rounded-2xl border-2 border-amber-300 bg-amber-50/60 p-6 shadow-sm">
                <div>
                  <span className="inline-flex items-center gap-1 text-xs font-extrabold uppercase text-amber-800">
                    <KeyRound className="h-3.5 w-3.5" />
                    Restauración de Correo Registrado
                  </span>
                  <h3 className="mt-1 text-lg font-extrabold text-slate-900">
                    ¿Ya no tienes acceso a tu correo Gmail anterior?
                  </h3>
                  <p className="mt-2 text-xs text-slate-700">
                    Solicita por WhatsApp que el Administrador o Asistente
                    Administrativo actualice tu cuenta a tu nuevo correo Gmail sin
                    perder tus cursos ni certificados.
                  </p>
                </div>
                <a
                  href={urlWhatsappCambioCorreo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-[#00294D] px-4 py-3 text-xs font-extrabold text-white hover:bg-slate-800"
                >
                  <MessageCircle className="h-4 w-4 text-[#FFB800]" />
                  <span>Solicitar Cambio de Correo por WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#001830] text-slate-300 border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div>
            © {new Date().getFullYear()} {configSitio.nombreEmpresa} — Todos los
            derechos reservados.
          </div>
          <div className="flex items-center gap-4">
            <Link href="/libro-reclamaciones" className="hover:text-white">
              Libro de Reclamaciones Virtual
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}