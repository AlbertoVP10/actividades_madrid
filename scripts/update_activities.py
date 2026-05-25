#!/usr/bin/env python3
"""
Script para actualizar actividades de Madrid.
Ejecución programada: todos los días a las 5 de la mañana.
"""

import os
import sys
import json
import time
import random
import requests
from datetime import datetime
from urllib.parse import urljoin
from bs4 import BeautifulSoup
from dotenv import load_dotenv

try:
    import pyrebase
    PYREBASE_AVAILABLE = True
except ImportError:
    PYREBASE_AVAILABLE = False

# Configuración
URL_ACTIVIDADES_MADRID = "https://datos.madrid.es/egob/catalogo/206974-0-agenda-eventos-culturales-100.json"
URL_BASE_MADRID = "https://www.madrid.es"
DIV_CLASS_IMAGEN = "image-content ic-right"
DATA_DIR = "./data"
os.makedirs(DATA_DIR, exist_ok=True)
ARCHIVO_ACTIVIDADES = os.path.join(DATA_DIR, "actividades_procesadas.json")
ARCHIVO_IMAGENES = os.path.join(DATA_DIR, "imagenes.json")
MAX_IMAGENES = 50
SLEEP = 2

def load_json(path, default=None):
    if default is None:
        default = {}
    if os.path.exists(path):
        try:
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print(f"⚠️  No se pudo leer {path}: {e}")
            return default
    return default

def save_json_atomic(path, data):
    tmp = f"{path}.tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    os.replace(tmp, path)

def get_firebase_config():
    load_dotenv()
    config = {
        "apiKey": os.getenv("FIREBASE_apiKey"),
        "authDomain": os.getenv("FIREBASE_authDomain"),
        "projectId": os.getenv("FIREBASE_projectId"),
        "storageBucket": os.getenv("FIREBASE_storageBucket"),
        "messagingSenderId": os.getenv("FIREBASE_messagingSenderId"),
        "appId": os.getenv("FIREBASE_appId"),
        "databaseURL": ""
    }
    return config

def download_from_firebase(bucket, filename):
    url = f"https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{filename.replace('/', '%2F')}?alt=media"
    try:
        response = requests.get(url, timeout=30)
        if response.status_code == 200:
            return response.json()
    except Exception as e:
        print(f"⚠️  Error descargando {filename}: {e}")
    return None

def upload_to_firebase(storage, local_path, remote_path):
    try:
        storage.child(remote_path).put(local_path)
        url = storage.child(remote_path).get_url(None)
        print(f"✅ Subido: {remote_path}")
        return url
    except Exception as e:
        print(f"❌ Error subiendo {remote_path}: {e}")
        raise
def extract_category(type_str):
    if not type_str:
        return 'Otras'
    type_lower = str(type_str).lower()
    if 'cine' in type_lower or 'film' in type_lower:
        return 'Cine'
    if 'teatro' in type_lower or 'theatre' in type_lower:
        return 'Teatro'
    if 'musica' in type_lower or 'music' in type_lower or 'concierto' in type_lower:
        return 'Música'
    if 'exposicion' in type_lower or 'exhibition' in type_lower:
        return 'Exposiciones'
    if 'taller' in type_lower or 'workshop' in type_lower:
        return 'Talleres'
    if 'deporte' in type_lower or 'sport' in type_lower:
        return 'Deportes'
    if 'danza' in type_lower or 'dance' in type_lower:
        return 'Danza'
    if 'literatura' in type_lower or 'book' in type_lower:
        return 'Literatura'
    if 'infantil' in type_lower or 'cuentacuentos' in type_lower or 'circo' in type_lower:
        return 'Infantil'
    if 'fiesta' in type_lower or 'sanisidro' in type_lower:
        return 'Fiestas'
    if 'destacada' in type_lower:
        return 'Destacada'
    if 'conferencia' in type_lower:
        return 'Conferencias'
    if 'excursion' in type_lower or 'visita' in type_lower:
        return 'Excursiones'
    if 'campamento' in type_lower:
        return 'Campamentos'
    return 'Otras'

def extract_district(district_url):
    if not district_url:
        return 'Desconocido'
    parts = str(district_url).split('/')
    name = parts[-1] if parts else ''
    district_map = {
        'Fuencarral-ElPardo': 'Fuencarral - El Pardo',
        'CiudadLineal': 'Ciudad Lineal',
        'PuenteDeVallecas': 'Puente de Vallecas',
        'Moncloa-Aravaca': 'Moncloa - Aravaca',
        'SanBlas-Canillejas': 'San Blas-Canillejas',
        'VillaDeVallecas': 'Villa de Vallecas'
    }
    return district_map.get(name, name)
def process_activities(raw_data):
    graph = raw_data.get('@graph', [])
    today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    processed = []
    
    for item in graph:
        address = item.get('address', {}) or {}
        district_obj = address.get('district', {}) or {}
        area = address.get('area', {}) or {}
        location_obj = item.get('location', {}) or {}
        
        dtstart = item.get('dtstart')
        date_val = None
        if dtstart:
            try:
                date_val = datetime.fromisoformat(dtstart.replace('Z', '+00:00').replace('+00:00', ''))
            except:
                pass
        
        dtend = item.get('dtend')
        end_date_val = None
        if dtend:
            try:
                end_date_val = datetime.fromisoformat(dtend.replace('Z', '+00:00').replace('+00:00', ''))
            except:
                pass
        
        if date_val and end_date_val:
            date_diff = (end_date_val - date_val).days
        else:
            date_diff = None

        if date_diff is not None:
            if date_diff > 7:
                duration = "Larga duración (> 7 días)"
            elif date_diff > 1:
                duration = "Multi-día (2-7 días)"
            else:
                duration = "1 día"
        else:
            duration = "1 día"

        try:
            lat = float(location_obj.get('latitude')) if location_obj.get('latitude') else None
            lon = float(location_obj.get('longitude')) if location_obj.get('longitude') else None
        except (ValueError, TypeError):
            lat, lon = None, None

        app_id = item.get('@id', '')
        app_id = app_id.split('/')[-1] if app_id else str(random.random())

        activity = {
            'app_id': app_id,
            'id': item.get('@id', ''),
            'title': item.get('title', 'Sin título'),
            'description': item.get('description', ''),
            'category': extract_category(item.get('@type')),
            'location': item.get('event-location', ''),
            'district': extract_district(district_obj.get('@id')),
            'lat': lat,
            'lon': lon,
            'date': date_val.isoformat() if date_val else None,
            'endDate': end_date_val.isoformat() if end_date_val else None,
            'time': item.get('time', ''),
            'free': item.get('free') == 1 or item.get('free') is True,
            'price': item.get('price', ''),
            'audience': item.get('audience', ''),
            'link': item.get('link', ''),
            'street': area.get('street-address', '') if area else '',
            'date_diff': date_diff,
            'duration': duration
        }
        processed.append(activity)
    
    filtered = [
        a for a in processed
        if a['date'] is None or datetime.fromisoformat(a['date']) >= today
    ]
    return filtered

def extraer_imagen(url, div_class, url_base):
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1"
    }
    try:
        print(f"   🔍 Accediendo a: {url[:80]}...")
        respuesta = requests.get(url, headers=headers, timeout=30)
        print(f"   📡 Status: {respuesta.status_code}")
        
        if respuesta.status_code != 200:
            print(f"   ❌ Error HTTP {respuesta.status_code}")
            return None
            
        soup = BeautifulSoup(respuesta.text, "html.parser")
        contenedor = soup.find("div", class_=div_class)
        
        if not contenedor:
            print(f"   ❌ No se encontró div con clase '{div_class}'")
            # Buscar alternativas
            divs = soup.find_all("div", class_=lambda x: x and "image" in str(x).lower())
            if divs:
                print(f"   ℹ️  Divs con 'image' encontrados: {len(divs)}")
                for d in divs[:3]:
                    print(f"      - {d.get('class')}")
            return None
            
        etiqueta_img = contenedor.find("img")
        if not etiqueta_img:
            print(f"   ❌ No se encontró img dentro del div")
            return None
            
        url_imagen = etiqueta_img.get("src")
        print(f"   📷 Src encontrado: {url_imagen[:80] if url_imagen else 'None'}...")
        
        if url_imagen and not url_imagen.startswith(("http://", "https://")):
            url_imagen = urljoin(url_base, url_imagen)
            print(f"   🔗 URL completa: {url_imagen[:80]}...")
            
        return url_imagen
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return None

def procesar_imagenes(actividades, imagenes_existentes, max_imagenes=50, skip_extraccion=False):
    """
    Procesa las imágenes de las actividades.
    - skip_extraccion: Si es True, solo descarga el JSON existente sin extraer nuevas imágenes.
                       Útil para ejecutar en GitHub Actions donde el servidor bloquea requests.
    """
    imagenes_map = imagenes_existentes.copy()
    
    # Si estamos en GitHub Actions (detectado por variable de entorno), saltar extracción
    if skip_extraccion or os.getenv('GITHUB_ACTIONS') == 'true':
        print("\n🖼️  Modo GitHub Actions: Saltando extracción de imágenes (servidor bloquea requests)")
        print(f"   📊 Imágenes existentes en Firebase: {len(imagenes_map)}")
        return imagenes_map
    
    obtained = 0
    total_new = 0
    
    print(f"\n🖼️  Procesando imágenes (máximo {max_imagenes} nuevas)...")
    
    for activity in actividades:
        app_id = activity.get('app_id')
        if not app_id:
            continue
        if app_id in imagenes_map:
            continue
        
        link = activity.get('link')
        if not link:
            imagenes_map[app_id] = None
            total_new += 1
            continue

        print(f"   📷 {app_id}")
        try:
            img = extraer_imagen(link, DIV_CLASS_IMAGEN, URL_BASE_MADRID)
        except Exception as e:
            img = None

        imagenes_map[app_id] = img
        total_new += 1
        if img:
            obtained += 1
            print(f"   ✅ Imagen encontrada")
        else:
            print(f"   ❌ Sin imagen")

        try:
            save_json_atomic(ARCHIVO_IMAGENES, imagenes_map)
        except Exception as e:
            print(f"   ⚠️  Error guardando: {e}")

        if total_new >= max_imagenes:
            print(f"\n✅ Límite de {max_imagenes} imágenes alcanzado")
            break

        time.sleep(SLEEP)
    
    print(f"\n📊 Imágenes: {obtained} encontradas, {total_new} procesadas")
    return imagenes_map
def main():
    print("=" * 60)
    print("🚀 ACTUALIZACIÓN DE ACTIVIDADES DE MADRID")
    print("=" * 60)
    print(f"⏰ Inicio: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    storage = None
    bucket_name = None
    
    try:
        config = get_firebase_config()
        bucket_name = config.get("storageBucket")
        if PYREBASE_AVAILABLE:
            firebase = pyrebase.initialize_app(config)
            storage = firebase.storage()
            print("✅ Firebase inicializado")
        else:
            print("⚠️  pyrebase no disponible")
    except Exception as e:
        print(f"⚠️  Error Firebase: {e}")
    
    print()
    
    # PASO 1: Descargar y procesar actividades
    print("📥 PASO 1: Descargando actividades...")
    try:
        response = requests.get(URL_ACTIVIDADES_MADRID, timeout=60)
        response.raise_for_status()
        raw_data = response.json()
        print(f"✅ Descargadas: {len(raw_data.get('@graph', []))} actividades")
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)
    
    print("\n⚙️  Procesando...")
    actividades = process_activities(raw_data)
    print(f"✅ Procesadas: {len(actividades)}")
    
    save_json_atomic(ARCHIVO_ACTIVIDADES, actividades)
    print(f"💾 Guardado en: {ARCHIVO_ACTIVIDADES}")
    
    if storage:
        print("\n☁️  Subiendo actividades...")
        upload_to_firebase(storage, ARCHIVO_ACTIVIDADES, "actividades_procesadas.json")
    
    print()
    
    # PASO 2: Extraer imágenes
    print("🖼️  PASO 2: Extrayendo imágenes...")
    imagenes_existentes = {}
    if bucket_name:
        print("📥 Descargando imágenes existentes...")
        imagenes_existentes = download_from_firebase(bucket_name, "imagenes.json") or {}
        print(f"✅ Imágenes existentes: {len(imagenes_existentes)}")
    
    # Detectar si estamos en GitHub Actions
    en_github_actions = os.getenv('GITHUB_ACTIONS') == 'true'
    
    imagenes_map = procesar_imagenes(actividades, imagenes_existentes, max_imagenes=MAX_IMAGENES)
    
    if storage:
        print("\n☁️  Subiendo imágenes...")
        if en_github_actions:
            print("   ℹ️  En GitHub Actions: No se suben imágenes (no se extrajeron nuevas)")
        else:
            upload_to_firebase(storage, ARCHIVO_IMAGENES, "imagenes.json")
    
    print()
    print("=" * 60)
    print("📊 RESUMEN")
    print("=" * 60)
    print(f"✅ Actividades: {len(actividades)}")
    print(f"✅ Total imágenes: {len(imagenes_map)}")
    print(f"✅ Con URL: {sum(1 for v in imagenes_map.values() if v)}")
    print(f"✅ Sin URL: {sum(1 for v in imagenes_map.values() if not v)}")
    print(f"⏰ Fin: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)

if __name__ == "__main__":
    main()
