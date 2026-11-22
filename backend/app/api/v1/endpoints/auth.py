"""Punto de importación para las rutas reales en role_access.py.

El router principal registra cada ruta una sola vez, evitando duplicados.
"""
from .role_access import register, login, me, change_password

__all__ = ['register', 'login', 'me', 'change_password']
