"""Explicaciones deterministas de requisitos por convocatoria."""


def explain_match(result: dict) -> dict:
    """Explica el porcentaje sin transformar requisitos desconocidos en cumplidos."""
    checks = result.get('requirements', [])
    unmet = [x for x in checks if x.get('status') != 'cumple']
    met = int(result.get('met', 0))
    total = int(result.get('total', 0))
    if total <= 0:
        explanation = 'No hay criterios obligatorios publicados suficientes para calcular compatibilidad.'
    elif not unmet:
        explanation = f'Cumples los {total} requisitos declarados. La institución decide la admisión final.'
    else:
        explanation = f'Cumples {met} de {total} requisitos. Revisa los faltantes antes de postular.'
    return {'opportunity_id': result.get('opportunity_id'), 'explanation': explanation,
            'pending': [{'kind': c.get('kind'), 'operator': c.get('operator'),
                         'value': c.get('required'), 'status': c.get('status')}
                        for c in unmet]}
