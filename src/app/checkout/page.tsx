// src/app/checkout/page.tsx
"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import FormularioPagoManual from "@/components/checkout/FormularioPagoManual";
import {
    ArrowLeft,
    CreditCard,
    Smartphone,
    Tag,
    CheckCircle2,
    ShieldCheck,
    Lock,
} from "lucide-react";

function CheckoutContenido() {
    const searchParams = useSearchParams();
    const paramsItem = {
        seccion: searchParams.get("seccion"),
        curso: searchParams.get("curso"),
        suscripcion: searchParams.get("suscripcion"),
        simulacro: searchParams.get("simulacro"),
    };

    const [cargando, setCargando] = useState(true);
    const [datos, setDatos] = useState<any>(null);
    const [modalidadActiva, setModalidadActiva] = useState<
        "MANUAL_VALIDACION" | "AUTOMATICO_PASARELA"
    >("MANUAL_VALIDACION");

    // Cupón y Comprobante (Boleta / Factura)
    const [codigoCupon, setCodigoCupon] = useState("");
    const [cuponAplicado, setCuponAplicado] = useState<any>(null);
    const [tipoComprobante, setTipoComprobante] = useState<"BOLETA" | "FACTURA">(
        "BOLETA"
    );
    const [documentoFacturacion, setDocumentoFacturacion] = useState("");
    const [razonSocialFacturacion, setRazonSocialFacturacion] = useState("");
    const [direccionFacturacion, setDireccionFacturacion] = useState("");

    const [enviando, setEnviando] = useState(false);
    const [pedidoConfirmado, setPedidoConfirmado] = useState<any>(null);

    async function cargarCheckout(cuponQuery?: string) {
        setCargando(true);
        try {
            const qs = new URLSearchParams();
            if (paramsItem.seccion) qs.set("seccion", paramsItem.seccion);
            if (paramsItem.curso) qs.set("curso", paramsItem.curso);
            if (paramsItem.suscripcion) qs.set("suscripcion", paramsItem.suscripcion);
            if (paramsItem.simulacro) qs.set("simulacro", paramsItem.simulacro);
            if (cuponQuery) qs.set("cupon", cuponQuery);

            const res = await fetch(`/api/checkout?${qs.toString()}`);
            if (res.ok) {
                const json = await res.json();
                setDatos(json);
                if (json.cuponValido) {
                    setCuponAplicado(json.cuponValido);
                } else if (cuponQuery) {
                    alert("El cupón ingresado no existe, venció o alcanzó su límite.");
                    setCuponAplicado(null);
                }

                if (json.usuario && !documentoFacturacion) {
                    setDocumentoFacturacion(json.usuario.dni || "");
                    setRazonSocialFacturacion(json.usuario.name || "");
                }

                // Selección automática según lo que esté habilitado en Configuración General
                if (
                    !json.configPagos?.pagoManualHabilitado &&
                    json.configPagos?.pagoAutomaticoHabilitado
                ) {
                    setModalidadActiva("AUTOMATICO_PASARELA");
                }
            }
        } finally {
            setCargando(false);
        }
    }

    useEffect(() => {
        cargarCheckout();
    }, []);

    if (cargando && !datos) {
        return (
            <div className="min-h-screen bg-zinc-50 flex items-center justify-center text-xs font-bold text-zinc-600">
                Preparando tu orden de inscripción...
            </div>
        );
    }

    if (!datos?.item) {
        return (
            <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
                <div className="max-w-md w-full rounded-2xl border border-zinc-200 bg-white p-8 text-center space-y-4">
                    <h1 className="text-base font-extrabold">
                        No se encontró el programa o plan seleccionado
                    </h1>
                    <Link
                        href="/?vista=publica"
                        className="inline-flex items-center gap-2 rounded-xl bg-zinc-950 px-5 py-2.5 text-xs font-extrabold text-white"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Volver al Catálogo</span>
                    </Link>
                </div>
            </div>
        );
    }

    // Pantalla de confirmación tras enviar el pago
    if (pedidoConfirmado) {
        return (
            <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
                <div className="max-w-lg w-full rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm text-center space-y-5">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-950 text-emerald-400">
                        <CheckCircle2 className="h-8 w-8" />
                    </div>
                    <div className="space-y-1">
                        <span className="text-[11px] font-mono font-bold text-zinc-500">
                            ORDEN {pedidoConfirmado.numeroPedido}
                        </span>
                        <h1 className="text-xl font-extrabold text-zinc-950">
                            Comprobante Recibido para Validación
                        </h1>
                    </div>
                    <p className="text-xs leading-relaxed text-zinc-600">
                        Tu pago por <strong>{datos.item.titulo}</strong> fue registrado con
                        éxito. En cuanto nuestro equipo administrativo apruebe la operación,
                        tu acceso se habilitará automáticamente en tu Aula Virtual.
                    </p>
                    <div className="flex flex-wrap justify-center gap-3 pt-2">
                        <Link
                            href="/aula-virtual"
                            className="rounded-xl bg-zinc-950 px-6 py-3 text-xs font-extrabold text-white"
                        >
                            Ir a mi Aula Virtual
                        </Link>
                        <Link
                            href="/?vista=publica"
                            className="rounded-xl border border-zinc-300 px-5 py-3 text-xs font-bold hover:bg-zinc-50"
                        >
                            Volver al Inicio
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const precioBase = Number(datos.item.precio || 0);
    const descuentoCalculado = cuponAplicado
        ? cuponAplicado.tipoDescuento === "PORCENTAJE"
            ? (precioBase * cuponAplicado.valorDescuento) / 100
            : cuponAplicado.valorDescuento
        : 0;
    const totalPagar = Math.max(0, precioBase - descuentoCalculado);

    async function procesarEnvio(
        modalidad: "MANUAL_VALIDACION" | "AUTOMATICO_PASARELA",
        datosManual?: any
    ) {
        setEnviando(true);
        try {
            const res = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    modalidad,
                    paramsItem,
                    codigoCupon: cuponAplicado?.codigo || null,
                    tipoComprobante,
                    documentoFacturacion,
                    razonSocialFacturacion,
                    direccionFacturacion,
                    ...(datosManual || {}),
                }),
            });
            const json = await res.json();
            if (res.ok && json.ok) {
                setPedidoConfirmado(json);
            } else {
                alert(json.error || "Ocurrió un error al registrar tu pedido");
            }
        } finally {
            setEnviando(false);
        }
    }

    return (
        <div className="min-h-screen bg-zinc-50 text-zinc-950 py-10 px-4">
            <div className="mx-auto max-w-5xl space-y-6">
                <div className="flex items-center justify-between">
                    <Link
                        href="/?vista=publica"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-600 hover:text-zinc-950"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Volver a la Plataforma</span>
                    </Link>
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500">
                        <Lock className="h-3.5 w-3.5" />
                        <span>Inscripción Segura</span>
                    </span>
                </div>

                {/* Si el visitante no inició sesión con Google */}
                {!datos.usuario && (
                    <div className="rounded-2xl border-2 border-zinc-950 bg-white p-5 flex flex-wrap items-center justify-between gap-4">
                        <div className="text-xs">
                            <strong className="block text-sm">
                                Inicia sesión con Google para continuar con tu inscripción
                            </strong>
                            <span className="text-zinc-600">
                                Así tu curso, membresía o simulador quedará vinculado
                                automáticamente a tu cuenta.
                            </span>
                        </div>
                        <Link
                            href="/api/auth/signin"
                            className="rounded-xl bg-zinc-950 px-5 py-2.5 text-xs font-extrabold text-white"
                        >
                            Ingresar con Google
                        </Link>
                    </div>
                )}

                <div className="grid gap-6 lg:grid-cols-12">
                    {/* COLUMNA IZQUIERDA: MÉTODO DE PAGO + DATOS DE COMPROBANTE */}
                    <div className="lg:col-span-7 space-y-6">
                        {/* Selector Híbrido: Pago Manual vs Pasarela Automática */}
                        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-5">
                            <h1 className="text-lg font-extrabold">
                                1. Elige tu Modalidad de Pago
                            </h1>

                            <div className="grid gap-3 sm:grid-cols-2 text-xs font-extrabold">
                                {datos.configPagos?.pagoManualHabilitado && (
                                    <button
                                        type="button"
                                        onClick={() => setModalidadActiva("MANUAL_VALIDACION")}
                                        className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition ${modalidadActiva === "MANUAL_VALIDACION"
                                                ? "border-zinc-950 bg-zinc-950 text-white"
                                                : "border-zinc-200 bg-zinc-50 text-zinc-800 hover:border-zinc-400"
                                            }`}
                                    >
                                        <Smartphone className="h-5 w-5 shrink-0" />
                                        <div>
                                            <div>Yape / Plin / Transferencia</div>
                                            <div className="text-[10px] font-normal opacity-80">
                                                Sube tu captura y N° de operación
                                            </div>
                                        </div>
                                    </button>
                                )}

                                {datos.configPagos?.pagoAutomaticoHabilitado && (
                                    <button
                                        type="button"
                                        onClick={() => setModalidadActiva("AUTOMATICO_PASARELA")}
                                        className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition ${modalidadActiva === "AUTOMATICO_PASARELA"
                                                ? "border-zinc-950 bg-zinc-950 text-white"
                                                : "border-zinc-200 bg-zinc-50 text-zinc-800 hover:border-zinc-400"
                                            }`}
                                    >
                                        <CreditCard className="h-5 w-5 shrink-0" />
                                        <div>
                                            <div>Tarjeta / Pasarela en Línea</div>
                                            <div className="text-[10px] font-normal opacity-80">
                                                Activación inmediata automática
                                            </div>
                                        </div>
                                    </button>
                                )}
                            </div>

                            {/* Datos de Facturación (Boleta o Factura) */}
                            <div className="border-t border-zinc-100 pt-4 space-y-3 text-xs">
                                <div className="flex items-center gap-4 font-bold">
                                    <span>Comprobante requerido:</span>
                                    <label className="flex items-center gap-1.5 cursor-pointer">
                                        <input
                                            type="radio"
                                            checked={tipoComprobante === "BOLETA"}
                                            onChange={() => setTipoComprobante("BOLETA")}
                                        />
                                        <span>Boleta (DNI)</span>
                                    </label>
                                    <label className="flex items-center gap-1.5 cursor-pointer">
                                        <input
                                            type="radio"
                                            checked={tipoComprobante === "FACTURA"}
                                            onChange={() => setTipoComprobante("FACTURA")}
                                        />
                                        <span>Factura (RUC)</span>
                                    </label>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2">
                                    <input
                                        placeholder={
                                            tipoComprobante === "FACTURA" ? "Número de RUC" : "DNI"
                                        }
                                        value={documentoFacturacion}
                                        onChange={(e) => setDocumentoFacturacion(e.target.value)}
                                        className="rounded-xl border border-zinc-300 px-3 py-2"
                                    />
                                    <input
                                        placeholder={
                                            tipoComprobante === "FACTURA"
                                                ? "Razón Social"
                                                : "Nombres y Apellidos"
                                        }
                                        value={razonSocialFacturacion}
                                        onChange={(e) => setRazonSocialFacturacion(e.target.value)}
                                        className="rounded-xl border border-zinc-300 px-3 py-2"
                                    />
                                    {tipoComprobante === "FACTURA" && (
                                        <input
                                            placeholder="Dirección Fiscal"
                                            value={direccionFacturacion}
                                            onChange={(e) => setDireccionFacturacion(e.target.value)}
                                            className="sm:col-span-2 rounded-xl border border-zinc-300 px-3 py-2"
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Formulario según la modalidad elegida */}
                            <div className="border-t border-zinc-100 pt-5">
                                {modalidadActiva === "MANUAL_VALIDACION" ? (
                                    <FormularioPagoManual
                                        cuentasManuales={datos.cuentasManuales || []}
                                        instruccionesGenerales={
                                            datos.configPagos?.instruccionesGeneralesPagoManual || ""
                                        }
                                        enviando={enviando}
                                        onEnviarPagoManual={(datosManual) =>
                                            procesarEnvio("MANUAL_VALIDACION", datosManual)
                                        }
                                    />
                                ) : (
                                    <div className="space-y-4">
                                        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-xs space-y-1">
                                            <div className="font-extrabold">
                                                Pasarela configurada:{" "}
                                                {datos.pasarelasActivas?.[0]?.nombreVisible ||
                                                    "Pendiente de llaves API"}
                                            </div>
                                            <p className="text-zinc-600">
                                                Al confirmar, se generará tu orden segura para completar
                                                el pago con tarjeta o Yape en línea con activación
                                                inmediata vía webhook.
                                            </p>
                                        </div>
                                        <button
                                            disabled={enviando || !datos.usuario}
                                            onClick={() => procesarEnvio("AUTOMATICO_PASARELA")}
                                            className="w-full rounded-xl bg-zinc-950 py-3.5 text-xs font-extrabold text-white hover:bg-zinc-800 disabled:opacity-50"
                                        >
                                            {enviando
                                                ? "Generando orden..."
                                                : `Pagar S/ ${totalPagar.toFixed(2)} en Línea`}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* COLUMNA DERECHA: RESUMEN DE ORDEN Y CUPÓN */}
                    <div className="lg:col-span-5 space-y-5">
                        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-5 sticky top-6">
                            <h2 className="text-sm font-extrabold uppercase tracking-wider text-zinc-500">
                                Resumen de tu Inscripción
                            </h2>

                            <div className="space-y-1 border-b border-zinc-100 pb-4">
                                <div className="text-base font-extrabold text-zinc-950">
                                    {datos.item.titulo}
                                </div>
                                <div className="text-xs text-zinc-500">
                                    {datos.item.subtitulo}
                                </div>
                            </div>

                            {/* Cupón de Descuento */}
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Tag className="h-3.5 w-3.5 absolute left-3 top-2.5 text-zinc-400" />
                                    <input
                                        placeholder="Código de cupón"
                                        value={codigoCupon}
                                        onChange={(e) => setCodigoCupon(e.target.value)}
                                        className="w-full rounded-xl border border-zinc-300 pl-8 pr-3 py-2 text-xs uppercase font-bold"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => cargarCheckout(codigoCupon)}
                                    className="rounded-xl border border-zinc-950 px-4 py-2 text-xs font-extrabold hover:bg-zinc-100"
                                >
                                    Aplicar
                                </button>
                            </div>

                            {/* Totales */}
                            <div className="space-y-2 text-xs border-t border-zinc-100 pt-4">
                                <div className="flex justify-between text-zinc-600">
                                    <span>Subtotal</span>
                                    <span>S/ {precioBase.toFixed(2)}</span>
                                </div>
                                {descuentoCalculado > 0 && (
                                    <div className="flex justify-between font-bold text-emerald-700">
                                        <span>Descuento ({cuponAplicado?.codigo})</span>
                                        <span>- S/ {descuentoCalculado.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-lg font-extrabold text-zinc-950 border-t border-zinc-200 pt-3">
                                    <span>Total a Pagar</span>
                                    <span>S/ {totalPagar.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-[11px] text-zinc-500 pt-2">
                                <ShieldCheck className="h-4 w-4 text-zinc-900 shrink-0" />
                                <span>
                                    Acceso automático a tu Aula Virtual y certificación con código
                                    QR único.
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-zinc-50 flex items-center justify-center text-xs font-bold">
                    Cargando Checkout...
                </div>
            }
        >
            <CheckoutContenido />
        </Suspense>
    );
}