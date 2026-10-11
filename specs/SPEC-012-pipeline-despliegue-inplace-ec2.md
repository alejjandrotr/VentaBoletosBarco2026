# SPEC-012: Pipeline CI/CD para Despliegue In-Place del Backend en AWS EC2

## 1. Metadata
- **ID:** SPEC-012
- **Título:** Automatización de Despliegue Continuo (CI/CD) In-Place en AWS EC2 vía GitHub Actions
- **Estado:** PROPUESTO
- **Dependencias:** Backend NestJS
- **Fecha:** 2026-10-11
- **Autor:** Antigravity AI & Desarrollador

---

## 2. Contexto de Negocio y Enfoque Didáctico
El equipo requiere automatizar el ciclo de entrega del backend en la nube para eliminar tareas manuales de conexión SSH, clonado y compilación en cada cambio.

Como decisión arquitectónica inicial (etapa 1), se implementa un modelo de **Actualización In-Place Directa en Instancia Única de EC2**:
1. El servidor EC2 permanece activo permanentemente.
2. Cada evento `push` a la rama `main` dispara un flujo en **GitHub Actions**.
3. El pipeline se conecta vía SSH al servidor, descarga el código (`git pull`), instala dependencias, compila y reinicia el servicio con PM2.

### Propósito del Enfoque:
Este modelo permite evidenciar en la práctica los riesgos operativos de no contar con ambientes inmutables o contenedores antes de transicionar hacia Docker y despliegues sin tiempo de inactividad (*Zero-Downtime / Blue-Green*).

---

## 3. Riesgos Operativos e Invariantes del Enfoque In-Place

### 3.1 Riesgo de "Desarrollador Estrella" (Rotura en Vivo)
* Si se introduce un cambio con errores de compilación de TypeScript o dependencias incompatibles en `main`:
  * El paso `npm run build` fallará en el servidor en producción.
  * Si el proceso anterior se detuvo o quedó inconsistente, el backend quedará caído para todos los usuarios.

### 3.2 Cuello de Botella de Recursos (Memoria y CPU)
* Ejecutar `npm install` y `nest build` en instancias de bajo costo (`t2.micro` / `t3.micro` con 1 GB RAM) compite con la memoria del proceso en ejecución.
* **Invariante obligatoria:** El servidor debe contar con al menos 2 GB de memoria de intercambio (*Swap*) activa para evitar caídas por *Out of Memory* (OOM Killer).

### 3.3 Tiempo de Inactividad (Downtime)
* Mientras se compila y se reinicia el proceso mediante `pm2 restart`, las peticiones entrantes de los clientes experimentarán latencia o errores de conexión momentáneos.

---

## 4. Requisitos de Infraestructura y Secretos

### 4.1 Instancia AWS EC2 (Servidor)
- Sistema Operativo: Ubuntu 22.04 / 24.04 LTS (o Amazon Linux 2023).
- Runtime: Node.js 22 LTS y npm.
- Gestor de Procesos: PM2 instalado globalmente (`npm install -g pm2`).
- Configuración de Swap: 2 GB (`/swapfile`).
- Variables de Entorno: Archivo `.env` configurado localmente en `/home/ubuntu/.../backend/.env`.

### 4.2 AWS Security Group
- Regla de entrada SSH: Puerto `22` (abierto a GitHub Actions / IP administrativa).
- Regla de entrada HTTP/API: Puerto `3000` (o el puerto configurado en el backend) abierto a `0.0.0.0/0`.

### 4.3 Secretos Requeridos en GitHub (`Repository Settings > Secrets and variables > Actions`)
- `EC2_HOST`: Dirección IP pública o nombre DNS de la instancia EC2.
- `EC2_USER`: Usuario SSH de la máquina (ej. `ubuntu`).
- `EC2_SSH_KEY`: Clave privada PEM asociada a la instancia EC2.
- `PROJECT_PATH`: Ruta absoluta donde reside la carpeta del backend en la EC2 (ej. `/home/ubuntu/Stream/venta-de-boletos/backend`).

---

## 5. Definición del Pipeline (`.github/workflows/deploy-backend.yml`)

```yaml
name: Deploy Backend to EC2 (In-Place Update)

on:
  push:
    branches:
      - main
    paths:
      - 'venta-de-boletos/backend/**'
      - '.github/workflows/deploy-backend.yml'

jobs:
  deploy:
    name: Despliegue In-Place en AWS EC2
    runs-on: ubuntu-latest

    steps:
      - name: Checkout del repositorio
        uses: actions/checkout@v4

      - name: Ejecutar despliegue remoto vía SSH
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ${{ secrets.EC2_USER }}
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            set -e  # Interrumpir ejecución ante cualquier fallo

            echo ">>> [1/5] Accediendo al directorio del backend..."
            cd ${{ secrets.PROJECT_PATH }}

            echo ">>> [2/5] Descargando últimos cambios desde Git..."
            git fetch --all
            git reset --hard origin/main

            echo ">>> [3/5] Instalando dependencias de Node.js..."
            npm install

            echo ">>> [4/5] Compilando NestJS..."
            npm run build

            echo ">>> [5/5] Reiniciando aplicación con PM2..."
            pm2 restart backend-boletos || pm2 start dist/main.js --name "backend-boletos"

            echo ">>> Estado del servicio:"
            pm2 status
```

---

## 6. Criterios de Aceptación y Pruebas de Verificación

### Caso de Prueba 1: Despliegue Exitoso (Happy Path)
- **Acción:** Realizar un cambio en un endpoint del backend (ej. versionado o texto informativo) y hacer `push` a `main`.
- **Resultado:**
  - El workflow en GitHub Actions finaliza en estado exitoso (`green`).
  - La petición HTTP a `http://<EC2_HOST>:3000/...` refleja el cambio sin intervención manual.

### Caso de Prueba 2: Detección y Evidencia de Falla (Error en Producción)
- **Acción:** Introducir un error sintáctico intencional de TypeScript en el backend y hacer `push` a `main`.
- **Resultado:**
  - El paso `npm run build` falla en la EC2.
  - El pipeline aborta (`red`).
  - Se registra el impacto en el servicio existente para documentar la necesidad de validaciones CI previas (linting/tests) y contenedores.

---

## 7. Próximos Pasos (Evolución Arquitectónica)
Una vez validado este comportamiento:
1. Incorporar etapa de validación previa en el Runner de GitHub (`npm run lint` y `npm run test`) antes de intentar tocar el servidor.
2. Migrar la ejecución a **Docker / Docker Compose** para despliegues atómicos y desacoplados del entorno del sistema operativo.
