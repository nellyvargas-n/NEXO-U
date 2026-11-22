"""Punto de importación para las rutas reales en community_features.py.

El router principal registra cada ruta una sola vez, evitando duplicados.
"""
from .community_features import add_comment, get_comments

__all__ = ['add_comment', 'get_comments']
