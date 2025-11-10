# Deployment Guide - MAU Hospital System

Este sistema utiliza **GitHub Actions con Self-Hosted Runner** para deployment automático, igual que mi-dashboard y ciimeit.

## Arquitectura

```
GitHub (push) → Self-Hosted Runner → Docker Build → Docker Compose Deploy
```

## Requisitos Previos

### En el Servidor del Hospital

1. **Docker y Docker Compose**
2. **GitHub Actions Self-Hosted Runner** configurado
3. Directorio de deployment: `/home/usuariohjm/mau-deployment/`

## Setup Inicial en el Servidor

### 1. Preparar Directorio de Deployment

```bash
# Crear directorio
sudo mkdir -p /home/usuariohjm/mau-deployment
sudo chown -R usuariohjm:usuariohjm /home/usuariohjm/mau-deployment
cd /home/usuariohjm/mau-deployment
```

### 2. Configurar Variables de Entorno

Crear archivo `.env` con las variables de producción:

```bash
nano .env
```

Contenido (basado en `.env.example`):

```env
# Database
DB_NAME=maudb
DB_USER=mau_user
DB_PASSWORD=TU_PASSWORD_SEGURO_AQUI

# Django
DJANGO_SECRET_KEY=TU_SECRET_KEY_MUY_LARGO_Y_SEGURO
DJANGO_ALLOWED_HOSTS=*
DEBUG=False

# Ports
BACKEND_PORT=8001
FRONTEND_PORT=8002
```

### 3. Copiar docker-compose-deploy.yml

```bash
# El workflow copiará automáticamente los archivos necesarios
# O puedes copiarlos manualmente:
cp /path/to/repo/docker-compose-deploy.yml .
```

## Flujo de Deployment

### Desarrollo Local → Producción

```bash
# 1. Hacer cambios en tu código
cd /Users/totewi/DesarrolloLocal/HJM/MAU

# 2. Commit y push
git add .
git commit -m "feat: nueva funcionalidad"
git push origin main  # o production

# 3. GitHub Actions se ejecuta automáticamente
# 4. El self-hosted runner construye las imágenes
# 5. Deploy automático en el servidor
```

### Branches

- **main**: Deploy automático a desarrollo/staging
- **production**: Deploy automático a producción

## Comandos Útiles en el Servidor

```bash
cd /home/usuariohjm/mau-deployment

# Ver estado
docker compose -f docker-compose-deploy.yml ps

# Ver logs
docker compose -f docker-compose-deploy.yml logs -f

# Restart un servicio
docker compose -f docker-compose-deploy.yml restart mau-backend

# Detener todo
docker compose -f docker-compose-deploy.yml down

# Iniciar todo
docker compose -f docker-compose-deploy.yml up -d
```

## Estructura del Proyecto

```
MAU/
├── backend/                    # Código Django
├── frontend/                   # Código Vue.js
├── Dockerfile                  # Backend image
├── Dockerfile.vue              # Frontend image
├── docker-compose-deploy.yml   # Producción
├── docker-compose.yml          # Desarrollo (con todos los servicios)
├── .github/
│   └── workflows/
│       └── deploy-self-hosted.yml  # CI/CD
└── .env.example                # Template de variables
```

## Servicios Deployados

El sistema incluye:

- **mau-backend**: API Django en puerto 8001
- **mau-frontend**: SPA Vue.js en puerto 8002
- **mau-db**: PostgreSQL 16
- **watchtower**: Auto-actualización de imágenes

## URLs de Acceso

Después del deployment:

- **Frontend**: `http://servidor:8002/`
- **Backend API**: `http://servidor:8001/api/`

## Integración con Traefik (Opcional)

Si quieres integrar con el Traefik del proyecto HJM principal:

```yaml
# En docker-compose-deploy.yml, agregar labels a mau-frontend:
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.mau.rule=PathPrefix(`/mau`)"
  - "traefik.http.services.mau.loadbalancer.server.port=80"
```

## Troubleshooting

### Ver logs del deployment

```bash
# En GitHub
https://github.com/jlrochin/HJM-MAU/actions

# En el servidor
cd /home/usuariohjm/mau-deployment
docker compose -f docker-compose-deploy.yml logs --tail=100
```

### Rebuild manual

```bash
cd /path/to/repo

# Backend
docker build -f Dockerfile -t ghcr.io/jlrochin/mau-backend:latest .

# Frontend
docker build -f Dockerfile.vue -t ghcr.io/jlrochin/mau-frontend:latest .

# Deploy
cd /home/usuariohjm/mau-deployment
docker compose -f docker-compose-deploy.yml up -d
```

### Resetear base de datos

```bash
cd /home/usuariohjm/mau-deployment

# CUIDADO: Esto elimina todos los datos
docker compose -f docker-compose-deploy.yml down -v
docker compose -f docker-compose-deploy.yml up -d
```

## Backup

```bash
# Backup de base de datos
docker exec mau-db pg_dump -U mau_user maudb > backup_mau_$(date +%Y%m%d).sql

# Restaurar
cat backup_mau_20250110.sql | docker exec -i mau-db psql -U mau_user -d maudb
```

## Configurar Self-Hosted Runner (Primera vez)

Si el runner no está configurado:

```bash
# En el servidor
cd /home/usuariohjm
mkdir actions-runner && cd actions-runner

# Descargar runner (verificar versión más reciente)
curl -o actions-runner-linux-x64-2.311.0.tar.gz -L https://github.com/actions/runner/releases/download/v2.311.0/actions-runner-linux-x64-2.311.0.tar.gz
tar xzf ./actions-runner-linux-x64-2.311.0.tar.gz

# Configurar (obtener token desde GitHub repo Settings > Actions > Runners)
./config.sh --url https://github.com/jlrochin/HJM-MAU --token TU_TOKEN

# Instalar como servicio
sudo ./svc.sh install
sudo ./svc.sh start
```

## Monitoreo

```bash
# Ver recursos
docker stats

# Ver logs en tiempo real
docker compose -f docker-compose-deploy.yml logs -f --tail=50

# Health checks
curl http://localhost:8001/api/
curl http://localhost:8002/health
```

## Seguridad

1. ✅ Cambiar passwords en `.env`
2. ✅ Usar `DJANGO_SECRET_KEY` fuerte
3. ✅ Configurar firewall (UFW)
4. ✅ Mantener Docker actualizado
5. ✅ Backups regulares de la base de datos

---

Para más información, consulta:
- `docker-compose-deploy.yml` - Configuración de producción
- `.github/workflows/deploy-self-hosted.yml` - Pipeline CI/CD
- `SIMPLE-DEPLOY.md` - Deployment manual sin CI/CD
