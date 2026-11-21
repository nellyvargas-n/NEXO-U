"""Utilidades puras para ventanas de convocatorias."""
from datetime import date

def days_until(deadline:date,today:date|None=None)->int:
    return (deadline-(today or date.today())).days
