# Tarea: Reubicación de Botones de Acción en Pantalla de Filtros

## Plan de Implementación

### 1. Análisis de la estructura actual
- [x] Localizar el componente FiltersView en index.html
- [x] Identificar los botones "Aplicar" y "Limpiar" actuales
- [x] Entender el layout y estructura del contenedor de filtros

### 2. Cambios a realizar

#### A. Eliminar botones de la posición superior
- [x] Eliminar el div que contiene los botones "Aplicar" y "Limpiar" de la parte superior del filtersView

#### B. Crear barra de acciones fija inferior
- [x] Crear un nuevo contenedor sticky/fixed en la parte inferior
- [x] Posicionar por encima del menú de navegación base (bottom nav)
- [x] Asegurar que permanezca visible durante el scroll

#### C. Estilizar botones según especificaciones
- [x] Botón "Limpiar": diseño minimalista (texto + icono de papelera), sin fondo gris
- [x] Botón "Aplicar": mantener color salmón/coral, texto blanco, esquinas redondeadas
- [x] Botón "Aplicar": mostrar contador dinámico de resultados

#### D. Ajustar área de scroll
- [x] Agregar padding/margin inferior al contenedor de filtros para evitar que el último elemento quede tapado

### 3. Criterios de Aceptación
- [x] Los botones ya no son visibles en la parte superior
- [x] La barra de botones permanece fija en la parte inferior durante el scroll
- [x] El botón "Limpiar" se visualiza como texto plano con icono
- [x] El botón "Aplicar" mantiene su estilo y actualiza el contador dinámicamente
- [x] El último elemento de la lista es visible completamente
- [x] La funcionalidad de los botones es la misma

### 4. Testing
- [x] Verificar comportamiento en scroll
- [x] Verificar actualización del contador
- [x] Verificar funcionalidad de limpiar filtros
- [x] Verificar funcionalidad de aplicar filtros

## Resumen de Cambios

### Archivos modificados:
1. **www/index.html**
   - Eliminados los botones "Aplicar" y "Limpiar" de la parte superior del filtersView
   - Agregada barra de acciones fija inferior (`#filtersActionBar`) con:
     - Botón "Limpiar": diseño minimalista (texto + icono `delete_outline`)
     - Botón "Aplicar": color primario salmón/coral (`bg-primary`), texto blanco, esquinas redondeadas (`rounded-full`)
   - Agregado padding inferior de 100px al contenedor filtersView para evitar que el contenido quede tapado
   - La barra está posicionada en `bottom-[80px]` para quedar justo encima del menú de navegación

2. **www/js/app.js**
   - Actualizada función `applyFilters()` para sincronizar el contador de resultados en ambos elementos (`filterResultCount` y `filterResultCountBottom`)
   - Actualizada función `openFiltersView()` para mostrar la barra de acciones al abrir la vista de filtros
   - Actualizada función `closeFiltersView()` para ocultar la barra de acciones al cerrar la vista de filtros
   - Actualizada función `openFilterField()` para ocultar la barra de acciones cuando se navega a un campo específico de filtro

### Características implementadas:
- ✅ Barra fija en la parte inferior (z-index 90, por encima del contenido pero debajo del bottom nav)
- ✅ Fondo con efecto blur para mejor legibilidad sobre el contenido
- ✅ Botón "Limpiar" con diseño minimalista (solo texto e icono, sin fondo)
- ✅ Botón "Aplicar" con color primario del tema (`#F08080`), texto blanco, bordes redondeados
- ✅ Contador dinámico de resultados en tiempo real
- ✅ Padding inferior ajustado para que el último elemento sea visible
- ✅ Comportamiento responsive (max-width en la barra para pantallas grandes)
