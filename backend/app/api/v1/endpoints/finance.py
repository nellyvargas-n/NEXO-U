"""Punto de importación para las rutas reales en student_features.py.

El router principal registra cada ruta una sola vez, evitando duplicados.
"""
from .student_features import get_entries, create_entry, delete_entry

__all__ = ['get_entries', 'create_entry', 'delete_entry']
