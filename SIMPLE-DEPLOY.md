# Guía de Deployment Simple - MAU Hospital System

## Deployment Local con Docker Compose (sin CI/CD)

Esta es la forma más directa de deployar el sistema completo sin necesidad de GitHub Container Registry.

## Opción 1: En tu Máquina Local (para pruebas)

```bash
cd /Users/totewi/DesarrolloLocal/HJM/MAU

# Construir todas las imágenes
docker compose build

# Iniciar todos los servicios
docker compose up -d

# Ver logs
docker compose logs -f

# Acceder a la aplicación
open http://localhost
```

## Opción 2: En Servidor de Producción

### Paso 1: Preparar el Servidor

```bash
# En el servidor Ubuntu
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker

# Verificar
docker --version
docker compose version
```

### Paso 2: Copiar el Proyecto al Servidor

**Opción A: Clonar desde GitHub**
```bash
# En el servidor
cd /opt
sudo git clone https://github.com/jlrochin/HJM-MAU.git hjm
cd hjm
```

**Opción B: Copiar via SCP**
```bash
# Desde tu máquina local
cd /Users/totewi/DesarrolloLocal/HJM
tar czf mau.tar.gz MAU/
scp mau.tar.gz usuario@servidor:/tmp/

# En el servidor
cd /opt
sudo tar xzf /tmp/mau.tar.gz
sudo mv MAU hjm
cd hjm
```

### Paso 3: Configurar Variables de Entorno

En el servidor, edita los archivos `.env`:

```bash
cd /opt/hjm

# Editar variables de MAU
nano mau.env
nano mau-db.env

# Editar variables de CAGPU (si aplica)
nano cagpu.env
nano cagpu-db.env
```

**Importante:** Cambia todas las contraseñas y secrets por valores seguros.

### Paso 4: Construir e Iniciar

```bash
cd /opt/hjm

# Construir todas las imágenes (toma 5-10 minutos)
docker compose build

# Iniciar servicios
docker compose up -d

# Verificar estado
docker compose ps
```

### Paso 5: Verificar

```bash
# Ver logs
docker compose logs -f

# Verificar servicios
docker compose ps

# Probar endpoints
curl http://localhost/
curl http://localhost/mau/
curl http://localhost/cagpu/
```

## Estructura de Servicios

El docker-compose.yml incluye:

- **Traefik**: Proxy inverso (puerto 80)
- **home**: Landing page en `/`
- **cagpu-frontend**: Frontend en `/cagpu`
- **cagpu-backend**: API en `/cagpu/api`
- **mau-frontend**: Frontend en `/mau`
- **mau-backend**: API en `/mau/api`
- **postgres-cagpu**: Base de datos para CAGPU
- **postgres-mau**: Base de datos para MAU
- **watchtower**: Auto-actualización (opcional)

## Actualizar el Sistema

### Sin GitHub (manual)

```bash
# 1. Detener servicios
docker compose down

# 2. Actualizar código
git pull origin main
# O copiar archivos actualizados

# 3. Reconstruir imágenes
docker compose build

# 4. Iniciar servicios
docker compose up -d
```

### Con GitHub (automático)

Si quieres usar GitHub para actualizar:

```bash
# En tu máquina local
git add .
git commit -m "feat: nueva funcionalidad"
git push origin main

# En el servidor
cd /opt/hjm
git pull origin main
docker compose build
docker compose up -d
```

## Comandos Útiles

```bash
# Ver logs de todos los servicios
docker compose logs -f

# Ver logs de un servicio específico
docker compose logs -f mau-backend

# Reiniciar un servicio
docker compose restart mau-backend

# Detener todo
docker compose down

# Detener y eliminar volúmenes (¡CUIDADO! elimina datos)
docker compose down -v

# Ver estado de contenedores
docker compose ps

# Ejecutar comando en contenedor
docker compose exec mau-backend python manage.py migrate

# Ver uso de recursos
docker stats

# Limpiar imágenes antiguas
docker image prune -a
```

## Backup

### Backup de Base de Datos

```bash
# PostgreSQL MAU
docker compose exec postgres-mau pg_dump -U mau_user maudb > backup_mau_$(date +%Y%m%d).sql

# PostgreSQL CAGPU
docker compose exec postgres-cagpu pg_dump -U cagpu_user cagpudb > backup_cagpu_$(date +%Y%m%d).sql
```

### Restaurar Backup

```bash
# Restaurar MAU
cat backup_mau_20250110.sql | docker compose exec -T postgres-mau psql -U mau_user -d maudb

# Restaurar CAGPU
cat backup_cagpu_20250110.sql | docker compose exec -T postgres-cagpu psql -U cagpu_user -d cagpudb
```

## Troubleshooting

### Servicio no inicia

```bash
# Ver logs
docker compose logs [servicio]

# Verificar configuración
docker compose config

# Reconstruir
docker compose build [servicio]
docker compose up -d [servicio]
```

### Error de puertos ocupados

```bash
# Ver qué está usando el puerto 80
sudo lsof -i :80

# Detener el servicio que lo usa
sudo systemctl stop apache2  # o nginx
```

### Problemas de permisos

```bash
# Verificar permisos de archivos
ls -la

# Cambiar propietario
sudo chown -R $USER:$USER .
```

### Base de datos no se conecta

```bash
# Verificar que postgres esté corriendo
docker compose ps postgres-mau

# Ver logs de postgres
docker compose logs postgres-mau

# Verificar variables de entorno
cat mau.env
cat mau-db.env

# Reiniciar
docker compose restart postgres-mau
docker compose restart mau-backend
```

## Configurar Firewall

```bash
# Permitir HTTP
sudo ufw allow 80/tcp

# Permitir HTTPS (si usas SSL)
sudo ufw allow 443/tcp

# Permitir SSH
sudo ufw allow 22/tcp

# Activar
sudo ufw enable
```

## SSL con Let's Encrypt (Opcional)

Para habilitar HTTPS con certificados SSL gratuitos, agrega a tu docker-compose.yml:

```yaml
services:
  traefik:
    command:
      # ... comandos existentes ...
      - --certificatesresolvers.letsencrypt.acme.email=tu@email.com
      - --certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json
      - --certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web
    volumes:
      # ... volumes existentes ...
      - ./letsencrypt:/letsencrypt
```

## Monitoreo

### Ver estado de servicios

```bash
# Estado general
docker compose ps

# Recursos
docker stats

# Logs en tiempo real
docker compose logs -f --tail=100
```

### Script de monitoreo

Crea un archivo `monitor.sh`:

```bash
#!/bin/bash
echo "=== Estado de Servicios ==="
docker compose ps

echo -e "\n=== Uso de Recursos ==="
docker stats --no-stream

echo -e "\n=== Últimos Logs ==="
docker compose logs --tail=20
```

```bash
chmod +x monitor.sh
./monitor.sh
```

## Resumen de URLs

Después del deployment, tendrás acceso a:

- **Home**: `http://tu-servidor/`
- **MAU Frontend**: `http://tu-servidor/mau/`
- **MAU API**: `http://tu-servidor/mau/api/`
- **CAGPU Frontend**: `http://tu-servidor/cagpu/`
- **CAGPU API**: `http://tu-servidor/cagpu/api/`

## Notas Importantes

1. **Seguridad**: Cambia todas las contraseñas y secrets antes de deployment
2. **Backups**: Configura backups automáticos de las bases de datos
3. **SSL**: En producción, usa HTTPS con certificados SSL
4. **Firewall**: Configura UFW para permitir solo puertos necesarios
5. **Monitoreo**: Revisa logs regularmente
6. **Actualizaciones**: Mantén Docker y el sistema operativo actualizados

---

**¿Necesitas el CI/CD con GitHub Actions?**

Si quieres deployment automático cada vez que haces push, mira `DEPLOYMENT-GUIDE.md`.
Esta guía es para deployment manual que es más simple y directo.
