# Script de Actualización de Actividades

Este script automatiza la descarga, procesamiento y subida de actividades culturales de Madrid a Firebase Storage.

## Funcionalidad

El script realiza las siguientes tareas:

1. **Descarga** el JSON de actividades desde `datos.madrid.es`
2. **Procesa** las actividades (normaliza categorías, distritos, fechas, etc.)
3. **Sube** el archivo procesado a Firebase Storage
4. **Extrae** imágenes de las páginas de detalle de cada actividad
5. **Sube** el archivo de imágenes a Firebase Storage

## Ejecución

### Local

```bash
# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno (crear archivo .env)
cp .env.example .env
# Editar .env con tus credenciales de Firebase

# Ejecutar
python scripts/update_activities.py
```

### GitHub Actions (Automático)

El workflow está configurado para ejecutarse:
- **Automáticamente**: Todos los días a las 5:00 AM UTC
- **Manualmente**: Desde la pestaña "Actions" en GitHub

## Configuración en GitHub

### 1. Configurar Secrets

Ve a **Settings > Secrets and variables > Actions** y añade los siguientes secrets:

| Secret | Descripción |
|--------|-------------|
| `FIREBASE_APIKEY` | API Key de Firebase |
| `FIREBASE_AUTHDOMAIN` | Auth Domain de Firebase |
| `FIREBASE_PROJECTID` | Project ID de Firebase |
| `FIREBASE_STORAGEBUCKET` | Storage Bucket (ej: `mi-proyecto.appspot.com`) |
| `FIREBASE_MESSAGINGSENDERID` | Messaging Sender ID |
| `FIREBASE_APPID` | App ID de Firebase |

### 2. Obtener credenciales de Firebase

1. Ve a la [Consola de Firebase](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. Ve a **Configuración del proyecto > General**
4. En "Tus apps", selecciona la app web
5. Copia los valores de la configuración de Firebase SDK

### 3. Probar el workflow

1. Ve a la pestaña **Actions** en GitHub
2. Selecciona el workflow "Actualización Diaria de Actividades"
3. Click en **Run workflow**

## Estructura de archivos

```
scripts/
├── update_activities.py    # Script principal
└── README.md               # Este archivo

data/                       # Directorio de datos (creado automáticamente)
├── actividades_procesadas.json  # Actividades procesadas
└── imagenes.json                # Mapa de imágenes (app_id -> url)

.github/workflows/
└── daily-update.yml        # Configuración de GitHub Actions
```

## Variables de configuración

En el script `update_activities.py`:

- `MAX_IMAGENES`: Límite de imágenes nuevas por ejecución (default: 50)
- `SLEEP`: Segundos entre requests (default: 2)

## Notas

- El script procesa máximo 50 imágenes nuevas por ejecución para evitar sobrecargar el servidor de Madrid
- Las ejecuciones posteriores continuarán desde donde lo dejaron
- Los archivos se guardan incrementalmente para no perder progreso
- GitHub Actions mantiene logs de cada ejecución por 90 días
