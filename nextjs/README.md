# MAU Hospital - Sistema de Gestión de Recetas (Next.js Refactor)

Sistema Intrahospitalario de Gestión de Recetas - Versión refactorizada con Next.js 16, shadcn/ui y PostgreSQL.

## Stack Tecnológico

- **Framework**: Next.js 16 (App Router)
- **React**: 19.2
- **UI**: shadcn/ui (New York style)
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript
- **Forms**: React Hook Form + Zod
- **Database**: PostgreSQL + Prisma ORM
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

# Generar Prisma Client
pnpm prisma:generate

# Ejecutar en desarrollo
pnpm dev
```

## Scripts Disponibles

```bash
# Desarrollo
pnpm dev                # Desarrollo con Turbopack
pnpm build              # Build para producción
pnpm start              # Iniciar servidor producción
pnpm lint               # Ejecutar ESLint
pnpm format             # Formatear código con Prettier

# Prisma
pnpm prisma:generate    # Generar Prisma Client
pnpm prisma:migrate     # Crear y aplicar migraciones
pnpm prisma:studio      # Abrir Prisma Studio
pnpm prisma:seed        # Seed database con datos de prueba
```

## Base de Datos

### Configuración PostgreSQL

El proyecto usa PostgreSQL en el puerto **5433** (mismo que el backend Django actual).

**Conexión:**
```
Host: localhost
Port: 5433
Database: maudb
User: mau_user
Password: mau_local_password_123
```

### Modelos Prisma

El schema incluye los siguientes modelos migrados desde Django:

- **User**: Usuarios del sistema (Admin, Doctor, Enfermera, Farmacia)
- **Patient**: Pacientes con CURP, datos personales
- **Prescription**: Recetas médicas con diagnósticos
- **Medication**: Catálogo de medicamentos con stock
- **PrescriptionMedication**: Relación recetas-medicamentos
- **CIE10**: Catálogo de diagnósticos CIE-10
- **AuditLog**: Auditoría de acciones del sistema
- **MedicalHistory**: Historial médico de pacientes

### Migraciones

```bash
# Crear nueva migración
pnpm prisma:migrate

# Ver base de datos en Prisma Studio
pnpm prisma:studio
```

### Seed Data

El archivo `prisma/seed.ts` crea datos de prueba:

**Usuarios:**
- Admin: `admin@hospital.com` / `admin123`
- Doctor: `doctor@hospital.com` / `admin123`
- Enfermera: `enfermera@hospital.com` / `admin123`

**Datos de prueba:**
- 2 pacientes
- 3 medicamentos (Paracetamol, Ibuprofeno, Amoxicilina)
- 3 códigos CIE-10
- 1 receta de ejemplo

```bash
pnpm prisma:seed
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
│   │   ├── prisma.ts          # Prisma Client singleton
│   │   ├── validations/       # Zod schemas
│   │   └── utils.ts           # Utilities
│   └── types/                 # TypeScript types
├── prisma/
│   ├── schema.prisma          # Prisma schema
│   ├── seed.ts                # Seed data
│   └── migrations/            # Database migrations
└── public/                    # Static assets
```

## Configuración

### Base Path

Configurado con `basePath: '/mau'` para deployment con Traefik.

- Desarrollo: `http://localhost:3000/mau`
- Producción: `https://tu-dominio.com/mau`

### Variables de Entorno

Ver `.env.example` para las variables requeridas.

**Críticas:**
```env
DATABASE_URL="postgresql://mau_user:mau_local_password_123@localhost:5433/maudb"
NEXTAUTH_URL="http://localhost:3000/mau"
NEXTAUTH_SECRET="development-secret-key-change-in-production"
```

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

# Push a remote
git push origin refactor/nextjs

# Cuando esté listo para merge
git checkout development
git merge refactor/nextjs
```

## Roadmap

Ver `ROADMAP-MIGRACION.md` en la raíz del proyecto MAU para el plan completo de migración.

### Próximos Pasos

1. [x] Configurar Next.js + shadcn/ui (Tarea 1)
2. [x] Configurar PostgreSQL + Prisma (Tarea 2)
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
