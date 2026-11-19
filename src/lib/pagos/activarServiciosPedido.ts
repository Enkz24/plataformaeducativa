// src/lib/pagos/activarServiciosPedido.ts
import { prisma } from "@/lib/prisma";

export async function activarServiciosPedido(pedidoId: string) {
    const pedido = await prisma.pedido.findUnique({
        where: { id: pedidoId },
        include: {
            estudiante: true,
            items: {
                include: {
                    seccion: true,
                    curso: true,
                    planSuscripcion: true,
                    planSimulacro: true,
                },
            },
        },
    });

    if (!pedido) {
        throw new Error("Pedido no encontrado para activar servicios");
    }

    // Idempotencia: si los servicios ya fueron activados antes, no duplicamos registros
    if (pedido.serviciosActivados) {
        return { yaEstabaActivado: true, pedidoId: pedido.id };
    }

    const ahora = new Date();

    for (const item of pedido.items) {
        // A. COMPRA DE SECCIÓN EN TEMPORADA O CURSO INDIVIDUAL
        if (
            item.concepto === "COMPRA_SECCION_TEMPORADA" ||
            item.concepto === "COMPRA_CURSO_PROGRAMA"
        ) {
            const cursoIdFinal = item.cursoId || item.seccion?.cursoId;
            if (!cursoIdFinal) continue;

            const matriculaExistente = await prisma.matriculaEstudiante.findFirst({
                where: {
                    estudianteId: pedido.estudianteId,
                    cursoId: cursoIdFinal,
                    seccionId: item.seccionId || null,
                },
            });

            if (matriculaExistente) {
                await prisma.matriculaEstudiante.update({
                    where: { id: matriculaExistente.id },
                    data: {
                        estado: "ACTIVO",
                        pedidoOrigenId: pedido.id,
                        fechaActivacion: ahora,
                    },
                });
            } else {
                await prisma.matriculaEstudiante.create({
                    data: {
                        estudianteId: pedido.estudianteId,
                        cursoId: cursoIdFinal,
                        seccionId: item.seccionId || null,
                        origenAcceso: "COMPRA_INDIVIDUAL",
                        pedidoOrigenId: pedido.id,
                        estado: "ACTIVO",
                        fechaActivacion: ahora,
                    },
                });
            }
        }

        // B. COMPRA DE MEMBRESÍA / SUSCRIPCIÓN RECURRENTE
        if (item.concepto === "SUSCRIPCION_RECURRENTE" && item.planSuscripcion) {
            const dias = item.planSuscripcion.duracionDias || 30;
            const fechaVencimiento = new Date(
                ahora.getTime() + dias * 24 * 60 * 60 * 1000
            );

            await prisma.suscripcionEstudiante.create({
                data: {
                    estudianteId: pedido.estudianteId,
                    planSuscripcionId: item.planSuscripcion.id,
                    pedidoOrigenId: pedido.id,
                    estado: "ACTIVO",
                    fechaInicio: ahora,
                    fechaVencimiento,
                    duracionContratadaDias: dias,
                },
            });
        }

        // C. COMPRA INDIVIDUAL DE SIMULADOR OECE
        if (item.concepto === "PLAN_SIMULACRO_OECE" && item.planSimulacro) {
            const dias = item.planSimulacro.duracionDiasVigencia || 30;
            const fechaVencimiento = new Date(
                ahora.getTime() + dias * 24 * 60 * 60 * 1000
            );

            await prisma.suscripcionSimulacroOECE.create({
                data: {
                    estudianteId: pedido.estudianteId,
                    planSimulacroId: item.planSimulacro.id,
                    pedidoOrigenId: pedido.id,
                    estado: "ACTIVO",
                    fechaActivacion: ahora,
                    fechaVencimiento,
                },
            });
        }
    }

    // Marcar el pedido como PAGADO y con servicios activados
    await prisma.pedido.update({
        where: { id: pedido.id },
        data: {
            estado: "PAGADO",
            serviciosActivados: true,
            fechaActivacionServicios: ahora,
        },
    });

    // Registrar constancia de notificación en historial
    await prisma.registroNotificacionCorreo.create({
        data: {
            usuarioId: pedido.estudianteId,
            correoDestino: pedido.estudiante.email,
            tipoNotificacion: "PAGO_CONFIRMADO_ACCESO_ACTIVO",
            asunto: `Pago confirmado y acceso activo — Pedido ${pedido.numeroPedido}`,
            referenciaPedidoId: pedido.id,
            enviadoExitoso: true,
        },
    });

    return { yaEstabaActivado: false, pedidoId: pedido.id };
}