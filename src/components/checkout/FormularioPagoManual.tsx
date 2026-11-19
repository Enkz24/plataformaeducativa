// src/components/checkout/FormularioPagoManual.tsx
"use client";

import React, { useState } from "react";
import { UploadCloud, CheckCircle2, Loader2, ShieldAlert } from "lucide-react";

interface FormularioPagoManualProps {
    cuentasManuales: any[];
    instruccionesGenerales: string;
    enviando: boolean;
    onEnviarPagoManual: (datosManual: {
        proveedorPago: string;
        cuentaDestinoManualId: string | null;
        numeroOperacionBancaria: string;
        horaOperacionDeclarada: string;
        fechaOperacionDeclarada: string;
        bancoOrigenDeclarado: string;
        comprobanteAdjuntoUrl: string;
        notasEstudiante: string;
    }) => Promise<void>;
}

export default function FormularioPagoManual({
    cuentasManuales,
    instruccionesGenerales,
    enviando,
    onEnviarPagoManual,
}: FormularioPagoManualProps) {
    const [proveedorPago, setProveedorPago] = useState("YAPE_MANUAL");
    const [cuentaDestinoManualId, setCuentaDestinoManualId] = useState<string>(
        cuentasManuales?.[0]?.id || ""
    );
    const [numeroOperacionBancaria, setNumeroOperacionBancaria] = useState("");
    const [horaOperacionDeclarada, setHoraOperacionDeclarada] = useState("");
    const [fechaOperacionDeclarada, setFechaOperacionDeclarada] = useState(
        new Date().toISOString().slice(0, 10)
    );
    const [bancoOrigenDeclarado, setBancoOrigenDeclarado] = useState("Yape");
    const [comprobanteAdjuntoUrl, setComprobanteAdjuntoUrl] = useState("");
    const [notasEstudiante, setNotasEstudiante] = useState("");
    const [subiendoVoucher, setSubiendoVoucher] = useState(false);

    async function subirCaptura(file: File) {
        setSubiendoVoucher(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("carpeta", "vouchers");

            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });
            const json = await res.json();
            if (res.ok && json.url) {
                setComprobanteAdjuntoUrl(json.url);
            } else {
                alert(json.error || "Error subiendo la captura");
            }
        } finally {
            setSubiendoVoucher(false);
        }
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        onEnviarPagoManual({
            proveedorPago,
            cuentaDestinoManualId: cuentaDestinoManualId || null,
            numeroOperacionBancaria,
            horaOperacionDeclarada,
            fechaOperacionDeclarada,
            bancoOrigenDeclarado,
            comprobanteAdjuntoUrl,
            notasEstudiante,
        });
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {/* Instrucciones y cuentas destino configuradas */}
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 space-y-3 text-xs">
                <p className="text-zinc-700 leading-relaxed font-medium">
                    {instruccionesGenerales}
                </p>

                {cuentasManuales.length > 0 && (
                    <div className="grid gap-3 sm:grid-cols-2 pt-1">
                        {cuentasManuales.map((cta) => (
                            <label
                                key={cta.id}
                                className={`rounded-xl border p-3 cursor-pointer transition ${cuentaDestinoManualId === cta.id
                                        ? "border-zinc-950 bg-white shadow-sm"
                                        : "border-zinc-200 bg-white"
                                    }`}
                            >
                                <div className="flex items-center gap-2 font-extrabold">
                                    <input
                                        type="radio"
                                        name="cuentaDestino"
                                        checked={cuentaDestinoManualId === cta.id}
                                        onChange={() => {
                                            setCuentaDestinoManualId(cta.id);
                                            setProveedorPago(cta.medioPago);
                                        }}
                                    />
                                    <span>{cta.nombreEntidad}</span>
                                </div>
                                <div className="pl-5 mt-1 space-y-0.5 text-[11px] text-zinc-600">
                                    <div>Titular: {cta.titularCuenta}</div>
                                    {cta.numeroCelularBilletera && (
                                        <div className="font-mono font-bold text-zinc-900">
                                            Celular: {cta.numeroCelularBilletera}
                                        </div>
                                    )}
                                    {cta.numeroCuenta && (
                                        <div className="font-mono font-bold text-zinc-900">
                                            Cuenta: {cta.numeroCuenta}
                                        </div>
                                    )}
                                    {cta.codigoCCI && (
                                        <div className="font-mono">CCI: {cta.codigoCCI}</div>
                                    )}
                                </div>
                            </label>
                        ))}
                    </div>
                )}
            </div>

            {/* Datos obligatorios del pago */}
            <div className="grid gap-4 sm:grid-cols-2 text-xs">
                <div>
                    <label className="block font-bold mb-1">Medio de Pago Utilizado *</label>
                    <select
                        value={proveedorPago}
                        onChange={(e) => {
                            setProveedorPago(e.target.value);
                            const mapa: Record<string, string> = {
                                YAPE_MANUAL: "Yape",
                                PLIN_MANUAL: "Plin",
                                TRANSFERENCIA_BANCARIA_MANUAL: "BCP / Interbank / BBVA",
                                DEPOSITO_AGENTE_MANUAL: "Agente Bancario",
                            };
                            setBancoOrigenDeclarado(mapa[e.target.value] || "Banca");
                        }}
                        className="w-full rounded-xl border border-zinc-300 px-3 py-2.5 font-bold"
                    >
                        <option value="YAPE_MANUAL">Yape</option>
                        <option value="PLIN_MANUAL">Plin</option>
                        <option value="TRANSFERENCIA_BANCARIA_MANUAL">
                            Transferencia Bancaria (BCP / BBVA / Interbank / BN)
                        </option>
                        <option value="DEPOSITO_AGENTE_MANUAL">Depósito en Agente</option>
                    </select>
                </div>

                <div>
                    <label className="block font-bold mb-1">
                        Número de Operación (Irrepetible) *
                    </label>
                    <input
                        required
                        placeholder="Ej: 04928173"
                        value={numeroOperacionBancaria}
                        onChange={(e) => setNumeroOperacionBancaria(e.target.value)}
                        className="w-full rounded-xl border border-zinc-300 px-3 py-2.5 font-mono font-bold"
                    />
                </div>

                <div>
                    <label className="block font-bold mb-1">Fecha de Operación *</label>
                    <input
                        type="date"
                        required
                        value={fechaOperacionDeclarada}
                        onChange={(e) => setFechaOperacionDeclarada(e.target.value)}
                        className="w-full rounded-xl border border-zinc-300 px-3 py-2.5"
                    />
                </div>

                <div>
                    <label className="block font-bold mb-1">
                        Hora Exacta del Comprobante *
                    </label>
                    <input
                        type="time"
                        required
                        value={horaOperacionDeclarada}
                        onChange={(e) => setHoraOperacionDeclarada(e.target.value)}
                        className="w-full rounded-xl border border-zinc-300 px-3 py-2.5 font-mono"
                    />
                </div>
            </div>

            {/* Zona Drag & Drop de Captura / Voucher */}
            <div className="space-y-1.5">
                <label className="block text-xs font-bold">
                    Captura de Pantalla o Voucher (JPG, PNG o PDF) *
                </label>
                <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                        e.preventDefault();
                        const f = e.dataTransfer.files?.[0];
                        if (f) subirCaptura(f);
                    }}
                    className="relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50 p-6 text-center hover:border-zinc-950 transition"
                >
                    <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) subirCaptura(f);
                        }}
                        className="absolute inset-0 cursor-pointer opacity-0"
                    />

                    {subiendoVoucher ? (
                        <div className="flex items-center gap-2 text-xs font-bold">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Subiendo comprobante...</span>
                        </div>
                    ) : comprobanteAdjuntoUrl ? (
                        <div className="space-y-2">
                            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-700">
                                <CheckCircle2 className="h-4 w-4" />
                                <span>Comprobante cargado correctamente</span>
                            </div>
                            {!comprobanteAdjuntoUrl.endsWith(".pdf") && (
                                <img
                                    src={comprobanteAdjuntoUrl}
                                    alt="Vista previa comprobante"
                                    className="mx-auto max-h-40 rounded-lg border border-zinc-200 object-contain"
                                />
                            )}
                        </div>
                    ) : (
                        <div className="space-y-1 text-xs text-zinc-600">
                            <UploadCloud className="h-6 w-6 mx-auto text-zinc-900" />
                            <p>
                                <strong>Arrastra la captura de Yape/Transferencia aquí</strong>{" "}
                                o haz clic para seleccionarla
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <textarea
                rows={2}
                placeholder="Notas adicionales opcionales (ej. nombre del titular que realizó el Yape)..."
                value={notasEstudiante}
                onChange={(e) => setNotasEstudiante(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 p-3 text-xs"
            />

            <div className="flex items-start gap-2 rounded-xl bg-zinc-100 p-3 text-[11px] text-zinc-600">
                <ShieldAlert className="h-4 w-4 shrink-0 text-zinc-900 mt-0.5" />
                <span>
                    El número de operación es único en el sistema. Una vez validado por el
                    Administrador o Asistente Administrativo, tu acceso se activará
                    automáticamente en tu Aula Virtual.
                </span>
            </div>

            <button
                type="submit"
                disabled={enviando || subiendoVoucher}
                className="w-full rounded-xl bg-zinc-950 py-3.5 text-xs font-extrabold text-white shadow hover:bg-zinc-800 disabled:opacity-50"
            >
                {enviando
                    ? "Registrando comprobante..."
                    : "Enviar Comprobante para Aprobación"}
            </button>
        </form>
    );
}