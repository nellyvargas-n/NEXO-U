"""Punto de importación para las rutas reales en role_access.py.

El router principal registra cada ruta una sola vez, evitando duplicados.
"""
from .role_access import list_users, change_user, verify_org

__all__ = ['list_users', 'change_user', 'verify_org']
