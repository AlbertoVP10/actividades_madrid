#!/usr/bin/env python3
"""
Script para enriquecer actividades con campos de IA usando Groq.
Genera: es_aire_libre, edad_minima, edad_maxima

Ejecución: python scripts/enrich_activities.py
"""

import os
import sys
import json
import time
import argparse
from datetime import datetime
from typing import List, Dict, Any

# Añadir directorio padre al path para imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from utils.firebase_helper import (
    get_firebase_config,
    download_from_firebase,
    upload_to_firebase,
    save_json_atomic,
    load_json,
    PYREBASE_AVAILABLE
)

# Intentar importar Groq
try:
    from groq import Groq
    GROQ_AVAILABLE = True
except ImportError:
    GROQ_AVAILABLE = False
    print("⚠️ Groq no instalado. Instala con: pip install groq")


def parse_args():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(
        description="Enriquece actividades con campos de IA usando Groq"
    )
    parser.add_argument(
        "--input", "-i",
        default="data/actividades_procesadas.json",
        help="Archivo JSON de entrada"
    )
    parser.add_argument(
        "--output", "-o",
        default="data/descripcion_clasificada.json",
        help="Archivo JSON de salida"
    )
    parser.add_argument(
        "--batch-size", "-b",
        type=int,
        default=2,
        help="Tamaño de lote para procesamiento (recomendado: 2)"
    )
    parser.add_argument(
        "--limit", "-l",
        type=int,
        default=None,
        help="Limitar número de actividades a procesar (para testing)"
    )
    parser.add_argument(
        "--upload",
        action="store_true",
        help="Subir resultado a Firebase automáticamente"
    )
    return parser.parse_args()


def clasificar_lote_groq(client: Groq, lote_textos: List[dict]) -> List[dict]:
    """
    Clasifica un lote de actividades usando Groq API.
    
    Args:
        client: Cliente de Groq inicializado
        lote_textos: Lista de dicts con 'app_id' y 'description'
        
    Returns:
        Lista de resultados clasificados
    """
    bloque_input = ""
    for item in lote_textos:
        bloque_input += f"--- APP_ID: {item['app_id']} ---\n{item['description']}\n--- FIN ---\n\n"

    prompt = f"""Eres un sistema experto en extracción de datos (NER) y procesamiento de lenguaje natural de alta precisión. Tu tarea es analizar descripciones de actividades culturales y de ocio del Ayuntamiento de Madrid para estructurarlas en un formato JSON estricto.

### INSTRUCCIONES DE PROCESAMIENTO
1. Analiza detenidamente el identificador del archivo (`app_id`) y el texto de la descripción proporcionada.
2. Evalúa las condiciones ambientales para determinar si la actividad ocurre al aire libre.
3. Extrae los rangos de edad aplicando las reglas lógicas e infiriendo los límites numéricos según el contexto de forma matemática.

### LÓGICA DE EXTRACCIÓN DE EDADES (CRÍTICA)
- Expresiones de rango ("de X a Y", "entre X y Y", "X-Y años"): 'edad_minima' = X, 'edad_maxima' = Y.
- Expresiones de límite inferior ("a partir de X años", "mayores de X años", ">X"): 'edad_minima' = X, 'edad_maxima' = null.
- Expresiones de límite superior ("hasta X años", "menores de X años", "<X"): 'edad_minima' = null, 'edad_maxima' = X.
- Palabras clave de infancia: Si menciona "bebés" sin especificar edad, asume 'edad_minima' = 0.
- Palabras clave de adultos: Si menciona "adultos", "público adulto" o "mayores de edad", asume 'edad_minima' = 18.
- Sin restricciones ("para todos los públicos", "público familiar" sin rangos): 'edad_minima' = 0, 'edad_maxima' = null.
- En caso de total ambigüedad o ausencia de datos: Ambos campos deben ser null.

### FORMATO DE SALIDA REQUERIDO
Devuelve EXCLUSIVAMENTE un objeto JSON válido que cumpla estrictamente con el siguiente esquema (no incluyas bloques de código markdown, ni texto introductorio, ni notas aclaratorias):

{{
  "actividades": [
    {{
      "app_id": string,
      "es_aire_libre": boolean,
      "edad_minima": number | null,
      "edad_maxima": number | null
    }}
  ]
}}

### DATOS A PROCESAR:
{bloque_input}"""

    for intento in range(3):
        try:
            completion = client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.0,
                response_format={"type": "json_object"}
            )
            
            resultado_json = json.loads(completion.choices[0].message.content)
            return resultado_json.get("actividades", [])
            
        except Exception as e:
            print(f"Error en intento {intento+1}: {e}")
            if intento < 2:
                print(f"Aviso: Intento {intento+1} falló. Esperando 10 segundos...")
                time.sleep(10)
            else:
                raise e


def main():
    """Función principal."""
    args = parse_args()
    
    print("=" * 60)
    print("🤖 ENRIQUECIMIENTO IA DE ACTIVIDADES (GROQ)")
    print("=" * 60)
    print(f"⏰ Inicio: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # Verificar que Groq está disponible
    if not GROQ_AVAILABLE:
        print("❌ Groq no está instalado. Ejecuta: pip install groq")
        sys.exit(1)
    
    # Inicializar cliente de Groq
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        print("❌ GROQ_API_KEY no encontrado en variables de entorno")
        sys.exit(1)
    
    client = Groq(api_key=api_key)
    print("✅ Cliente Groq inicializado")
    print()
    
    # Archivos de entrada y salida
    archivo_entrada = args.input
    archivo_salida = args.output
    
    # Descargar de Firebase si no existe localmente
    if not os.path.exists(archivo_entrada):
        print(f"📥 Descargando actividades desde Firebase...")
        config = get_firebase_config()
        bucket = config.get("storageBucket")
        
        if bucket:
            data = download_from_firebase(bucket, "actividades_procesadas.json")
            if data:
                os.makedirs(os.path.dirname(archivo_entrada), exist_ok=True)
                save_json_atomic(archivo_entrada, data)
                print(f"✅ Descargadas {len(data)} actividades")
            else:
                print("❌ No se pudieron descargar actividades")
                sys.exit(1)
        else:
            print("❌ FIREBASE_storageBucket no configurado")
            sys.exit(1)
    
    # 1. Cargar el histórico existente
    historico_clasificado = {}
    if os.path.exists(archivo_salida):
        print(f"📂 Cargando histórico existente: {archivo_salida}")
        try:
            datos_viejos = load_json(archivo_salida, [])
            historico_clasificado = {item["app_id"]: item for item in datos_viejos}
            print(f"   ✅ {len(historico_clasificado)} actividades ya clasificadas")
        except Exception as e:
            print(f"   ⚠️ Error cargando histórico: {e}")
    
    # 2. Cargar catálogo actual y filtrar nuevos
    nuevas_actividades = []
    print(f"\n📋 Cargando catálogo actual...")
    
    catalogo_actual = load_json(archivo_entrada, [])
    
    if isinstance(catalogo_actual, list):
        for item in catalogo_actual:
            uid = item.get("app_id")
            desc = item.get("description", "")
            
            if not desc:
                continue
            
            if uid not in historico_clasificado:
                nuevas_actividades.append({
                    "app_id": uid,
                    "description": desc
                })
    
    print(f"   Total actividades: {len(catalogo_actual)}")
    print(f"   Nuevas a procesar: {len(nuevas_actividades)}")
    
    # Aplicar límite si se especificó
    if args.limit:
        print(f"   ⚠️ Limitado a {args.limit} actividades (modo testing)")
        nuevas_actividades = nuevas_actividades[:args.limit]
    
    # 3. Procesar nuevas actividades
    if nuevas_actividades:
        tamanio_lote = args.batch_size
        total_lotes = -(-len(nuevas_actividades) // tamanio_lote)
        
        print(f"\n🚀 Procesando {len(nuevas_actividades)} actividades en lotes de {tamanio_lote}...")
        print()
        
        for i in range(0, len(nuevas_actividades), tamanio_lote):
            lote = nuevas_actividades[i:i+tamanio_lote]
            lote_num = i // tamanio_lote + 1
            
            print(f"Procesando lote {lote_num} de {total_lotes}...")
            
            try:
                resultados_lote = clasificar_lote_groq(client, lote)
                
                # Integrar resultados en histórico
                for res in resultados_lote:
                    historico_clasificado[res["app_id"]] = res
                
                print(f"   ✅ {len(resultados_lote)} actividades clasificadas")
                
                # Guardar incrementalmente
                save_json_atomic(archivo_salida, list(historico_clasificado.values()))
                
                # Esperar entre peticiones (rate limit de Groq)
                if i + tamanio_lote < len(nuevas_actividades):
                    time.sleep(12)
                    
            except Exception as e:
                print(f"   ❌ Error procesando lote {lote_num}: {e}")
                continue
        
        print(f"\n✅ Procesamiento completado!")
        print(f"   Total en histórico: {len(historico_clasificado)} actividades")
    else:
        print("\n✅ No hay actividades nuevas para procesar.")
    
    # 4. Subir a Firebase si se solicitó
    if args.upload:
        print("\n☁️ Subiendo resultado a Firebase...")
        config = get_firebase_config()
        
        if PYREBASE_AVAILABLE and config.get("storageBucket"):
            try:
                import pyrebase
                firebase = pyrebase.initialize_app(config)
                storage = firebase.storage()
                
                url = upload_to_firebase(
                    storage,
                    archivo_salida,
                    "descripcion_clasificada.json"
                )
                
                if url:
                    print(f"   ✅ Subido correctamente")
                else:
                    print(f"   ❌ Error al subir")
            except Exception as e:
                print(f"   ❌ Error: {e}")
        else:
            print("   ⚠️ Firebase no disponible")
    
    print("\n" + "=" * 60)
    print(f"⏰ Fin: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)


if __name__ == "__main__":
    main()
