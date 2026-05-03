import streamlit as st
import pandas as pd
import requests
import folium
from streamlit_folium import st_folium
import plotly.express as px
from datetime import datetime, timedelta
from geopy.distance import geodesic
from geopy.geocoders import Nominatim

# Configuración de página
st.set_page_config(
    page_title="Actividades Madrid",
    page_icon="🎭",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Logo que aparece cuando el sidebar está colapsado
st.logo(
    image="🎭",
    icon_image="🔍",
    link=None
)

# CSS responsive
st.markdown("""
<style>
    @media (max-width: 768px) {
        .stApp { padding: 0.5rem; }
        h1 { font-size: 22px !important; }
        h2 { font-size: 18px !important; }
        .stButton>button { width: 100%; }
    }
    .activity-card { 
        background: #f8f9fa; 
        padding: 15px; 
        border-radius: 10px; 
        margin: 10px 0;
        border-left: 4px solid #ff4b4b;
    }
    .distance-badge {
        background: #ff4b4b;
        color: white;
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 12px;
    }
    /* Añade texto 'Filtros' junto al botón del sidebar */
    [data-testid="collapsedControl"]::after {
        content: " Filtros";
        font-weight: bold;
        color: #FF4B4B;
        margin-left: 5px;
        font-size: 16px;
    }
</style>
""", unsafe_allow_html=True)

# AUTENTICACIÓN
if 'authenticated' not in st.session_state:
    st.session_state.authenticated = False

if not st.session_state.authenticated:
    st.title("🔒 Acceso Privado")
    pwd = st.text_input("Contraseña", type="password")
    if pwd == "abc123":
        st.session_state.authenticated = True
        st.rerun()
    elif pwd:
        st.error("Contraseña incorrecta")
    st.stop()

# INICIALIZAR FAVORITOS Y REFERENCIA
if 'favoritos' not in st.session_state:
    st.session_state.favoritos = []
if 'ref_coords' not in st.session_state:
    st.session_state.ref_coords = None

# Función para cargar datos desde la API
@st.cache_data(ttl=3600)
def load_data_from_api():
    """Carga datos desde la API del Ayuntamiento de Madrid"""
    try:
        url = "https://datos.madrid.es/egob/catalogo/206974-0-agenda-eventos-culturales-100.json"
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        data = response.json()
        
        if '@graph' in data:
            df = pd.json_normalize(data['@graph'])
        else:
            df = pd.DataFrame(data)
        
        df['lat'] = pd.to_numeric(df.get('location.latitude'), errors='coerce')
        df['lon'] = pd.to_numeric(df.get('location.longitude'), errors='coerce')
        
        if 'dtstart' in df.columns:
            df['dtstart'] = pd.to_datetime(df['dtstart'], errors='coerce')
        
        # Crear ID único si no existe
        if '@id' not in df.columns:
            df['@id'] = df.index.astype(str)
        
        # Extraer categoría del tipo
        df['categoria'] = df.get('@type', '').apply(lambda x: extraer_categoria(x))
        
        return df
    except Exception as e:
        st.error(f"Error cargando datos: {e}")
        return pd.DataFrame()

def extraer_categoria(tipo):
    """Extrae categoría legible del tipo"""
    if pd.isna(tipo):
        return 'Otras'
    tipo_str = str(tipo).lower()
    if 'cine' in tipo_str or 'film' in tipo_str:
        return 'Cine'
    elif 'teatro' in tipo_str or 'theatre' in tipo_str:
        return 'Teatro'
    elif 'musica' in tipo_str or 'music' in tipo_str or 'concierto' in tipo_str:
        return 'Música'
    elif 'exposicion' in tipo_str or 'exhibition' in tipo_str:
        return 'Exposiciones'
    elif 'taller' in tipo_str or 'workshop' in tipo_str:
        return 'Talleres'
    elif 'deporte' in tipo_str or 'sport' in tipo_str:
        return 'Deportes'
    elif 'danza' in tipo_str or 'dance' in tipo_str:
        return 'Danza'
    elif 'literatura' in tipo_str or 'book' in tipo_str:
        return 'Literatura'
    else:
        return 'Otras'

# Función para geocodificar dirección
@st.cache_data(ttl=86400)
def geocodificar_direccion(direccion):
    """Convierte dirección en coordenadas usando Nominatim"""
    try:
        geolocator = Nominatim(user_agent="actividades_madrid_app")
        location = geolocator.geocode(f"{direccion}, Madrid, España")
        if location:
            return (location.latitude, location.longitude)
        return None
    except Exception as e:
        st.error(f"Error geocodificando: {e}")
        return None

# Función para calcular distancia
def calcular_distancia(lat1, lon1, lat2, lon2):
    """Calcula distancia en km entre dos puntos"""
    try:
        return round(geodesic((lat1, lon1), (lat2, lon2)).kilometers, 1)
    except:
        return None

# Cargar datos
df_original = load_data_from_api()

if len(df_original) == 0:
    st.error("No se pudieron cargar los datos")
    st.stop()

# Título
st.title("🎭 Actividades Madrid")

# Sidebar con filtros
with st.sidebar:
    st.header("🔍 Filtros")
    
    # Inicializar valores en session_state si no existen
    if 'categoria_sel' not in st.session_state:
        st.session_state.categoria_sel = 'Todas'
    if 'distrito_sel' not in st.session_state:
        st.session_state.distrito_sel = 'Todos'
    if 'publico_sel' not in st.session_state:
        st.session_state.publico_sel = 'Todos'
    if 'fecha_tipo' not in st.session_state:
        st.session_state.fecha_tipo = "Todas las fechas"
    if 'franja_horaria' not in st.session_state:
        st.session_state.franja_horaria = "Todo el día"
    if 'solo_gratis' not in st.session_state:
        st.session_state.solo_gratis = False
    if 'busqueda' not in st.session_state:
        st.session_state.busqueda = ""
    
    # Categorías predefinidas
    categorias = ['Todas'] + sorted(df_original['categoria'].unique().tolist())
    categoria_sel = st.selectbox("🎭 Categoría", categorias, key='categoria_sel')
    
    # Distrito
    if 'address.area.district' in df_original.columns:
        distritos = ['Todos'] + sorted([d for d in df_original['address.area.district'].dropna().unique() if pd.notna(d)])
        distrito_sel = st.selectbox("📍 Distrito", distritos, key='distrito_sel')
    else:
        distrito_sel = 'Todos'
    
    # Público objetivo
    st.subheader("👥 Público")
    publico_opciones = ['Todos', 'Niños', 'Familias', 'Adultos', 'Mayores', 'Jóvenes']
    publico_sel = st.selectbox("", publico_opciones, label_visibility="collapsed", key='publico_sel')
    
    # Fecha
    st.subheader("📅 Fecha")
    fecha_tipo = st.selectbox("Tipo de filtro", [
        "Todas las fechas",
        "Hoy",
        "Mañana", 
        "Próximos 7 días",
        "Próximo mes",
        "Fecha concreta",
        "Rango de fechas"
    ], key='fecha_tipo')
    
    fecha_filtro = fecha_tipo  # Para compatibilidad con código existente
    
    # Mostrar selector de fecha según el tipo
    fecha_concreta = None
    fecha_desde = None
    fecha_hasta = None
    
    if fecha_tipo == "Fecha concreta":
        fecha_concreta = st.date_input("Selecciona fecha", datetime.now())
    elif fecha_tipo == "Rango de fechas":
        col1, col2 = st.columns(2)
        with col1:
            fecha_desde = st.date_input("Desde", datetime.now())
        with col2:
            # Validar que fecha_hasta no sea anterior a fecha_desde
            fecha_hasta_min = fecha_desde if fecha_desde else datetime.now()
            fecha_hasta = st.date_input("Hasta", fecha_hasta_min + timedelta(days=7), min_value=fecha_hasta_min)
    
    # Franja horaria
    st.subheader("🕐 Horario")
    franja_horaria = st.selectbox("", [
        "Todo el día",
        "Mañana (6:00 - 12:00)",
        "Tarde (12:00 - 18:00)",
        "Noche (18:00 - 24:00)"
    ], label_visibility="collapsed", key='franja_horaria')
    
    # Gratuidad
    solo_gratis = st.checkbox("💰 Solo gratuitas", key='solo_gratis')
    
    # Búsqueda
    busqueda = st.text_input("🔎 Buscar", placeholder="Título o descripción...", key='busqueda')
    
    # Dirección de referencia para distancia
    st.subheader("📍 Tu ubicación")
    direccion_ref = st.text_input("Introduce una calle", placeholder="Ej: Calle Mayor 10")
    
    if direccion_ref and st.button("📍 Calcular distancias"):
        with st.spinner("Geocodificando..."):
            coords = geocodificar_direccion(direccion_ref)
            if coords:
                st.session_state.ref_coords = coords
                st.success(f"✅ Ubicación encontrada: {coords[0]:.4f}, {coords[1]:.4f}")
            else:
                st.error("No se pudo encontrar la dirección")
    
    # Ordenar por
    st.subheader("📊 Ordenar por")
    opciones_orden = ["Más recientes", "Más baratas (gratis primero)", "Más cercanas", "Más lejanas"]
    orden_sel = st.selectbox("", opciones_orden)
    
    # Ver favoritos
    ver_favoritos = st.checkbox(f"❤️ Mis favoritos ({len(st.session_state.favoritos)})")
    
    st.markdown("---")
    st.caption(f"📊 {len(df_original)} actividades")

# Aplicar filtros
df = df_original.copy()

# Usar valores de session_state para los filtros
categoria_sel = st.session_state.categoria_sel
distrito_sel = st.session_state.distrito_sel
publico_sel = st.session_state.publico_sel
fecha_tipo = st.session_state.fecha_tipo
franja_horaria = st.session_state.franja_horaria
solo_gratis = st.session_state.solo_gratis
busqueda = st.session_state.busqueda

# Filtro categoría
if categoria_sel != 'Todas':
    df = df[df['categoria'] == categoria_sel]

# Filtro distrito
if distrito_sel != 'Todos' and 'address.area.district' in df.columns:
    df = df[df['address.area.district'] == distrito_sel]

# Filtro público
if publico_sel != 'Todos' and 'audience' in df.columns:
    df = df[df['audience'].str.contains(publico_sel, case=False, na=False)]

# Filtro gratuidad
if solo_gratis and 'free' in df.columns:
    df = df[df['free'] == 1]

# Filtro búsqueda
if busqueda and 'title' in df.columns:
    mask = df['title'].str.contains(busqueda, case=False, na=False)
    if 'description' in df.columns:
        mask |= df['description'].str.contains(busqueda, case=False, na=False)
    df = df[mask]

# Filtro fecha
if fecha_tipo != "Todas las fechas" and 'dtstart' in df.columns:
    hoy = datetime.now()
    df = df.dropna(subset=['dtstart'])
    if len(df) > 0:
        if fecha_tipo == "Hoy":
            df = df[df['dtstart'].dt.date == hoy.date()]
        elif fecha_tipo == "Mañana":
            manana = hoy + timedelta(days=1)
            df = df[df['dtstart'].dt.date == manana.date()]
        elif fecha_tipo == "Próximos 7 días":
            df = df[df['dtstart'] <= hoy + timedelta(days=7)]
        elif fecha_tipo == "Próximo mes":
            df = df[df['dtstart'] <= hoy + timedelta(days=30)]
        elif fecha_tipo == "Fecha concreta" and fecha_concreta:
            df = df[df['dtstart'].dt.date == fecha_concreta]
        elif fecha_tipo == "Rango de fechas" and fecha_desde and fecha_hasta:
            df = df[(df['dtstart'].dt.date >= fecha_desde) & (df['dtstart'].dt.date <= fecha_hasta)]

# Filtro franja horaria
if franja_horaria != "Todo el día" and 'time' in df.columns:
    def extraer_hora(time_str):
        """Extrae la hora de un string de tiempo"""
        if pd.isna(time_str):
            return None
        try:
            # Intentar parsear formatos comunes
            time_str = str(time_str)
            if ':' in time_str:
                parts = time_str.split(':')
                return int(parts[0])
        except:
            pass
        return None
    
    df['hora'] = df['time'].apply(extraer_hora)
    # NO hacer dropna - conservar actividades sin hora
    
    if franja_horaria == "Mañana (6:00 - 12:00)":
        df = df[(df['hora'] >= 6) & (df['hora'] < 12) | df['hora'].isna()]
    elif franja_horaria == "Tarde (12:00 - 18:00)":
        df = df[(df['hora'] >= 12) & (df['hora'] < 18) | df['hora'].isna()]
    elif franja_horaria == "Noche (18:00 - 24:00)":
        df = df[(df['hora'] >= 18) & (df['hora'] < 24) | df['hora'].isna()]

# Ver favoritos
if ver_favoritos and len(st.session_state.favoritos) > 0:
    df = df[df['@id'].isin(st.session_state.favoritos)]

# Calcular distancias si hay referencia
if st.session_state.ref_coords and 'lat' in df.columns and 'lon' in df.columns:
    ref_lat, ref_lon = st.session_state.ref_coords
    df['distancia_km'] = df.apply(
        lambda row: calcular_distancia(ref_lat, ref_lon, row['lat'], row['lon']) 
        if pd.notna(row['lat']) and pd.notna(row['lon']) else None,
        axis=1
    )
else:
    df['distancia_km'] = None

# Aplicar ordenamiento
if orden_sel == "Más recientes" and 'dtstart' in df.columns:
    df = df.sort_values('dtstart', na_position="last")
elif orden_sel == "Más baratas (gratis primero)" and 'free' in df.columns:
    df = df.sort_values('free', ascending=False, na_position="last")
elif orden_sel == "Más cercanas" and 'distancia_km' in df.columns:
    df = df.sort_values('distancia_km', na_position="last")
elif orden_sel == "Más lejanas" and 'distancia_km' in df.columns:
    df = df.sort_values('distancia_km', ascending=False, na_position="last")

# PAGINACIÓN
if 'page' not in st.session_state:
    st.session_state.page = 0

items_por_pagina = 20
total_paginas = (len(df) + items_por_pagina - 1) // items_por_pagina

# KPIs en horizontal - Compactos para móvil
st.markdown("---")

# Calcular valores
kpi_total = len(df)
kpi_gratis = len(df[df['free'] == 1]) if 'free' in df.columns else 0
kpi_ubicacion = len(df.dropna(subset=['lat', 'lon']))
kpi_hoy = 0
if 'dtstart' in df.columns and len(df) > 0:
    kpi_hoy = len(df[df['dtstart'].dt.date == datetime.now().date()])

# Mostrar KPIs en grid compacto
st.markdown(f"""
<div style='display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 20px;'>
    <div style='background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                padding: 10px 5px; border-radius: 8px; text-align: center; color: white; min-width: 0;'>
        <div style='font-size: 20px; font-weight: bold; line-height: 1;'>{kpi_total}</div>
        <div style='font-size: 10px; opacity: 0.9; margin-top: 2px;'>📊 Total</div>
    </div>
    <div style='background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); 
                padding: 10px 5px; border-radius: 8px; text-align: center; color: white; min-width: 0;'>
        <div style='font-size: 20px; font-weight: bold; line-height: 1;'>{kpi_gratis}</div>
        <div style='font-size: 10px; opacity: 0.9; margin-top: 2px;'>💰 Gratis</div>
    </div>
    <div style='background: linear-gradient(135deg, #fc4a1a 0%, #f7b733 100%); 
                padding: 10px 5px; border-radius: 8px; text-align: center; color: white; min-width: 0;'>
        <div style='font-size: 20px; font-weight: bold; line-height: 1;'>{kpi_ubicacion}</div>
        <div style='font-size: 10px; opacity: 0.9; margin-top: 2px;'>📍 Mapa</div>
    </div>
    <div style='background: linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%); 
                padding: 10px 5px; border-radius: 8px; text-align: center; color: white; min-width: 0;'>
        <div style='font-size: 20px; font-weight: bold; line-height: 1;'>{kpi_hoy}</div>
        <div style='font-size: 10px; opacity: 0.9; margin-top: 2px;'>📅 Hoy</div>
    </div>
</div>
""", unsafe_allow_html=True)

# FILTER CHIPS - Filtros aplicados
filtros_activos = []

if categoria_sel != 'Todas':
    filtros_activos.append(f"🎭 {categoria_sel}")
if distrito_sel != 'Todos':
    filtros_activos.append(f"📍 {distrito_sel}")
if publico_sel != 'Todos':
    filtros_activos.append(f"👥 {publico_sel}")
if fecha_tipo != "Todas las fechas":
    filtros_activos.append(f"📅 {fecha_tipo}")
if franja_horaria != "Todo el día":
    filtros_activos.append(f"🕐 {franja_horaria}")
if solo_gratis:
    filtros_activos.append("💰 Gratis")
if busqueda:
    filtros_activos.append(f"🔎 {busqueda[:20]}...")

# Funciones callback para quitar filtros
def quitar_categoria():
    st.session_state.categoria_sel = 'Todas'

def quitar_distrito():
    st.session_state.distrito_sel = 'Todos'

def quitar_publico():
    st.session_state.publico_sel = 'Todos'

def quitar_fecha():
    st.session_state.fecha_tipo = "Todas las fechas"

def quitar_horario():
    st.session_state.franja_horaria = "Todo el día"

def quitar_gratis():
    st.session_state.solo_gratis = False

def quitar_busqueda():
    st.session_state.busqueda = ""

def limpiar_todos():
    st.session_state.categoria_sel = 'Todas'
    st.session_state.distrito_sel = 'Todos'
    st.session_state.publico_sel = 'Todos'
    st.session_state.fecha_tipo = "Todas las fechas"
    st.session_state.franja_horaria = "Todo el día"
    st.session_state.solo_gratis = False
    st.session_state.busqueda = ""

# FILTER CHIPS - Filtros aplicados en línea horizontal
if filtros_activos:
    st.markdown("<small>**Filtros:**</small>", unsafe_allow_html=True)
    
    # Crear contenedor horizontal con CSS flexbox
    chips_html = "<div style='display: flex; flex-wrap: wrap; gap: 6px; margin: 8px 0;'>"
    
    # Mapear filtros a sus callbacks
    filtros_callbacks = {
        "🎭": (quitar_categoria, "categoria"),
        "📍": (quitar_distrito, "distrito"),
        "👥": (quitar_publico, "publico"),
        "📅": (quitar_fecha, "fecha"),
        "🕐": (quitar_horario, "horario"),
        "💰": (quitar_gratis, "gratis"),
        "🔎": (quitar_busqueda, "busqueda")
    }
    
    # Crear columnas horizontales para los chips
    num_chips = len(filtros_activos)
    chip_cols = st.columns(min(num_chips + 1, 6))  # +1 para el botón de limpiar
    
    for i, filtro in enumerate(filtros_activos[:6]):  # Máximo 6 filtros
        with chip_cols[i]:
            # Extraer el icono para determinar el callback
            icono = filtro[:2] if len(filtro) >= 2 else ""
            
            # Acortar texto del filtro
            texto_corto = filtro.replace("Próximos ", "").replace("Próximo ", "")
            if len(texto_corto) > 15:
                texto_corto = texto_corto[:12] + "..."
            
            # Determinar callback
            callback = None
            for key, (cb, name) in filtros_callbacks.items():
                if key in filtro:
                    callback = cb
                    break
            
            # Botón pequeño con estilo compacto
            if callback:
                if st.button(
                    f"{texto_corto} ✕",
                    key=f"chip_{i}",
                    on_click=callback,
                    use_container_width=True
                ):
                    pass
    
    # Botón limpiar en la última columna
    with chip_cols[min(num_chips, 5)]:
        if st.button("🗑️ Limpiar", key="limpiar_filtros", on_click=limpiar_todos, use_container_width=True):
            pass
    
    st.markdown("---")

# TABS
tab1, tab2, tab3 = st.tabs(["📋 Lista", "🗺️ Mapa", "📊 Estadísticas"])

# TAB 1: LISTA
with tab1:
    st.subheader(f"📋 {len(df)} actividades")
    
    if st.session_state.ref_coords:
        st.info(f"📍 Distancias calculadas desde: {st.session_state.ref_coords[0]:.4f}, {st.session_state.ref_coords[1]:.4f}")
    
    # Controles de paginación con pills
    st.markdown("<div style='margin: 10px 0;'></div>", unsafe_allow_html=True)
    
    # Crear opciones de página para pills
    opciones_pagina = []
    if st.session_state.page > 0:
        opciones_pagina.append("⬅️ Ant")
    
    pagina_actual_texto = f"📄 {st.session_state.page + 1}/{max(1, total_paginas)}"
    opciones_pagina.append(pagina_actual_texto)
    
    if st.session_state.page < total_paginas - 1:
        opciones_pagina.append("Sig ➡️")
    
    # El default debe ser el texto de la página actual
    seleccion = st.pills("Navegación", opciones_pagina, default=pagina_actual_texto, label_visibility="collapsed")
    
    if seleccion == "⬅️ Ant" and st.session_state.page > 0:
        st.session_state.page -= 1
        st.rerun()
    elif seleccion == "Sig ➡️" and st.session_state.page < total_paginas - 1:
        st.session_state.page += 1
        st.rerun()
    
    # Mostrar actividades de la página actual
    inicio = st.session_state.page * items_por_pagina
    fin = inicio + items_por_pagina
    df_pagina = df.iloc[inicio:fin]
    
    for idx, row in df_pagina.iterrows():
        # Preparar información resumida para el título del expander
        categoria = row.get('categoria', 'Otras')
        titulo = row.get('title', 'Sin título')
        
        # Info resumida para mostrar junto al título
        info_resumen = []
        if 'dtstart' in row and pd.notna(row['dtstart']):
            fecha = row['dtstart'].strftime('%d/%m/%Y') if hasattr(row['dtstart'], 'strftime') else str(row['dtstart'])
            info_resumen.append(f"📅 {fecha}")
        if 'event-location' in row and pd.notna(row['event-location']):
            info_resumen.append(f"📍 {row['event-location']}")
        if 'free' in row and row['free'] == 1:
            info_resumen.append("💰 Gratis")
        if 'distancia_km' in row and pd.notna(row['distancia_km']):
            info_resumen.append(f"📏 {row['distancia_km']} km")
        
        texto_resumen = " | ".join(info_resumen)
        
        # Crear expander con título + info resumida
        with st.expander(f"**{titulo}**  \n  *{texto_resumen}*"):
            col1, col2 = st.columns([4, 1])
            
            with col1:
                st.caption(f"🏷️ Categoría: {categoria}")
                
                # Descripción completa
                if 'description' in row and pd.notna(row['description']):
                    st.markdown("**Descripción:**")
                    st.write(row['description'])
                
                # Detalles completos
                st.markdown("**Detalles:**")
                detalles = []
                
                if 'dtstart' in row and pd.notna(row['dtstart']):
                    fecha = row['dtstart'].strftime('%d/%m/%Y') if hasattr(row['dtstart'], 'strftime') else str(row['dtstart'])
                    detalles.append(f"📅 **Fecha:** {fecha}")
                if 'time' in row and pd.notna(row['time']):
                    detalles.append(f"🕐 **Hora:** {row['time']}")
                if 'event-location' in row and pd.notna(row['event-location']):
                    detalles.append(f"📍 **Lugar:** {row['event-location']}")
                if 'address.area.district' in row and pd.notna(row['address.area.district']):
                    detalles.append(f"🏘️ **Distrito:** {row['address.area.district']}")
                if 'address.area.street-address' in row and pd.notna(row['address.area.street-address']):
                    detalles.append(f"🗺️ **Dirección:** {row['address.area.street-address']}")
                if 'free' in row and row['free'] == 1:
                    detalles.append("💰 **Precio:** Gratuito")
                elif 'price' in row and pd.notna(row['price']):
                    detalles.append(f"💰 **Precio:** {row['price']}")
                if 'audience' in row and pd.notna(row['audience']):
                    detalles.append(f"👥 **Público:** {row['audience']}")
                if 'distancia_km' in row and pd.notna(row['distancia_km']):
                    detalles.append(f"📏 **Distancia:** {row['distancia_km']} km")
                
                for detalle in detalles:
                    st.write(detalle)
                
                # Enlaces
                if 'link' in row and pd.notna(row['link']):
                    st.markdown(f"[🔗 Ver más información]({row['link']})")
                
                # Enlace a Google Maps si hay coordenadas
                if 'lat' in row and 'lon' in row and pd.notna(row['lat']) and pd.notna(row['lon']):
                    maps_url = f"https://www.google.com/maps?q={row['lat']},{row['lon']}"
                    st.markdown(f"[🗺️ Ver en Google Maps]({maps_url})")
            
            with col2:
                # Botón favorito
                act_id = row.get('@id', str(idx))
                es_fav = act_id in st.session_state.favoritos
                
                if st.button("❤️ Favorito" if es_fav else "🤍 Añadir", key=f"fav_{act_id}"):
                    if es_fav:
                        st.session_state.favoritos.remove(act_id)
                    else:
                        st.session_state.favoritos.append(act_id)
                    st.rerun()

# TAB 2: MAPA
with tab2:
    st.subheader("🗺️ Mapa de actividades")
    
    df_map = df.dropna(subset=['lat', 'lon'])
    
    if len(df_map) > 0:
        # Centro del mapa
        if st.session_state.ref_coords:
            center_lat, center_lon = st.session_state.ref_coords
            zoom = 13
        else:
            center_lat, center_lon = 40.4168, -3.7038
            zoom = 12
        
        m = folium.Map(location=[center_lat, center_lon], zoom_start=zoom)
        
        # Añadir marcador de referencia si existe
        if st.session_state.ref_coords:
            folium.Marker(
                location=st.session_state.ref_coords,
                popup="Tu ubicación",
                icon=folium.Icon(color='red', icon='home'),
                tooltip="📍 Tu ubicación"
            ).add_to(m)
        
        # Añadir marcadores de actividades
        for idx, row in df_map.head(100).iterrows():
            popup_text = f"<b>{row.get('title', 'Sin título')}</b><br>"
            popup_text += f"🏷️ {row.get('categoria', 'Otras')}<br>"
            popup_text += f"📍 {row.get('event-location', 'N/A')}<br>"
            if 'dtstart' in row and pd.notna(row['dtstart']):
                fecha = row['dtstart'].strftime('%d/%m/%Y') if hasattr(row['dtstart'], 'strftime') else str(row['dtstart'])
                popup_text += f"📅 {fecha}<br>"
            if 'distancia_km' in row and pd.notna(row['distancia_km']):
                popup_text += f"📏 {row['distancia_km']} km<br>"
            if 'link' in row and pd.notna(row['link']):
                popup_text += f'<a href="{row["link"]}" target="_blank">Ver más</a>'
            
            folium.Marker(
                location=[row['lat'], row['lon']],
                popup=folium.Popup(popup_text, max_width=300),
                tooltip=row.get('title', 'Actividad')[:50]
            ).add_to(m)
        
        st_folium(m, width=700, height=500)
        st.caption(f"Mostrando {min(len(df_map), 100)} actividades")
    else:
        st.info("No hay actividades con coordenadas")

# TAB 3: ESTADÍSTICAS
with tab3:
    st.subheader("📊 Estadísticas")
    
    col1, col2 = st.columns(2)
    
    with col1:
        # Gráfico por categoría
        st.write("**Actividades por categoría:**")
        cat_counts = df['categoria'].value_counts().head(10)
        fig = px.bar(x=cat_counts.index, y=cat_counts.values, 
                    labels={'x': 'Categoría', 'y': 'Actividades'},
                    color=cat_counts.values,
                    color_continuous_scale='Reds')
        st.plotly_chart(fig, use_container_width=True)
    
    with col2:
        # Gráfico por distrito
        if 'address.area.district' in df.columns:
            st.write("**Actividades por distrito:**")
            dist_counts = df['address.area.district'].value_counts().head(10)
            fig = px.bar(x=dist_counts.index, y=dist_counts.values,
                        labels={'x': 'Distrito', 'y': 'Actividades'},
                        color=dist_counts.values,
                        color_continuous_scale='Blues')
            st.plotly_chart(fig, use_container_width=True)
    
    # Gráfico de distribución por precio
    if 'free' in df.columns:
        st.write("**Distribución por precio:**")
        free_counts = df['free'].value_counts()
        labels = {1: 'Gratis', 0: 'De pago'}
        free_counts.index = [labels.get(i, 'Desconocido') for i in free_counts.index]
        fig = px.pie(values=free_counts.values, names=free_counts.index,
                    color=free_counts.index,
                    color_discrete_map={'Gratis': '#00cc96', 'De pago': '#ff4b4b'})
        st.plotly_chart(fig, use_container_width=True)
    
    # Gráfico de actividades por fecha
    if 'dtstart' in df.columns:
        st.write("**Actividades por fecha:**")
        df['fecha'] = pd.to_datetime(df['dtstart'], errors='coerce').dt.date
        fecha_counts = df['fecha'].value_counts().sort_index().head(30)
        fig = px.line(x=fecha_counts.index, y=fecha_counts.values,
                     labels={'x': 'Fecha', 'y': 'Actividades'},
                     markers=True)
        st.plotly_chart(fig, use_container_width=True)
    
    # Distribución de distancias si hay referencia
    if 'distancia_km' in df.columns and df['distancia_km'].notna().any():
        st.write("**Distribución de distancias:**")
        distancias = df['distancia_km'].dropna()
        fig = px.histogram(x=distancias, nbins=20,
                          labels={'x': 'Distancia (km)', 'y': 'Número de actividades'},
                          color_discrete_sequence=['#ff4b4b'])
        st.plotly_chart(fig, use_container_width=True)

# Footer
st.markdown("---")
st.caption("🎭 Dashboard de Actividades Madrid | Datos: Ayuntamiento de Madrid")
