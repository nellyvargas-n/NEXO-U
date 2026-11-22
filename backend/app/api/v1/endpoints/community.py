"""Punto de importación para las rutas reales en community_features.py.

El router principal registra cada ruta una sola vez, evitando duplicados.
"""
from .community_features import list_posts, create_post

__all__ = ['list_posts', 'create_post']
