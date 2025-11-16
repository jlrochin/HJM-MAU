# MAU Hospital - Sistema de Gestión de Recetas (Next.js Refactor)

Sistema Intrahospitalario de Gestión de Recetas - Versión refactorizada con Next.js 16, shadcn/ui y PostgreSQL.

## Stack Tecnológico

- **Framework**: Next.js 16 (App Router)
- **React**: 19.2
- **UI**: shadcn/ui (New York style)
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript
- **Forms**: React Hook Form + Zod
- **Database**: PostgreSQL + Prisma ORM (próximo)
- **Auth**: NextAuth.js v5 (próximo)

## Ubicación en el Proyecto

Este es el nuevo frontend refactorizado ubicado en `/MAU/nextjs/`

```
/MAU/
├── backend/     (Django - sistema actual)
├── frontend/    (Vue.js - sistema actual)
├── nextjs/      (Next.js - nuevo sistema - ESTE PROYECTO)
└── ...
```

## Instalación

```bash
cd nextjs

# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp .env.example .env.local

# Ejecutar en desarrollo
pnpm dev
```

## Scripts Disponibles

```bash
pnpm dev        # Desarrollo con Turbopack
pnpm build      # Build para producción
pnpm start      # Iniciar servidor producción
pnpm lint       # Ejecutar ESLint
pnpm format     # Formatear código con Prettier
```

## Estructura del Proyecto

```
nextjs/
├── src/
│   ├── app/                    # App Router (Next.js 16)
│   │   ├── (auth)/            # Grupo de rutas autenticación
│   │   │   └── login/
│   │   ├── (dashboard)/       # Grupo de rutas dashboard
│   │   │   ├── pacientes/
│   │   │   ├── recetas/
│   │   │   ├── medicamentos/
│   │   │   └── reportes/
│   │   └── api/               # API Routes
│   │       ├── patients/
│   │       ├── prescriptions/
│   │       ├── medications/
│   │       ├── cie10/
│   │       └── reports/
│   ├── components/
│   │   ├── ui/                # shadcn components
│   │   ├── forms/             # Form components
│   │   ├── tables/            # Table components
│   │   ├── dashboard/         # Dashboard widgets
│   │   └── layout/            # Layout components
│   ├── actions/               # Server Actions
│   ├── lib/
│   │   ├── validations/       # Zod schemas
│   │   └── utils.ts           # Utilities
│   └── types/                 # TypeScript types
└── prisma/                     # Prisma schema (próximo)
```

## Configuración

### Base Path

Configurado con `basePath: '/mau'` para deployment con Traefik.

- Desarrollo: `http://localhost:3000/mau`
- Producción: `https://tu-dominio.com/mau`

### Variables de Entorno

Ver `.env.example` para las variables requeridas.

## Desarrollo

### Agregar Componentes shadcn

```bash
pnpm dlx shadcn@latest add button
pnpm dlx shadcn@latest add form
pnpm dlx shadcn@latest add table
```

## Git Workflow

Este proyecto está en la rama `refactor/nextjs`.

```bash
# Ver rama actual
git branch

# Cambiar a rama refactor
git checkout refactor/nextjs

# Hacer commits
git add .
git commit -m "refactor: descripción del cambio"

# Cuando esté listo para merge
git checkout development
git merge refactor/nextjs
```

## Roadmap

Ver `ROADMAP-MIGRACION.md` en la raíz del proyecto MAU para el plan completo de migración.

### Próximos Pasos

1. [x] Configurar Next.js + shadcn/ui (Tarea 1)
2. [ ] Configurar PostgreSQL + Prisma (Tarea 2)
3. [ ] Implementar NextAuth.js (Tarea 3)
4. [ ] Migrar componentes desde Vue (Tarea 4)
5. [ ] Crear API Routes (Tarea 5)
6. [ ] Implementar módulo de recetas (Tarea 7)
7. [ ] Dashboard con métricas (Tarea 8)
8. [ ] Tests (Tarea 9)
9. [ ] Docker + CI/CD (Tarea 10)

## Documentación

- [Next.js 16](https://nextjs.org/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [Tailwind CSS v4](https://tailwindcss.com)
- [Prisma](https://prisma.io/docs)
- [NextAuth.js](https://authjs.dev)

## Licencia

Privado - Hospital Juan María
