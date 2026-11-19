// src/app/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import HeaderPublico from "@/components/home/HeaderPublico";
import HeroSliderPortada, {
  SliderItemPortada,
} from "@/components/home/HeroSliderPortada";
import BotonesFlotantesAyuda from "@/components/home/BotonesFlotantesAyuda";
import VerificadorCertificado from "@/components/certificados/VerificadorCertificado";
import CatalogoInteractivoLanding, {
  ProgramaItemLanding,
} from "@/components/home/CatalogoInteractivoLanding";
import {
  ShieldCheck,
  CheckCircle,
  ClipboardCheck,
  MessageCircle,
  ArrowRight,
  Settings,
  Sparkles,
  BookOpen,
  KeyRound,
} from "lucide-react";

export const dynamic = "force-dynamic";

// Convierte cualquier ruta /uploads/... a /api/uploads/... para que cargue al instante en Next.js sin reiniciar
function normalizarMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const limpia = url.trim();
  if (!limpia) return null;
  if (limpia.startsWith("/upload/")) {
    return `/api${limpia}`;
  }
  return limpia;
}

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
      if (usuarioActual.rol === "ADMINISTRADOR") {
        redirect("/admin/configuracion");
      }

      const faltaDatosCertificado =
        !usuarioActual.perfilCompletado ||
        !usuarioActual.dni ||
        !usuarioActual.nombres ||
        !usuarioActual.apellidos;

      if (faltaDatosCertificado) {
        redirect("/completar-perfil");
      }

      if (
        usuarioActual.rol === "ASISTENTE_ADMINISTRATIVO" ||
        usuarioActual.rol === "CONTADURIA" ||
        usuarioActual.rol === "SECRETARIA"
      ) {
        redirect("/admin/configuracion");
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
  // 2. CARGA REAL DESDE BASE DE DATOS (EMPRESA, SLIDERS, CURSOS, MEMBRESÍAS, SIMULADORES)
  // =========================================================================
  let configSitio = {
    nombreEmpresa: "AULA PROFESIONAL",
    subtituloEmpresa: "Escuela de Gestión y Especialización",
    slogan: "Impulsa tu carrera profesional",
    logoUrl: null as string | null,
    telefonoWhatsappAsesoria: "51983495578",
    telefonoWhatsappAlumnos: "51990945941",
    telefonoWhatsappCambioCorreo: "51949329563",
    mensajeBaseCambioCorreo:
      "Hola, ya no tengo acceso a mi correo Gmail registrado y solicito restaurar mi cuenta a este nuevo correo:",
    mostrarCintilloSuperior: true,
    textoCintilloSuperior:
      "Plataforma de Capacitación, Membresías y Simulador de Examen OECE (Ley N.° 32069) con Certificación QR",
  };

  let slidersActivos: SliderItemPortada[] = [];
  let programasParaMostrar: ProgramaItemLanding[] = [];
  let planesMembresiaBD: any[] = [];
  let planesSimulacroBD: any[] = [];

  try {
    const [
      configEnBD,
      slidersEnBD,
      seccionesVisiblesEnBD,
      cursosSinSeccionEnBD,
      membresiasEnBD,
      simulacrosEnBD,
    ] = await Promise.all([
      prisma.configuracionSitio.findUnique({ where: { clave: "PRINCIPAL" } }),
      prisma.sliderPortada.findMany({
        where: { activo: true },
        orderBy: { orden: "asc" },
      }),
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
            select: {
              name: true,
              nombres: true,
              apellidos: true,
              cargoActual: true,
            },
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
      prisma.cursoPrograma.findMany({
        where: { estado: "PUBLICADO", destacadoEnInicio: true },
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
        orderBy: { createdAt: "desc" },
      }),
      prisma.planSuscripcionCatalogo.findMany({
        where: { activo: true },
        orderBy: { precio: "asc" },
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
        slogan: configEnBD.slogan ?? configSitio.slogan,
        logoUrl: normalizarMediaUrl(configEnBD.logoUrl),
        telefonoWhatsappAsesoria: configEnBD.telefonoWhatsappAsesoria,
        telefonoWhatsappAlumnos: configEnBD.telefonoWhatsappAlumnos,
        telefonoWhatsappCambioCorreo: configEnBD.telefonoWhatsappCambioCorreo,
        mensajeBaseCambioCorreo: configEnBD.mensajeBaseCambioCorreo,
        mostrarCintilloSuperior: configEnBD.mostrarCintilloSuperior,
        textoCintilloSuperior:
          configEnBD.textoCintilloSuperior ?? configSitio.textoCintilloSuperior,
      };
    }

    slidersActivos = slidersEnBD.map((s) => ({
      ...s,
      imagenFondoUrl:
        normalizarMediaUrl(s.imagenFondoUrl) || "/sliders/slider-default.jpg",
    }));

    const mapeadosDesdeSecciones: ProgramaItemLanding[] =
      seccionesVisiblesEnBD.map((sec) => {
        const docenteObj = sec.docente ?? sec.curso.profesor;
        const nombreDocente = sec.llevaDocente
          ? docenteObj?.name ??
          (`${docenteObj?.nombres ?? ""} ${docenteObj?.apellidos ?? ""
            }`.trim() ||
            "Docente Especialista")
          : "Modalidad 100% Grabada (Autoaprendizaje)";

        return {
          id: sec.id,
          seccionId: sec.id,
          codigoInterno: `${sec.curso.codigoInterno} • ${sec.nombreSeccion}`,
          titulo: `${sec.curso.titulo} (${sec.nombreSeccion})`,
          slug: `${sec.curso.slug}?seccion=${sec.codigoSeccion}`,
          imagenPortada: normalizarMediaUrl(sec.curso.imagenPortada),
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
      });

    const cursosYaIncluidosIds = new Set(
      seccionesVisiblesEnBD.map((s) => s.cursoId)
    );

    const mapeadosDesdeCursosBase: ProgramaItemLanding[] = cursosSinSeccionEnBD
      .filter((c) => !cursosYaIncluidosIds.has(c.id))
      .map((c) => ({
        id: c.id,
        seccionId: null,
        codigoInterno: c.codigoInterno,
        titulo: c.titulo,
        slug: c.slug,
        imagenPortada: normalizarMediaUrl(c.imagenPortada),
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
      imagenPortada: normalizarMediaUrl(m.imagenPortada),
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
      imagenPortada: normalizarMediaUrl(s.imagenPortada),
      descripcion: s.descripcion,
      permiteVentaIndividual: s.permiteVentaIndividual,
      precio: Number(s.precio),
      precioOferta: s.precioOferta ? Number(s.precioOferta) : null,
      duracionDiasVigencia: s.duracionDiasVigencia,
      intentosMaximosSimulacro: s.intentosMaximosSimulacro,
      cantidadPreguntasHabilitadas: s.cantidadPreguntasHabilitadas,
      habilitarDemoEnInicio: s.habilitarDemoEnInicio,
      cantidadPreguntasDemo: s.cantidadPreguntasDemo,
    }));
  } catch {
    // Fallback seguro si la BD aún se está sincronizando
  }

  const simulacroConDemo = planesSimulacroBD.find(
    (s) => s.habilitarDemoEnInicio
  );
  const urlWhatsappCambioCorreo = `https://wa.me/${configSitio.telefonoWhatsappCambioCorreo
    }?text=${encodeURIComponent(configSitio.mensajeBaseCambioCorreo)}`;

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 text-zinc-950 pb-16 md:pb-0">
      {/* Barra superior si el Admin está previsualizando la portada */}
      {usuarioActual?.rol === "ADMINISTRADOR" && (
        <div className="bg-zinc-950 text-white px-4 py-2 text-xs font-bold flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span>
              Vista Pública activa — Estás viendo la portada tal como la ven tus
              estudiantes.
            </span>
          </div>
          <Link
            href="/admin/configuracion"
            className="inline-flex items-center gap-1.5 rounded-lg bg-amber-400 px-3 py-1 text-zinc-950 font-extrabold hover:bg-amber-300"
          >
            <Settings className="h-3.5 w-3.5" />
            <span>Volver al Panel de Configuración</span>
          </Link>
        </div>
      )}

      {/* Cintillo Superior */}
      {configSitio.mostrarCintilloSuperior && (
        <div className="bg-zinc-900 text-white border-b border-zinc-800">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-2 text-[11px] sm:text-xs sm:px-6 lg:px-8">
            <div className="flex items-center gap-2">
              <span className="rounded bg-amber-400 px-1.5 py-0.5 text-[10px] font-extrabold text-zinc-950">
                OFICIAL
              </span>
              <span className="font-medium text-zinc-200 line-clamp-1">
                {configSitio.textoCintilloSuperior}
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-4">
              <a
                href="#membresias"
                className="inline-flex items-center gap-1 font-bold text-amber-400 hover:underline"
              >
                <span>Ver membresías</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
              <a
                href="#diplomas-verificacion"
                className="inline-flex items-center gap-1 text-zinc-300 hover:text-white"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>Validar QR</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 1. CABECERA RESPONSIVE CON LOGO REAL SUBIDO */}
      <HeaderPublico
        nombreEmpresa={configSitio.nombreEmpresa}
        subtituloEmpresa={configSitio.subtituloEmpresa}
        logoUrl={configSitio.logoUrl}
      />

      <main className="flex-1">
        {/* 2. SLIDER HERO FULL-WIDTH (SOPORTA IMAGEN Y VIDEO MP4/WEBM) */}
        <HeroSliderPortada
          sliders={slidersActivos}
          nombreEmpresa={configSitio.nombreEmpresa}
          slogan={configSitio.slogan}
        />

        {/* 3. CATÁLOGO DE CURSOS Y SECCIONES CON SUS IMÁGENES SUBIDAS */}
        {programasParaMostrar.length > 0 ? (
          <CatalogoInteractivoLanding programas={programasParaMostrar} />
        ) : (
          <section
            id="cursos-y-diplomados"
            className="py-16 bg-white border-b border-zinc-200"
          >
            <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-900">
                <BookOpen className="h-8 w-8" />
              </div>
              <h2 className="mt-4 text-2xl font-extrabold text-zinc-950 sm:text-3xl">
                Catálogo de Cursos, Temporadas y Secciones
              </h2>
              <p className="mt-2 text-sm text-zinc-600 max-w-xl mx-auto">
                Aún no hay secciones publicadas para mostrar en la página
                principal. Configura una temporada y marca «Mostrar en Página
                Principal» desde el panel administrativo.
              </p>
            </div>
          </section>
        )}

        {/* 4. SIMULADOR DE EXAMEN OECE CON IMAGEN REAL Y PRECIO INDIVIDUAL */}
        <section
          id="simulador-oece"
          className="scroll-mt-20 py-16 bg-zinc-950 text-white"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6 sm:p-10">
              <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
                <div className="max-w-2xl space-y-2">
                  <span className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-3 py-1 text-xs font-extrabold text-zinc-950">
                    <ClipboardCheck className="h-4 w-4" />
                    MÓDULO ESPECIAL • PREPARACIÓN OFICIAL
                  </span>
                  <h2 className="text-2xl font-extrabold sm:text-3xl">
                    SIMULADORES DE EXAMEN DE CERTIFICACIÓN OECE
                  </h2>
                  <p className="text-sm leading-relaxed text-zinc-300">
                    Practica con banco de preguntas actualizado, temporizador
                    oficial, modo práctica sin tiempo y diagnóstico automático
                    de temas a reforzar.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    href={
                      simulacroConDemo
                        ? `/simulador-demo?plan=${simulacroConDemo.codigo}`
                        : "/simulador-demo"
                    }
                    className="rounded-xl bg-amber-400 px-5 py-3 text-xs sm:text-sm font-extrabold text-zinc-950 shadow-lg transition hover:bg-amber-300"
                  >
                    {simulacroConDemo
                      ? `Probar Demo Gratis (${simulacroConDemo.cantidadPreguntasDemo} preguntas)`
                      : "Probar Demo de Simulador"}
                  </Link>
                </div>
              </div>

              {planesSimulacroBD.length > 0 ? (
                <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {planesSimulacroBD.map((plan) => (
                    <div
                      key={plan.id}
                      className="flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-lg"
                    >
                      <div>
                        {plan.imagenPortada && (
                          <div className="h-40 w-full overflow-hidden bg-zinc-900">
                            <img
                              src={plan.imagenPortada}
                              alt={plan.nombre}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        )}
                        <div className="p-6">
                          <span className="rounded-md bg-zinc-800 px-2.5 py-1 text-[11px] font-extrabold text-amber-400">
                            NIVEL {plan.nivel}
                          </span>
                          <h3 className="mt-3 text-lg font-extrabold text-white">
                            {plan.nombre}
                          </h3>
                          <p className="mt-1 text-xs font-semibold text-zinc-400">
                            {plan.cantidadPreguntasHabilitadas} preguntas •{" "}
                            {plan.intentosMaximosSimulacro} intentos
                          </p>
                          {plan.permiteVentaIndividual && (
                            <div className="mt-4 flex items-baseline gap-2">
                              <span className="text-3xl font-extrabold text-white">
                                S/ {(plan.precioOferta ?? plan.precio).toFixed(2)}
                              </span>
                              <span className="text-xs text-zinc-400">
                                / {plan.duracionDiasVigencia} días
                              </span>
                            </div>
                          )}
                          <p className="mt-3 text-xs text-zinc-300 line-clamp-3">
                            {plan.descripcion}
                          </p>
                        </div>
                      </div>

                      <div className="p-6 pt-0">
                        <Link
                          href={`/checkout?simulacro=${plan.codigo}`}
                          className="block w-full rounded-xl bg-amber-400 py-3 text-center text-xs font-extrabold text-zinc-950 hover:bg-amber-300 transition"
                        >
                          Adquirir {plan.nombre}
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6 text-center text-xs text-zinc-400">
                  Aún no se han publicado simuladores visibles para el inicio.
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 5. MEMBRESÍAS CON IMAGEN REAL SUBIDA */}
        <section
          id="membresias"
          className="scroll-mt-20 py-16 bg-white border-b border-zinc-200"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-500">
                Planes de Suscripción
              </span>
              <h2 className="mt-1 text-2xl font-extrabold text-zinc-950 sm:text-3xl">
                Accede a nuestros cursos y simuladores con una membresía
              </h2>
              <p className="mt-2 text-sm text-zinc-600">
                Activación mediante pasarela automática o subiendo tu captura de
                Yape, Plin o Transferencia Bancaria.
              </p>
            </div>

            {planesMembresiaBD.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {planesMembresiaBD.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col justify-between overflow-hidden rounded-3xl border-2 transition ${m.destacado
                      ? "border-zinc-950 bg-zinc-950 text-white shadow-xl"
                      : "border-zinc-200 bg-zinc-50 text-zinc-950"
                      }`}
                  >
                    <div>
                      {m.imagenPortada && (
                        <div className="h-44 w-full overflow-hidden bg-zinc-900">
                          <img
                            src={m.imagenPortada}
                            alt={m.nombre}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}

                      <div className="p-7">
                        <div className="flex items-center justify-between">
                          <span
                            className={`rounded-full px-3 py-1 text-[11px] font-extrabold ${m.destacado
                              ? "bg-amber-400 text-zinc-950"
                              : "bg-zinc-200 text-zinc-900"
                              }`}
                          >
                            {m.etiquetaDuracionTexto}
                          </span>
                          <span className="text-xs font-bold opacity-75">
                            {m.duracionDias} días
                          </span>
                        </div>

                        <h3 className="mt-4 text-xl font-extrabold">
                          {m.nombre}
                        </h3>
                        <div className="mt-3 flex items-baseline gap-2">
                          <span className="text-3xl font-extrabold">
                            S/ {m.precio.toFixed(2)}
                          </span>
                        </div>

                        <p
                          className={`mt-3 text-xs leading-relaxed ${m.destacado ? "text-zinc-300" : "text-zinc-600"
                            }`}
                        >
                          {m.descripcion}
                        </p>

                        <ul className="mt-5 space-y-2 text-xs">
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500" />
                            <span>Cursos habilitados para este plan</span>
                          </li>
                          {m.incluyeCertificados && (
                            <li className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500" />
                              <span>Certificados con código QR único</span>
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>

                    <div className="p-7 pt-0">
                      <Link
                        href={`/checkout?suscripcion=${m.codigo}`}
                        className={`block w-full rounded-xl py-3 text-center text-xs font-extrabold transition ${m.destacado
                          ? "bg-amber-400 text-zinc-950 hover:bg-amber-300"
                          : "bg-zinc-950 text-white hover:bg-zinc-800"
                          }`}
                      >
                        Adquirir {m.nombre}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center text-xs text-zinc-600">
                Aún no hay planes de membresía publicados.
              </div>
            )}
          </div>
        </section>

        {/* 6. VERIFICADOR DE CERTIFICADOS QR / DNI */}
        <section
          id="diplomas-verificacion"
          className="scroll-mt-20 py-16 bg-zinc-100 border-b border-zinc-200"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-5 space-y-4">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-800">
                  <ShieldCheck className="h-4 w-4" />
                  VERIFICACIÓN CON CÁMARA QR Y CONSULTA POR DNI
                </span>
                <h2 className="text-2xl font-extrabold text-zinc-950 sm:text-3xl">
                  Verifica o descarga tus Credenciales y Certificados
                </h2>
                <p className="text-sm leading-relaxed text-zinc-600">
                  Escanea el código QR único con la cámara de tu celular o
                  ingresa tu número de DNI / Código de registro para verificar
                  la autenticidad de tu certificado al instante.
                </p>
              </div>

              <div className="lg:col-span-7">
                <VerificadorCertificado />
              </div>
            </div>
          </div>
        </section>

        {/* 7. SOPORTE Y CAMBIO DE CORREO GMAIL VÍA WHATSAPP */}
        <section id="contacto-soporte" className="py-16 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10">
              <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-500">
                Atención y Soporte
              </span>
              <h2 className="mt-1 text-2xl font-extrabold text-zinc-950 sm:text-3xl">
                ¿Necesitas ayuda o perdiste el acceso a tu correo Gmail?
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="flex flex-col justify-between rounded-2xl border border-zinc-200 bg-zinc-50 p-6">
                <div>
                  <span className="text-xs font-bold uppercase text-zinc-500">
                    Inscripciones
                  </span>
                  <h3 className="mt-1 text-lg font-extrabold text-zinc-950">
                    Información de Cursos y Membresías
                  </h3>
                  <p className="mt-2 text-xs text-zinc-600">
                    Consulta costos por sección, horarios en vivo o acceso
                    grabado.
                  </p>
                </div>
                <a
                  href={`https://wa.me/${configSitio.telefonoWhatsappAsesoria}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-xs font-extrabold text-white hover:bg-emerald-700"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Asesoría por WhatsApp</span>
                </a>
              </div>

              <div className="flex flex-col justify-between rounded-2xl border border-zinc-200 bg-zinc-50 p-6">
                <div>
                  <span className="text-xs font-bold uppercase text-zinc-500">
                    Alumnos Matriculados
                  </span>
                  <h3 className="mt-1 text-lg font-extrabold text-zinc-950">
                    Pagos, Vouchers y Certificados
                  </h3>
                  <p className="mt-2 text-xs text-zinc-600">
                    Seguimiento de aprobación de vouchers Yape/Transferencia y
                    emisión de diplomas.
                  </p>
                </div>
                <a
                  href={`https://wa.me/${configSitio.telefonoWhatsappAlumnos}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-xs font-extrabold text-white hover:bg-emerald-700"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Soporte Alumnos WhatsApp</span>
                </a>
              </div>

              <div className="flex flex-col justify-between rounded-2xl border-2 border-zinc-950 bg-zinc-950 text-white p-6">
                <div>
                  <span className="inline-flex items-center gap-1 text-xs font-extrabold uppercase text-amber-400">
                    <KeyRound className="h-3.5 w-3.5" />
                    Restauración de Correo
                  </span>
                  <h3 className="mt-1 text-lg font-extrabold">
                    ¿Ya no tienes acceso a tu correo Gmail anterior?
                  </h3>
                  <p className="mt-2 text-xs text-zinc-300">
                    Solicita por WhatsApp que actualicemos tu cuenta a tu nuevo
                    correo sin perder tus cursos ni certificados.
                  </p>
                </div>
                <a
                  href={urlWhatsappCambioCorreo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-3 text-xs font-extrabold text-zinc-950 hover:bg-amber-300"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Pedir Cambio de Correo</span>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* BOTONES FLOTANTES (ASISTENTE IA EN CONSTRUCCIÓN + WHATSAPP + BARRA MÓVIL) */}
      <BotonesFlotantesAyuda
        telefonoWhatsapp={configSitio.telefonoWhatsappAsesoria}
        nombreEmpresa={configSitio.nombreEmpresa}
      />

      <footer className="bg-zinc-950 text-zinc-400 border-t border-zinc-800">
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