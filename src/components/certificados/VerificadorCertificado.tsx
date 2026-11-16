// src/components/certificados/VerificadorCertificado.tsx
"use client";

import { useState, FormEvent } from "react";
import { Search, Award, CheckCircle2, AlertCircle, QrCode } from "lucide-react";

interface CertificadoResultado {
  id: string;
  codigoUnico: string;
  codigoVerificacionQR: string;
  dniTitular: string;
  nombreCompletoTitular: string;
  nombreProgramaImpreso: string;
  tipoProgramaImpreso: string;
  horasAcademicas: number;
  notaObtenida: string | null;
  fechaEmision: string;
  archivoPdfUrl: string | null;
}

export default function VerificadorCertificado() {
  const [consulta, setConsulta] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultados, setResultados] = useState<CertificadoResultado[] | null>(null);

  const buscarCertificado = async (e: FormEvent) => {
    e.preventDefault();
    if (!consulta.trim()) return;

    setCargando(true);
    setError(null);
    setResultados(null);

    try {
      const res = await fetch(
        `/api/certificados/verificar?q=${encodeURIComponent(consulta.trim())}`
      );
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "No se pudo verificar el certificado.");
      } else {
        setResultados(data.certificados || []);
      }
    } catch {
      setError("Error de conexión al verificar el certificado.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          <Award className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            Verificación Oficial de Certificados (DNI / Código Único / QR)
          </h3>
          <p className="text-sm text-slate-600">
            Consulta la autenticidad de diplomas, especializaciones y cursos emitidos.
          </p>
        </div>
      </div>

      <form onSubmit={buscarCertificado} className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-3 h-5 w-5 text-slate-400" />
          <input
            type="text"
            value={consulta}
            onChange={(e) => setConsulta(e.target.value)}
            placeholder="Ingresa N° de DNI (ej. 71234567) o Código de Certificado..."
            className="w-full rounded-xl border border-slate-300 py-2.5 pl-11 pr-4 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
          />
        </div>
        <button
          type="submit"
          disabled={cargando}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
        >
          <QrCode className="h-4 w-4" />
          <span>{cargando ? "Verificando..." : "Validar Ahora"}</span>
        </button>
      </form>

      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {resultados && resultados.length === 0 && (
        <div className="mt-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
          No se encontraron certificados registrados con el DNI o código ingresado.
        </div>
      )}

      {resultados && resultados.length > 0 && (
        <div className="mt-5 space-y-3">
          {resultados.map((cert) => (
            <div
              key={cert.id}
              className="flex flex-col justify-between gap-4 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 sm:flex-row sm:items-center"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">
                    CERTIFICADO VÁLIDO - {cert.tipoProgramaImpreso}
                  </span>
                  <span className="text-xs font-mono text-slate-600">
                    Código: {cert.codigoUnico}
                  </span>
                </div>
                <p className="text-base font-bold text-slate-900">
                  {cert.nombreProgramaImpreso}
                </p>
                <p className="text-sm text-slate-700">
                  Otorgado a: <strong>{cert.nombreCompletoTitular}</strong> (DNI:{" "}
                  {cert.dniTitular}) — <strong>{cert.horasAcademicas} horas académicas</strong>
                </p>
                <p className="text-xs text-slate-500">
                  Fecha de emisión: {new Date(cert.fechaEmision).toLocaleDateString("es-PE")}
                </p>
              </div>
              {cert.archivoPdfUrl && (
                <a
                  href={cert.archivoPdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex shrink-0 items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                >
                  Descargar PDF / QR
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}