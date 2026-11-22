"""Cliente OPCIONAL de Gemini para explicar textos públicos, nunca decidir matches.

NEXO U funciona sin esta integración. No pases datos personales, finanzas,
credenciales privadas, secretos ni información sobre menores a este cliente.
"""
from __future__ import annotations
import httpx
from app.core.config import settings
from app.ai.prompts import PUBLIC_EXPLANATION_RULES
from app.ai.safety import redact_sensitive


class AIUnavailable(RuntimeError):
    """Gemini no está configurado o no devuelve una explicación usable."""


class GeminiClient:
    def __init__(self, key: str | None = None, model: str | None = None):
        self.key = key if key is not None else settings.gemini_api_key
        self.model = model or settings.gemini_model

    @property
    def enabled(self) -> bool:
        return bool(self.key)

    def explain_public_text(self, public_text: str) -> str:
        """Genera SOLO una explicación de una convocatoria pública sin PII.

        Método opt-in: la API principal no lo llama automáticamente.
        """
        if not self.enabled:
            raise AIUnavailable('Gemini no configurado; el matching local sigue disponible')
        if not public_text or len(public_text) > 1800:
            raise ValueError('Proporciona un texto público breve de hasta 1800 caracteres')
        cleaned = redact_sensitive(public_text)
        # Rechaza indicios de datos sensibles en vez de transmitir su versión oculta.
        if cleaned != public_text:
            raise ValueError('El texto contiene información sensible: no se envió al proveedor')
        payload = {'contents': [{'parts': [{'text': f'{PUBLIC_EXPLANATION_RULES}\n\nConvocatoria pública:\n{public_text}'}]}],
                   'generationConfig': {'temperature': 0.1, 'maxOutputTokens': 400}}
        try:
            with httpx.Client(timeout=15) as client:
                response = client.post(
                    f'https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent',
                    headers={'x-goog-api-key': self.key}, json=payload)
                response.raise_for_status()
                data = response.json()
            return data['candidates'][0]['content']['parts'][0]['text']
        except (httpx.HTTPError, KeyError, IndexError, TypeError) as exc:
            raise AIUnavailable('No fue posible obtener la explicación opcional') from exc
