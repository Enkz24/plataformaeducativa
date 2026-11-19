// src/app/api/docente/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function obtenerDocenteOAdmin() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return null;

    const usuario = await prisma.user.findUnique({
        where: { email: session.user.email.toLowerCase() },
    });

    if (!usuario || !usuario.activo) return null;
    if (
        usuario.rol !== "PROFESOR" &&
        usuario.rol !== "ADMINISTRADOR" &&
        usuario.rol !== "ASISTENTE_ADMINISTRATIVO"
    ) {
        return null;
    }
    return usuario;
}

export async function GET() {
    try {
        const docente = await obtenerDocenteOAdmin();
        if (!docente) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const ahora = new Date();
        const esAdmin =
            docente.rol === "ADMINISTRADOR" ||
            docente.rol === "ASISTENTE_ADMINISTRATIVO";

        // El docente solo ve sus secciones asignadas mientras la temporada esté vigente
        const seccionesAsignadas = await prisma.seccionCursoTemporada.findMany({
            where: esAdmin
                ? { activa: true }
                : {
                    activa: true,
                    llevaDocente: true,
                    OR: [
                        { docenteId: docente.id },
                        { correoDocenteAsignado: docente.email.toLowerCase() },
                    ],
                    temporada: {
                        activa: true,
                        fechaInicio: { lte: ahora },
                        fechaFin: { gte: ahora },
                    },
                },
            include: {
                temporada: true,
                curso: {
                    include: {
                        modulos: {
                            orderBy: { orden: "asc" },
                            include: {
                                lecciones: {
                                    orderBy: { orden: "asc" },
                                    include: {
                                        recursosAdjuntos: { orderBy: { orden: "asc" } },
                                        evaluaciones: {
                                            include: { preguntas: true },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                sesionesHabilitadas: {
                    where: { habilitada: true },
                    orderBy: [{ numeroClaseAgrupada: "asc" }, { ordenEnSeccion: "asc" }],
                    include: { leccion: { include: { modulo: true } } },
                },
                clasesVivoMeet: { orderBy: { numeroClase: "asc" } },
                asistencias: true,
                calificaciones: { orderBy: { updatedAt: "desc" } },
                matriculas: {
                    where: { estado: "ACTIVO" },
                    include: {
                        estudiante: {
                            select: {
                                id: true,
                                name: true,
                                nombres: true,
                                apellidos: true,
                                dni: true,
                                email: true,
                            },
                        },
                    },
                },
                invitacionesCorreo: true,
                planesMembresiaPermitidos: true,
            },
            orderBy: { createdAt: "desc" },
        });

        // Construimos la lista unificada de estudiantes por cada sección (matriculados + invitados registrados + membresía activa)
        const seccionesConEstudiantes = await Promise.all(
            seccionesAsignadas.map(async (sec) => {
                const alumnosMap = new Map<string, any>();

                for (const m of sec.matriculas) {
                    if (m.estudiante) {
                        alumnosMap.set(m.estudiante.id, {
                            ...m.estudiante,
                            origen: m.origenAcceso,
                        });
                    }
                }

                // Estudiantes invitados por Gmail que ya existen en User
                const correosInv = sec.invitacionesCorreo
                    .filter((i) => i.rolInvitado === "ESTUDIANTE")
                    .map((i) => i.correoGmail.toLowerCase());

                if (correosInv.length > 0) {
                    const usersInv = await prisma.user.findMany({
                        where: { email: { in: correosInv } },
                        select: {
                            id: true,
                            name: true,
                            nombres: true,
                            apellidos: true,
                            dni: true,
                            email: true,
                        },
                    });
                    for (const u of usersInv) {
                        if (!alumnosMap.has(u.id)) {
                            alumnosMap.set(u.id, { ...u, origen: "INVITACION_CORREO" });
                        }
                    }
                }

                // Estudiantes con membresía activa permitida en esta sección
                const planesIds = sec.planesMembresiaPermitidos.map(
                    (p) => p.planSuscripcionId
                );
                if (planesIds.length > 0 && !sec.cerradoSoloInvitados) {
                    const subs = await prisma.suscripcionEstudiante.findMany({
                        where: {
                            planSuscripcionId: { in: planesIds },
                            estado: "ACTIVO",
                            OR: [
                                { fechaVencimiento: null },
                                { fechaVencimiento: { gte: ahora } },
                            ],
                        },
                        include: {
                            estudiante: {
                                select: {
                                    id: true,
                                    name: true,
                                    nombres: true,
                                    apellidos: true,
                                    dni: true,
                                    email: true,
                                },
                            },
                        },
                    });
                    for (const s of subs) {
                        if (s.estudiante && !alumnosMap.has(s.estudiante.id)) {
                            alumnosMap.set(s.estudiante.id, {
                                ...s.estudiante,
                                origen: "MEMBRESIA",
                            });
                        }
                    }
                }

                const totalHorasDictadas = sec.clasesVivoMeet.reduce(
                    (acc, c) => acc + Number(c.horasTrabajoDocente || 0),
                    0
                );

                return {
                    ...sec,
                    estudiantesSeccion: Array.from(alumnosMap.values()),
                    totalHorasDictadas: Number(totalHorasDictadas.toFixed(2)),
                };
            })
        );

        const totalHorasGlobal = seccionesConEstudiantes.reduce(
            (acc, s) => acc + s.totalHorasDictadas,
            0
        );

        return NextResponse.json({
            docente: {
                id: docente.id,
                name: docente.name,
                nombres: docente.nombres,
                apellidos: docente.apellidos,
                email: docente.email,
                rol: docente.rol,
            },
            secciones: seccionesConEstudiantes,
            totalHorasGlobal: Number(totalHorasGlobal.toFixed(2)),
        });
    } catch (error) {
        console.error("Error GET /api/docente:", error);
        return NextResponse.json(
            { error: "Error cargando el panel docente" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const docente = await obtenerDocenteOAdmin();
        if (!docente) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const body = await request.json();
        const { accion, datos } = body;

        // Verificación de pertenencia a la sección (seguridad)
        const verificarSeccion = async (seccionId: string) => {
            const sec = await prisma.seccionCursoTemporada.findUnique({
                where: { id: seccionId },
            });
            if (!sec) return null;
            const esAdmin =
                docente.rol === "ADMINISTRADOR" ||
                docente.rol === "ASISTENTE_ADMINISTRATIVO";
            const esTitular =
                sec.docenteId === docente.id ||
                sec.correoDocenteAsignado?.toLowerCase() ===
                docente.email.toLowerCase();
            return esAdmin || esTitular ? sec : null;
        };

        // 1. ASOCIAR / ACTUALIZAR LINK DE CHAT WHATSAPP DE LA SECCIÓN
        if (accion === "GUARDAR_WHATSAPP_SECCION") {
            const sec = await verificarSeccion(datos.seccionId);
            if (!sec) {
                return NextResponse.json({ error: "Sin acceso a esta sección" }, { status: 403 });
            }
            await prisma.seccionCursoTemporada.update({
                where: { id: sec.id },
                data: {
                    enlaceGrupoWhatsapp: datos.enlaceGrupoWhatsapp || null,
                    horarioSeccionTexto: datos.horarioSeccionTexto || undefined,
                },
            });
            return NextResponse.json({ ok: true });
        }

        // 2. PROGRAMAR O ELIMINAR CLASE EN VIVO GOOGLE MEET (Con horas de trabajo y sesiones cubiertas)
        if (accion === "CREAR_CLASE_MEET") {
            const sec = await verificarSeccion(datos.seccionId);
            if (!sec) {
                return NextResponse.json({ error: "Sin acceso a esta sección" }, { status: 403 });
            }

            const sesionesArray = String(datos.sesionesCubiertasNumeros || "1")
                .split(",")
                .map((n) => n.trim())
                .filter(Boolean);

            const clase = await prisma.claseVivoMeetSeccion.create({
                data: {
                    seccionId: sec.id,
                    numeroClase: Number(datos.numeroClase || 1),
                    tituloClase: datos.tituloClase || `Clase ${datos.numeroClase || 1} en Vivo`,
                    sesionesCubiertasNumeros: sesionesArray.join(","),
                    cantidadSesionesEquiv: Math.max(1, sesionesArray.length),
                    fechaHoraInicio: new Date(datos.fechaHoraInicio),
                    fechaHoraFin: new Date(datos.fechaHoraFin),
                    horasTrabajoDocente: Number(datos.horasTrabajoDocente || 2),
                    enlaceGoogleMeet: datos.enlaceGoogleMeet || null,
                    enlaceGrabacionResultante: datos.enlaceGrabacionResultante || null,
                },
            });

            return NextResponse.json({ ok: true, clase });
        }

        if (accion === "ELIMINAR_CLASE_MEET") {
            const sec = await verificarSeccion(datos.seccionId);
            if (!sec) {
                return NextResponse.json({ error: "Sin acceso a esta sección" }, { status: 403 });
            }
            await prisma.claseVivoMeetSeccion.delete({
                where: { id: datos.claseId },
            });
            return NextResponse.json({ ok: true });
        }

        // 3. REGISTRAR / EDITAR ASISTENCIA (Individual o agrupada por todas las sesiones de una clase Meet)
        if (accion === "GUARDAR_ASISTENCIA_LOTE") {
            const sec = await verificarSeccion(datos.seccionId);
            if (!sec) {
                return NextResponse.json({ error: "Sin acceso a esta sección" }, { status: 403 });
            }

            // datos.registros = [{ estudianteId, numeroSesionCubierta, estado, claseMeetId?, observacion? }]
            const registros: any[] = Array.isArray(datos.registros)
                ? datos.registros
                : [];

            for (const reg of registros) {
                await prisma.asistenciaEstudianteSeccion.upsert({
                    where: {
                        seccionId_estudianteId_numeroSesionCubierta: {
                            seccionId: sec.id,
                            estudianteId: reg.estudianteId,
                            numeroSesionCubierta: Number(reg.numeroSesionCubierta),
                        },
                    },
                    update: {
                        estado: reg.estado || "ASISTIO",
                        claseMeetId: reg.claseMeetId || null,
                        editadoPorId: docente.id,
                        marcadoAutomatico: false,
                        observacion: reg.observacion || null,
                    },
                    create: {
                        seccionId: sec.id,
                        estudianteId: reg.estudianteId,
                        numeroSesionCubierta: Number(reg.numeroSesionCubierta),
                        estado: reg.estado || "ASISTIO",
                        claseMeetId: reg.claseMeetId || null,
                        editadoPorId: docente.id,
                        marcadoAutomatico: false,
                        observacion: reg.observacion || null,
                    },
                });
            }

            return NextResponse.json({ ok: true });
        }

        // 4. SUBIR O EDITAR NOTA CON COMENTARIO POR ALUMNO Y MÓDULO/SESIÓN
        if (accion === "GUARDAR_CALIFICACION") {
            const sec = await verificarSeccion(datos.seccionId);
            if (!sec) {
                return NextResponse.json({ error: "Sin acceso a esta sección" }, { status: 403 });
            }

            const existente = await prisma.calificacionSeccionEstudiante.findFirst({
                where: {
                    seccionId: sec.id,
                    estudianteId: datos.estudianteId,
                    conceptoEvaluado: datos.conceptoEvaluado,
                },
            });

            if (existente) {
                await prisma.calificacionSeccionEstudiante.update({
                    where: { id: existente.id },
                    data: {
                        nota: Number(datos.nota),
                        comentarioDocente: datos.comentarioDocente || null,
                        moduloId: datos.moduloId || null,
                        registradoPorId: docente.id,
                    },
                });
            } else {
                await prisma.calificacionSeccionEstudiante.create({
                    data: {
                        seccionId: sec.id,
                        estudianteId: datos.estudianteId,
                        moduloId: datos.moduloId || null,
                        conceptoEvaluado: datos.conceptoEvaluado,
                        nota: Number(datos.nota),
                        comentarioDocente: datos.comentarioDocente || null,
                        registradoPorId: docente.id,
                    },
                });
            }

            // Actualizamos el promedio final en MatriculaEstudiante si existe matrícula
            const todasNotasAlumno = await prisma.calificacionSeccionEstudiante.findMany({
                where: { seccionId: sec.id, estudianteId: datos.estudianteId },
            });

            if (todasNotasAlumno.length > 0) {
                const promedio =
                    todasNotasAlumno.reduce((acc, n) => acc + Number(n.nota), 0) /
                    todasNotasAlumno.length;

                const mat = await prisma.matriculaEstudiante.findFirst({
                    where: { seccionId: sec.id, estudianteId: datos.estudianteId },
                });

                if (mat) {
                    await prisma.matriculaEstudiante.update({
                        where: { id: mat.id },
                        data: {
                            notaFinalPromedio: Number(promedio.toFixed(2)),
                            aprobado: promedio >= 14,
                        },
                    });
                }
            }

            return NextResponse.json({ ok: true });
        }

        // 5. EDICIÓN CONDICIONAL DE MATERIALES Y PREGUNTAS (Solo si permisoDocenteEditarCurso === true)
        if (accion === "DOCENTE_EDITAR_MATERIAL") {
            const sec = await verificarSeccion(datos.seccionId);
            if (!sec) {
                return NextResponse.json({ error: "Sin acceso a esta sección" }, { status: 403 });
            }
            const esAdmin = docente.rol === "ADMINISTRADOR";
            if (!esAdmin && !sec.permisoDocenteEditarCurso) {
                return NextResponse.json(
                    { error: "No tienes permiso habilitado por el Administrador para editar materiales de este curso." },
                    { status: 403 }
                );
            }

            if (datos.videoUrl !== undefined) {
                await prisma.leccionCurso.update({
                    where: { id: datos.leccionId },
                    data: { videoUrl: datos.videoUrl || null },
                });
            }

            if (datos.tituloMaterial && datos.archivoUrl) {
                await prisma.recursoLeccion.create({
                    data: {
                        leccionId: datos.leccionId,
                        titulo: datos.tituloMaterial,
                        tipoArchivo: datos.tipoArchivo || "PPTX",
                        origenAlmacenamiento: datos.archivoUrl.includes("drive.google.com")
                            ? "GOOGLE_DRIVE_LINK"
                            : "SERVIDOR_PUBLIC",
                        archivoUrl: datos.archivoUrl,
                    },
                });
            }

            return NextResponse.json({ ok: true });
        }

        if (accion === "DOCENTE_AGREGAR_PREGUNTA") {
            const sec = await verificarSeccion(datos.seccionId);
            if (!sec) {
                return NextResponse.json({ error: "Sin acceso a esta sección" }, { status: 403 });
            }
            const esAdmin = docente.rol === "ADMINISTRADOR";
            if (!esAdmin && !sec.permisoDocenteEditarCurso) {
                return NextResponse.json(
                    { error: "No tienes permiso habilitado para editar exámenes." },
                    { status: 403 }
                );
            }

            let evaluacion = await prisma.evaluacion.findFirst({
                where: { leccionId: datos.leccionId },
            });

            if (!evaluacion) {
                evaluacion = await prisma.evaluacion.create({
                    data: {
                        leccionId: datos.leccionId,
                        cursoId: sec.cursoId,
                        titulo: "Cuestionario de Sesión",
                    },
                });
            }

            await prisma.preguntaEvaluacion.create({
                data: {
                    evaluacionId: evaluacion.id,
                    enunciado: datos.enunciado,
                    opciones: {
                        create: [
                            { letraOpcion: "A", textoOpcion: datos.opcionA, esCorrecta: datos.correcta === "A", orden: 1 },
                            { letraOpcion: "B", textoOpcion: datos.opcionB, esCorrecta: datos.correcta === "B", orden: 2 },
                            { letraOpcion: "C", textoOpcion: datos.opcionC, esCorrecta: datos.correcta === "C", orden: 3 },
                            { letraOpcion: "D", textoOpcion: datos.opcionD, esCorrecta: datos.correcta === "D", orden: 4 },
                        ],
                    },
                },
            });

            return NextResponse.json({ ok: true });
        }

        return NextResponse.json({ error: "Acción no reconocida" }, { status: 400 });
    } catch (error: any) {
        console.error("Error POST /api/docente:", error);
        return NextResponse.json(
            { error: error?.message || "Error procesando acción docente" },
            { status: 500 }
        );
    }
}