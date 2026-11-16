// src/components/admin/TabUsuariosCorreos.tsx
"use client";

import React, { useState } from "react";
import { Search } from "lucide-react";

interface TabUsuariosCorreosProps {
    usuarios: any[];
    onGuardarUsuario: (datos: any) => Promise<void>;
}

export default function TabUsuariosCorreos({
    usuarios,
    onGuardarUsuario,
}: TabUsuariosCorreosProps) {
    const [busqueda, setBusqueda] = useState("");

    const filtrados = usuarios.filter((u) => {
        const q = busqueda.toLowerCase();
        return (
            !q ||
            (u.name || "").toLowerCase().includes(q) ||
            (u.dni || "").toLowerCase().includes(q) ||
            (u.email || "").toLowerCase().includes(q)
        );
    });

    return (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h3 className="text-base font-extrabold">
                        Directorio de Usuarios, Asignación de Roles y Cambio de Correo Gmail
                    </h3>
                    <p className="text-xs text-zinc-500">
                        Incluye tanto a los usuarios registrados con Google como a las
                        cuentas creadas por DNI en la migración de los 4,200 certificados.
                    </p>
                </div>

                <div className="relative w-72">
                    <Search className="h-4 w-4 absolute left-3 top-2.5 text-zinc-400" />
                    <input
                        placeholder="Buscar por DNI, nombre o correo..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        className="w-full rounded-xl border border-zinc-300 pl-9 pr-3 py-2 text-xs"
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                    <thead>
                        <tr className="border-b border-zinc-200 bg-zinc-50 font-extrabold">
                            <th className="p-2.5">Nombre Completo</th>
                            <th className="p-2.5">DNI</th>
                            <th className="p-2.5">Correo Gmail (Editable)</th>
                            <th className="p-2.5">Rol</th>
                            <th className="p-2.5">Acción</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200">
                        {filtrados.map((u) => (
                            <FilaUsuarioEditable
                                key={u.id}
                                usuario={u}
                                onGuardar={onGuardarUsuario}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function FilaUsuarioEditable({
    usuario,
    onGuardar,
}: {
    usuario: any;
    onGuardar: (d: any) => Promise<void>;
}) {
    const [nombres, setNombres] = useState(
        usuario.name || usuario.nombres || ""
    );
    const [dni, setDni] = useState(usuario.dni || "");
    const [nuevoEmail, setNuevoEmail] = useState(usuario.email || "");
    const [nuevoRol, setNuevoRol] = useState(usuario.rol || "ESTUDIANTE");

    return (
        <tr>
            <td className="p-2.5">
                <input
                    value={nombres}
                    onChange={(e) => setNombres(e.target.value)}
                    className="w-full rounded border border-zinc-300 px-2 py-1 font-bold"
                />
            </td>
            <td className="p-2.5">
                <input
                    value={dni}
                    onChange={(e) => setDni(e.target.value)}
                    className="w-28 rounded border border-zinc-300 px-2 py-1 font-mono"
                />
            </td>
            <td className="p-2.5">
                <input
                    value={nuevoEmail}
                    onChange={(e) => setNuevoEmail(e.target.value)}
                    className="w-full rounded border border-zinc-300 px-2 py-1"
                />
            </td>
            <td className="p-2.5">
                <select
                    value={nuevoRol}
                    onChange={(e) => setNuevoRol(e.target.value)}
                    className="rounded border border-zinc-300 px-2 py-1 font-bold"
                >
                    <option value="ESTUDIANTE">ESTUDIANTE</option>
                    <option value="PROFESOR">PROFESOR</option>
                    <option value="ASISTENTE_ADMINISTRATIVO">ASISTENTE ADMIN</option>
                    <option value="CONTADURIA">CONTADURÍA</option>
                    <option value="ADMINISTRADOR">ADMINISTRADOR</option>
                </select>
            </td>
            <td className="p-2.5">
                <button
                    onClick={() =>
                        onGuardar({
                            userId: usuario.id,
                            nombres,
                            dni,
                            nuevoEmail,
                            nuevoRol,
                        })
                    }
                    className="rounded-lg bg-zinc-950 px-3 py-1.5 text-xs font-extrabold text-white hover:bg-zinc-800"
                >
                    Guardar
                </button>
            </td>
        </tr>
    );
}