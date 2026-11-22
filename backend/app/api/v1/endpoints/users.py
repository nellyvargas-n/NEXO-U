"""Punto de importación para las rutas reales en role_access.py.

El router principal registra cada ruta una sola vez, evitando duplicados.
"""
from .role_access import me, list_users

__all__ = ['me', 'list_users']
