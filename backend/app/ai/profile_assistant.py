"""Siguientes pasos basados en el estado del perfil, sin inferencia opaca."""


def profile_next_steps(profile_type: str, has_profile: bool, credential_count: int) -> list[str]:
    if not has_profile:
        return ["Completa tu perfil escolar o universitario para evaluar oportunidades."]
    steps = []
    if credential_count == 0:
        steps.append("Añade habilidades o certificados que puedas demostrar.")
    if profile_type == "colegial":
        steps.append("Consulta becas con criterios oficiales publicados; el resultado no es una adjudicación.")
    else:
        steps.append("Consulta el matching y revisa si hay cursos que terminan antes de cada convocatoria.")
    return steps
