import streamlit as st
import pandas as pd
import requests
from datetime import datetime, timedelta

# Configuración de página
st.set_page_config(
    page_title="Actividades Madrid",
    page_icon="🎭",
    layout="wide",
    initial_sidebar_state="collapsed"
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
</style>
""", unsafe_allow_html=True)

# Función para cargar datos desde la API del Ayuntamiento de Madrid
@st.cache_data(ttl=3600)  # Cache por 1 hora
def load_data_from_api():
    """Carga datos desde la API del Ayuntamiento de Madrid"""
    try:
        url = "https://datos.madrid.es/egob/catalogo/206974-0-agenda-eventos-culturales-100.json"
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        data = response.json()
        
        # Convertir a DataFrame
        if '@graph' in data:
            df = pd.json_normalize(data['@graph'])
        else:
            df = pd.DataFrame(data)
        
        # Limpiar y preparar datos
        df['lat'] = pd.to_numeric(df.get('location.latitude'), errors='coerce')
        df['lon'] = pd.to_numeric(df.get('location.longitude'), errors='coerce')
        
        # Convertir fechas
        if 'dtstart' in df.columns:
            df['dtstart'] = pd.to_datetime(df['dtstart'], errors='coerce')
        
        return df
    except Exception as e:
        st.error(f"Error cargando datos de la API: {e}")
        return pd.DataFrame()

# Cargar datos
df_original = load_data_from_api()

# Título
st.title("🎭 Actividades Madrid")
st.markdown("Descubre eventos y actividades culturales en la ciudad")

if len(df_original) == 0:
    st.error("No se pudieron cargar los datos de la API")
    st.stop()

# Sidebar con filtros
with st.sidebar:
    st.header("🔍 Filtros")
    
    # Filtro de distrito
    if 'address.area.district' in df_original.columns:
        distritos = ['Todos'] + sorted([d for d in df_original['address.area.district'].dropna().unique() if pd.notna(d)])
        distrito_sel = st.selectbox("📍 Distrito", distritos)
    else:
        distrito_sel = 'Todos'
    
    # Filtro de fecha
    st.subheader("📅 Fecha")
    fecha_opciones = ["Todas", "Hoy", "Próximos 7 días", "Próximos 30 días"]
    fecha_filtro = st.radio("", fecha_opciones)
    
    # Filtro de gratuidad
    solo_gratis = st.checkbox("💰 Solo gratuitas", value=False)
    
    # Búsqueda
    st.subheader("🔎 Buscar")
    busqueda = st.text_input("", placeholder="Título o descripción...")
    
    # Info
    st.markdown("---")
    st.caption(f"📊 {len(df_original)} actividades cargadas")
    st.caption("🔄 Actualizado: " + datetime.now().strftime("%d/%m/%Y %H:%M"))

# Aplicar filtros
df = df_original.copy()

# Filtro distrito
if distrito_sel != 'Todos' and 'address.area.district' in df.columns:
    df = df[df['address.area.district'] == distrito_sel]

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
if fecha_filtro != "Todas" and 'dtstart' in df.columns:
    hoy = datetime.now()
    df = df.dropna(subset=['dtstart'])
    
    if fecha_filtro == "Hoy":
        df = df[df['dtstart'].dt.date == hoy.date()]
    elif fecha_filtro == "Próximos 7 días":
        df = df[df['dtstart'] <= hoy + timedelta(days=7)]
    elif fecha_filtro == "Próximos 30 días":
        df = df[df['dtstart'] <= hoy + timedelta(days=30)]

# Métricas
st.markdown("---")
col1, col2, col3, col4 = st.columns(4)
col1.metric("📊 Total", len(df))
col2.metric("💰 Gratis", len(df[df['free'] == 1]) if 'free' in df.columns else 0)
col3.metric("📍 Distritos", df['address.area.district'].nunique() if 'address.area.district' in df.columns else 0)

hoy_count = 0
if 'dtstart' in df.columns and len(df) > 0:
    hoy_count = len(df[df['dtstart'].dt.date == datetime.now().date()])
col4.metric("📅 Hoy", hoy_count)

# Lista de actividades
st.markdown("---")
st.subheader(f"📋 {len(df)} actividades encontradas")

# Mostrar actividades
for idx, row in df.head(50).iterrows():
    with st.container():
        # Título
        titulo = row.get('title', 'Sin título')
        st.markdown(f"### {titulo}")
        
        # Descripción
        if 'description' in row and pd.notna(row['description']):
            desc = str(row['description'])[:200] + "..." if len(str(row['description'])) > 200 else str(row['description'])
            st.caption(desc)
        
        # Detalles en columnas
        c1, c2, c3 = st.columns(3)
        
        with c1:
            # Fecha y hora
            if 'dtstart' in row and pd.notna(row['dtstart']):
                fecha = row['dtstart'].strftime('%d/%m/%Y') if hasattr(row['dtstart'], 'strftime') else str(row['dtstart'])
                st.write(f"📅 {fecha}")
            if 'time' in row and pd.notna(row['time']):
                st.write(f"🕐 {row['time']}")
        
        with c2:
            # Ubicación
            if 'event-location' in row and pd.notna(row['event-location']):
                st.write(f"📍 {row['event-location']}")
            if 'address.area.district' in row and pd.notna(row['address.area.district']):
                st.write(f"🏘️ {row['address.area.district']}")
            if 'address.area.street-address' in row and pd.notna(row['address.area.street-address']):
                st.write(f"🗺️ {row['address.area.street-address']}")
        
        with c3:
            # Precio y público
            if 'free' in row and row['free'] == 1:
                st.write("💰 **Gratuito**")
            elif 'price' in row and pd.notna(row['price']):
                st.write(f"💰 {row['price']}")
            
            if 'audience' in row and pd.notna(row['audience']):
                st.write(f"👥 {row['audience']}")
            
            # Enlace
            if 'link' in row and pd.notna(row['link']):
                st.markdown(f"[🔗 Más info]({row['link']})")
            
            # Mapa
            if 'lat' in row and 'lon' in row and pd.notna(row['lat']) and pd.notna(row['lon']):
                maps_url = f"https://www.google.com/maps?q={row['lat']},{row['lon']}"
                st.markdown(f"[🗺️ Ver mapa]({maps_url})")
        
        st.markdown("---")

# Footer
st.markdown("---")
st.caption("🎭 Dashboard de Actividades Madrid")
st.caption("📡 Datos: Ayuntamiento de Madrid (API) | Actualizado automáticamente")
