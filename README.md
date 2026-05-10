# 🎭 Actividades Madrid Dashboard

Dashboard interactivo para consultar actividades culturales en Madrid.

## 🚀 Despliegue en Streamlit Cloud

### 1. Crear cuenta
- Ve a https://streamlit.io/cloud
- Inicia sesión con tu cuenta de GitHub

### 2. Desplegar la app
1. Haz clic en "New app"
2. Selecciona el repositorio: `AlbertoVP10/actividades_madrid`
3. Ruta del archivo principal: `app.py`
4. Haz clic en "Deploy"

### 3. Configurar (opcional)
- La app se actualiza automáticamente al hacer push a main
- Los datos se cargan en tiempo real desde la API del Ayuntamiento de Madrid

## � Android App Transition

The web app has been transitioned to a Capacitor-wrapped Android application for Google Play distribution.

### Key Features
- Hybrid Android app using Capacitor WebView wrapper
- Package ID: `com.myapp.id`
- Bundled local assets for improved offline performance
- Mobile-optimized UI with responsive design fixes
- Full Android permissions for location and internet access

### Getting Started with Android Development
See [Android Quickstart Guide](specs/001-android-app-roadmap/quickstart.md) for detailed setup instructions, including Capacitor installation, Android Studio configuration, and Google Play deployment steps.

### Build Commands
```bash
# Install dependencies
npm install

# Add Android platform
npx cap add android

# Sync web assets
npx cap sync android

# Open in Android Studio
npx cap open android

# Build for production
npx cap build android --prod
```

## �📁 Estructura del proyecto

```
actividades_madrid/
├── app.py              # Aplicación principal
├── requirements.txt    # Dependencias
├── .streamlit/
│   └── config.toml    # Configuración visual
└── README.md          # Este archivo
```

## ✨ Funcionalidades

- 🔍 **Filtros**: Por distrito, fecha, gratuidad, búsqueda por texto
- 📊 **Métricas**: Total, gratuitas, por distrito, actividades de hoy
- 📱 **Responsive**: Optimizado para móvil y desktop
- 🗺️ **Enlaces a mapas**: Google Maps para cada ubicación
- 🔄 **Datos actualizados**: Conexión directa a API del Ayuntamiento

## 🛠️ Tecnologías

- Streamlit
- Pandas
- Requests
- API del Ayuntamiento de Madrid

## 📄 Licencia

MIT License - Datos proporcionados por el Ayuntamiento de Madrid
