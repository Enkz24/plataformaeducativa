// src/app/api/admin/configuracion/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { activarServiciosPedido } from "@/lib/pagos/activarServiciosPedido";
async function verificarAdminOSoporte() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return null;

    const usuario = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { permisosEspecificos: true },
    });

    if (!usuario || !usuario.activo) return null;
    if (
        usuario.rol !== "ADMINISTRADOR" &&
        usuario.rol !== "ASISTENTE_ADMINISTRATIVO" &&
        usuario.rol !== "CONTADURIA"
    ) {
        return null;
    }
    return usuario;
}

function parseFechaPeru(fechaStr: string): Date | null {
    if (!fechaStr) return null;
    const limpia = String(fechaStr).trim();
    const partes = limpia.split(/[\/\-]/);
    if (partes.length === 3) {
        if (partes[0].length === 4) {
            return new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
        }
        return new Date(Number(partes[2]), Number(partes[1]) - 1, Number(partes[0]));
    }
    const d = new Date(limpia);
    return isNaN(d.getTime()) ? null : d;
}

function extraerNombreYDni(texto: string, codigoFallback?: string) {
    const limpio = String(texto || "").trim();
    const match = limpio.match(/^(.+?)\s*\((\d{6,12})\)\s*$/);
    if (match) {
        return {
            nombreCompleto: match[1].trim(),
            dni: match[2].trim(),
        };
    }
    // Si el DNI viene después del guion en el código (ej: 25489-41647880)
    const matchCodigo = String(codigoFallback || "").match(/-(\d{7,10})$/);
    return {
        nombreCompleto: limpio.replace(/\(\d+\)/g, "").trim() || "TITULAR REGISTRADO",
        dni: matchCodigo ? matchCodigo[1] : `SIN-DNI-${Date.now().toString().slice(-5)}`,
    };
}

export async function GET() {
    try {
        const admin = await verificarAdminOSoporte();
        if (!admin) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const [
            configSitio,
            sliders,
            categorias,
            cursos,
            temporadas,
            secciones,
            membresias,
            simuladores,
            configPagos,
            pasarelas,
            operacionesPago,
            certificadosRecientes,
            totalCertificadosCount,
            lotesMigracion,
            usuarios,
        ] = await Promise.all([
            prisma.configuracionSitio.findUnique({ where: { clave: "PRINCIPAL" } }),
            prisma.sliderPortada.findMany({ orderBy: { orden: "asc" } }),
            prisma.categoriaAcademica.findMany({ orderBy: { orden: "asc" } }),
            prisma.cursoPrograma.findMany({
                include: {
                    categoria: true,
                    modulos: {
                        orderBy: { orden: "asc" },
                        include: {
                            evaluaciones: {
                                include: { preguntas: { include: { opciones: true } } },
                            },
                            lecciones: {
                                orderBy: { orden: "asc" },
                                include: {
                                    recursosAdjuntos: { orderBy: { orden: "asc" } },
                                    tareas: true,
                                    evaluaciones: {
                                        include: {
                                            preguntas: {
                                                include: { opciones: { orderBy: { orden: "asc" } } },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
            }),
            prisma.temporadaAcademica.findMany({
                include: { _count: { select: { secciones: true } } },
                orderBy: { fechaInicio: "desc" },
            }),
            prisma.seccionCursoTemporada.findMany({
                include: {
                    temporada: true,
                    curso: true,
                    docente: {
                        select: { id: true, name: true, nombres: true, apellidos: true, email: true },
                    },
                    planesMembresiaPermitidos: { include: { planSuscripcion: true } },
                    simuladoresPermitidos: { include: { planSimulacro: true } },
                    sesionesHabilitadas: {
                        orderBy: { ordenEnSeccion: "asc" },
                        include: { leccion: true },
                    },
                    invitacionesCorreo: true,
                },
                orderBy: { createdAt: "desc" },
            }),
            prisma.planSuscripcionCatalogo.findMany({ orderBy: { precio: "asc" } }),
            prisma.planSimulacroOECE.findMany({
                include: {
                    membresiasDondeSeIncluye: { include: { planSuscripcion: true } },
                    cursosVinculados: { include: { curso: true } },
                    evaluacionesSimulacro: {
                        include: { preguntas: { include: { opciones: true } } },
                    },
                },
                orderBy: { precio: "asc" },
            }),
            prisma.configuracionGeneralPagos.findUnique({
                where: { claveConfiguracion: "PRINCIPAL" },
            }),
            prisma.configuracionPasarelaAutomatica.findMany({
                orderBy: { ordenVisualizacion: "asc" },
            }),
            prisma.operacionPago.findMany({
                include: {
                    pedido: {
                        include: {
                            estudiante: {
                                select: { name: true, nombres: true, apellidos: true, email: true, dni: true },
                            },
                            items: { include: { seccion: { include: { temporada: true } } } },
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
                take: 100,
            }),
            prisma.certificado.findMany({
                orderBy: { fechaEmision: "desc" },
                take: 50,
            }),
            prisma.certificado.count(),
            prisma.loteMigracionExcel.findMany({
                orderBy: { fechaEjecucion: "desc" },
                take: 10,
            }),
            prisma.user.findMany({
                select: {
                    id: true,
                    name: true,
                    nombres: true,
                    apellidos: true,
                    dni: true,
                    email: true,
                    telefono: true,
                    rol: true,
                    activo: true,
                    migradoDesdeExcel: true,
                },
                orderBy: { createdAt: "desc" },
                take: 150,
            }),
        ]);

        return NextResponse.json({
            adminActual: admin,
            configSitio,
            sliders,
            categorias,
            cursos,
            temporadas,
            secciones,
            membresias,
            simuladores,
            configPagos,
            pasarelas,
            operacionesPago,
            certificadosRecientes,
            totalCertificadosCount,
            lotesMigracion,
            usuarios,
        });
    } catch (error) {
        console.error("Error GET /api/admin/configuracion:", error);
        return NextResponse.json(
            { error: "Error cargando datos del sistema" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const admin = await verificarAdminOSoporte();
        if (!admin) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const body = await request.json();
        const { accion, datos } = body;

        // =========================================================================
        // 1. EMPRESA, SLIDERS Y APARIENCIA
        // =========================================================================
        if (accion === "GUARDAR_EMPRESA") {
            const config = await prisma.configuracionSitio.upsert({
                where: { clave: "PRINCIPAL" },
                update: {
                    nombreEmpresa: datos.nombreEmpresa,
                    subtituloEmpresa: datos.subtituloEmpresa,
                    rucEmpresa: datos.rucEmpresa,
                    razonSocial: datos.razonSocial,
                    slogan: datos.slogan,
                    logoUrl: datos.logoUrl,
                    direccionFisica: datos.direccionFisica,
                    correoContacto: datos.correoContacto,
                    telefonoWhatsappAsesoria: datos.telefonoWhatsappAsesoria,
                    telefonoWhatsappAlumnos: datos.telefonoWhatsappAlumnos,
                    telefonoWhatsappCambioCorreo: datos.telefonoWhatsappCambioCorreo,
                    mensajeBaseCambioCorreo: datos.mensajeBaseCambioCorreo,
                    codigoCertificacionIsoDefault: datos.codigoCertificacionIsoDefault,
                    firmaDirectorUrl: datos.firmaDirectorUrl,
                    mostrarCintilloSuperior: Boolean(datos.mostrarCintilloSuperior),
                    textoCintilloSuperior: datos.textoCintilloSuperior,
                },
                create: {
                    clave: "PRINCIPAL",
                    nombreEmpresa: datos.nombreEmpresa || "AULA PROFESIONAL",
                    subtituloEmpresa:
                        datos.subtituloEmpresa || "Escuela de Gestión y Especialización",
                    rucEmpresa: datos.rucEmpresa,
                    razonSocial: datos.razonSocial,
                    slogan: datos.slogan,
                    logoUrl: datos.logoUrl || "/empresa/logo.png",
                    direccionFisica: datos.direccionFisica,
                    correoContacto: datos.correoContacto,
                    telefonoWhatsappAsesoria: datos.telefonoWhatsappAsesoria || "51983495578",
                    telefonoWhatsappAlumnos: datos.telefonoWhatsappAlumnos || "51990945941",
                    telefonoWhatsappCambioCorreo:
                        datos.telefonoWhatsappCambioCorreo || "51949329563",
                    mensajeBaseCambioCorreo:
                        datos.mensajeBaseCambioCorreo ||
                        "Hola, solicito restaurar mi cuenta a un nuevo correo Gmail.",
                    codigoCertificacionIsoDefault:
                        datos.codigoCertificacionIsoDefault || "ISO 9001:2015",
                    firmaDirectorUrl: datos.firmaDirectorUrl || "/firmas/firma-director.png",
                    mostrarCintilloSuperior: Boolean(datos.mostrarCintilloSuperior),
                    textoCintilloSuperior: datos.textoCintilloSuperior,
                },
            });
            return NextResponse.json({ ok: true, config });
        }

        if (accion === "GUARDAR_SLIDER") {
            if (datos.id) {
                const slider = await prisma.sliderPortada.update({
                    where: { id: datos.id },
                    data: {
                        titulo: datos.titulo,
                        subtitulo: datos.subtitulo,
                        etiquetaSuperior: datos.etiquetaSuperior,
                        imagenFondoUrl: datos.imagenFondoUrl,
                        textoBotonPrincipal: datos.textoBotonPrincipal,
                        enlaceBotonPrincipal: datos.enlaceBotonPrincipal,
                    },
                });
                return NextResponse.json({ ok: true, slider });
            }
            const slider = await prisma.sliderPortada.create({
                data: {
                    titulo: datos.titulo,
                    subtitulo: datos.subtitulo,
                    etiquetaSuperior: datos.etiquetaSuperior || "FORMACIÓN PROFESIONAL",
                    imagenFondoUrl: datos.imagenFondoUrl || "/sliders/slider-1.jpg",
                    textoBotonPrincipal: datos.textoBotonPrincipal || "Explorar cursos",
                    enlaceBotonPrincipal: datos.enlaceBotonPrincipal || "#cursos-y-diplomados",
                    activo: true,
                },
            });
            return NextResponse.json({ ok: true, slider });
        }

        if (accion === "ELIMINAR_SLIDER") {
            await prisma.sliderPortada.delete({ where: { id: datos.id } });
            return NextResponse.json({ ok: true });
        }

        // =========================================================================
        // 2. CATEGORÍAS Y CURSOS MAESTROS (CREAR, EDITAR, ELIMINAR)
        // =========================================================================
        if (accion === "GUARDAR_CATEGORIA") {
            if (datos.id) {
                const cat = await prisma.categoriaAcademica.update({
                    where: { id: datos.id },
                    data: {
                        nombre: datos.nombre,
                        subcategoriasTexto: datos.subcategoriasTexto,
                        imagenUrl: datos.imagenUrl,
                    },
                });
                return NextResponse.json({ ok: true, categoria: cat });
            }
            const slug = (datos.nombre || "categoria")
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-z0-9]+/g, "-");
            const categoria = await prisma.categoriaAcademica.create({
                data: {
                    nombre: datos.nombre,
                    slug: `${slug}-${Date.now().toString().slice(-3)}`,
                    subcategoriasTexto: datos.subcategoriasTexto,
                    imagenUrl: datos.imagenUrl || "/categorias/default.jpg",
                },
            });
            return NextResponse.json({ ok: true, categoria });
        }

        if (accion === "ELIMINAR_CATEGORIA") {
            await prisma.categoriaAcademica.delete({ where: { id: datos.id } });
            return NextResponse.json({ ok: true });
        }

        if (accion === "GUARDAR_CURSO_MAESTRO") {
            if (datos.id) {
                const cursoEditado = await prisma.cursoPrograma.update({
                    where: { id: datos.id },
                    data: {
                        codigoInterno: datos.codigoInterno,
                        titulo: datos.titulo,
                        nombreCorto: datos.nombreCorto,
                        categoriaId: datos.categoriaId,
                        resumen: datos.resumen || datos.titulo,
                        imagenPortada: datos.imagenPortada,
                        videoPresentacionUrl: datos.videoPresentacionUrl,
                        horasAcademicas: Number(datos.horasAcademicas || 40),
                        tipoHoras: datos.tipoHoras || "PEDAGOGICAS",
                        creditos: Number(datos.creditos || 0),
                        precioBase: Number(datos.precioBase || 100),
                        enlaceCarpetaGoogleDrive: datos.enlaceCarpetaGoogleDrive || null,
                        destacadoEnInicio: Boolean(datos.destacadoEnInicio),
                    },
                });
                return NextResponse.json({ ok: true, curso: cursoEditado });
            }

            const slug = (datos.titulo || "curso")
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, "");

            const totalModulos = Math.max(1, Number(datos.numeroModulosBase || 2));
            const totalSesiones = Math.max(1, Number(datos.numeroSesionesBase || 4));
            const sesionesPorModulo = Math.max(
                1,
                Math.ceil(totalSesiones / totalModulos)
            );

            const curso = await prisma.cursoPrograma.create({
                data: {
                    codigoInterno: datos.codigoInterno,
                    titulo: datos.titulo,
                    nombreCorto: datos.nombreCorto,
                    slug: `${slug}-${Date.now().toString().slice(-4)}`,
                    resumen: datos.resumen || datos.titulo,
                    descripcionCompleta: datos.descripcionCompleta || datos.resumen || "",
                    imagenPortada: datos.imagenPortada || "/cursos/default-curso.jpg",
                    videoPresentacionUrl: datos.videoPresentacionUrl,
                    tipoPrograma: datos.tipoPrograma || "CURSO",
                    modalidad: datos.modalidad || "SINCRONO",
                    estado: "PUBLICADO",
                    numeroModulosBase: totalModulos,
                    numeroSesionesBase: totalSesiones,
                    horasAcademicas: Number(datos.horasAcademicas || 40),
                    tipoHoras: datos.tipoHoras || "PEDAGOGICAS",
                    creditos: Number(datos.creditos || 0),
                    precioBase: Number(datos.precioBase || 100),
                    enlaceCarpetaGoogleDrive: datos.enlaceCarpetaGoogleDrive || null,
                    destacadoEnInicio: Boolean(datos.destacadoEnInicio),
                    categoriaId: datos.categoriaId,
                    profesorId: admin.id,
                },
            });

            let sesionGlobal = 1;
            for (let m = 1; m <= totalModulos; m++) {
                const mod = await prisma.moduloCurso.create({
                    data: {
                        cursoId: curso.id,
                        titulo: `Módulo ${m}`,
                        orden: m,
                    },
                });
                for (
                    let s = 1;
                    s <= sesionesPorModulo && sesionGlobal <= totalSesiones;
                    s++
                ) {
                    await prisma.leccionCurso.create({
                        data: {
                            moduloId: mod.id,
                            numeroSesionGlobal: sesionGlobal,
                            titulo: `Sesión ${sesionGlobal}`,
                            videoUrl: datos.enlaceCarpetaGoogleDrive || null,
                            orden: s,
                        },
                    });
                    sesionGlobal++;
                }
            }
            return NextResponse.json({ ok: true, curso });
        }

        if (accion === "ELIMINAR_CURSO_MAESTRO") {
            await prisma.cursoPrograma.delete({ where: { id: datos.id } });
            return NextResponse.json({ ok: true });
        }

        if (accion === "ELIMINAR_SESION_MODULO") {
            await prisma.leccionCurso.delete({ where: { id: datos.leccionId } });
            return NextResponse.json({ ok: true });
        }

        if (accion === "GUARDAR_MATERIAL_SESION") {
            if (datos.videoUrl !== undefined || datos.tituloSesion) {
                await prisma.leccionCurso.update({
                    where: { id: datos.leccionId },
                    data: {
                        titulo: datos.tituloSesion || undefined,
                        videoUrl: datos.videoUrl || null,
                    },
                });
            }
            if (datos.tituloMaterial && datos.archivoUrl) {
                await prisma.recursoLeccion.create({
                    data: {
                        leccionId: datos.leccionId,
                        titulo: datos.tituloMaterial,
                        tipoArchivo: datos.tipoArchivo || "ARCHIVO",
                        origenAlmacenamiento: datos.archivoUrl.includes("drive.google.com")
                            ? "GOOGLE_DRIVE_LINK"
                            : "SERVIDOR_PUBLIC",
                        archivoUrl: datos.archivoUrl,
                    },
                });
            }
            if (datos.tituloTarea) {
                await prisma.tareaLeccion.create({
                    data: {
                        leccionId: datos.leccionId,
                        titulo: datos.tituloTarea,
                        instrucciones:
                            datos.instruccionesTarea || "Subir entregable de la sesión.",
                    },
                });
            }
            return NextResponse.json({ ok: true });
        }

        // IMPORTAR LOTE DE PREGUNTAS (DESDE EXCEL/CSV O MANUAL) A UNA SESIÓN, MÓDULO O SIMULADOR OECE
        if (accion === "IMPORTAR_PREGUNTAS_LOTE") {
            let evaluacion = await prisma.evaluacion.findFirst({
                where: {
                    ...(datos.leccionId ? { leccionId: datos.leccionId } : {}),
                    ...(datos.moduloId ? { moduloId: datos.moduloId } : {}),
                    ...(datos.planSimulacroId
                        ? { planSimulacroId: datos.planSimulacroId }
                        : {}),
                },
            });

            if (!evaluacion) {
                evaluacion = await prisma.evaluacion.create({
                    data: {
                        titulo: datos.tituloEvaluacion || "Cuestionario Oficial",
                        esSimulacroOECE: Boolean(datos.planSimulacroId),
                        cursoId: datos.cursoId || null,
                        moduloId: datos.moduloId || null,
                        leccionId: datos.leccionId || null,
                        planSimulacroId: datos.planSimulacroId || null,
                        duracionMinutos: Number(datos.duracionMinutos || 45),
                    },
                });
            }

            const listaPreguntas: any[] = Array.isArray(datos.preguntas)
                ? datos.preguntas
                : [];
            let creadas = 0;

            for (const p of listaPreguntas) {
                if (!p.enunciado) continue;
                const correcta = String(p.correcta || "A")
                    .trim()
                    .toUpperCase();
                await prisma.preguntaEvaluacion.create({
                    data: {
                        evaluacionId: evaluacion.id,
                        enunciado: String(p.enunciado).trim(),
                        categoriaTematica: p.categoriaTematica || "General",
                        referenciaNormativa: p.referenciaNormativa || "",
                        explicacionSolucion: p.explicacionSolucion || "",
                        esPreguntaDemo: Boolean(p.esPreguntaDemo),
                        opciones: {
                            create: [
                                {
                                    letraOpcion: "A",
                                    textoOpcion: String(p.opcionA || "Opción A"),
                                    esCorrecta: correcta === "A",
                                    orden: 1,
                                },
                                {
                                    letraOpcion: "B",
                                    textoOpcion: String(p.opcionB || "Opción B"),
                                    esCorrecta: correcta === "B",
                                    orden: 2,
                                },
                                {
                                    letraOpcion: "C",
                                    textoOpcion: String(p.opcionC || "Opción C"),
                                    esCorrecta: correcta === "C",
                                    orden: 3,
                                },
                                {
                                    letraOpcion: "D",
                                    textoOpcion: String(p.opcionD || "Opción D"),
                                    esCorrecta: correcta === "D",
                                    orden: 4,
                                },
                            ],
                        },
                    },
                });
                creadas++;
            }

            return NextResponse.json({ ok: true, creadas });
        }

        // =========================================================================
        // 3. TEMPORADAS Y SECCIONES (LISTAR, CREAR, EDITAR Y ELIMINAR)
        // =========================================================================
        if (accion === "GUARDAR_TEMPORADA") {
            if (datos.id) {
                const temp = await prisma.temporadaAcademica.update({
                    where: { id: datos.id },
                    data: {
                        codigo: datos.codigo,
                        nombre: datos.nombre,
                        fechaInicio: new Date(datos.fechaInicio),
                        fechaFin: new Date(datos.fechaFin),
                        activa: Boolean(datos.activa ?? true),
                    },
                });
                return NextResponse.json({ ok: true, temporada: temp });
            }
            const temporada = await prisma.temporadaAcademica.create({
                data: {
                    codigo: datos.codigo,
                    nombre: datos.nombre,
                    fechaInicio: new Date(datos.fechaInicio),
                    fechaFin: new Date(datos.fechaFin),
                    activa: true,
                },
            });
            return NextResponse.json({ ok: true, temporada });
        }

        if (accion === "ELIMINAR_TEMPORADA") {
            await prisma.temporadaAcademica.delete({ where: { id: datos.id } });
            return NextResponse.json({ ok: true });
        }

        if (accion === "GUARDAR_SECCION_TEMPORADA") {
            let docenteIdEncontrado: string | null = null;
            const correoDocente = datos.correoDocenteAsignado
                ? String(datos.correoDocenteAsignado).trim().toLowerCase()
                : null;

            if (datos.llevaDocente && correoDocente && correoDocente.includes("@")) {
                const userDocente = await prisma.user.upsert({
                    where: { email: correoDocente },
                    update: { rol: correoDocente === admin.email ? admin.rol : "PROFESOR" },
                    create: {
                        email: correoDocente,
                        rol: "PROFESOR",
                        name: "Docente Asignado",
                    },
                });
                docenteIdEncontrado = userDocente.id;
            }

            if (datos.id) {
                const secEditada = await prisma.seccionCursoTemporada.update({
                    where: { id: datos.id },
                    data: {
                        codigoSeccion: datos.codigoSeccion,
                        nombreSeccion: datos.nombreSeccion,
                        temporadaId: datos.temporadaId,
                        cursoId: datos.cursoId,
                        docenteId: docenteIdEncontrado,
                        correoDocenteAsignado: correoDocente,
                        llevaDocente: Boolean(datos.llevaDocente),
                        permisoDocenteEditarCurso: Boolean(datos.permisoDocenteEditarCurso),
                        permiteInscripcionPagoDirecto: Boolean(
                            datos.permiteInscripcionPagoDirecto
                        ),
                        precioSeccion: Number(datos.precioSeccion || 0),
                        visibleEnInicio: datos.cerradoSoloInvitados
                            ? false
                            : Boolean(datos.visibleEnInicio),
                        cerradoSoloInvitados: Boolean(datos.cerradoSoloInvitados),
                        modoCuestionariosSeccion:
                            datos.modoCuestionariosSeccion || "POR_SESION",
                        modoTareas: datos.modoTareas || "TAREA_POR_SESION",
                        tipoAcreditacion: datos.tipoAcreditacion || "POR_DEFECTO_CURSO",
                    },
                });

                await prisma.seccionMembresiaPermitida.deleteMany({
                    where: { seccionId: secEditada.id },
                });
                for (const planSuscripcionId of datos.membresiasIds || []) {
                    await prisma.seccionMembresiaPermitida.create({
                        data: { seccionId: secEditada.id, planSuscripcionId },
                    });
                }

                await prisma.seccionSimuladorPermitido.deleteMany({
                    where: { seccionId: secEditada.id },
                });
                for (const planSimulacroId of datos.simuladoresIds || []) {
                    await prisma.seccionSimuladorPermitido.create({
                        data: { seccionId: secEditada.id, planSimulacroId },
                    });
                }

                return NextResponse.json({ ok: true, seccion: secEditada });
            }

            const cursoConSesiones = await prisma.cursoPrograma.findUnique({
                where: { id: datos.cursoId },
                include: {
                    modulos: {
                        orderBy: { orden: "asc" },
                        include: { lecciones: { orderBy: { orden: "asc" } } },
                    },
                },
            });
            const todasLasLecciones =
                cursoConSesiones?.modulos.flatMap((m) => m.lecciones) || [];

            const seccion = await prisma.seccionCursoTemporada.create({
                data: {
                    codigoSeccion: datos.codigoSeccion,
                    nombreSeccion: datos.nombreSeccion,
                    temporadaId: datos.temporadaId,
                    cursoId: datos.cursoId,
                    docenteId: docenteIdEncontrado,
                    correoDocenteAsignado: correoDocente,
                    llevaDocente: Boolean(datos.llevaDocente),
                    permisoDocenteEditarCurso: Boolean(datos.permisoDocenteEditarCurso),
                    permiteInscripcionPagoDirecto: Boolean(
                        datos.permiteInscripcionPagoDirecto
                    ),
                    precioSeccion: Number(datos.precioSeccion || 0),
                    visibleEnInicio: datos.cerradoSoloInvitados
                        ? false
                        : Boolean(datos.visibleEnInicio),
                    cerradoSoloInvitados: Boolean(datos.cerradoSoloInvitados),
                    cantidadSesionesHabilitadas: todasLasLecciones.length || 8,
                    modoCuestionariosSeccion:
                        datos.modoCuestionariosSeccion || "POR_SESION",
                    modoTareas: datos.modoTareas || "TAREA_POR_SESION",
                    tipoAcreditacion: datos.tipoAcreditacion || "POR_DEFECTO_CURSO",
                },
            });

            for (const planSuscripcionId of datos.membresiasIds || []) {
                await prisma.seccionMembresiaPermitida.create({
                    data: { seccionId: seccion.id, planSuscripcionId },
                });
            }

            for (const planSimulacroId of datos.simuladoresIds || []) {
                await prisma.seccionSimuladorPermitido.create({
                    data: { seccionId: seccion.id, planSimulacroId },
                });
            }

            for (let i = 0; i < todasLasLecciones.length; i++) {
                await prisma.sesionSeccionConfig.create({
                    data: {
                        seccionId: seccion.id,
                        leccionId: todasLasLecciones[i].id,
                        habilitada: true,
                        numeroClaseAgrupada: i + 1,
                        ordenEnSeccion: i + 1,
                    },
                });
            }

            return NextResponse.json({ ok: true, seccion });
        }

        if (accion === "ELIMINAR_SECCION_TEMPORADA") {
            await prisma.seccionCursoTemporada.delete({ where: { id: datos.id } });
            return NextResponse.json({ ok: true });
        }

        if (accion === "GUARDAR_ADECUACION_SESIONES_SECCION") {
            for (const item of datos.sesionesConfig || []) {
                await prisma.sesionSeccionConfig.update({
                    where: { id: item.id },
                    data: {
                        habilitada: Boolean(item.habilitada),
                        numeroClaseAgrupada: Number(item.numeroClaseAgrupada || 1),
                        materialDriveUrlOverride: item.materialDriveUrlOverride || null,
                        requiereTareaEnSesion: Boolean(item.requiereTareaEnSesion),
                        requiereExamenEnSesion: Boolean(item.requiereExamenEnSesion),
                    },
                });
            }
            return NextResponse.json({ ok: true });
        }

        // =========================================================================
        // 4. MEMBRESÍAS Y SIMULADORES OECE
        // =========================================================================
        if (accion === "GUARDAR_MEMBRESIA") {
            const membresia = await prisma.planSuscripcionCatalogo.upsert({
                where: { codigo: datos.codigo },
                update: {
                    nombre: datos.nombre,
                    etiquetaDuracionTexto: datos.etiquetaDuracionTexto,
                    imagenPortada: datos.imagenPortada,
                    descripcion: datos.descripcion || "",
                    precio: Number(datos.precio),
                    duracionDias: Number(datos.duracionDias || 30),
                },
                create: {
                    codigo: datos.codigo,
                    nombre: datos.nombre,
                    etiquetaDuracionTexto:
                        datos.etiquetaDuracionTexto || `${datos.duracionDias} días`,
                    imagenPortada:
                        datos.imagenPortada || "/membresias/default-membresia.jpg",
                    descripcion: datos.descripcion || "",
                    precio: Number(datos.precio || 89),
                    duracionDias: Number(datos.duracionDias || 30),
                },
            });
            return NextResponse.json({ ok: true, membresia });
        }

        if (accion === "ELIMINAR_MEMBRESIA") {
            await prisma.planSuscripcionCatalogo.delete({ where: { id: datos.id } });
            return NextResponse.json({ ok: true });
        }

        if (accion === "GUARDAR_SIMULADOR_OECE") {
            const dataBase = {
                codigo: datos.codigo,
                nombre: datos.nombre,
                nivel: datos.nivel || "PREMIUM",
                imagenPortada: datos.imagenPortada || "/simuladores/oece-default.jpg",
                descripcion: datos.descripcion || "",
                permiteVentaIndividual: Boolean(datos.permiteVentaIndividual ?? true),
                precio: Number(datos.precio || 0),
                precioOferta: datos.precioOferta ? Number(datos.precioOferta) : null,
                visibleEnInicio: Boolean(datos.visibleEnInicio ?? true),
                permitirVincularACursos: Boolean(datos.permitirVincularACursos ?? true),
                duracionDiasVigencia: Number(datos.duracionDiasVigencia || 30),
                intentosMaximosSimulacro: Number(datos.intentosMaximosSimulacro || 10),
                cantidadPreguntasHabilitadas: Number(
                    datos.cantidadPreguntasHabilitadas || 100
                ),
                habilitarDemoEnInicio: Boolean(datos.habilitarDemoEnInicio),
                cantidadPreguntasDemo: Number(datos.cantidadPreguntasDemo || 5),
                activo: true,
            };

            const simulador = datos.id
                ? await prisma.planSimulacroOECE.update({
                    where: { id: datos.id },
                    data: dataBase,
                })
                : await prisma.planSimulacroOECE.upsert({
                    where: { codigo: datos.codigo },
                    update: dataBase,
                    create: dataBase,
                });

            // Actualizar checkboxes de Suscripciones / Membresías vinculadas
            await prisma.simuladorMembresiaPermitida.deleteMany({
                where: { planSimulacroId: simulador.id },
            });
            for (const planSuscripcionId of datos.membresiasIds || []) {
                await prisma.simuladorMembresiaPermitida.create({
                    data: { planSimulacroId: simulador.id, planSuscripcionId },
                });
            }

            // Actualizar checkboxes de Cursos vinculados
            await prisma.simuladorCursoVinculado.deleteMany({
                where: { planSimulacroId: simulador.id },
            });
            for (const cursoId of datos.cursosIds || []) {
                await prisma.simuladorCursoVinculado.create({
                    data: { planSimulacroId: simulador.id, cursoId },
                });
            }

            return NextResponse.json({ ok: true, simulador });
        }

        if (accion === "ELIMINAR_SIMULADOR") {
            await prisma.planSimulacroOECE.delete({ where: { id: datos.id } });
            return NextResponse.json({ ok: true });
        }

        // =========================================================================
        // 5. MIGRACIÓN MASIVA DE LOS 4,200 CERTIFICADOS HISTÓRICOS (CON QR DE ANVERSO)
        // =========================================================================
        if (accion === "IMPORTAR_CERTIFICADOS_EXCEL") {
            const filas: any[] = Array.isArray(datos.filas) ? datos.filas : [];
            if (filas.length === 0) {
                return NextResponse.json(
                    { error: "No se enviaron filas para importar" },
                    { status: 400 }
                );
            }

            const lote = await prisma.loteMigracionExcel.create({
                data: {
                    nombreArchivoOriginal:
                        datos.nombreArchivo || `Migracion-${new Date().toISOString().slice(0, 10)}`,
                    ejecutadoPorId: admin.id,
                    totalFilasProcesadas: filas.length,
                },
            });

            let usuariosCreados = 0;
            let certificadosImportados = 0;

            for (const f of filas) {
                const cursoNombre = String(f.curso || "").replace(/^"|"$/g, "").trim();
                const codigoCert = String(f.codigo || "").trim();
                if (!cursoNombre || !codigoCert) continue;

                const { nombreCompleto: nombreAlumno, dni: dniAlumno } =
                    extraerNombreYDni(f.alumno, codigoCert);
                const { nombreCompleto: nombreDocente, dni: dniDocente } =
                    extraerNombreYDni(f.docente);

                const correoGenerado = `${dniAlumno.toLowerCase()}@migrado.aulaprofesional.pe`;

                // Buscamos al estudiante por DNI o creamos su cuenta automática con su DNI
                let usuarioAlumno = await prisma.user.findUnique({
                    where: { dni: dniAlumno },
                });

                if (!usuarioAlumno) {
                    usuarioAlumno = await prisma.user.upsert({
                        where: { email: correoGenerado },
                        update: {
                            dni: dniAlumno,
                            name: nombreAlumno,
                            nombres: nombreAlumno,
                        },
                        create: {
                            email: correoGenerado,
                            dni: dniAlumno,
                            name: nombreAlumno,
                            nombres: nombreAlumno,
                            rol: "ESTUDIANTE",
                            migradoDesdeExcel: true,
                            loteMigracionId: lote.id,
                            perfilCompletado: true,
                        },
                    });
                    usuariosCreados++;
                }

                const horas = parseInt(String(f.horas || "40"), 10) || 40;
                const fechaIni = parseFechaPeru(f.fechaInicio);
                const fechaFin = parseFechaPeru(f.fechaFin);

                await prisma.certificado.upsert({
                    where: { codigoUnico: codigoCert },
                    update: {
                        dniTitular: dniAlumno,
                        nombreCompletoTitular: nombreAlumno,
                        nombreProgramaImpreso: cursoNombre,
                        temporadaNombreImpreso: f.categoria || "Curso de Especialización",
                        seccionNombreImpreso: `Docente: ${nombreDocente}`,
                        horasAcademicas: horas,
                        fechaInicioCurso: fechaIni,
                        fechaTerminoCurso: fechaFin,
                        esMigradoExcel: true,
                        anulado: String(f.estado || "Activo").toLowerCase() === "anulado",
                        detalleModulosYNotasReverso: {
                            esSoloAnversoHistorico: true,
                            categoriaOriginal: f.categoria || "Curso de Especialización",
                            docenteOriginal: nombreDocente,
                            dniDocenteOriginal: dniDocente,
                            tipoHorasOriginal: f.tipoHoras || "Lectivas",
                        },
                    },
                    create: {
                        codigoUnico: codigoCert,
                        codigoVerificacionQR: codigoCert,
                        estudianteId: usuarioAlumno.id,
                        dniTitular: dniAlumno,
                        nombreCompletoTitular: nombreAlumno,
                        nombreProgramaImpreso: cursoNombre,
                        temporadaNombreImpreso: f.categoria || "Curso de Especialización",
                        seccionNombreImpreso: `Docente: ${nombreDocente}`,
                        horasAcademicas: horas,
                        fechaInicioCurso: fechaIni,
                        fechaTerminoCurso: fechaFin,
                        emitidoConFechaPasada: true,
                        esMigradoExcel: true,
                        loteMigracionId: lote.id,
                        urlVerificacionPublica: `/verificar/${encodeURIComponent(codigoCert)}`,
                        anulado: String(f.estado || "Activo").toLowerCase() === "anulado",
                        detalleModulosYNotasReverso: {
                            esSoloAnversoHistorico: true,
                            categoriaOriginal: f.categoria || "Curso de Especialización",
                            docenteOriginal: nombreDocente,
                            dniDocenteOriginal: dniDocente,
                            tipoHorasOriginal: f.tipoHoras || "Lectivas",
                        },
                    },
                });

                certificadosImportados++;
            }

            await prisma.loteMigracionExcel.update({
                where: { id: lote.id },
                data: { usuariosCreados, certificadosImportados },
            });

            return NextResponse.json({
                ok: true,
                usuariosCreados,
                certificadosImportados,
            });
        }

        // =========================================================================
        // 6. PASARELA API, APROBACIÓN MANUAL DE PAGOS Y FINANZAS
        // =========================================================================
        if (accion === "GUARDAR_CONFIG_PAGOS") {
            const configPagos = await prisma.configuracionGeneralPagos.upsert({
                where: { claveConfiguracion: "PRINCIPAL" },
                update: {
                    pagoAutomaticoHabilitado: Boolean(datos.pagoAutomaticoHabilitado),
                    pagoManualHabilitado: Boolean(datos.pagoManualHabilitado),
                    instruccionesGeneralesPagoManual:
                        datos.instruccionesGeneralesPagoManual || "",
                },
                create: {
                    claveConfiguracion: "PRINCIPAL",
                    pagoAutomaticoHabilitado: Boolean(datos.pagoAutomaticoHabilitado),
                    pagoManualHabilitado: Boolean(datos.pagoManualHabilitado),
                    instruccionesGeneralesPagoManual:
                        datos.instruccionesGeneralesPagoManual || "",
                },
            });
            return NextResponse.json({ ok: true, configPagos });
        }

        if (accion === "GUARDAR_PASARELA_API") {
            const pasarela = await prisma.configuracionPasarelaAutomatica.upsert({
                where: { proveedor: datos.proveedor || "CULQI" },
                update: {
                    nombreVisible: datos.nombreVisible || "Pasarela de Pagos Tarjeta / Yape",
                    habilitada: Boolean(datos.habilitada),
                    modoProduccion: Boolean(datos.modoProduccion),
                    publicKey: datos.publicKey || "",
                    merchantId: datos.merchantId || "",
                    variableEntornoSecretKey:
                        datos.variableEntornoSecretKey || "PASARELA_SECRET_KEY",
                    variableEntornoWebhook:
                        datos.variableEntornoWebhook || "PASARELA_WEBHOOK_SECRET",
                },
                create: {
                    proveedor: datos.proveedor || "CULQI",
                    nombreVisible: datos.nombreVisible || "Pasarela de Pagos Tarjeta / Yape",
                    habilitada: Boolean(datos.habilitada),
                    modoProduccion: Boolean(datos.modoProduccion),
                    publicKey: datos.publicKey || "",
                    merchantId: datos.merchantId || "",
                    variableEntornoSecretKey:
                        datos.variableEntornoSecretKey || "PASARELA_SECRET_KEY",
                    variableEntornoWebhook:
                        datos.variableEntornoWebhook || "PASARELA_WEBHOOK_SECRET",
                },
            });
            return NextResponse.json({ ok: true, pasarela });
        }

        if (accion === "DECIDIR_PAGO_MANUAL") {
            const nuevoEstado =
                datos.decision === "APROBAR" ? "APROBADO" : "RECHAZADO";
            const op = await prisma.operacionPago.update({
                where: { id: datos.operacionId },
                data: {
                    estado: nuevoEstado,
                    revisadoPorId: admin.id,
                    rolRevisor: admin.rol,
                    fechaRevision: new Date(),
                    motivoDecision: datos.motivo || `Revisión manual: ${nuevoEstado}`,
                },
            });

            if (nuevoEstado === "APROBADO") {
                await activarServiciosPedido(op.pedidoId);
            } else {
                await prisma.pedido.update({
                    where: { id: op.pedidoId },
                    data: { estado: "RECHAZADO" },
                });
            }

            return NextResponse.json({ ok: true });
        }

        if (accion === "ACTUALIZAR_USUARIO_O_CORREO") {
            const usuarioActualizado = await prisma.user.update({
                where: { id: datos.userId },
                data: {
                    email: datos.nuevoEmail
                        ? datos.nuevoEmail.trim().toLowerCase()
                        : undefined,
                    rol: datos.nuevoRol || undefined,
                    nombres: datos.nombres || undefined,
                    dni: datos.dni || undefined,
                },
            });
            return NextResponse.json({ ok: true, usuario: usuarioActualizado });
        }

        return NextResponse.json({ error: "Acción no reconocida" }, { status: 400 });
    } catch (error: any) {
        console.error("Error POST /api/admin/configuracion:", error);
        return NextResponse.json(
            { error: error?.message || "Error al guardar en base de datos" },
            { status: 500 }
        );
    }
}