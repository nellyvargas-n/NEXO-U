"""Punto de importación para las rutas reales en secure_workspace.py.

El router principal registra cada ruta una sola vez, evitando duplicados.
"""
from .secure_workspace import my_enrollments, enroll

__all__ = ['my_enrollments', 'enroll']
