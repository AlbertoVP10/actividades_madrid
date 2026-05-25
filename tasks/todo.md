# Tarea: Migrar procesamiento de actividades de app.js al notebook

## Objetivo
Mover todo el procesamiento de la lista de actividades que actualmente se hace en `www/js/app.js` al notebook `prueba.ipynb`, de forma que el notebook:
1. Descargue las actividades de Madrid
2. Procese y filtre las actividades (igual que hace app.js)
3. Suba el archivo procesado a Firebase Storage

## Análisis de app.js - Funciones a migrar

### 1. Extracción y transformación de datos
- [x] `extractCategory(type)` - Extrae categoría legible del tipo de evento
- [x] `extractDistrict(districtUrl)` - Extrae nombre del distrito desde URL

### 2. Filtrado de actividades
- [x] Filtrar actividades pasadas (fecha >= hoy)
- [x] Filtros por categoría, distrito, audiencia, fecha, hora
- [x] Filtro de búsqueda por texto
- [x] Filtro "solo gratuitas"
- [x] Filtro de favoritos
- [x] Filtro de proximidad (cerca de ubicación)

### 3. Ordenamiento
- [x] Por fecha reciente
- [x] Por fecha antigua
- [x] Por precio (gratuitas primero)
- [x] Por distancia (si hay ubicación)

### 4. Cálculos adicionales
- [x] `calculateDistance()` - Calcular distancia entre coordenadas
- [x] Añadir campo `distance` a cada actividad

### 5. Estructura de datos final
Cada actividad debe tener:
- id, title, description, category, location, district
- lat, lon, date, endDate, time
- free, price, audience, link, street
- distance (opcional, si se calcula)

## Implementación

### Notebook - Celdas a añadir/modificar:

1. **Celda de descarga** (ya existe)
   - Descargar JSON de datos.madrid.es

2. **Celda de procesamiento** (NUEVA)
   - Funciones extract_category() y extract_district()
   - Filtrado de actividades pasadas
   - Normalización de datos
   - Añadir campos calculados

3. **Celda de guardado local** (ya existe)
   - Guardar actividades.json procesado

4. **Celda de subida a Firebase** (ya existe)
   - Subir archivo a Firebase Storage

## Notas
- El notebook ya tiene código para descargar y subir a Firebase
- Falta implementar las funciones de procesamiento equivalentes a app.js
- Las fechas deben manejarse como objetos datetime (no timestamps JS)
- Las coordenadas deben ser float
