"""
Modelos de IA para enriquecimiento de actividades.
"""

from .zero_shot import AirClassifier
from .qa_age import AgeExtractor

__all__ = ['AirClassifier', 'AgeExtractor']
