# Plan de Desarrollo - App Actividades Madrid v2

## Resumen del Proyecto
Reimplementación completa de la app de actividades culturales de Madrid con nuevo diseño UI/UX.

## Fases de Desarrollo

### Fase 1: Estructura Base (Hito 1)
- [x] Crear estructura de carpetas www2
- [ ] Crear index.html base con metadatos
- [ ] Configurar Tailwind CSS con tema personalizado (colores del diseño)
- [ ] Configurar fuentes (Inter) e iconos (Material Symbols)
- [ ] Crear archivo CSS base con variables y utilidades

### Fase 2: Sistema de Navegación SPA (Hito 2)
- [ ] Implementar router JavaScript para SPA
- [ ] Crear sistema de vistas/pantallas
- [ ] Implementar transiciones entre pantallas
- [ ] Crear estructura de estado global (appState)

### Fase 3: Pantallas de Onboarding (Hito 3)
- [ ] Splashscreen con logo y loading
- [ ] Onboarding Slide 1: "Planes gratuitos oficiales"
- [ ] Onboarding Slide 2: "Cerca de ti"
- [ ] Onboarding Slide 3: "Sin registros"
- [ ] Pantalla de preferencias (9 categorías seleccionables)
- [ ] Lógica de guardado en localStorage

### Fase 4: Pantalla Principal - Home (Hito 4)
- [ ] Header con logo y botón de info
- [ ] Barra de búsqueda
- [ ] KPIs interactivos (Hoy, Esta semana, Cercanos, Gratuitos)
- [ ] Filtros expandibles (Categoría, Distrito, Público, Horario)
- [ ] Lista de actividades con cards
- [ ] Mapa con marcadores
- [ ] Bottom navigation (Inicio, Mapa, Favoritos, Perfil)

### Fase 5: Detalle de Actividad (Hito 5)
- [ ] Header con imagen y título
- [ ] Información básica (fecha, hora, lugar)
- [ ] Descripción completa
- [ ] Botón de favoritos
- [ ] Botón de compartir
- [ ] Botón de cómo llegar (navegación)
- [ ] Navegación anterior/siguiente entre actividades

### Fase 6: Pantalla de Mapa (Hito 6)
- [ ] Mapa a pantalla completa
- [ ] Marcadores de actividades
- [ ] Filtros superpuestos
- [ ] Bottom sheet con lista de actividades
- [ ] Clustering de marcadores

### Fase 7: Pantalla de Favoritos (Hito 7)
- [ ] Lista de actividades guardadas
- [ ] Indicador de actividades expiradas
- [ ] Opción de eliminar favoritos
- [ ] Sincronización con contador en home

### Fase 8: Pantalla de Perfil (Hito 8)
- [ ] Información del usuario (local)
- [ ] Preferencias guardadas
- [ ] Historial de actividades vistas
- [ ] Configuración de notificaciones
- [ ] Sección de información (donaciones, redes sociales)

### Fase 9: Funcionalidades Avanzadas (Hito 9)
- [ ] Geolocalización del usuario
- [ ] Cálculo de distancias
- [ ] Filtros combinados (AND/OR)
- [ ] Búsqueda en tiempo real
- [ ] Compartir actividad (Web Share API)

### Fase 10: Optimización y Testing (Hito 10)
- [ ] Lazy loading de imágenes
- [ ] Service Worker para PWA
- [ ] Optimización de rendimiento
- [ ] Testing en móviles
- [ ] Ajustes responsive

## Estructura de Archivos
```
www2/
├── index.html
├── css/
│   ├── base.css
│   ├── components.css
│   └── animations.css
├── js/
│   ├── app.js
│   ├── router.js
│   ├── state.js
│   ├── api.js
│   ├── utils.js
│   ├── components/
│   │   ├── onboarding.js
│   │   ├── home.js
│   │   ├── activity-detail.js
│   │   ├── map-view.js
│   │   ├── favorites.js
│   │   └── profile.js
│   └── services/
│       ├── geolocation.js
│       ├── storage.js
│       └── filters.js
├── assets/
│   ├── images/
│   ├── icons/
│   └── logo.svg
└── data/
    └── activities.json
```

## Paleta de Colores (del diseño)
- Primary: #6B4EE6 (púrpura)
- Primary Light: #8B6FF0
- Background: #FFFFFF
- Surface: #F8F9FA
- Text Primary: #1A1C1C
- Text Secondary: #5B4039
- Accent: #F08080 (salmon)

## Notas Técnicas
- Usar Leaflet para el mapa
- localStorage para persistencia
- Vanilla JS (no frameworks)
- Mobile-first responsive
- PWA ready
