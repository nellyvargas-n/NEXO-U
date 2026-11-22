"""Supresión de métricas cuando los recuentos son demasiado pequeños."""


def privacy_safe_count(count: int, minimum: int = 5) -> int | None:
    """Evita exponer recuentos pequeños de alumnos identificables."""
    if count < 0 or minimum < 1:
        raise ValueError('Conteo o umbral inválido')
    return count if count >= minimum else None
