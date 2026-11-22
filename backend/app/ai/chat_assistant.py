"""Asistente local de preguntas frecuentes, disponible sin Gemini.

No genera decisiones de elegibilidad ni emplea información privada.
"""
from app.ai.safety import clean_question

ANSWERS = (
    (("beca", "descuento"), "El porcentaje de beca se estima solo cuando la institución publicó reglas verificables y fueron aprobadas. La institución decide la adjudicación."),
    (("inglés", "ingles", "b1", "idioma"), "El nivel requerido está en 'operator' del requisito (por ejemplo B1). Solo se recomienda un curso válido que termine antes del cierre."),
    (("curso", "capacitación", "capacitacion"), "Consulta las rutas de cursos de tu matching. La credencial solo queda verificada cuando la organización emisora valida la inscripción."),
    (("empresa", "organización", "organizacion"), "Las organizaciones verificadas pueden publicar convocatorias y validar la finalización de sus propios cursos. No pueden consultar finanzas de estudiantes."),
    (("contraseña", "contrasena", "login", "sesión"), "Nunca compartas contraseñas, claves de Neon o tokens JWT. Usa la API de autenticación de NEXO U."),
    (("plata", "dinero", "saldo", "finanza"), "La billetera financiera es opcional para estudiantes universitarios adultos y no se comparte con empresas."),
)


def answer_question(question: str) -> dict:
    text = clean_question(question)
    normalized = text.casefold()
    response = next((answer for words, answer in ANSWERS if any(w in normalized for w in words)),
                    "NEXO U compara tu perfil con requisitos publicados, explica lo que falta y muestra rutas para avanzar. Consulta siempre la fuente oficial.")
    return {'answer': response, 'source': 'orientacion_local', 'generative_ai_used': False}
