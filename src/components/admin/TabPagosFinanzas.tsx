// src/components/admin/TabPagosFinanzas.tsx
"use client";

import React, { useState } from "react";
import { CheckCircle, XCircle, Key, DollarSign } from "lucide-react";

interface TabPagosFinanzasProps {
    configPagos: any;
    pasarelas: any[];
    operacionesPago: any[];
    onGuardarConfigPagos: (datos: any) => Promise<void>;
    onGuardarPasarelaApi: (datos: any) => Promise<void>;
    onDecidirPagoManual: (operacionId: string, decision: "APROBAR" | "RECHAZADO") => Promise<void>;
}

export default function TabPagosFinanzas({
    configPagos,
    pasarelas,
    operacionesPago,
    onGuardarConfigPagos,
    onGuardarPasarelaApi,
    onDecidirPagoManual,
}: TabPagosFinanzasProps) {
    const [pagoAutomatico, setPagoAutomatico] = useState(
        configPagos?.pagoAutomaticoHabilitado ?? true
    );
    const [pagoManual, setPagoManual] = useState(
        configPagos?.pagoManualHabilitado ?? true
    );
    const [instrucciones, setInstrucciones] = useState(
        configPagos?.instruccionesGeneralesPagoManual ||
        "Sube tu captura de Yape, Plin o Transferencia con hora y número de operación único."
    );

    const pasarelaActual = pasarelas?.[0] || {};
    const [proveedor, setProveedor] = useState(pasarelaActual.proveedor || "CULQI");
    const [publicKey, setPublicKey] = useState(pasarelaActual.publicKey || "");
    const [merchantId, setMerchantId] = useState(pasarelaActual.merchantId || "");
    const [habilitadaApi, setHabilitadaApi] = useState(
        pasarelaActual.habilitada ?? false
    );

    // Cálculo de recaudación por Pasarela vs Manual
    const pagados = operacionesPago.filter(
        (o) => o.estado === "APROBADO" || o.estado === "PAGADO"
    );
    const totalPasarela = pagados
        .filter((o) => o.modalidad === "AUTOMATICO_PASARELA")
        .reduce((acc, o) => acc + Number(o.monto || 0), 0);
    const totalManual = pagados
        .filter((o) => o.modalidad === "MANUAL_VALIDACION")
        .reduce((acc, o) => acc + Number(o.monto || 0), 0);

    return (
        <div className="space-y-6">
            {/* Resumen Financiero */}
            <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                    <span className="text-xs font-bold text-zinc-500">
                        Recaudado por Pasarela Automática
                    </span>
                    <div className="text-2xl font-extrabold mt-1">
                        S/ {totalPasarela.toFixed(2)}
                    </div>
                </div>
                <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                    <span className="text-xs font-bold text-zinc-500">
                        Recaudado por Aprobación Manual (Yape/Bancos)
                    </span>
                    <div className="text-2xl font-extrabold mt-1">
                        S/ {totalManual.toFixed(2)}
                    </div>
                </div>
                <div className="rounded-2xl border border-zinc-900 bg-zinc-950 text-white p-5 shadow-sm">
                    <span className="text-xs font-bold text-zinc-400">
                        Recaudación Total Confirmada
                    </span>
                    <div className="text-2xl font-extrabold mt-1">
                        S/ {(totalPasarela + totalManual).toFixed(2)}
                    </div>
                </div>
            </div>

            {/* Bandeja de Aprobación de Pagos Manuales y Vouchers */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
                <h3 className="text-base font-extrabold">
                    Bandeja de Validación de Pagos (Aprobar / Rechazar Vouchers y Ver Pagos de Pasarela)
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr className="border-b border-zinc-200 bg-zinc-50 font-extrabold">
                                <th className="p-3">Estudiante</th>
                                <th className="p-3">Modalidad / Medio</th>
                                <th className="p-3">N° Operación y Hora</th>
                                <th className="p-3">Monto</th>
                                <th className="p-3">Voucher</th>
                                <th className="p-3">Estado / Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200">
                            {operacionesPago.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-6 text-center text-zinc-500">
                                        Aún no hay operaciones de pago registradas.
                                    </td>
                                </tr>
                            ) : (
                                operacionesPago.map((op) => (
                                    <tr key={op.id}>
                                        <td className="p-3">
                                            <div className="font-bold">
                                                {op.pedido?.estudiante?.name || "Estudiante"}
                                            </div>
                                            <div className="text-[11px] text-zinc-500">
                                                {op.pedido?.estudiante?.email}
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <span className="font-semibold">{op.proveedorPago}</span>
                                        </td>
                                        <td className="p-3 font-mono">
                                            Op: {op.numeroOperacionBancaria || op.pasarelaTransaccionId || "-"}
                                            {op.horaOperacionDeclarada && ` (${op.horaOperacionDeclarada})`}
                                        </td>
                                        <td className="p-3 font-extrabold">
                                            S/ {Number(op.monto).toFixed(2)}
                                        </td>
                                        <td className="p-3">
                                            {op.comprobanteAdjuntoUrl ? (
                                                <a
                                                    href={op.comprobanteAdjuntoUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="underline font-bold"
                                                >
                                                    Ver Captura
                                                </a>
                                            ) : (
                                                "Pasarela"
                                            )}
                                        </td>
                                        <td className="p-3">
                                            {op.estado === "PENDIENTE_VALIDACION" ||
                                                op.estado === "PENDIENTE_PAGO" ? (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => onDecidirPagoManual(op.id, "APROBAR")}
                                                        className="inline-flex items-center gap-1 rounded bg-zinc-950 px-2.5 py-1 text-[11px] font-bold text-white"
                                                    >
                                                        <CheckCircle className="h-3.5 w-3.5" />
                                                        <span>Aprobar</span>
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            onDecidirPagoManual(op.id, "RECHAZADO")
                                                        }
                                                        className="inline-flex items-center gap-1 rounded border border-red-300 px-2.5 py-1 text-[11px] font-bold text-red-700"
                                                    >
                                                        <XCircle className="h-3.5 w-3.5" />
                                                        <span>Rechazar</span>
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="rounded bg-zinc-100 px-2.5 py-1 text-[11px] font-extrabold">
                                                    {op.estado}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Conexión de API Pasarela y Interruptor Manual / Automático */}
            <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
                    <h4 className="text-sm font-extrabold">
                        Interruptor General (Desactivar pasarela con 1 clic si falla)
                    </h4>
                    <div className="space-y-2 text-xs font-bold">
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={pagoAutomatico}
                                onChange={(e) => setPagoAutomatico(e.target.checked)}
                            />
                            <span>Habilitar Cobro Automático por Pasarela</span>
                        </label>
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={pagoManual}
                                onChange={(e) => setPagoManual(e.target.checked)}
                            />
                            <span>
                                Habilitar Subida de Captura Yape / Transferencia Manual
                            </span>
                        </label>
                    </div>
                    <textarea
                        rows={3}
                        value={instrucciones}
                        onChange={(e) => setInstrucciones(e.target.value)}
                        className="w-full rounded-lg border border-zinc-300 p-2.5 text-xs"
                    />
                    <button
                        onClick={() =>
                            onGuardarConfigPagos({
                                pagoAutomaticoHabilitado: pagoAutomatico,
                                pagoManualHabilitado: pagoManual,
                                instruccionesGeneralesPagoManual: instrucciones,
                            })
                        }
                        className="rounded-xl bg-zinc-950 px-4 py-2 text-xs font-extrabold text-white"
                    >
                        Guardar Modalidad de Pagos
                    </button>
                </div>

                <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
                    <h4 className="text-sm font-extrabold flex items-center gap-2">
                        <Key className="h-4 w-4" />
                        <span>Conexión API de Pasarela de Pagos (Llaves y Webhook de Respuesta)</span>
                    </h4>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <select
                            value={proveedor}
                            onChange={(e) => setProveedor(e.target.value)}
                            className="rounded-lg border border-zinc-300 px-3 py-2 text-xs font-bold"
                        >
                            <option value="CULQI">Culqi (Tarjetas + Yape)</option>
                            <option value="MERCADOPAGO">MercadoPago</option>
                            <option value="IZIPAY">Izipay</option>
                            <option value="NIUBIZ">Niubiz</option>
                        </select>
                        <input
                            placeholder="Public Key (pk_live_... o pk_test_...)"
                            value={publicKey}
                            onChange={(e) => setPublicKey(e.target.value)}
                            className="rounded-lg border border-zinc-300 px-3 py-2 text-xs"
                        />
                        <input
                            placeholder="Merchant ID / Código Comercio"
                            value={merchantId}
                            onChange={(e) => setMerchantId(e.target.value)}
                            className="rounded-lg border border-zinc-300 px-3 py-2 text-xs"
                        />
                        <div className="flex items-center text-xs font-bold">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={habilitadaApi}
                                    onChange={(e) => setHabilitadaApi(e.target.checked)}
                                />
                                <span>Activar esta Pasarela</span>
                            </label>
                        </div>
                    </div>
                    <p className="text-[11px] text-zinc-500">
                        Endpoint de Respuesta (Webhook) listo en tu plataforma:{" "}
                        <code className="bg-zinc-100 px-1.5 py-0.5 rounded font-bold">
                            /api/pagos/webhook
                        </code>
                    </p>
                    <button
                        onClick={() =>
                            onGuardarPasarelaApi({
                                proveedor,
                                publicKey,
                                merchantId,
                                habilitada: habilitadaApi,
                            })
                        }
                        className="rounded-xl bg-zinc-950 px-4 py-2 text-xs font-extrabold text-white"
                    >
                        Guardar Conexión de Pasarela
                    </button>
                </div>
            </div>
        </div>
    );
}