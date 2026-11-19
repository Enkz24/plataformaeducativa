// src/app/api/aula-virtual/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const INCLUDE_SECCION_COMPLETA = {
    temporada: true,
    curso: {
        include: {
            categoria: true,
            modulos: {
                orderBy: { orden: "asc" as const },
                include: {
                    evaluaciones: {
                        where: { activa: true },
                        include: {
                            preguntas: {
                                orderBy: { orden: "asc" as const },
                                include: { opciones: { orderBy: { orden: "asc" as const } } },
                            },
                        },
                    },
                },
            },
        },
    },
    docente: {
        select: {
            id: true,
            name: true,
            nombres: true,
            apellidos: true,
            email: true,
            cargoActual: true,
        },
    },
    sesionesHabilitadas: {
        where: { habilitada: true },
        orderBy: [{ numeroClaseAgrupada: "asc" as const }, { ordenEnSeccion: "asc" as const }],
        include: {
            leccion: {
                include: {
                    modulo: { select: { id: true, titulo: true, orden: true } },
                    recursosAdjuntos: { orderBy: { orden: "asc" as const } },
                    tareas: true,
                    evaluaciones: {
                        where: { activa: true },
                        include: {
                            preguntas: {
                                orderBy: { orden: "asc" as const },
                                include: { opciones: { orderBy: { orden: "asc" as const } } },
                            },
                        },
                    },
                },
            },
        },
    },
    clasesVivoMeet: { orderBy: { numeroClase: "asc" as const } },
    planesMembresiaPermitidos: { include: { planSuscripcion: true } },
    simuladoresPermitidos: { include: { planSimulacro: true } },
};

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Debes iniciar sesión" }, { status: 401 });
        }

        const emailUsuario = session.user.email.toLowerCase();
        const usuario = await prisma.user.findUnique({
            where: { email: emailUsuario },
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
                perfilCompletado: true,
            },
        });

        if (!usuario || !usuario.activo) {
            return NextResponse.json({ error: "Usuario inactivo o no encontrado" }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const seccionSolicitadaId = searchParams.get("seccion");
        const ahora = new Date();

        // Mapa para deduplicar secciones y registrar por qué el alumno tiene acceso a cada una
        const seccionesMap = new Map<
            string,
            { seccion: any; origenesAcceso: string[]; matricula: any | null }
        >();

        const registrarSeccion = (
            seccion: any,
            origen: string,
            matricula: any | null = null
        ) => {
            if (!seccion) return;
            const existente = seccionesMap.get(seccion.id);
            if (existente) {
                if (!existente.origenesAcceso.includes(origen)) {
                    existente.origenesAcceso.push(origen);
                }
                if (matricula && !existente.matricula) {
                    existente.matricula = matricula;
                }
            } else {
                seccionesMap.set(seccion.id, {
                    seccion,
                    origenesAcceso: [origen],
                    matricula,
                });
            }
        };

        // =========================================================================
        // 1. RESOLUCIÓN DE ACCESOS ACTIVOS SEGÚN ROL, PAGOS, SUSCRIPCIÓN E INVITACIÓN
        // =========================================================================
        const esAdminOAsistente =
            usuario.rol === "ADMINISTRADOR" ||
            usuario.rol === "ASISTENTE_ADMINISTRATIVO";

        // A. Suscripciones / Membresías ACTIVAS y NO VENCIDAS del usuario
        const suscripcionesActivas = await prisma.suscripcionEstudiante.findMany({
            where: {
                estudianteId: usuario.id,
                estado: "ACTIVO",
                OR: [{ fechaVencimiento: null }, { fechaVencimiento: { gte: ahora } }],
            },
            include: { planSuscripcion: true },
            orderBy: { fechaVencimiento: "desc" },
        });

        const idsPlanesMembresiaActivos = suscripcionesActivas.map(
            (s) => s.planSuscripcionId
        );

        if (esAdminOAsistente) {
            // El administrador puede previsualizar todas las secciones activas (o la sección puntual pedida)
            const seccionesAdmin = await prisma.seccionCursoTemporada.findMany({
                where: seccionSolicitadaId
                    ? { id: seccionSolicitadaId }
                    : { activa: true },
                include: INCLUDE_SECCION_COMPLETA,
                orderBy: { createdAt: "desc" },
                take: 30,
            });
            for (const sec of seccionesAdmin) {
                registrarSeccion(sec, "Vista Administrador");
            }
        } else {
            // B. Si es DOCENTE: secciones asignadas a su ID o a su correo Gmail en temporadas vigentes
            if (usuario.rol === "PROFESOR") {
                const seccionesDocente = await prisma.seccionCursoTemporada.findMany({
                    where: {
                        activa: true,
                        llevaDocente: true,
                        OR: [
                            { docenteId: usuario.id },
                            { correoDocenteAsignado: emailUsuario },
                        ],
                        temporada: {
                            activa: true,
                            fechaFin: { gte: ahora },
                        },
                    },
                    include: INCLUDE_SECCION_COMPLETA,
                });
                for (const sec of seccionesDocente) {
                    registrarSeccion(sec, "Docente Asignado");
                }
            }

            // C. CURSOS / SECCIONES PAGADAS INDIVIDUALMENTE (Matrículas ACTIVAS y sin vencimiento)
            const matriculasActivas = await prisma.matriculaEstudiante.findMany({
                where: {
                    estudianteId: usuario.id,
                    estado: "ACTIVO",
                    OR: [
                        { fechaVencimientoAcceso: null },
                        { fechaVencimientoAcceso: { gte: ahora } },
                    ],
                },
                include: {
                    seccion: { include: INCLUDE_SECCION_COMPLETA },
                },
            });

            for (const mat of matriculasActivas) {
                if (mat.seccion && mat.seccion.activa) {
                    const etiqueta =
                        mat.origenAcceso === "INVITACION_CORREO"
                            ? "Invitación Gmail"
                            : mat.origenAcceso === "MEMBRESIA"
                                ? "Membresía Activa"
                                : "Curso Pagado";
                    registrarSeccion(mat.seccion, etiqueta, mat);
                }
            }

            // D. SECCIONES HABILITADAS POR SU PLAN DE MEMBRESÍA / SUSCRIPCIÓN ACTIVA
            if (idsPlanesMembresiaActivos.length > 0) {
                const seccionesPorMembresia =
                    await prisma.seccionCursoTemporada.findMany({
                        where: {
                            activa: true,
                            cerradoSoloInvitados: false,
                            temporada: { activa: true },
                            planesMembresiaPermitidos: {
                                some: {
                                    planSuscripcionId: { in: idsPlanesMembresiaActivos },
                                },
                            },
                        },
                        include: INCLUDE_SECCION_COMPLETA,
                    });

                for (const sec of seccionesPorMembresia) {
                    // Identificamos el nombre exacto del plan de membresía del alumno que habilita esta sección
                    const planCoincidente = suscripcionesActivas.find((sub) =>
                        sec.planesMembresiaPermitidos.some(
                            (p) => p.planSuscripcionId === sub.planSuscripcionId
                        )
                    );
                    const etiquetaPlan = planCoincidente
                        ? `Membresía: ${planCoincidente.planSuscripcion.nombre}`
                        : "Membresía Activa";

                    const matExistente = matriculasActivas.find(
                        (m) => m.seccionId === sec.id
                    );
                    registrarSeccion(sec, etiquetaPlan, matExistente || null);
                }
            }

            // E. INVITACIONES DIRECTAS POR CORREO GMAIL A SECCIONES CERRADAS O PRIVADAS
            const invitaciones = await prisma.invitacionSeccionCorreo.findMany({
                where: {
                    correoGmail: emailUsuario,
                    seccion: { activa: true },
                },
                include: {
                    seccion: { include: INCLUDE_SECCION_COMPLETA },
                },
            });

            for (const inv of invitaciones) {
                if (!inv.aceptada) {
                    await prisma.invitacionSeccionCorreo.update({
                        where: { id: inv.id },
                        data: { aceptada: true, fechaAceptacion: new Date() },
                    });
                }
                const matExistente = matriculasActivas.find(
                    (m) => m.seccionId === inv.seccionId
                );
                registrarSeccion(inv.seccion, "Invitación Gmail", matExistente || null);
            }
        }

        const seccionesActivasLista = Array.from(seccionesMap.values());
        const idsSeccionesActivas = seccionesActivasLista.map((s) => s.seccion.id);
        const idsCursosActivos = seccionesActivasLista.map(
            (s) => s.seccion.cursoId
        );

        // =========================================================================
        // 2. SIMULADORES ACTIVOS DEL ALUMNO (POR COMPRA PROPIA, MEMBRESÍA O SECCIÓN ACTIVA)
        // =========================================================================
        const simuladoresComprados = await prisma.suscripcionSimulacroOECE.findMany({
            where: {
                estudianteId: usuario.id,
                estado: "ACTIVO",
                OR: [{ fechaVencimiento: null }, { fechaVencimiento: { gte: ahora } }],
            },
            select: { planSimulacroId: true, fechaVencimiento: true },
        });
        const idsSimComprados = simuladoresComprados.map((s) => s.planSimulacroId);

        const simuladoresActivos = await prisma.planSimulacroOECE.findMany({
            where: esAdminOAsistente
                ? { activo: true }
                : {
                    activo: true,
                    OR: [
                        { id: { in: idsSimComprados } },
                        ...(idsPlanesMembresiaActivos.length > 0
                            ? [
                                {
                                    membresiasDondeSeIncluye: {
                                        some: {
                                            planSuscripcionId: { in: idsPlanesMembresiaActivos },
                                        },
                                    },
                                },
                            ]
                            : []),
                        ...(idsSeccionesActivas.length > 0
                            ? [
                                {
                                    seccionesDondeParticipa: {
                                        some: { seccionId: { in: idsSeccionesActivas } },
                                    },
                                },
                            ]
                            : []),
                        ...(idsCursosActivos.length > 0
                            ? [
                                {
                                    cursosVinculados: {
                                        some: { cursoId: { in: idsCursosActivos } },
                                    },
                                },
                            ]
                            : []),
                    ],
                },
            include: {
                evaluacionesSimulacro: {
                    where: { activa: true },
                    include: {
                        preguntas: {
                            orderBy: { orden: "asc" },
                            include: { opciones: { orderBy: { orden: "asc" } } },
                        },
                    },
                },
            },
        });

        // =========================================================================
        // 3. PROGRESO, NOTAS, INTENTOS, FORO, CERTIFICADOS Y PAGOS DEL USUARIO
        // =========================================================================
        const [
            progresosLeccion,
            calificacionesAlumno,
            intentosEvaluacion,
            mensajesForo,
            certificadosAlumno,
            pedidosAlumno,
        ] = await Promise.all([
            prisma.progresoLeccion.findMany({
                where: { estudianteId: usuario.id },
            }),
            prisma.calificacionSeccionEstudiante.findMany({
                where: {
                    estudianteId: usuario.id,
                    seccionId: { in: idsSeccionesActivas },
                },
                orderBy: { updatedAt: "desc" },
            }),
            prisma.intentoEvaluacion.findMany({
                where: { estudianteId: usuario.id },
                include: { evaluacion: { select: { titulo: true, esSimulacroOECE: true } } },
                orderBy: { fechaInicio: "desc" },
                take: 40,
            }),
            prisma.mensajeForoSeccion.findMany({
                where: { seccionId: { in: idsSeccionesActivas } },
                include: {
                    autor: { select: { name: true, nombres: true, rol: true } },
                },
                orderBy: { createdAt: "desc" },
                take: 100,
            }),
            prisma.certificado.findMany({
                where: {
                    anulado: false,
                    OR: [
                        { estudianteId: usuario.id },
                        ...(usuario.dni ? [{ dniTitular: usuario.dni }] : []),
                    ],
                },
                orderBy: { fechaEmision: "desc" },
            }),
            prisma.pedido.findMany({
                where: { estudianteId: usuario.id },
                include: { items: true },
                orderBy: { createdAt: "desc" },
                take: 25,
            }),
        ]);

        const leccionesCompletadasIds = progresosLeccion
            .filter((p) => p.completada)
            .map((p) => p.leccionId);

        // Calculamos el progreso real 0-100% y etapa (1-5) por cada sección activa
        const seccionesFormateadas = seccionesActivasLista.map((item) => {
            const totalSesiones = item.seccion.sesionesHabilitadas.length;
            const completadasEnSeccion = item.seccion.sesionesHabilitadas.filter(
                (s: any) => leccionesCompletadasIds.includes(s.leccionId)
            ).length;

            const porcentaje =
                totalSesiones > 0
                    ? Math.round((completadasEnSeccion / totalSesiones) * 100)
                    : 0;
            const etapaActual = Math.min(5, Math.floor((porcentaje / 100) * 5));

            const notasSeccion = calificacionesAlumno.filter(
                (c) => c.seccionId === item.seccion.id
            );
            const foroSeccion = mensajesForo.filter(
                (m) => m.seccionId === item.seccion.id
            );
            const certificadoSeccion = certificadosAlumno.find(
                (cert) => cert.seccionId === item.seccion.id
            );

            return {
                ...item.seccion,
                origenesAcceso: item.origenesAcceso,
                progreso: {
                    totalSesiones,
                    completadasEnSeccion,
                    porcentaje,
                    etapaActual,
                    habilitadoCertificado:
                        porcentaje === 100 ||
                        Boolean(item.matricula?.habilitadoImprimirCert) ||
                        Boolean(certificadoSeccion),
                },
                notasAlumno: notasSeccion,
                mensajesForo: foroSeccion,
                certificadoEmitido: certificadoSeccion || null,
            };
        });

        return NextResponse.json({
            usuario,
            suscripcionesActivas,
            seccionesActivas: seccionesFormateadas,
            simuladoresActivos,
            leccionesCompletadasIds,
            intentosEvaluacion,
            certificadosAlumno,
            pedidosAlumno,
        });
    } catch (error) {
        console.error("Error GET /api/aula-virtual:", error);
        return NextResponse.json(
            { error: "Error cargando tu Aula Virtual" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "No autenticado" }, { status: 401 });
        }

        const usuario = await prisma.user.findUnique({
            where: { email: session.user.email.toLowerCase() },
        });
        if (!usuario) {
            return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
        }

        const body = await request.json();
        const { accion, datos } = body;

        // 1. MARCAR SESIÓN COMO COMPLETADA Y ACTUALIZAR PROGRESO 1-2-3-4-5
        if (accion === "MARCAR_SESION_COMPLETADA") {
            const { seccionId, leccionId, completada } = datos;

            await prisma.progresoLeccion.upsert({
                where: {
                    estudianteId_leccionId: {
                        estudianteId: usuario.id,
                        leccionId,
                    },
                },
                update: {
                    completada: Boolean(completada),
                    seccionId: seccionId || null,
                    fechaCompletado: completada ? new Date() : null,
                },
                create: {
                    estudianteId: usuario.id,
                    leccionId,
                    seccionId: seccionId || null,
                    completada: Boolean(completada),
                    fechaCompletado: completada ? new Date() : null,
                },
            });

            // Recalcular porcentaje en MatriculaEstudiante si existe
            if (seccionId) {
                const sesionesSec = await prisma.sesionSeccionConfig.findMany({
                    where: { seccionId, habilitada: true },
                    select: { leccionId: true },
                });
                const leccionIds = sesionesSec.map((s) => s.leccionId);
                const total = leccionIds.length;

                const completadasCount = await prisma.progresoLeccion.count({
                    where: {
                        estudianteId: usuario.id,
                        leccionId: { in: leccionIds },
                        completada: true,
                    },
                });

                const porcentaje = total > 0 ? (completadasCount / total) * 100 : 0;
                const etapa = Math.min(5, Math.floor((porcentaje / 100) * 5));

                const matExistente = await prisma.matriculaEstudiante.findFirst({
                    where: { estudianteId: usuario.id, seccionId },
                });

                if (matExistente) {
                    await prisma.matriculaEstudiante.update({
                        where: { id: matExistente.id },
                        data: {
                            porcentajeProgreso: porcentaje,
                            etapaActualCompletada: etapa,
                            habilitadoImprimirCert: porcentaje >= 100,
                            fechaCulminacion: porcentaje >= 100 ? new Date() : null,
                        },
                    });
                }
            }

            return NextResponse.json({ ok: true });
        }

        // 2. RESOLVER CUESTIONARIO DE SESIÓN O SIMULADOR OECE (AUTOCALIFICACIÓN INMEDIATA)
        if (accion === "ENVIAR_CUESTIONARIO") {
            const { evaluacionId, seccionId, respuestas, esModoPractica } = datos;
            // respuestas = { [preguntaId]: opcionIdSeleccionada }

            const evaluacion = await prisma.evaluacion.findUnique({
                where: { id: evaluacionId },
                include: {
                    preguntas: { include: { opciones: true } },
                },
            });

            if (!evaluacion) {
                return NextResponse.json(
                    { error: "Evaluación no encontrada" },
                    { status: 404 }
                );
            }

            const totalPreguntas = evaluacion.preguntas.length;
            let correctas = 0;
            const temasConError: Record<string, number> = {};
            const detalleCorreccion: any[] = [];

            for (const preg of evaluacion.preguntas) {
                const opcionElegidaId = respuestas?.[preg.id];
                const opcionCorrecta = preg.opciones.find((o) => o.esCorrecta);
                const acerto = opcionCorrecta && opcionCorrecta.id === opcionElegidaId;

                if (acerto) {
                    correctas++;
                } else {
                    const tema = preg.categoriaTematica || "General";
                    temasConError[tema] = (temasConError[tema] || 0) + 1;
                }

                detalleCorreccion.push({
                    preguntaId: preg.id,
                    enunciado: preg.enunciado,
                    acerto: Boolean(acerto),
                    opcionCorrectaTexto: opcionCorrecta
                        ? `${opcionCorrecta.letraOpcion}. ${opcionCorrecta.textoOpcion}`
                        : "",
                    explicacionSolucion: preg.explicacionSolucion || "",
                    referenciaNormativa: preg.referenciaNormativa || "",
                });
            }

            const porcentajeAciertos =
                totalPreguntas > 0 ? (correctas / totalPreguntas) * 100 : 0;
            const notaVigesimal =
                totalPreguntas > 0
                    ? (correctas / totalPreguntas) * Number(evaluacion.notaMaxima || 20)
                    : 0;
            const aprobado =
                notaVigesimal >= Number(evaluacion.notaMinimaAprobatoria || 14);

            const intentosPrevios = await prisma.intentoEvaluacion.count({
                where: { evaluacionId, estudianteId: usuario.id },
            });

            const intento = await prisma.intentoEvaluacion.create({
                data: {
                    evaluacionId,
                    estudianteId: usuario.id,
                    seccionId: seccionId || null,
                    esModoPractica: Boolean(esModoPractica),
                    numeroIntento: intentosPrevios + 1,
                    fechaFin: new Date(),
                    respuestasJson: respuestas || {},
                    temasReforzarJson: temasConError,
                    puntajeObtenido: Number(notaVigesimal.toFixed(2)),
                    porcentajeAciertos: Number(porcentajeAciertos.toFixed(2)),
                    aprobado,
                    calificadoAutomatico: true,
                },
            });

            return NextResponse.json({
                ok: true,
                resultado: {
                    intentoId: intento.id,
                    correctas,
                    totalPreguntas,
                    notaObtenida: Number(notaVigesimal.toFixed(2)),
                    porcentajeAciertos: Number(porcentajeAciertos.toFixed(1)),
                    aprobado,
                    temasReforzar: Object.entries(temasConError).map(([tema, errores]) => ({
                        tema,
                        errores,
                    })),
                    detalleCorreccion,
                },
            });
        }

        // 3. PUBLICAR MENSAJE EN EL FORO DE LA SECCIÓN
        if (accion === "PUBLICAR_FORO") {
            const { seccionId, mensaje } = datos;
            if (!mensaje || !String(mensaje).trim()) {
                return NextResponse.json(
                    { error: "Escribe un mensaje antes de publicar" },
                    { status: 400 }
                );
            }

            await prisma.mensajeForoSeccion.create({
                data: {
                    seccionId,
                    autorId: usuario.id,
                    mensaje: String(mensaje).trim(),
                },
            });

            return NextResponse.json({ ok: true });
        }

        return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
    } catch (error: any) {
        console.error("Error POST /api/aula-virtual:", error);
        return NextResponse.json(
            { error: error?.message || "Error procesando acción" },
            { status: 500 }
        );
    }
}