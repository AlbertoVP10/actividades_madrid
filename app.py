import streamlit as st
import pandas as pd
import requests
import folium
from streamlit_folium import st_folium
import plotly.express as px
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

# INICIALIZAR FAVORITOS
if 'favoritos' not in st.session_state:
    st.session_state.favoritos = []

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
        
        return df
    except Exception as e:
        st.error(f"Error cargando datos: {e}")
        return pd.DataFrame()

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
    
    if 'address.area.district' in df_original.columns:
        distritos = ['Todos'] + sorted([d for d in df_original['address.area.district'].dropna().unique() if pd.notna(d)])
        distrito_sel = st.selectbox("📍 Distrito", distritos)
    else:
        distrito_sel = 'Todos'
    
    st.subheader("📅 Fecha")
    fecha_opciones = ["Todas", "Hoy", "Próximos 7 días", "Próximos 30 días"]
    fecha_filtro = st.radio("", fecha_opciones, label_visibility="collapsed")
    
    solo_gratis = st.checkbox("💰 Solo gratuitas")
    
    busqueda = st.text_input("🔎 Buscar", placeholder="Título o descripción...")
    
    # Ver favoritos
    ver_favoritos = st.checkbox(f"❤️ Mis favoritos ({len(st.session_state.favoritos)})")
    
    st.markdown("---")
    st.caption(f"📊 {len(df_original)} actividades")

# Aplicar filtros
df = df_original.copy()

if distrito_sel != 'Todos' and 'address.area.district' in df.columns:
    df = df[df['address.area.district'] == distrito_sel]

if solo_gratis and 'free' in df.columns:
    df = df[df['free'] == 1]

if busqueda and 'title' in df.columns:
    mask = df['title'].str.contains(busqueda, case=False, na=False)
    if 'description' in df.columns:
        mask |= df['description'].str.contains(busqueda, case=False, na=False)
    df = df[mask]

if fecha_filtro != "Todas" and 'dtstart' in df.columns:
    hoy = datetime.now()
    df = df.dropna(subset=['dtstart'])
    if len(df) > 0:
        if fecha_filtro == "Hoy":
            df = df[df['dtstart'].dt.date == hoy.date()]
        elif fecha_filtro == "Próximos 7 días":
            df = df[df['dtstart'] <= hoy + timedelta(days=7)]
        elif fecha_filtro == "Próximos 30 días":
            df = df[df['dtstart'] <= hoy + timedelta(days=30)]

# Ver favoritos
if ver_favoritos and len(st.session_state.favoritos) > 0:
    df = df[df['@id'].isin(st.session_state.favoritos)]

# PAGINACIÓN
if 'page' not in st.session_state:
    st.session_state.page = 0

items_por_pagina = 20
total_paginas = (len(df) + items_por_pagina - 1) // items_por_pagina

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

# TABS
tab1, tab2, tab3 = st.tabs(["📋 Lista", "🗺️ Mapa", "📊 Estadísticas"])

# TAB 1: LISTA
with tab1:
    st.subheader(f"📋 {len(df)} actividades")
    
    # Controles de paginación
    col_pag1, col_pag2, col_pag3 = st.columns([1, 2, 1])
    with col_pag1:
        if st.button("⬅️ Anterior") and st.session_state.page > 0:
            st.session_state.page -= 1
            st.rerun()
    with col_pag2:
        st.write(f"Página {st.session_state.page + 1} de {max(1, total_paginas)}")
    with col_pag3:
        if st.button("Siguiente ➡️") and st.session_state.page < total_paginas - 1:
            st.session_state.page += 1
            st.rerun()
    
    # Mostrar actividades de la página actual
    inicio = st.session_state.page * items_por_pagina
    fin = inicio + items_por_pagina
    df_pagina = df.iloc[inicio:fin]
    
    for idx, row in df_pagina.iterrows():
        with st.container():
            col_left, col_right = st.columns([4, 1])
            
            with col_left:
                st.markdown(f"### {row.get('title', 'Sin título')}")
                
                if 'description' in row and pd.notna(row['description']):
                    desc = str(row['description'])[:150] + "..."
                    st.caption(desc)
                
                info = []
                if 'dtstart' in row and pd.notna(row['dtstart']):
                    fecha = row['dtstart'].strftime('%d/%m/%Y') if hasattr(row['dtstart'], 'strftime') else str(row['dtstart'])
                    info.append(f"📅 {fecha}")
                if 'event-location' in row and pd.notna(row['event-location']):
                    info.append(f"📍 {row['event-location']}")
                if 'free' in row and row['free'] == 1:
                    info.append("💰 Gratis")
                
                st.write(" | ".join(info))
                
                if 'link' in row and pd.notna(row['link']):
                    st.markdown(f"[🔗 Más info]({row['link']})")
            
            with col_right:
                # Botón favorito
                act_id = row.get('@id', str(idx))
                es_fav = act_id in st.session_state.favoritos
                
                if st.button("❤️" if es_fav else "🤍", key=f"fav_{act_id}"):
                    if es_fav:
                        st.session_state.favoritos.remove(act_id)
                    else:
                        st.session_state.favoritos.append(act_id)
                    st.rerun()
            
            st.markdown("---")

# TAB 2: MAPA
with tab2:
    st.subheader("🗺️ Mapa de actividades")
    
    df_map = df.dropna(subset=['lat', 'lon'])
    
    if len(df_map) > 0:
        df_map = df_map.head(100)  # Limitar para rendimiento
        
        m = folium.Map(location=[40.4168, -3.7038], zoom_start=12)
        
        for idx, row in df_map.iterrows():
            popup_text = f"<b>{row.get('title', 'Sin título')}</b><br>"
            popup_text += f"📍 {row.get('event-location', 'N/A')}<br>"
            if 'dtstart' in row and pd.notna(row['dtstart']):
                fecha = row['dtstart'].strftime('%d/%m/%Y') if hasattr(row['dtstart'], 'strftime') else str(row['dtstart'])
                popup_text += f"📅 {fecha}<br>"
            if 'link' in row and pd.notna(row['link']):
                popup_text += f'<a href="{row["link"]}" target="_blank">Ver más</a>'
            
            folium.Marker(
                location=[row['lat'], row['lon']],
                popup=folium.Popup(popup_text, max_width=300),
                tooltip=row.get('title', 'Actividad')[:50]
            ).add_to(m)
        
        st_folium(m, width=700, height=500)
        st.caption(f"Mostrando {len(df_map)} actividades")
    else:
        st.info("No hay actividades con coordenadas")

# TAB 3: ESTADÍSTICAS
with tab3:
    st.subheader("📊 Estadísticas")
    
    col1, col2 = st.columns(2)
    
    with col1:
        if 'address.area.district' in df.columns:
            st.write("**Actividades por distrito:**")
            dist_counts = df['address.area.district'].value_counts().head(10)
            fig = px.bar(x=dist_counts.index, y=dist_counts.values, 
                        labels={'x': 'Distrito', 'y': 'Actividades'})
            st.plotly_chart(fig, use_container_width=True)
    
    with col2:
        if 'free' in df.columns:
            st.write("**Distribución por precio:**")
            free_counts = df['free'].value_counts()
            labels = {1: 'Gratis', 0: 'De pago'}
            free_counts.index = [labels.get(i, 'Desconocido') for i in free_counts.index]
            fig = px.pie(values=free_counts.values, names=free_counts.index)
            st.plotly_chart(fig, use_container_width=True)
    
    if 'dtstart' in df.columns:
        st.write("**Actividades por fecha:**")
        df['fecha'] = pd.to_datetime(df['dtstart'], errors='coerce').dt.date
        fecha_counts = df['fecha'].value_counts().sort_index().head(30)
        fig = px.line(x=fecha_counts.index, y=fecha_counts.values,
                     labels={'x': 'Fecha', 'y': 'Actividades'})
        st.plotly_chart(fig, use_container_width=True)

# Footer
st.markdown("---")
st.caption("🎭 Dashboard de Actividades Madrid | Datos: Ayuntamiento de Madrid")
