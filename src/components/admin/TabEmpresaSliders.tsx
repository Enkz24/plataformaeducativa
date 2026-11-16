// src/components/admin/TabEmpresaSliders.tsx
"use client";

import React, { useEffect, useState } from "react";
import DropzoneArchivo from "@/components/admin/DropzoneArchivo";
import { Save, Plus, Edit3, Trash2 } from "lucide-react";

interface TabEmpresaSlidersProps {
    subTabActiva: string;
    configSitio: any;
    sliders: any[];
    onEjecutarAccion: (
        accion: string,
        datos: any,
        msgExito: string
    ) => Promise<void>;
}

export default function TabEmpresaSliders({
    subTabActiva,
    configSitio,
    sliders,
    onEjecutarAccion,
}: TabEmpresaSlidersProps) {
    const [formEmpresa, setFormEmpresa] = useState({
        nombreEmpresa: "AULA PROFESIONAL",
        subtituloEmpresa: "Escuela de Gestión y Especialización",
        rucEmpresa: "",
        razonSocial: "",
        slogan: "Impulsa tu carrera profesional",
        logoUrl: "/empresa/logo.png",
        direccionFisica: "",
        correoContacto: "",
        telefonoWhatsappAsesoria: "51983495578",
        telefonoWhatsappAlumnos: "51990945941",
        telefonoWhatsappCambioCorreo: "51949329563",
        mensajeBaseCambioCorreo:
            "Hola, ya no tengo acceso a mi correo registrado y solicito restaurar mi cuenta a este nuevo correo:",
        codigoCertificacionIsoDefault: "ISO 9001:2015 CO24.00145/U",
        firmaDirectorUrl: "/firmas/firma-director.png",
        mostrarCintilloSuperior: true,
        textoCintilloSuperior:
            "Plataforma de Capacitación, Membresías y Simuladores OECE con Certificación QR",
    });

    const [formSlider, setFormSlider] = useState({
        id: "",
        titulo: "",
        subtitulo: "",
        etiquetaSuperior: "FORMACIÓN PROFESIONAL • PERÚ",
        imagenFondoUrl: "/sliders/slider-1.jpg",
        textoBotonPrincipal: "Explorar cursos",
        enlaceBotonPrincipal: "#cursos-y-diplomados",
    });

    useEffect(() => {
        if (configSitio) {
            setFormEmpresa((prev) => ({ ...prev, ...configSitio }));
        }
    }, [configSitio]);

    if (subTabActiva === "emp_sliders") {
        return (
            <div className="space-y-6">
                <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-base font-extrabold">
                            {formSlider.id
                                ? `Editando Slider: ${formSlider.titulo}`
                                : "Agregar Nuevo Slider de Fondo para la Página Principal"}
                        </h3>
                        {formSlider.id && (
                            <button
                                onClick={() =>
                                    setFormSlider({
                                        id: "",
                                        titulo: "",
                                        subtitulo: "",
                                        etiquetaSuperior: "FORMACIÓN PROFESIONAL • PERÚ",
                                        imagenFondoUrl: "/sliders/slider-1.jpg",
                                        textoBotonPrincipal: "Explorar cursos",
                                        enlaceBotonPrincipal: "#cursos-y-diplomados",
                                    })
                                }
                                className="text-xs font-bold underline"
                            >
                                Cancelar edición
                            </button>
                        )}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div>
                            <label className="block text-xs font-bold mb-1">
                                Etiqueta Superior
                            </label>
                            <input
                                value={formSlider.etiquetaSuperior}
                                onChange={(e) =>
                                    setFormSlider({
                                        ...formSlider,
                                        etiquetaSuperior: e.target.value,
                                    })
                                }
                                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-xs"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold mb-1">
                                Título Principal del Slider
                            </label>
                            <input
                                placeholder="Ej: Diplomados y Cursos con Certificación QR"
                                value={formSlider.titulo}
                                onChange={(e) =>
                                    setFormSlider({ ...formSlider, titulo: e.target.value })
                                }
                                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-xs"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold mb-1">
                                Subtítulo Descriptivo
                            </label>
                            <input
                                placeholder="Subtítulo del banner"
                                value={formSlider.subtitulo}
                                onChange={(e) =>
                                    setFormSlider({ ...formSlider, subtitulo: e.target.value })
                                }
                                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-xs"
                            />
                        </div>
                        <div className="sm:col-span-2 lg:col-span-3">
                            <DropzoneArchivo
                                label="Subir Imagen de Fondo del Slider (Arrastra desde tu PC o pega ruta)"
                                carpeta="sliders"
                                accept="image/*"
                                valorActual={formSlider.imagenFondoUrl}
                                onChangeUrl={(url) =>
                                    setFormSlider({ ...formSlider, imagenFondoUrl: url })
                                }
                            />
                        </div>
                    </div>

                    <button
                        onClick={async () => {
                            await onEjecutarAccion(
                                "GUARDAR_SLIDER",
                                formSlider,
                                formSlider.id
                                    ? "Slider actualizado"
                                    : "Slider publicado en la página de inicio"
                            );
                            setFormSlider({
                                id: "",
                                titulo: "",
                                subtitulo: "",
                                etiquetaSuperior: "FORMACIÓN PROFESIONAL • PERÚ",
                                imagenFondoUrl: "/sliders/slider-1.jpg",
                                textoBotonPrincipal: "Explorar cursos",
                                enlaceBotonPrincipal: "#cursos-y-diplomados",
                            });
                        }}
                        className="inline-flex items-center gap-2 rounded-xl bg-zinc-950 px-5 py-2.5 text-xs font-extrabold text-white"
                    >
                        <Plus className="h-4 w-4" />
                        <span>
                            {formSlider.id ? "Guardar Cambios del Slider" : "Publicar Slider"}
                        </span>
                    </button>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                    {sliders.map((s) => (
                        <div
                            key={s.id}
                            className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm flex flex-col justify-between"
                        >
                            <div>
                                <span className="text-[10px] font-mono text-zinc-500">
                                    {s.imagenFondoUrl}
                                </span>
                                <h4 className="font-extrabold text-sm mt-1">{s.titulo}</h4>
                                <p className="text-xs text-zinc-600 mt-1">{s.subtitulo}</p>
                            </div>
                            <div className="mt-4 flex gap-3 border-t border-zinc-100 pt-3 text-xs font-bold">
                                <button
                                    onClick={() =>
                                        setFormSlider({
                                            id: s.id,
                                            titulo: s.titulo,
                                            subtitulo: s.subtitulo || "",
                                            etiquetaSuperior: s.etiquetaSuperior || "",
                                            imagenFondoUrl: s.imagenFondoUrl,
                                            textoBotonPrincipal: s.textoBotonPrincipal || "Explorar",
                                            enlaceBotonPrincipal:
                                                s.enlaceBotonPrincipal || "#cursos-y-diplomados",
                                        })
                                    }
                                    className="inline-flex items-center gap-1 underline"
                                >
                                    <Edit3 className="h-3.5 w-3.5" />
                                    <span>Editar</span>
                                </button>
                                <button
                                    onClick={() =>
                                        onEjecutarAccion(
                                            "ELIMINAR_SLIDER",
                                            { id: s.id },
                                            "Slider eliminado"
                                        )
                                    }
                                    className="inline-flex items-center gap-1 text-red-600 hover:underline"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    <span>Eliminar</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-5">
            <div>
                <h3 className="text-base font-extrabold">
                    Datos Institucionales de la Empresa, RUC, Logo, Firmas y WhatsApp
                </h3>
                <p className="text-xs text-zinc-500">
                    Todo lo que guardes aquí actualiza automáticamente la página de
                    inicio, cabecera, pie de página y los certificados PDF.
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                    <label className="block text-xs font-bold mb-1">
                        Nombre Comercial de la Empresa
                    </label>
                    <input
                        value={formEmpresa.nombreEmpresa}
                        onChange={(e) =>
                            setFormEmpresa({ ...formEmpresa, nombreEmpresa: e.target.value })
                        }
                        className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-xs"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold mb-1">
                        Subtítulo Institucional
                    </label>
                    <input
                        value={formEmpresa.subtituloEmpresa}
                        onChange={(e) =>
                            setFormEmpresa({
                                ...formEmpresa,
                                subtituloEmpresa: e.target.value,
                            })
                        }
                        className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-xs"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold mb-1">
                        Número de RUC de la Empresa
                    </label>
                    <input
                        placeholder="Ej: 20601234567"
                        value={formEmpresa.rucEmpresa || ""}
                        onChange={(e) =>
                            setFormEmpresa({ ...formEmpresa, rucEmpresa: e.target.value })
                        }
                        className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-xs"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold mb-1">
                        Razón Social Legal
                    </label>
                    <input
                        placeholder="Ej: CENTRO DE CAPACITACIÓN S.A.C."
                        value={formEmpresa.razonSocial || ""}
                        onChange={(e) =>
                            setFormEmpresa({ ...formEmpresa, razonSocial: e.target.value })
                        }
                        className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-xs"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold mb-1">
                        Dirección Física
                    </label>
                    <input
                        value={formEmpresa.direccionFisica || ""}
                        onChange={(e) =>
                            setFormEmpresa({
                                ...formEmpresa,
                                direccionFisica: e.target.value,
                            })
                        }
                        className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-xs"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold mb-1">
                        Código ISO para Certificados
                    </label>
                    <input
                        value={formEmpresa.codigoCertificacionIsoDefault || ""}
                        onChange={(e) =>
                            setFormEmpresa({
                                ...formEmpresa,
                                codigoCertificacionIsoDefault: e.target.value,
                            })
                        }
                        className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-xs"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold mb-1">
                        WhatsApp Asesoría Comercial (con 51)
                    </label>
                    <input
                        value={formEmpresa.telefonoWhatsappAsesoria}
                        onChange={(e) =>
                            setFormEmpresa({
                                ...formEmpresa,
                                telefonoWhatsappAsesoria: e.target.value,
                            })
                        }
                        className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-xs"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold mb-1">
                        WhatsApp Soporte Alumnos (con 51)
                    </label>
                    <input
                        value={formEmpresa.telefonoWhatsappAlumnos}
                        onChange={(e) =>
                            setFormEmpresa({
                                ...formEmpresa,
                                telefonoWhatsappAlumnos: e.target.value,
                            })
                        }
                        className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-xs"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold mb-1">
                        WhatsApp Restauración de Correo Gmail (wa.me/51...)
                    </label>
                    <input
                        value={formEmpresa.telefonoWhatsappCambioCorreo}
                        onChange={(e) =>
                            setFormEmpresa({
                                ...formEmpresa,
                                telefonoWhatsappCambioCorreo: e.target.value,
                            })
                        }
                        className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-xs"
                    />
                </div>

                <div className="sm:col-span-2 lg:col-span-1">
                    <DropzoneArchivo
                        label="Subir Logo de la Empresa"
                        carpeta="empresa"
                        accept="image/*"
                        valorActual={formEmpresa.logoUrl}
                        onChangeUrl={(url) =>
                            setFormEmpresa({ ...formEmpresa, logoUrl: url })
                        }
                    />
                </div>

                <div className="sm:col-span-2 lg:col-span-2">
                    <DropzoneArchivo
                        label="Subir Firma Digital Principal para Certificados"
                        carpeta="firmas"
                        accept="image/*"
                        valorActual={formEmpresa.firmaDirectorUrl}
                        onChangeUrl={(url) =>
                            setFormEmpresa({ ...formEmpresa, firmaDirectorUrl: url })
                        }
                    />
                </div>
            </div>

            <button
                onClick={() =>
                    onEjecutarAccion(
                        "GUARDAR_EMPRESA",
                        formEmpresa,
                        "Configuración general de la empresa guardada"
                    )
                }
                className="inline-flex items-center gap-2 rounded-xl bg-zinc-950 px-6 py-3 text-xs font-extrabold text-white hover:bg-zinc-800"
            >
                <Save className="h-4 w-4" />
                <span>Guardar Datos de la Empresa</span>
            </button>
        </div>
    );
}