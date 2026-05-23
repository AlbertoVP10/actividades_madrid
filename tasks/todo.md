# TODO: Mostrar imágenes de eventos en la ficha

## Objetivo
Mostrar la imagen del evento en la ficha de detalle cuando se expande una actividad, similar al diseño de la captura enviada.

## Plan

1. **Crear función para extraer imagen** de la URL del evento
   - Hacer scraping de la página del ayuntamiento
   - Buscar la etiqueta `<img>` con la imagen del evento
   - Extraer el atributo `src`

2. **Modificar la visualización del expander** 
   - Añadir la imagen en la parte superior del expander
   - Mantener el diseño actual de detalles debajo

3. **Optimización**
   - Cachear las URLs de imágenes para no hacer scraping repetido
   - Manejar casos donde no haya imagen

## Checklist
- [x] Crear función `extract_image_from_event_url()`
- [x] Modificar el expander para mostrar la imagen
- [ ] Probar con varios eventos
- [ ] Manejar errores (páginas sin imagen, timeouts, etc.)
