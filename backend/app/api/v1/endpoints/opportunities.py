"""Punto de importación para las rutas reales en institution_features.py.

El router principal registra cada ruta una sola vez, evitando duplicados.
"""
from .institution_features import public_opportunities, my_opportunities

__all__ = ['public_opportunities', 'my_opportunities']
