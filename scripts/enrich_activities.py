#!/usr/bin/env python3
"""
Script para enriquecer actividades con campos de IA.
Genera: es_aire_libre, edad_minima, edad_maxima

Ejecución: python scripts/enrich_activities.py \
           --input data/actividades_procesadas.json \
           --output data/actividades_procesadas_ia.json \
           --batch-size 32
"""

import os
import sys
import json
import argparse
import time
from datetime import datetime
from typing import List, Dict, Any

# Añadir directorio padre al path para imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from models.zero_shot import AirClassifier
from models.qa_age import AgeExtractor
from utils.text_processor import batch_generator, clean_text
from utils.firebase_helper import (
    get_firebase_config,
    download_from_firebase,
    upload_to_firebase,
    save_json_atomic,
    load_json,
    PYREBASE_AVAILABLE
)


def parse_args():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(
        description="Enriquece actividades con campos de IA"
    )
    parser.add_argument(
        "--input", "-i",
        default="data/actividades_procesadas.json",
        help="Archivo JSON de entrada"
    )
    parser.add_argument(
        "--output", "-o",
        default="data/actividades_procesadas_ia.json",
        help="Archivo JSON de salida"
    )
    parser.add_argument(
        "--batch-size", "-b",
        type=int,
        default=32,
        help="Tamaño de batch para procesamiento"
    )
    parser.add_argument(
        "--limit", "-l",
        type=int,
        default=None,
        help="Limitar número de actividades a procesar (para testing)"
    )
    parser.add_argument(
        "--skip-existing",
        action="store_true",
        help="Saltar actividades ya procesadas en el archivo de salida"
    )
    parser.add_argument(
        "--upload",
        action="store_true",
        help="Subir resultado a Firebase automáticamente"
    )
    return parser.parse_args()


def load_activities(input_path: str) -> List[Dict[str, Any]]:
    """Carga actividades desde archivo JSON."""
    print(f"📥 Cargando actividades desde: {input_path}")
    
    # Si no existe localmente, intentar descargar de Firebase
    if not os.path.exists(input_path):
        print("   Archivo no encontrado localmente, descargando de Firebase...")
        config = get_firebase_config()
        bucket = config.get("storageBucket")
        
        if bucket:
            data = download_from_firebase(bucket, "actividades_procesadas.json")
            if data:
                os.makedirs(os.path.dirname(input_path), exist_ok=True)
                save_json_atomic(input_path, data)
                print(f"   ✅ Descargado y guardado en {input_path}")
                return data
        
        print("   ❌ No se pudo obtener el archivo")
        return []
    
    # Cargar desde archivo local
    data = load_json(input_path, [])
    print(f"   ✅ Cargadas {len(data)} actividades")
    return data


def process_activities(
    activities: List[Dict[str, Any]],
    air_classifier: AirClassifier,
    age_extractor: AgeExtractor,
    batch_size: int = 32,
    existing_results: Dict[str, Dict] = None
) -> List[Dict[str, Any]]:
    """
    Procesa actividades enriqueciéndolas con campos de IA.
    
    Args:
        activities: Lista de actividades
        air_classifier: Clasificador de aire libre
        age_extractor: Extractor de edades
        batch_size: Tamaño de batch
        existing_results: Resultados existentes para saltar
        
    Returns:
        Lista de actividades enriquecidas
    """
    if existing_results is None:
        existing_results = {}
    
    enriched = []
    total = len(activities)
    processed = 0
    skipped = 0
    
    print(f"\n🚀 Procesando {total} actividades...")
    print(f"   Batch size: {batch_size}")
    print()
    
    start_time = time.time()
    
    for batch in batch_generator(activities, batch_size):
        batch_start = time.time()
        
        for activity in batch:
            app_id = activity.get('app_id') or activity.get('id')
            
            # Verificar si ya existe
            if app_id in existing_results:
                enriched.append(existing_results[app_id])
                skipped += 1
                continue
            
            # Preparar texto
            title = activity.get('title', '')
            description = activity.get('description', '')
            clean_desc = clean_text(description)
            
            # Si no hay descripción, usar título
            if not clean_desc and title:
                clean_desc = clean_text(title)
            
            # Clasificar aire libre
            try:
                es_aire_libre = air_classifier.classify_single(clean_desc, title)
            except Exception as e:
                print(f"   ⚠️ Error clasificando {app_id}: {e}")
                es_aire_libre = None
            
            # Extraer edades
            try:
                ages = age_extractor.extract_ages(clean_desc, title)
            except Exception as e:
                print(f"   ⚠️ Error extrayendo edades {app_id}: {e}")
                ages = {'edad_minima': None, 'edad_maxima': None}
            
            # Crear actividad enriquecida
            enriched_activity = {
                **activity,
                'es_aire_libre': es_aire_libre,
                'edad_minima': ages['edad_minima'],
                'edad_maxima': ages['edad_maxima']
            }
            
            enriched.append(enriched_activity)
            processed += 1
        
        # Progreso
        batch_time = time.time() - batch_start
        progress = len(enriched)
        percent = (progress / total) * 100
        elapsed = time.time() - start_time
        avg_time = elapsed / progress if progress > 0 else 0
        eta = avg_time * (total - progress)
        
        print(f"   📊 {progress}/{total} ({percent:.1f}%) | "
              f"Procesadas: {processed} | Saltadas: {skipped} | "
              f"Batch: {batch_time:.1f}s | ETA: {eta/60:.1f}min")
    
    total_time = time.time() - start_time
    print(f"\n✅ Procesamiento completado en {total_time/60:.1f} minutos")
    print(f"   Total: {len(enriched)} actividades")
    
    return enriched


def analyze_results(activities: List[Dict[str, Any]]) -> None:
    """Analiza y muestra estadísticas de los resultados."""
    print("\n📊 ESTADÍSTICAS DE RESULTADOS")
    print("=" * 50)
    
    total = len(activities)
    if total == 0:
        print("   No hay actividades para analizar")
        return
    
    # es_aire_libre
    aire_libre_count = sum(1 for a in activities if a.get('es_aire_libre') is True)
    interior_count = sum(1 for a in activities if a.get('es_aire_libre') is False)
    unknown_count = sum(1 for a in activities if a.get('es_aire_libre') is None)
    
    print(f"\n🌳 Aire Libre:")
    print(f"   Sí: {aire_libre_count} ({aire_libre_count/total*100:.1f}%)")
    print(f"   No: {interior_count} ({interior_count/total*100:.1f}%)")
    print(f"   Desconocido: {unknown_count} ({unknown_count/total*100:.1f}%)")
    
    # Edades
    with_min = sum(1 for a in activities if a.get('edad_minima') is not None)
    with_max = sum(1 for a in activities if a.get('edad_maxima') is not None)
    with_both = sum(1 for a in activities 
                    if a.get('edad_minima') is not None and a.get('edad_maxima') is not None)
    
    print(f"\n👶 Edades:")
    print(f"   Con edad mínima: {with_min} ({with_min/total*100:.1f}%)")
    print(f"   Con edad máxima: {with_max} ({with_max/total*100:.1f}%)")
    print(f"   Con ambas: {with_both} ({with_both/total*100:.1f}%)")
    
    # Distribución de edades
    min_ages = [a['edad_minima'] for a in activities if a.get('edad_minima') is not None]
    max_ages = [a['edad_maxima'] for a in activities if a.get('edad_maxima') is not None]
    
    if min_ages:
        print(f"   Edad mínima promedio: {sum(min_ages)/len(min_ages):.1f}")
    if max_ages:
        print(f"   Edad máxima promedio: {sum(max_ages)/len(max_ages):.1f}")


def main():
    """Función principal."""
    args = parse_args()
    
    print("=" * 60)
    print("🤖 ENRIQUECIMIENTO IA DE ACTIVIDADES")
    print("=" * 60)
    print(f"⏰ Inicio: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # Cargar actividades
    activities = load_activities(args.input)
    
    if not activities:
        print("❌ No se encontraron actividades para procesar")
        sys.exit(1)
    
    # Limitar para testing si es necesario
    if args.limit:
        print(f"⚠️ Modo testing: limitado a {args.limit} actividades")
        activities = activities[:args.limit]
    
    # Cargar resultados existentes si se especificó
    existing_results = {}
    if args.skip_existing and os.path.exists(args.output):
        print(f"📂 Cargando resultados existentes desde: {args.output}")
        existing_data = load_json(args.output, [])
        for act in existing_data:
            app_id = act.get('app_id') or act.get('id')
            if app_id:
                existing_results[app_id] = act
        print(f"   ✅ {len(existing_results)} actividades ya procesadas")
    
    # Inicializar modelos
    print("\n🧠 Inicializando modelos de IA...")
    air_classifier = AirClassifier(device="cpu")
    age_extractor = AgeExtractor(device="cpu")
    
    # Procesar actividades
    enriched = process_activities(
        activities,
        air_classifier,
        age_extractor,
        batch_size=args.batch_size,
        existing_results=existing_results
    )
    
    # Analizar resultados
    analyze_results(enriched)
    
    # Guardar resultado
    print(f"\n💾 Guardando resultado en: {args.output}")
    os.makedirs(os.path.dirname(args.output), exist_ok=True)
    save_json_atomic(args.output, enriched)
    print(f"   ✅ Guardado {len(enriched)} actividades")
    
    # Subir a Firebase si se solicitó
    if args.upload:
        print("\n☁️ Subiendo a Firebase...")
        config = get_firebase_config()
        
        if PYREBASE_AVAILABLE and config.get("storageBucket"):
            try:
                import pyrebase
                firebase = pyrebase.initialize_app(config)
                storage = firebase.storage()
                
                url = upload_to_firebase(
                    storage,
                    args.output,
                    "actividades_procesadas_ia.json"
                )
                
                if url:
                    print(f"   ✅ Subido correctamente")
                else:
                    print(f"   ❌ Error al subir")
            except Exception as e:
                print(f"   ❌ Error: {e}")
        else:
            print("   ⚠️ Firebase no disponible o configuración incompleta")
    
    print("\n" + "=" * 60)
    print(f"⏰ Fin: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)


if __name__ == "__main__":
    main()
