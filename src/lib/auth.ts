// src/lib/auth.ts
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PermisoSistema, RolUsuario } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

// Permisos base por Rol (combinables con los permisos personalizados en la tabla UsuarioPermiso)
export const PERMISOS_BASE_POR_ROL: Record<RolUsuario, PermisoSistema[]> = {
  ADMINISTRADOR: Object.values(PermisoSistema),
  ASISTENTE_ADMINISTRATIVO: [
    PermisoSistema.CONSULTAR_PAGOS,
    PermisoSistema.VALIDAR_PAGOS_MANUALES,
    PermisoSistema.APROBAR_PAGOS,
    PermisoSistema.RECHAZAR_PAGOS,
    PermisoSistema.GESTIONAR_CUOTAS,
    PermisoSistema.GESTIONAR_CURSOS_PROGRAMAS,
    PermisoSistema.GESTIONAR_SIMULACROS_OECE,
    PermisoSistema.EMITIR_CERTIFICADOS,
    PermisoSistema.ATENDER_LIBRO_RECLAMACIONES,
  ],
  CONTADURIA: [
    PermisoSistema.CONSULTAR_PAGOS,
    PermisoSistema.VALIDAR_PAGOS_MANUALES,
    PermisoSistema.APROBAR_PAGOS,
    PermisoSistema.RECHAZAR_PAGOS,
    PermisoSistema.REEMBOLSAR_PAGOS,
    PermisoSistema.GESTIONAR_CUOTAS,
    PermisoSistema.EXPORTAR_REPORTES_FINANCIEROS,
    PermisoSistema.EMITIR_COMPROBANTES_CONTABLES,
  ],
  SECRETARIA: [
    PermisoSistema.CONSULTAR_PAGOS,
    PermisoSistema.VALIDAR_PAGOS_MANUALES,
    PermisoSistema.APROBAR_PAGOS,
    PermisoSistema.RECHAZAR_PAGOS,
    PermisoSistema.EMITIR_CERTIFICADOS,
  ],
  PROFESOR: [
    PermisoSistema.GESTIONAR_CURSOS_PROGRAMAS,
  ],
  ESTUDIANTE: [],
};

export async function obtenerPermisosEfectivosUsuario(
  userId: string,
  rol: RolUsuario
): Promise<PermisoSistema[]> {
  if (rol === RolUsuario.ADMINISTRADOR) {
    return Object.values(PermisoSistema);
  }

  const permisosBase = new Set<PermisoSistema>(PERMISOS_BASE_POR_ROL[rol] || []);

  const permisosPersonalizados = await prisma.usuarioPermiso.findMany({
    where: { userId },
  });

  for (const p of permisosPersonalizados) {
    if (p.concedido) {
      permisosBase.add(p.permiso);
    } else {
      permisosBase.delete(p.permiso);
    }
  }

  return Array.from(permisosBase);
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    // Estrategia JWT para que sirva tanto en Next.js Web como en una futura App Móvil
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  pages: {
    signIn: "/",
    error: "/",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      allowDangerousEmailAccountLinking: true,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          nombres: profile.given_name ?? profile.name,
          apellidos: profile.family_name ?? "",
          email: profile.email,
          image: profile.picture,
          rol: RolUsuario.ESTUDIANTE,
        };
      },
    }),
    CredentialsProvider({
      name: "Correo y Contraseña",
      credentials: {
        email: { label: "Correo Electrónico", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Ingresa tu correo electrónico y contraseña.");
        }

        const usuario = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        });

        if (!usuario || !usuario.passwordHash) {
          throw new Error("Credenciales inválidas o cuenta registrada con Google.");
        }

        if (!usuario.activo) {
          throw new Error("Tu cuenta se encuentra suspendida. Contacta con soporte.");
        }

        const passwordValido = await bcrypt.compare(
          credentials.password,
          usuario.passwordHash
        );

        if (!passwordValido) {
          throw new Error("Contraseña incorrecta.");
        }

        const permisos = await obtenerPermisosEfectivosUsuario(
          usuario.id,
          usuario.rol
        );

        return {
          id: usuario.id,
          name: usuario.name ?? `${usuario.nombres ?? ""} ${usuario.apellidos ?? ""}`.trim(),
          email: usuario.email,
          image: usuario.image,
          dni: usuario.dni,
          rol: usuario.rol,
          permisos,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.rol = user.rol ?? RolUsuario.ESTUDIANTE;
        token.dni = user.dni ?? null;
        token.permisos = await obtenerPermisosEfectivosUsuario(
          user.id,
          token.rol
        );
      } else if (trigger === "update" && token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id },
        });
        if (dbUser) {
          token.rol = dbUser.rol;
          token.dni = dbUser.dni;
          token.permisos = await obtenerPermisosEfectivosUsuario(
            dbUser.id,
            dbUser.rol
          );
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.rol = token.rol;
        session.user.dni = token.dni;
        session.user.permisos = token.permisos ?? [];
      }
      return session;
    },
  },
};