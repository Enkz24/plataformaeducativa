// src/app/panel/administrador/page.tsx
import { redirect } from "next/navigation";

export default function RedirectPanelAdministrador() {
    redirect("/admin/configuracion");
}