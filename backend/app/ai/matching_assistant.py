"""Síntesis de resultados del motor determinista."""
from app.ai.opportunity_assistant import explain_match
from app.ai.course_recommender import courses_for_missing_requirements


def summarize_matches(matches: list[dict]) -> dict:
    """Resume oportunidades y rutas existentes; no concede credenciales."""
    return {
        'evaluated': len(matches),
        'eligible': sum(1 for match in matches if match.get('eligible')),
        'opportunities': [explain_match(m) for m in matches],
        'routes': courses_for_missing_requirements(matches),
    }
