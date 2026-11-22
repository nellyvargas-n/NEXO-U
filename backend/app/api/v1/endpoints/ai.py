"""Rutas reales de orientación educativa sin decisiones de IA."""
from fastapi import APIRouter, Depends, Query
from app.schemas.ai import QuestionRequest
from sqlalchemy.orm import Session
from app.core.auth_jwt import require_role
from app.core.database import get_db
from app.models.access import AppUser
from app.services.matching_service import evaluate
from app.ai.chat_assistant import answer_question
from app.ai.course_recommender import courses_for_missing_requirements
from app.ai.matching_assistant import summarize_matches

router = APIRouter(tags=['Orientación educativa (reglas locales)'])

@router.get('/asistente/estado')
def assistant_status():
    return {'status': 'available', 'type': 'reglas_locales', 'generative_ai_used': False,
            'note': 'El matching y las becas NO dependen de un modelo generativo.'}

@router.post('/usuario/asistente/preguntar')
def ask_question(body: QuestionRequest, user: AppUser = Depends(require_role('usuario'))):
    return answer_question(body.question)

@router.get('/usuario/rutas')
def my_routes(limit: int = Query(default=20, ge=1, le=100),
              user: AppUser = Depends(require_role('usuario')), db: Session = Depends(get_db)):
    matches = evaluate(db, student_user_id=user.id)
    return courses_for_missing_requirements(matches, limit=limit)

@router.get('/usuario/match/resumen')
def my_matching_summary(user: AppUser = Depends(require_role('usuario')), db: Session = Depends(get_db)):
    return summarize_matches(evaluate(db, student_user_id=user.id))
