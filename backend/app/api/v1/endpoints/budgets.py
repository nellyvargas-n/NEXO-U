"""Punto de importación para las rutas reales en student_features.py.

El router principal registra cada ruta una sola vez, evitando duplicados.
"""
from .student_features import budgets, upsert_budget

__all__ = ['budgets', 'upsert_budget']
