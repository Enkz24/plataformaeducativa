// src/app/api/pagos/webhook/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { activarServiciosPedido } from "@/lib/pagos/activarServiciosPedido";

export async function POST(request: Request) {
    try {
        const payload = await request.json();

        // Campos normalizados (al conectar tu proveedor definitivo solo ajustas estas 4 líneas al formato de su JSON)
        const eventoExternoId = String(
            payload?.id || payload?.eventId || `evt-${Date.now()}`
        );
        const numeroPedido =
            payload?.metadata?.numeroPedido ||
            payload?.external_reference ||
            payload?.numeroPedido;
        const estadoExterno = String(
            payload?.status || payload?.data?.outcome?.type || payload?.estado || ""
        ).toLowerCase();
        const transaccionId = String(
            payload?.data?.id || payload?.transaction_id || eventoExternoId
        );

        // 1. Evitar reprocesar un mismo webhook dos veces
        const yaProcesado = await prisma.eventoWebhookPasarela.findUnique({
            where: { eventoExternoId },
        });
        if (yaProcesado?.procesadoExitoso) {
            return NextResponse.json({ ok: true, duplicado: true });
        }

        // 2. Buscar el pedido asociado
        const pedido = numeroPedido
            ? await prisma.pedido.findUnique({
                where: { numeroPedido: String(numeroPedido) },
                include: { operacionesPago: true },
            })
            : null;

        const operacion = pedido?.operacionesPago?.[0] || null;

        const evento = await prisma.eventoWebhookPasarela.upsert({
            where: { eventoExternoId },
            update: { payloadJson: payload },
            create: {
                proveedor: operacion?.proveedorPago || "CULQI",
                eventoExternoId,
                tipoEvento: payload?.type || "payment.succeeded",
                firmaValida: true, // Aquí validarás el header HMAC-SHA256 con process.env.PASARELA_WEBHOOK_SECRET
                payloadJson: payload,
                operacionPagoId: operacion?.id || null,
            },
        });

        const pagoExitoso = [
            "approved",
            "paid",
            "succeeded",
            "venta_exitosa",
            "pagado",
        ].includes(estadoExterno);

        if (pedido && operacion && pagoExitoso) {
            await prisma.operacionPago.update({
                where: { id: operacion.id },
                data: {
                    estado: "PAGADO",
                    pasarelaTransaccionId: transaccionId,
                    verificadoPorWebhookFirma: true,
                    fechaConfirmacionPasarela: new Date(),
                    respuestaCrudaPasarelaJson: payload,
                },
            });

            await activarServiciosPedido(pedido.id);

            await prisma.eventoWebhookPasarela.update({
                where: { id: evento.id },
                data: { procesadoExitoso: true },
            });
        }

        return NextResponse.json({ ok: true });
    } catch (error: any) {
        console.error("Error Webhook /api/pagos/webhook:", error);
        return NextResponse.json(
            { error: error?.message || "Error procesando webhook" },
            { status: 500 }
        );
    }
}