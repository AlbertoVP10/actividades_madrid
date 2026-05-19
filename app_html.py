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

# Defino las rutas de mis archivos
base_dir = os.path.dirname(__file__)
html_file = os.path.join(base_dir, 'www/index.html')
css_file = os.path.join(base_dir, 'www/css/styles.css')
js_file = os.path.join(base_dir, 'www/js/app.js')
js_tw_file = os.path.join(base_dir, 'www/js/tailwind-config.js')

# 2. Verificar y leer todos los componentes
if os.path.exists(html_file):
    # Leer el HTML base
    with open(html_file, 'r', encoding='utf-8') as f:
        html_content = f.read()

    # Leer CSS si existe, si no, inicializar vacío
    css_content = ""
    if os.path.exists(css_file):
        with open(css_file, 'r', encoding='utf-8') as f:
            css_content = f"<style>{f.read()}</style>"

    # Leer JS si existe, si no, inicializar vacío
    js_content = ""
    if os.path.exists(js_file):
        with open(js_file, 'r', encoding='utf-8') as f:
            js_content = f"<script>{f.read()}</script>"

    # Leer la configuración de Tailwind si existe
    js_tw_content = ""
    if os.path.exists(js_tw_file):
        with open(js_tw_file, 'r', encoding='utf-8') as f:
            js_tw_content = f"<script>{f.read()}</script>"

    # 3. Inyectar dinámicamente los estilos y scripts al final de la estructura
    # Colocamos el CSS antes de cerrar </head> y el JS antes de cerrar </body>
    html_content = html_content.replace("</head>", f"{css_content}</head>")
    html_content = html_content.replace("</body>", f"{js_content}</body>")
    html_content = html_content.replace("</body>", f"{js_tw_content}</body>")

    # 4. Mostrar el resultado a pantalla completa
    # Nota: El height aquí da igual por el CSS forzado a 100vh del iframe
    st.components.v1.html(html_content, height=1000, scrolling=True)

else:
    st.error("No se encontró el archivo index.html")
    st.info("Asegúrate de que la carpeta 'www' exista al lado de app.py.")
