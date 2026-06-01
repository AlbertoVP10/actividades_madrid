"""
Utilidades de procesamiento de texto.
"""

import re
from typing import List, Generator, Any


def clean_text(text: str) -> str:
    """
    Limpia y normaliza el texto para procesamiento.
    
    Args:
        text: Texto a limpiar
        
    Returns:
        Texto limpio
    """
    if not text:
        return ""
    
    # Eliminar HTML
    text = re.sub(r'<[^>]+>', '', text)
    
    # Normalizar espacios
    text = re.sub(r'\s+', ' ', text)
    
    # Eliminar caracteres especiales pero mantener acentos
    text = re.sub(r'[^\w\sáéíóúÁÉÍÓÚñÑ.,;:!?()-]', '', text)
    
    return text.strip()


def batch_generator(items: List[Any], batch_size: int) -> Generator[List[Any], None, None]:
    """
    Genera batches de una lista para procesamiento eficiente.
    
    Args:
        items: Lista de elementos
        batch_size: Tamaño de cada batch
        
    Yields:
        Batches de elementos
    """
    for i in range(0, len(items), batch_size):
        yield items[i:i + batch_size]


def truncate_text(text: str, max_length: int = 400) -> str:
    """
    Trunca el texto a una longitud máxima segura.
    
    Args:
        text: Texto a truncar
        max_length: Longitud máxima
        
    Returns:
        Texto truncado
    """
    if len(text) <= max_length:
        return text
    
    # Truncar en el último espacio antes del límite
    truncated = text[:max_length]
    last_space = truncated.rfind(' ')
    
    if last_space > 0:
        truncated = truncated[:last_space]
    
    return truncated + "..."
