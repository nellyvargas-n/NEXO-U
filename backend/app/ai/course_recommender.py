"""Rutas por criterio, costo y fecha; NO publicidad ni comisión."""


def courses_for_missing_requirements(matches: list[dict], limit: int = 20) -> list[dict]:
    """Produce filas útiles para React exclusivamente a partir del matching verificado."""
    routes = []
    for match in matches:
        for requirement in match.get('requirements', []):
            if requirement.get('status') != 'falta':
                continue
            for course in requirement.get('courses', []):
                routes.append({
                    'opportunity_id': match['opportunity_id'],
                    'opportunity_title': match['title'],
                    'opportunity_deadline': match['deadline'],
                    'required_kind': requirement.get('kind'),
                    'operator': requirement.get('operator'),
                    'required': requirement.get('required'),
                    'required_level': requirement.get('required_level'),
                    'course_id': course['id'],
                    'course_title': course['title'],
                    'course_end_date': course['ends_on'],
                    'course_cost_bob': course['cost_bob'],
                    'course_credential_level': course.get('credential_level'),
                    'is_demo': bool(match.get('is_demo', False)),
                })
    return sorted(routes, key=lambda r: (r['opportunity_deadline'], r['course_cost_bob'], r['course_end_date']))[:limit]
