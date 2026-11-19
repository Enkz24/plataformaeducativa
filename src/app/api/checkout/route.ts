// src/app/api/checkout/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function resolverItemCheckout(params: {
    seccion?: string | null;
    curso?: string | null;
    suscripcion?: string | null;
    simulacro?: string | null;
}) {
    // 1. Sección específica de una Temporada
    if (params.seccion) {
        const sec = await prisma.seccionCursoTemporada.findFirst({
            where: {
                activa: true,
                OR: [{ id: params.seccion }, { codigoSeccion: params.seccion }],
            },
            include: { curso: true, temporada: true },
        });
        if (!sec) return null;

        const precio = Number(sec.precioOfertaSeccion ?? sec.precioSeccion);
        return {
            concepto: "COMPRA_SECCION_TEMPORADA" as const,
            titulo: `${sec.curso.titulo} — ${sec.nombreSeccion}`,
            subtitulo: `${sec.temporada.nombre} • ${sec.cantidadSesionesHabilitadas} sesiones`,
            imagenUrl: sec.curso.imagenPortada || "/cursos/default-curso.jpg",
            precio,
            cursoId: sec.cursoId,
            seccionId: sec.id,
            planSuscripcionId: null,
            planSimulacroId: null,
        };
    }

    // 2. Curso Maestro directo (si tiene una sección pública activa usa su precio; si no, precioBase)
    if (params.curso) {
        const curso = await prisma.cursoPrograma.findFirst({
            where: { OR: [{ id: params.curso }, { slug: params.curso }] },
            include: {
                seccionesTemporada: {
                    where: { activa: true, visibleEnInicio: true },
                    include: { temporada: true },
                    orderBy: { createdAt: "desc" },
                    take: 1,
                },
            },
        });
        if (!curso) return null;

        const secActiva = curso.seccionesTemporada[0];
        const precio = secActiva
            ? Number(secActiva.precioOfertaSeccion ?? secActiva.precioSeccion)
            : Number(curso.precioOferta ?? curso.precioBase);

        return {
            concepto: secActiva
                ? ("COMPRA_SECCION_TEMPORADA" as const)
                : ("COMPRA_CURSO_PROGRAMA" as const),
            titulo: secActiva
                ? `${curso.titulo} (${secActiva.nombreSeccion})`
                : curso.titulo,
            subtitulo: secActiva
                ? secActiva.temporada.nombre
                : `${curso.horasAcademicas} horas académicas`,
            imagenUrl: curso.imagenPortada || "/cursos/default-curso.jpg",
            precio,
            cursoId: curso.id,
            seccionId: secActiva?.id || null,
            planSuscripcionId: null,
            planSimulacroId: null,
        };
    }

    // 3. Plan de Suscripción / Membresía
    if (params.suscripcion) {
        const plan = await prisma.planSuscripcionCatalogo.findFirst({
            where: {
                activo: true,
                OR: [{ id: params.suscripcion }, { codigo: params.suscripcion }],
            },
        });
        if (!plan) return null;

        return {
            concepto: "SUSCRIPCION_RECURRENTE" as const,
            titulo: plan.nombre,
            subtitulo: `Membresía • Vigencia: ${plan.etiquetaDuracionTexto} (${plan.duracionDias} días)`,
            imagenUrl: plan.imagenPortada || "/membresias/default-membresia.jpg",
            precio: Number(plan.precio),
            cursoId: null,
            seccionId: null,
            planSuscripcionId: plan.id,
            planSimulacroId: null,
        };
    }

    // 4. Plan de Simulador OECE individual
    if (params.simulacro) {
        const sim = await prisma.planSimulacroOECE.findFirst({
            where: {
                activo: true,
                OR: [{ id: params.simulacro }, { codigo: params.simulacro }],
            },
        });
        if (!sim) return null;

        return {
            concepto: "PLAN_SIMULACRO_OECE" as const,
            titulo: sim.nombre,
            subtitulo: `Simulador OECE Nivel ${sim.nivel} • ${sim.cantidadPreguntasHabilitadas} preguntas • ${sim.duracionDiasVigencia} días`,
            imagenUrl: sim.imagenPortada || "/simuladores/oece-default.jpg",
            precio: Number(sim.precioOferta ?? sim.precio),
            cursoId: null,
            seccionId: null,
            planSuscripcionId: null,
            planSimulacroId: sim.id,
        };
    }

    return null;
}

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        const { searchParams } = new URL(request.url);

        const item = await resolverItemCheckout({
            seccion: searchParams.get("seccion"),
            curso: searchParams.get("curso"),
            suscripcion: searchParams.get("suscripcion"),
            simulacro: searchParams.get("simulacro"),
        });

        const [configPagos, cuentasManuales, pasarelasActivas, configSitio] =
            await Promise.all([
                prisma.configuracionGeneralPagos.findUnique({
                    where: { claveConfiguracion: "PRINCIPAL" },
                }),
                prisma.cuentaDestinoPagoManual.findMany({
                    where: { activa: true },
                    orderBy: { orden: "asc" },
                }),
                prisma.configuracionPasarelaAutomatica.findMany({
                    where: { habilitada: true },
                    select: {
                        id: true,
                        proveedor: true,
                        nombreVisible: true,
                        publicKey: true,
                        modoProduccion: true,
                    },
                    orderBy: { ordenVisualizacion: "asc" },
                }),
                prisma.configuracionSitio.findUnique({
                    where: { clave: "PRINCIPAL" },
                    select: {
                        nombreEmpresa: true,
                        rucEmpresa: true,
                        telefonoWhatsappAlumnos: true,
                    },
                }),
            ]);

        let usuarioActual = null;
        if (session?.user?.email) {
            usuarioActual = await prisma.user.findUnique({
                where: { email: session.user.email.toLowerCase() },
                select: {
                    id: true,
                    name: true,
                    nombres: true,
                    apellidos: true,
                    dni: true,
                    email: true,
                    telefono: true,
                },
            });
        }

        // Validación opcional de cupón por query (?cupon=CODIGO)
        const codigoCupon = searchParams.get("cupon");
        let cuponValido = null;
        if (codigoCupon) {
            const c = await prisma.cuponDescuento.findUnique({
                where: { codigo: codigoCupon.trim().toUpperCase() },
            });
            const ahora = new Date();
            if (
                c &&
                c.activo &&
                c.usosActuales < c.usosMaximos &&
                ahora >= c.fechaInicio &&
                ahora <= c.fechaExpiracion
            ) {
                cuponValido = {
                    id: c.id,
                    codigo: c.codigo,
                    tipoDescuento: c.tipoDescuento,
                    valorDescuento: Number(c.valorDescuento),
                };
            }
        }

        return NextResponse.json({
            usuario: usuarioActual,
            item,
            cuponValido,
            configPagos: configPagos || {
                pagoAutomaticoHabilitado: false,
                pagoManualHabilitado: true,
                instruccionesGeneralesPagoManual:
                    "Realiza tu pago por Yape, Plin o Transferencia Bancaria, sube la captura e indica la hora exacta y el número de operación irrepetible.",
            },
            cuentasManuales,
            pasarelasActivas,
            configSitio,
        });
    } catch (error) {
        console.error("Error GET /api/checkout:", error);
        return NextResponse.json(
            { error: "Error cargando los datos de pago" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "Debes iniciar sesión con tu cuenta de Google antes de pagar." },
                { status: 401 }
            );
        }

        const usuario = await prisma.user.findUnique({
            where: { email: session.user.email.toLowerCase() },
        });
        if (!usuario) {
            return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
        }

        const body = await request.json();
        const {
            modalidad, // "MANUAL_VALIDACION" | "AUTOMATICO_PASARELA"
            paramsItem,
            codigoCupon,
            tipoComprobante,
            documentoFacturacion,
            razonSocialFacturacion,
            direccionFacturacion,
            // Datos pago manual
            proveedorPago,
            cuentaDestinoManualId,
            numeroOperacionBancaria,
            horaOperacionDeclarada,
            fechaOperacionDeclarada,
            bancoOrigenDeclarado,
            comprobanteAdjuntoUrl,
            notasEstudiante,
        } = body;

        const item = await resolverItemCheckout(paramsItem || {});
        if (!item) {
            return NextResponse.json(
                { error: "El curso, membresía o simulador seleccionado no está disponible." },
                { status: 404 }
            );
        }

        // Cálculo seguro de subtotal, cupón y total en el servidor
        let descuento = 0;
        let cuponId: string | null = null;

        if (codigoCupon) {
            const cupon = await prisma.cuponDescuento.findUnique({
                where: { codigo: String(codigoCupon).trim().toUpperCase() },
            });
            const ahora = new Date();
            if (
                cupon &&
                cupon.activo &&
                cupon.usosActuales < cupon.usosMaximos &&
                ahora >= cupon.fechaInicio &&
                ahora <= cupon.fechaExpiracion
            ) {
                cuponId = cupon.id;
                descuento =
                    cupon.tipoDescuento === "PORCENTAJE"
                        ? (item.precio * Number(cupon.valorDescuento)) / 100
                        : Number(cupon.valorDescuento);
            }
        }

        const subtotal = item.precio;
        const total = Math.max(0, Number((subtotal - descuento).toFixed(2)));
        const numeroPedido = `PED-${Date.now().toString().slice(-8)}`;

        // VALIDACIÓN ESTRICTA PARA PAGO MANUAL (Número de operación irrepetible + Hora + Captura)
        if (modalidad === "MANUAL_VALIDACION") {
            const numOpLimpio = String(numeroOperacionBancaria || "").trim();
            if (!numOpLimpio || numOpLimpio.length < 4) {
                return NextResponse.json(
                    { error: "Ingresa un número de operación válido." },
                    { status: 400 }
                );
            }
            if (!horaOperacionDeclarada) {
                return NextResponse.json(
                    { error: "Indica la hora exacta que figura en tu comprobante." },
                    { status: 400 }
                );
            }
            if (!comprobanteAdjuntoUrl) {
                return NextResponse.json(
                    { error: "Debes adjuntar la captura o PDF del comprobante de pago." },
                    { status: 400 }
                );
            }

            // Verificar que el número de operación NO haya sido usado en otro pedido
            const operacionRepetida = await prisma.operacionPago.findUnique({
                where: { numeroOperacionBancaria: numOpLimpio },
            });
            if (operacionRepetida) {
                return NextResponse.json(
                    {
                        error: `El número de operación "${numOpLimpio}" ya fue registrado anteriormente. Cada operación es irrepetible.`,
                    },
                    { status: 409 }
                );
            }

            const pedido = await prisma.pedido.create({
                data: {
                    numeroPedido,
                    estudianteId: usuario.id,
                    modalidadElegida: "MANUAL_VALIDACION",
                    estado: "PENDIENTE_VALIDACION",
                    subtotal,
                    descuento,
                    total,
                    cuponId,
                    tipoComprobanteSolicitado: tipoComprobante || "BOLETA",
                    documentoFacturacion: documentoFacturacion || usuario.dni || null,
                    razonSocialFacturacion: razonSocialFacturacion || usuario.name || null,
                    direccionFacturacion: direccionFacturacion || null,
                    items: {
                        create: {
                            concepto: item.concepto,
                            descripcionItem: item.titulo,
                            cursoId: item.cursoId,
                            seccionId: item.seccionId,
                            planSuscripcionId: item.planSuscripcionId,
                            planSimulacroId: item.planSimulacroId,
                            precioPagado: total,
                        },
                    },
                    operacionesPago: {
                        create: {
                            modalidad: "MANUAL_VALIDACION",
                            proveedorPago: proveedorPago || "YAPE_MANUAL",
                            estado: "PENDIENTE_VALIDACION",
                            monto: total,
                            cuentaDestinoManualId: cuentaDestinoManualId || null,
                            numeroOperacionBancaria: numOpLimpio,
                            horaOperacionDeclarada: String(horaOperacionDeclarada).trim(),
                            fechaOperacionDeclarada: fechaOperacionDeclarada
                                ? new Date(fechaOperacionDeclarada)
                                : new Date(),
                            bancoOrigenDeclarado: bancoOrigenDeclarado || "Yape / Banca",
                            comprobanteAdjuntoUrl,
                            notasEstudiante: notasEstudiante || null,
                            historialAuditoria: {
                                create: {
                                    estadoNuevo: "PENDIENTE_VALIDACION",
                                    accionEjecutada: "ENVIO_COMPROBANTE_MANUAL_ESTUDIANTE",
                                    usuarioActorId: usuario.id,
                                    rolActor: usuario.rol,
                                    motivoObservacion: `Comprobante enviado — Op: ${numOpLimpio} (${horaOperacionDeclarada})`,
                                },
                            },
                        },
                    },
                },
                include: { operacionesPago: true },
            });

            if (cuponId) {
                await prisma.cuponDescuento.update({
                    where: { id: cuponId },
                    data: { usosActuales: { increment: 1 } },
                });
            }

            return NextResponse.json({
                ok: true,
                numeroPedido: pedido.numeroPedido,
                pedidoId: pedido.id,
                estado: "PENDIENTE_VALIDACION",
            });
        }

        // FLUJO PREPARADO PARA PASARELA AUTOMÁTICA (Culqi / MercadoPago / Izipay / Niubiz)
        if (modalidad === "AUTOMATICO_PASARELA") {
            const pasarela = await prisma.configuracionPasarelaAutomatica.findFirst({
                where: { habilitada: true },
                orderBy: { ordenVisualizacion: "asc" },
            });

            if (!pasarela) {
                return NextResponse.json(
                    {
                        error:
                            "La pasarela automática aún no tiene credenciales activas. Usa el pago manual con Yape o Transferencia.",
                    },
                    { status: 400 }
                );
            }

            const pedido = await prisma.pedido.create({
                data: {
                    numeroPedido,
                    estudianteId: usuario.id,
                    modalidadElegida: "AUTOMATICO_PASARELA",
                    estado: "PENDIENTE_PAGO",
                    subtotal,
                    descuento,
                    total,
                    cuponId,
                    tipoComprobanteSolicitado: tipoComprobante || "BOLETA",
                    documentoFacturacion: documentoFacturacion || usuario.dni || null,
                    razonSocialFacturacion: razonSocialFacturacion || usuario.name || null,
                    direccionFacturacion: direccionFacturacion || null,
                    items: {
                        create: {
                            concepto: item.concepto,
                            descripcionItem: item.titulo,
                            cursoId: item.cursoId,
                            seccionId: item.seccionId,
                            planSuscripcionId: item.planSuscripcionId,
                            planSimulacroId: item.planSimulacroId,
                            precioPagado: total,
                        },
                    },
                    operacionesPago: {
                        create: {
                            modalidad: "AUTOMATICO_PASARELA",
                            proveedorPago: pasarela.proveedor,
                            pasarelaConfigId: pasarela.id,
                            estado: "PENDIENTE_PAGO",
                            monto: total,
                        },
                    },
                },
            });

            return NextResponse.json({
                ok: true,
                numeroPedido: pedido.numeroPedido,
                pedidoId: pedido.id,
                proveedor: pasarela.proveedor,
                estado: "PENDIENTE_PAGO",
                mensaje:
                    "Orden generada y lista para conectar el SDK de tu pasarela afiliada.",
            });
        }

        return NextResponse.json(
            { error: "Modalidad de pago no válida" },
            { status: 400 }
        );
    } catch (error: any) {
        console.error("Error POST /api/checkout:", error);
        return NextResponse.json(
            { error: error?.message || "No se pudo registrar tu pago" },
            { status: 500 }
        );
    }
}