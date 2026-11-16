// src/components/admin/TabMigracionCertificados.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
    FileSpreadsheet,
    Upload,
    CheckCircle2,
    QrCode,
    ExternalLink,
    Download,
} from "lucide-react";

interface TabMigracionProps {
    certificadosRecientes: any[];
    totalCertificadosCount: number;
    onImportarLote: (filas: any[], nombreArchivo: string) => Promise<void>;
}

const MUESTRA_INICIAL_TSV = `"SISTEMA ELECTRÓNICO DE CONTRATACIONES DEL SISTEMA ELECTRÓNICO DE CONTRATACIONES DEL ESTADO - SEACE"\tCurso de Especialización\tMERARDO AMERICO OSORIO CANTURIN (42490429)\tYOVER JAIME AVENDAÑO (41647880)\t25489-41647880\t26/10/2024\t14/12/2024\t120\tLectivas\t\tNo\tNo\tActivo
ACABADOS DE INTERIORES Y EXTERIORES CON PINTURA LATEX SATINADO\tCurso Taller\tPEDRO FLORES MARTINEZ (28312023)\tYOMER HUICHO GAMBOA (71201455)\t21547-71201455\t02/10/2023\t04/11/2023\t80\tLectivas\t\tNo\tNo\tActivo`;

export default function TabMigracionCertificados({
    certificadosRecientes,
    totalCertificadosCount,
    onImportarLote,
}: TabMigracionProps) {
    const [textoPegado, setTextoPegado] = useState(MUESTRA_INICIAL_TSV);
    const [importando, setImportando] = useState(false);

    function parsearFilasDesdeTexto(raw: string) {
        const lineas = raw
            .split(/\r?\n/)
            .map((l) => l.trim())
            .filter(Boolean);

        const resultado: any[] = [];

        for (const linea of lineas) {
            // Ignorar cabecera si empieza con "Curso\tCategoria"
            if (
                linea.toLowerCase().startsWith("curso\tcategoria") ||
                linea.toLowerCase().startsWith("curso;categoria")
            ) {
                continue;
            }

            const cols = linea.includes("\t")
                ? linea.split("\t")
                : linea.split(";");

            if (cols.length < 5) continue;

            resultado.push({
                curso: cols[0]?.replace(/^"|"$/g, "").trim(),
                categoria: cols[1]?.trim() || "Curso de Especialización",
                docente: cols[2]?.trim() || "",
                alumno: cols[3]?.trim() || "",
                codigo: cols[4]?.trim() || "",
                fechaInicio: cols[5]?.trim() || "",
                fechaFin: cols[6]?.trim() || "",
                horas: cols[7]?.trim() || "40",
                tipoHoras: cols[8]?.trim() || "Lectivas",
                estado: cols[12]?.trim() || cols[cols.length - 1]?.trim() || "Activo",
            });
        }

        return resultado;
    }

    function descargarPlantillaCertificados() {
        const contenido =
            "Curso\tCategoria\tDocente\tAlumno\tCodigo\tFecha Inicio\tFecha Fin\tHoras\tTipo Horas\tCertificado\tCertificado Publico\tFoto Alumno Publico\tEstado\n" +
            MUESTRA_INICIAL_TSV;
        const blob = new Blob([contenido], { type: "text/tab-separated-values;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "plantilla_4200_certificados.tsv";
        a.click();
    }

    const filasPrevisualizadas = parsearFilasDesdeTexto(textoPegado);

    return (
        <div className="space-y-6">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <span className="inline-block rounded bg-zinc-950 px-2.5 py-0.5 text-[10px] font-extrabold text-white uppercase">
                            Total en Base de Datos: {totalCertificadosCount} Certificados
                        </span>
                        <h3 className="text-lg font-extrabold text-zinc-950 mt-1">
                            Migración Masiva de los 4,200 Certificados Históricos (Verificables con QR solo Anverso)
                        </h3>
                        <p className="text-xs text-zinc-600">
                            Pega directamente tus filas desde Excel o sube el archivo. El
                            sistema extrae el nombre y el DNI entre paréntesis —ej.{" "}
                            <code>YOVER JAIME AVENDAÑO (41647880)</code>—, le crea su usuario
                            con su DNI y activa su consulta pública por QR o DNI sin pedirle
                            Gmail.
                        </p>
                    </div>

                    <button
                        onClick={descargarPlantillaCertificados}
                        className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-2 text-xs font-extrabold hover:bg-zinc-100"
                    >
                        <Download className="h-4 w-4" />
                        <span>Descargar Formato Estándar</span>
                    </button>
                </div>

                {/* Subir archivo CSV / TSV */}
                <div className="flex items-center gap-3">
                    <label className="inline-flex items-center gap-2 cursor-pointer rounded-xl border border-zinc-300 bg-zinc-100 px-4 py-2 text-xs font-bold hover:bg-zinc-200">
                        <FileSpreadsheet className="h-4 w-4" />
                        <span>Cargar desde archivo (.csv / .tsv / .txt de Excel)</span>
                        <input
                            type="file"
                            accept=".csv,.tsv,.txt"
                            onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const text = await file.text();
                                setTextoPegado(text);
                            }}
                            className="hidden"
                        />
                    </label>
                    <span className="text-xs text-zinc-500">
                        o copia y pega directamente las celdas de tu Excel aquí abajo:
                    </span>
                </div>

                <textarea
                    rows={6}
                    value={textoPegado}
                    onChange={(e) => setTextoPegado(e.target.value)}
                    placeholder="Pega aquí las filas desde tu Excel (Curso | Categoria | Docente | Alumno | Codigo | Fecha Inicio | Fecha Fin | Horas | Tipo Horas...)"
                    className="w-full rounded-xl border border-zinc-300 bg-zinc-50 p-3 font-mono text-[11px]"
                />

                <div className="flex flex-wrap items-center justify-between gap-4">
                    <span className="text-xs font-bold text-zinc-700">
                        Filas detectadas listas para importar:{" "}
                        <strong>{filasPrevisualizadas.length}</strong>
                    </span>

                    <button
                        disabled={importando || filasPrevisualizadas.length === 0}
                        onClick={async () => {
                            setImportando(true);
                            try {
                                await onImportarLote(
                                    filasPrevisualizadas,
                                    "Lote-Excel-Certificados"
                                );
                            } finally {
                                setImportando(false);
                            }
                        }}
                        className="inline-flex items-center gap-2 rounded-xl bg-zinc-950 px-6 py-3 text-xs font-extrabold text-white shadow hover:bg-zinc-800 disabled:opacity-50"
                    >
                        <Upload className="h-4 w-4" />
                        <span>
                            {importando
                                ? "Importando certificados y creando cuentas por DNI..."
                                : `Importar ${filasPrevisualizadas.length} Certificados y Generar QRs`}
                        </span>
                    </button>
                </div>
            </div>

            {/* Tabla de certificados importados con enlace directo a su Cara Frontal + QR */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
                <h4 className="text-sm font-extrabold">
                    Últimos Certificados Registrados (Haz clic en &laquo;Ver Cara QR&raquo; para probar cómo lo ve el alumno al escanear)
                </h4>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr className="border-b border-zinc-200 bg-zinc-50 font-extrabold">
                                <th className="p-2.5">Código / Registro</th>
                                <th className="p-2.5">Alumno (DNI)</th>
                                <th className="p-2.5">Curso / Especialización</th>
                                <th className="p-2.5">Fechas y Horas</th>
                                <th className="p-2.5">Vista Pública QR (Solo Cara)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200">
                            {certificadosRecientes.map((c) => (
                                <tr key={c.id}>
                                    <td className="p-2.5 font-mono font-bold">{c.codigoUnico}</td>
                                    <td className="p-2.5">
                                        <div className="font-bold">{c.nombreCompletoTitular}</div>
                                        <div className="text-[11px] text-zinc-500">
                                            DNI: {c.dniTitular}
                                        </div>
                                    </td>
                                    <td className="p-2.5">
                                        <div className="font-semibold">{c.nombreProgramaImpreso}</div>
                                        <div className="text-[11px] text-zinc-500">
                                            {c.temporadaNombreImpreso} • {c.seccionNombreImpreso}
                                        </div>
                                    </td>
                                    <td className="p-2.5 text-[11px]">
                                        {c.horasAcademicas} hrs
                                    </td>
                                    <td className="p-2.5">
                                        <Link
                                            href={`/verificar/${encodeURIComponent(c.codigoUnico)}`}
                                            target="_blank"
                                            className="inline-flex items-center gap-1 rounded-lg bg-zinc-950 px-3 py-1.5 text-[11px] font-extrabold text-white hover:bg-zinc-800"
                                        >
                                            <QrCode className="h-3.5 w-3.5" />
                                            <span>Ver Cara QR</span>
                                            <ExternalLink className="h-3 w-3" />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}