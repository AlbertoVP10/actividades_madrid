"""
Extracción de edades usando Question Answering.
Usa distilbert-base-cased-distilled-squad para extraer edad mínima y máxima.
"""

import re
import torch
from typing import Dict, Optional, Tuple, List
from transformers import AutoTokenizer, AutoModelForQuestionAnswering


class AgeExtractor:
    """
    Extractor de edades mínima y máxima usando QA.
    Usa un modelo mediano de transformers optimizado para CPU.
    """
    
    # Modelo mediano recomendado: DistilBERT para QA
    MODEL_NAME = "distilbert-base-cased-distilled-squad"
    
    def __init__(self, device: str = "cpu"):
        """
        Inicializa el extractor cargando el modelo.
        
        Args:
            device: "cpu" o "cuda" (forzamos CPU para GitHub Actions)
        """
        self.device = device
        print(f"🤖 Cargando modelo QA: {self.MODEL_NAME}")
        
        # Cargar tokenizer y modelo
        self.tokenizer = AutoTokenizer.from_pretrained(self.MODEL_NAME)
        self.model = AutoModelForQuestionAnswering.from_pretrained(
            self.MODEL_NAME,
            torch_dtype=torch.float32
        )
        self.model.to(device)
        self.model.eval()
        
        print(f"✅ Modelo QA cargado en {device}")
    
    def _extract_with_regex(self, text: str) -> Tuple[Optional[int], Optional[int]]:
        """
        Extrae edades usando expresiones regulares como respaldo.
        
        Args:
            text: Texto a analizar
            
        Returns:
            Tupla (edad_mínima, edad_máxima)
        """
        text_lower = text.lower()
        
        # Patrones comunes de edad
        patterns = [
            # "de X a Y años"
            r'(?:de|desde)\s*(\d+)\s*(?:a|hasta)\s*(\d+)\s*(?:años|año)',
            # "X a Y años"
            r'(\d+)\s*(?:a|hasta)\s*(\d+)\s*(?:años|año)',
            # "mayores de X" / "desde X años"
            r'(?:mayores?\s+de|desde|a\s+partir\s+de)\s*(\d+)\s*(?:años|año)',
            # "hasta X años" / "menores de X"
            r'(?:hasta|menores?\s+de)\s*(\d+)\s*(?:años|año)',
            # "X+ años"
            r'(\d+)\+\s*(?:años|año)',
            # "edad: X-Y"
            r'edad[:\s]+(\d+)\s*[-a]\s*(\d+)',
            # "niños de X a Y"
            r'niños?\s+(?:de\s+)?(\d+)\s*(?:a|hasta)\s*(\d+)',
            # "para X-Y años"
            r'para\s+(\d+)\s*[-a]\s*(\d+)\s*(?:años|año)',
        ]
        
        min_age = None
        max_age = None
        
        for pattern in patterns:
            matches = re.findall(pattern, text_lower)
            for match in matches:
                if isinstance(match, tuple):
                    # Patrón con dos grupos (rango)
                    ages = [int(x) for x in match if x.isdigit()]
                    if len(ages) >= 2:
                        min_age = min(ages[0], ages[1])
                        max_age = max(ages[0], ages[1])
                    elif len(ages) == 1:
                        if min_age is None:
                            min_age = ages[0]
                        else:
                            max_age = ages[0]
                else:
                    # Patrón con un grupo
                    age = int(match)
                    if 'mayor' in text_lower or 'desde' in text_lower or '+' in text_lower:
                        min_age = age
                    elif 'hasta' in text_lower or 'menor' in text_lower:
                        max_age = age
                    elif min_age is None:
                        min_age = age
                    else:
                        max_age = age
        
        return min_age, max_age
    
    def _extract_with_qa(self, text: str, title: str = "") -> Tuple[Optional[int], Optional[int]]:
        """
        Extrae edades usando Question Answering.
        
        Args:
            text: Descripción de la actividad
            title: Título de la actividad
            
        Returns:
            Tupla (edad_mínima, edad_máxima)
        """
        # Preparar contexto
        context = f"{title}. {text}" if title else text
        if len(context) > 500:
            context = context[:500]
        
        min_age = None
        max_age = None
        
        # Preguntas para edad mínima
        min_questions = [
            "¿Cuál es la edad mínima?",
            "¿Desde qué edad?",
            "¿Para mayores de cuántos años?",
            "¿Cuál es la edad mínima recomendada?"
        ]
        
        # Preguntas para edad máxima
        max_questions = [
            "¿Cuál es la edad máxima?",
            "¿Hasta qué edad?",
            "¿Para menores de cuántos años?",
            "¿Cuál es la edad máxima permitida?"
        ]
        
        # Extraer edad mínima
        for question in min_questions:
            try:
                inputs = self.tokenizer(
                    question,
                    context,
                    return_tensors="pt",
                    truncation=True,
                    max_length=512
                )
                inputs = {k: v.to(self.device) for k, v in inputs.items()}
                
                with torch.no_grad():
                    outputs = self.model(**inputs)
                
                # Obtener respuesta
                answer_start = torch.argmax(outputs.start_logits)
                answer_end = torch.argmax(outputs.end_logits) + 1
                
                if answer_end > answer_start:
                    answer_tokens = inputs['input_ids'][0][answer_start:answer_end]
                    answer = self.tokenizer.decode(answer_tokens, skip_special_tokens=True)
                    
                    # Extraer número de la respuesta
                    numbers = re.findall(r'\d+', answer)
                    if numbers:
                        min_age = int(numbers[0])
                        break
            except Exception as e:
                continue
        
        # Extraer edad máxima
        for question in max_questions:
            try:
                inputs = self.tokenizer(
                    question,
                    context,
                    return_tensors="pt",
                    truncation=True,
                    max_length=512
                )
                inputs = {k: v.to(self.device) for k, v in inputs.items()}
                
                with torch.no_grad():
                    outputs = self.model(**inputs)
                
                answer_start = torch.argmax(outputs.start_logits)
                answer_end = torch.argmax(outputs.end_logits) + 1
                
                if answer_end > answer_start:
                    answer_tokens = inputs['input_ids'][0][answer_start:answer_end]
                    answer = self.tokenizer.decode(answer_tokens, skip_special_tokens=True)
                    
                    numbers = re.findall(r'\d+', answer)
                    if numbers:
                        candidate = int(numbers[0])
                        # Asegurar que máxima > mínima
                        if min_age is None or candidate > min_age:
                            max_age = candidate
                            break
            except Exception as e:
                continue
        
        return min_age, max_age
    
    def extract_ages(self, text: str, title: str = "") -> Dict[str, Optional[int]]:
        """
        Extrae edades mínima y máxima combinando QA y regex.
        
        Args:
            text: Descripción de la actividad
            title: Título de la actividad
            
        Returns:
            Diccionario con 'edad_minima' y 'edad_maxima'
        """
        # Intentar regex primero (más rápido y preciso para patrones claros)
        min_regex, max_regex = self._extract_with_regex(text)
        
        # Si regex no encuentra, usar QA
        if min_regex is None and max_regex is None:
            min_qa, max_qa = self._extract_with_qa(text, title)
            return {
                'edad_minima': min_qa,
                'edad_maxima': max_qa
            }
        
        # Combinar resultados: preferir regex, completar con QA si es necesario
        min_age = min_regex
        max_age = max_regex
        
        if min_age is None or max_age is None:
            min_qa, max_qa = self._extract_with_qa(text, title)
            if min_age is None:
                min_age = min_qa
            if max_age is None:
                max_age = max_qa
        
        # Validar: máxima debe ser mayor que mínima
        if min_age is not None and max_age is not None and max_age <= min_age:
            # Probablemente solo hay una edad especificada
            max_age = None
        
        return {
            'edad_minima': min_age,
            'edad_maxima': max_age
        }
    
    def extract_batch(self, texts: List[str], titles: List[str] = None) -> List[Dict[str, Optional[int]]]:
        """
        Extrae edades de un batch de actividades.
        
        Args:
            texts: Lista de descripciones
            titles: Lista de títulos (opcional)
            
        Returns:
            Lista de diccionarios con edades
        """
        if titles is None:
            titles = [""] * len(texts)
        
        results = []
        for text, title in zip(texts, titles):
            result = self.extract_ages(text, title)
            results.append(result)
        
        return results
