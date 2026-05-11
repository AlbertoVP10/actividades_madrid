#!/usr/bin/env python3
"""
Dashboard de Actividades Madrid - Versión HTML
Desplegado en Streamlit Cloud con iframe del HTML
"""

import streamlit as st
import os

# Configuración de página
st.set_page_config(
    page_title="Madrid Explore",
    page_icon="🎭",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# CSS para ocultar elementos de Streamlit y hacer fullscreen
st.markdown("""
<style>
    /* Ocultar header y footer de Streamlit */
    #MainMenu {visibility: hidden;}
    header {visibility: hidden;}
    footer {visibility: hidden;}
    
    /* Hacer el iframe fullscreen */
    .stApp {
        padding: 0 !important;
    }
    
    .main .block-container {
        padding: 0 !important;
        max-width: 100% !important;
    }
    
    /* Iframe a pantalla completa */
    iframe {
        width: 100vw !important;
        height: 100vh !important;
        border: none !important;
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
    }
    
    /* Ocultar el padding superior */
    .stApp > header {
        display: none !important;
    }
</style>
""", unsafe_allow_html=True)

# Leer el archivo HTML
html_file = os.path.join(os.path.dirname(__file__), 'www/index.html')

if os.path.exists(html_file):
    with open(html_file, 'r', encoding='utf-8') as f:
        html_content = f.read()
    
    # Mostrar el HTML en un iframe
    st.components.v1.html(html_content, height=1000, scrolling=True)
else:
    st.error("No se encontró el archivo index.html")
    st.info("Asegúrate de que el archivo index.html esté en la misma carpeta que este script.")