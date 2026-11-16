// src/types/next-auth.d.ts
import { PermisoSistema, RolUsuario } from "@prisma/client";
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      dni?: string | null;
      rol: RolUsuario;
      permisos: PermisoSistema[];
    };
  }

  interface User {
    id: string;
    dni?: string | null;
    rol: RolUsuario;
    permisos?: PermisoSistema[];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    dni?: string | null;
    rol: RolUsuario;
    permisos: PermisoSistema[];
  }
}