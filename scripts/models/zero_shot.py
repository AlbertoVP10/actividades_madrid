"""
Clasificación Zero-Shot para determinar si una actividad es al aire libre.
Usa distilbert-base-uncased-finetuned-sst-2-english para clasificación de texto.
"""

import torch
import numpy as np
from typing import List, Dict, Union
from transformers import AutoTokenizer, AutoModelForSequenceClassification


class AirClassifier:
    """
    Clasificador para determinar si una actividad ocurre al aire libre.
    Usa un modelo ligero de transformers optimizado para CPU.
    """
    
    # Modelo mediano recomendado: DistilBERT para clasificación
    MODEL_NAME = "distilbert-base-uncased-finetuned-sst-2-english"
    
    # Labels para zero-shot
    CANDIDATE_LABELS = ["aire libre", "interior"]
    
    def __init__(self, device: str = "cpu"):
        """
        Inicializa el clasificador cargando el modelo.
        
        Args:
            device: "cpu" o "cuda" (forzamos CPU para GitHub Actions)
        """
        self.device = device
        print(f"🤖 Cargando modelo de clasificación: {self.MODEL_NAME}")
        
        # Cargar tokenizer y modelo
        self.tokenizer = AutoTokenizer.from_pretrained(self.MODEL_NAME)
        self.model = AutoModelForSequenceClassification.from_pretrained(
            self.MODEL_NAME,
            torch_dtype=torch.float32  # Usar float32 para CPU
        )
        self.model.to(device)
        self.model.eval()  # Modo evaluación para inferencia
        
        print(f"✅ Modelo cargado en {device}")
    
    def _prepare_text(self, text: str, title: str = "") -> str:
        """
        Prepara el texto combinando título y descripción.
        
        Args:
            text: Descripción de la actividad
            title: Título de la actividad
            
        Returns:
            Texto preparado para clasificación
        """
        # Combinar título y descripción para más contexto
        combined = f"{title}. {text}" if title else text
        
        # Truncar a 512 tokens (límite de DistilBERT)
        # Aproximadamente 400 caracteres es seguro
        if len(combined) > 400:
            combined = combined[:400]
        
        return combined
    
    def classify_single(self, text: str, title: str = "") -> bool:
        """
        Clasifica una única actividad.
        
        Args:
            text: Descripción de la actividad
            title: Título de la actividad
            
        Returns:
            True si es al aire libre, False si es interior
        """
        prepared_text = self._prepare_text(text, title)
        
        # Tokenizar
        inputs = self.tokenizer(
            prepared_text,
            return_tensors="pt",
            truncation=True,
            max_length=512,
            padding=True
        )
        inputs = {k: v.to(self.device) for k, v in inputs.items()}
        
        # Inferencia
        with torch.no_grad():
            outputs = self.model(**inputs)
            probabilities = torch.softmax(outputs.logits, dim=-1)
            
        # Interpretar resultado
        # Usamos palabras clave en el texto como heurística adicional
        text_lower = prepared_text.lower()
        outdoor_keywords = [
            'aire libre', 'exterior', 'parque', 'jardín', 'plaza', 'calle',
            'patio', 'terraza', 'al aire libre', 'outdoor', 'fuera',
            'exterior', 'naturaleza', 'campo', 'montaña', 'playa'
        ]
        indoor_keywords = [
            'interior', 'sala', 'teatro', 'auditorio', 'museo', 'biblioteca',
            'indoor', 'dentro', 'cubierto', 'pabellón', 'centro cultural'
        ]
        
        outdoor_score = sum(1 for kw in outdoor_keywords if kw in text_lower)
        indoor_score = sum(1 for kw in indoor_keywords if kw in text_lower)
        
        # Combinar predicción del modelo con heurística de palabras clave
        model_score = probabilities[0][1].item()  # Probabilidad de clase positiva
        
        # Ajustar score basado en palabras clave
        keyword_bonus = (outdoor_score - indoor_score) * 0.1
        final_score = model_score + keyword_bonus
        
        return final_score > 0.5
    
    def classify_batch(self, texts: List[str], titles: List[str] = None) -> List[bool]:
        """
        Clasifica un batch de actividades para mayor eficiencia.
        
        Args:
            texts: Lista de descripciones
            titles: Lista de títulos (opcional)
            
        Returns:
            Lista de booleanos (True = aire libre)
        """
        if titles is None:
            titles = [""] * len(texts)
        
        results = []
        for text, title in zip(texts, titles):
            result = self.classify_single(text, title)
            results.append(result)
        
        return results
