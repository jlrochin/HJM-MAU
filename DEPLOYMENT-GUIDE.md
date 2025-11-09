# Guía Completa de Despliegue - MAU Hospital Management System

## Resumen

Este sistema utiliza un flujo de CI/CD completamente automatizado con GitHub Actions, Docker y Watchtower para despliegue continuo.

## Arquitectura del Despliegue

```
┌─────────────────────────────────────────────────────────────┐
│                       GitHub Actions                         │
│  - Construye imágenes Docker                                 │
│  - Publica en ghcr.io/jlrochin/mau-{frontend,backend}      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Container Registry                 │
│  - ghcr.io/jlrochin/mau-frontend:latest                     │
│  - ghcr.io/jlrochin/mau-backend:latest                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                       Watchtower                             │
│  - Detecta nuevas imágenes cada 60 segundos                 │
│  - Actualiza contenedores automáticamente                   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  Contenedores en Producción                  │
│  - mau-frontend (nginx)                                      │
│  - mau-backend (Django + gunicorn)                          │
│  - postgres-mau (PostgreSQL 16)                             │
└─────────────────────────────────────────────────────────────┘
```

## Requisitos Previos

### En tu Máquina Local
- Git
- GitHub CLI (`gh`) - ya configurado ✅
- Docker (opcional, para pruebas locales)

### En el Servidor de Producción
- Ubuntu 22.04+ o similar
- Docker Engine 24+
- Docker Compose v2+
- Acceso a internet para descargar imágenes de ghcr.io
- Puerto 80 disponible para Traefik

## Flujo de Trabajo de Desarrollo

### 1. Desarrollo Local

```bash
# Hacer cambios en el código
# Frontend: frontend/src/
# Backend: backend/

# Verificar cambios
git status
```

### 2. Commit y Push

```bash
# Agregar cambios
git add .

# Crear commit
git commit -m "feat: descripción del cambio"

# Push a GitHub
git push origin main
```

### 3. CI/CD Automático

Cuando haces push a la branch `main`:

1. **GitHub Actions se activa automáticamente** (`.github/workflows/docker.yml`)
2. **Construye las imágenes Docker:**
   - `mau-frontend`: Build multi-stage con Node.js → nginx
   - `mau-backend`: Build con Python → Django + gunicorn
3. **Publica a GitHub Container Registry:**
   - `ghcr.io/jlrochin/mau-frontend:latest`
   - `ghcr.io/jlrochin/mau-backend:latest`
4. **Tiempo estimado:** 5-8 minutos

### 4. Despliegue Automático

1. **Watchtower** (en el servidor) detecta las nuevas imágenes
2. Descarga las nuevas versiones
3. Detiene los contenedores antiguos
4. Inicia los nuevos contenedores
5. Limpia las imágenes antiguas
6. **Tiempo de detección:** Máximo 60 segundos
7. **Downtime:** ~10-30 segundos por servicio

## Configuración Inicial del Servidor

### Paso 1: Instalar Docker

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Agregar usuario al grupo docker
sudo usermod -aG docker $USER
newgrp docker

# Verificar instalación
docker --version
docker compose version
```

### Paso 2: Clonar la Configuración

```bash
# Crear directorio para el proyecto
sudo mkdir -p /opt/hjm-mau
sudo chown $USER:$USER /opt/hjm-mau
cd /opt/hjm-mau

# Copiar solo los archivos de configuración necesarios
# Crear docker-compose.yml
# Crear archivos .env
```

### Paso 3: Configurar Variables de Entorno

Crea estos archivos en `/opt/hjm-mau/`:

**mau.env:**
```bash
DATABASE_URL=postgresql://mau_user:TU_PASSWORD_SEGURO@postgres-mau:5432/maudb
DJANGO_ALLOWED_HOSTS=*
DJANGO_SECRET_KEY=tu-secret-key-muy-largo-y-seguro-aqui
DJANGO_SETTINGS_MODULE=mau_hospital.settings
DEBUG=False
```

**mau-db.env:**
```bash
POSTGRES_USER=mau_user
POSTGRES_PASSWORD=TU_PASSWORD_SEGURO
POSTGRES_DB=maudb
```

**Importante:** Cambia todos los valores de ejemplo por valores seguros en producción.

### Paso 4: Login en GitHub Container Registry

```bash
# Crear token en GitHub con scope 'read:packages'
# Settings → Developer settings → Personal access tokens → Tokens (classic)

# Login en ghcr.io
echo "TU_TOKEN_GITHUB" | docker login ghcr.io -u jlrochin --password-stdin
```

### Paso 5: Crear docker-compose.yml Simplificado

Este archivo solo para el servicio MAU (o puedes usar el completo del proyecto HJM):

```yaml
version: "3.9"

services:
  postgres-mau:
    image: postgres:16-alpine
    container_name: postgres-mau
    env_file:
      - ./mau-db.env
    volumes:
      - pgdata_mau:/var/lib/postgresql/data
    networks:
      - backend_net
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U $$POSTGRES_USER -d $$POSTGRES_DB"]
      interval: 5s
      timeout: 5s
      retries: 12

  mau-backend:
    image: ghcr.io/jlrochin/mau-backend:latest
    container_name: mau-backend
    depends_on:
      postgres-mau:
        condition: service_healthy
    env_file:
      - ./mau.env
    environment:
      DJANGO_SETTINGS_MODULE: mau_hospital.settings
    ports:
      - "3000:3000"
    labels:
      - "com.centurylinklabs.watchtower.enable=true"
    networks:
      - backend_net

  mau-frontend:
    image: ghcr.io/jlrochin/mau-frontend:latest
    container_name: mau-frontend
    ports:
      - "80:80"
    labels:
      - "com.centurylinklabs.watchtower.enable=true"
    networks:
      - frontend_net

  watchtower:
    image: containrrr/watchtower:latest
    container_name: watchtower
    restart: unless-stopped
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - ~/.docker/config.json:/config.json:ro
    environment:
      - WATCHTOWER_POLL_INTERVAL=60
      - WATCHTOWER_CLEANUP=true
      - WATCHTOWER_INCLUDE_STOPPED=true
      - WATCHTOWER_REVIVE_STOPPED=true
    command: --interval 60 --cleanup --label-enable
    labels:
      - "com.centurylinklabs.watchtower.enable=true"

volumes:
  pgdata_mau:

networks:
  frontend_net:
    driver: bridge
  backend_net:
    driver: bridge
```

### Paso 6: Iniciar los Servicios

```bash
# Primera vez: Pull de las imágenes
docker compose pull

# Iniciar todos los servicios
docker compose up -d

# Verificar estado
docker compose ps

# Ver logs
docker compose logs -f
```

## Verificación del Despliegue

### Verificar Servicios

```bash
# Estado de contenedores
docker compose ps

# Logs en tiempo real
docker compose logs -f

# Logs de un servicio específico
docker compose logs -f mau-backend

# Verificar Watchtower
docker logs watchtower
```

### Probar la Aplicación

```bash
# Desde el servidor
curl -I http://localhost/
curl http://localhost/api/

# Desde tu navegador
http://IP_DEL_SERVIDOR/
```

## Monitoreo de GitHub Actions

### Ver el Estado del Build

```bash
# En tu máquina local
gh run list

# Ver logs de la última ejecución
gh run view

# Ver logs en tiempo real
gh run watch
```

### Ver en GitHub

Visita: `https://github.com/jlrochin/HJM-MAU/actions`

## Comandos Útiles

### En tu Máquina Local

```bash
# Verificar workflow
gh workflow list

# Ver runs recientes
gh run list --limit 10

# Ver detalles de un run
gh run view [RUN_ID]

# Trigger manual del workflow
gh workflow run "Build and Push Docker Images"
```

### En el Servidor

```bash
# Reiniciar servicios
docker compose restart [servicio]

# Rebuild forzado (pull nuevas imágenes)
docker compose pull
docker compose up -d

# Ver logs
docker compose logs -f [servicio]

# Ejecutar comando en contenedor
docker compose exec mau-backend python manage.py migrate

# Acceder a shell de PostgreSQL
docker compose exec postgres-mau psql -U mau_user -d maudb

# Reiniciar Watchtower
docker compose restart watchtower

# Ver imágenes disponibles
docker images | grep mau

# Limpiar imágenes antiguas (si Watchtower no lo hace)
docker image prune -a
```

## Troubleshooting

### GitHub Actions falla

```bash
# Ver logs del workflow
gh run view

# Causas comunes:
# - Error en Dockerfile
# - Dependencias faltantes
# - Permisos de GHCR
```

### Watchtower no actualiza

```bash
# Verificar logs de Watchtower
docker logs watchtower

# Verificar que el contenedor tenga el label correcto
docker inspect mau-backend | grep -A 5 Labels

# Reiniciar Watchtower
docker compose restart watchtower

# Forzar pull manual
docker compose pull && docker compose up -d
```

### Servicio no inicia

```bash
# Ver logs detallados
docker compose logs mau-backend

# Verificar variables de entorno
docker compose config

# Verificar healthcheck de la base de datos
docker compose ps postgres-mau

# Conectar al contenedor
docker compose exec mau-backend sh
```

### Error de conexión a base de datos

```bash
# Verificar que postgres esté corriendo
docker compose ps postgres-mau

# Verificar logs de postgres
docker compose logs postgres-mau

# Verificar variables de entorno
cat mau-db.env

# Verificar conectividad desde el backend
docker compose exec mau-backend ping postgres-mau
```

## Seguridad

### Mejores Prácticas

1. **Tokens y Secrets:**
   - Usar tokens de GitHub con permisos mínimos
   - No commitear archivos `.env` al repositorio
   - Rotar passwords regularmente

2. **Servidor:**
   - Mantener Docker actualizado
   - Configurar firewall (UFW)
   - Usar HTTPS con certificados SSL (Let's Encrypt + Traefik)

3. **Base de Datos:**
   - Usar passwords fuertes
   - Realizar backups regulares
   - No exponer puerto de PostgreSQL públicamente

### Configurar Firewall

```bash
# Permitir SSH
sudo ufw allow 22/tcp

# Permitir HTTP
sudo ufw allow 80/tcp

# Permitir HTTPS (si configuras SSL)
sudo ufw allow 443/tcp

# Activar firewall
sudo ufw enable
```

## Backups

### Backup de Base de Datos

```bash
# Crear backup
docker compose exec postgres-mau pg_dump -U mau_user maudb > backup_$(date +%Y%m%d).sql

# Restaurar backup
cat backup_20250101.sql | docker compose exec -T postgres-mau psql -U mau_user -d maudb
```

### Backup Automático

Crea un cronjob:

```bash
# Editar crontab
crontab -e

# Agregar backup diario a las 2 AM
0 2 * * * cd /opt/hjm-mau && docker compose exec -T postgres-mau pg_dump -U mau_user maudb > /backups/mau_$(date +\%Y\%m\%d).sql
```

## Actualización de Variables de Entorno

Si necesitas cambiar variables de entorno:

```bash
# 1. Editar archivo .env
nano mau.env

# 2. Recrear contenedor
docker compose up -d mau-backend

# Los cambios se aplican automáticamente
```

## Rollback (Volver a Versión Anterior)

Si una actualización causa problemas:

```bash
# 1. Detener contenedores actuales
docker compose down

# 2. Ver imágenes disponibles
docker images | grep mau-backend

# 3. Editar docker-compose.yml para usar tag específico
# Cambiar: image: ghcr.io/jlrochin/mau-backend:latest
# Por: image: ghcr.io/jlrochin/mau-backend:<SHA-COMMIT>

# 4. Levantar con versión anterior
docker compose up -d

# 5. Desactivar temporalmente Watchtower si es necesario
docker compose stop watchtower
```

## Métricas y Rendimiento

```bash
# Ver uso de recursos
docker stats

# Ver espacio en disco
docker system df

# Limpiar recursos no usados
docker system prune -a
```

## Resumen del Flujo Completo

1. **Desarrollas localmente** → editas código
2. **Git commit + push** → subes a GitHub
3. **GitHub Actions** → construye imágenes (5-8 min)
4. **GHCR** → almacena imágenes
5. **Watchtower** → detecta nuevas imágenes (max 60 seg)
6. **Producción** → actualiza contenedores automáticamente

**Tiempo total desde push hasta producción:** 6-10 minutos

## Soporte

Para problemas o preguntas:
- Revisar logs: `docker compose logs -f`
- Revisar GitHub Actions: `gh run view`
- Documentación de Docker: https://docs.docker.com/
- Documentación de Watchtower: https://containrrr.dev/watchtower/

---

Generado con Claude Code - https://claude.com/claude-code
