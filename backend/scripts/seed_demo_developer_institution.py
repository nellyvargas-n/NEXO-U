"""Prepara contenido de cursos y oportunidades para el entorno de desarrollo.

Uso: ALLOW_DEMO_SEED=true python -m scripts.seed_demo_developer_institution
"""
from datetime import date, timedelta
import os
import secrets

from sqlalchemy import select

from app.core.auth_jwt import hash_password
from app.core.config import settings
from app.core.database import SessionLocal
from app.models.access import AppUser, Organization
from app.models.entities import Course, CourseLesson, Opportunity, Requirement
from app.models.extended import OrganizationCourse, OrganizationOpportunity

SOURCE = "Instituto Tecnológico NEXO-U"
LEGACY_SOURCE = "Instituto Tecnológico NEXO-U — DEMO"
OWNER_EMAIL = "instituto.demo@nexou.invalid"
OPPORTUNITY_TITLE = "Pasantía de Desarrollo de Software"
LEGACY_OPPORTUNITY_TITLE = "Pasantía de Desarrollo Backend y Frontend — DEMO"
REQUIREMENTS = [
    ("skill", "has", "Spring Boot"),
    ("skill", "has", "Angular"),
    ("skill", "has", "PostgreSQL"),
    ("skill", "has", "Linux"),
]

COURSES = [
    {
        "title": "Spring Boot: APIs REST y servicios",
        "skill": "Spring Boot",
        "duration_hours": 24,
        "cost_bob": 320,
        "summary": "Construye servicios web con Spring Boot, persistencia y pruebas para APIs REST.",
        "lessons": [
            ("Diseño de una API REST", "Organiza una aplicación Spring Boot por capas: controlador, servicio y repositorio. Define recursos y rutas REST, usa DTO para las entradas y devuelve códigos HTTP adecuados.\n\nPráctica: diseña GET /api/proyectos y POST /api/proyectos para una lista de proyectos."),
            ("Validación y persistencia", "Valida las entradas con Jakarta Validation y aplica reglas en la capa de servicio. Conecta una entidad con Spring Data JPA y controla los errores para evitar respuestas ambiguas.\n\nPráctica: persiste proyectos y responde 404 cuando no existe el identificador solicitado."),
            ("Pruebas y entrega", "Prueba el controlador y el servicio con casos correctos y fallidos. Documenta los endpoints y configura variables de entorno para que las credenciales no queden en el código.\n\nPráctica: agrega una prueba para POST /api/proyectos y registra cómo iniciar la aplicación."),
        ],
    },
    {
        "title": "Angular: interfaces y componentes web",
        "skill": "Angular",
        "duration_hours": 20,
        "cost_bob": 280,
        "summary": "Crea interfaces por componentes, consume servicios y valida formularios en Angular.",
        "lessons": [
            ("Componentes y plantillas", "Divide la interfaz en componentes con una responsabilidad clara. Usa propiedades para mostrar datos y eventos para comunicar acciones del usuario.\n\nPráctica: crea una tarjeta de oportunidad con título, institución y fecha límite."),
            ("Servicios y datos", "Centraliza las llamadas HTTP en servicios inyectables. Modela respuestas con tipos, representa estados de carga y muestra errores útiles cuando una solicitud falla.\n\nPráctica: conecta una lista de oportunidades a un endpoint REST y agrega búsqueda por título."),
            ("Formularios y calidad", "Usa formularios reactivos para validar campos y mostrar errores asociados a cada entrada. Comprueba navegación, accesibilidad por teclado y diseño adaptable.\n\nPráctica: valida un formulario de postulación y deshabilita el envío mientras se procesa."),
        ],
    },
    {
        "title": "PostgreSQL: consultas y modelado relacional",
        "skill": "PostgreSQL",
        "duration_hours": 16,
        "cost_bob": 220,
        "summary": "Modela datos relacionales y consulta información con PostgreSQL.",
        "lessons": [
            ("Tablas y relaciones", "Define tablas con claves primarias y foráneas. Elige tipos adecuados y agrega restricciones para proteger la consistencia de los datos.\n\nPráctica: modela estudiantes, cursos e inscripciones con una restricción única por estudiante y curso."),
            ("Consultas y agregaciones", "Combina tablas con JOIN, filtra con WHERE y resume datos con GROUP BY. Usa parámetros en lugar de concatenar valores recibidos por una aplicación.\n\nPráctica: consulta los cursos de cada estudiante y cuenta las inscripciones por curso."),
            ("Índices y transacciones", "Utiliza índices cuando aceleran filtros frecuentes y revisa el plan con EXPLAIN. Agrupa operaciones relacionadas en transacciones para evitar cambios parciales.\n\nPráctica: crea una inscripción y actualiza su estado dentro de una transacción."),
        ],
    },
    {
        "title": "Linux: terminal y fundamentos de servidores",
        "skill": "Linux",
        "duration_hours": 12,
        "cost_bob": 180,
        "summary": "Trabaja en la terminal, administra procesos y prepara servicios en Linux.",
        "lessons": [
            ("Archivos y permisos", "Navega con pwd, ls y cd; administra archivos con cp, mv y mkdir. Revisa permisos y aplica el mínimo acceso necesario a usuarios y grupos.\n\nPráctica: prepara un directorio de aplicación y limita el acceso a su archivo de configuración."),
            ("Procesos y servicios", "Inspecciona procesos, puertos y registros del sistema. Administra servicios con systemctl y consulta errores antes de reiniciar una aplicación.\n\nPráctica: identifica un servicio activo y encuentra sus últimos mensajes de registro."),
            ("Despliegue básico", "Configura variables de entorno, verifica conectividad y automatiza tareas repetibles con scripts sencillos. Evita guardar secretos en repositorios o archivos públicos.\n\nPráctica: escribe instrucciones de despliegue y valida que el servicio responda en el puerto esperado."),
        ],
    },
]


def get_or_create_opportunity(db, organization):
    opportunity = db.scalar(
        select(Opportunity)
        .join(OrganizationOpportunity, OrganizationOpportunity.opportunity_id == Opportunity.id)
        .where(OrganizationOpportunity.organization_id == organization.id)
        .order_by(Opportunity.id)
    )
    if opportunity is None:
        opportunity = db.scalar(select(Opportunity).where(
            Opportunity.title.in_([OPPORTUNITY_TITLE, LEGACY_OPPORTUNITY_TITLE]),
            Opportunity.source_name.in_([SOURCE, LEGACY_SOURCE]),
        ))
    fields = {
        "title": OPPORTUNITY_TITLE,
        "category": "pasantia",
        "deadline": date.today() + timedelta(days=60),
        "official_url": "",
        "amount_bob": 0,
        "is_demo": True,
        "source_name": SOURCE,
        "source_kind": "demostracion",
        "summary": "Programa de práctica en desarrollo de software con requisitos de Spring Boot, Angular, PostgreSQL y Linux.",
        "source_url": None,
        "source_checked_on": None,
    }
    if opportunity is None:
        opportunity = Opportunity(**fields)
        db.add(opportunity)
        db.flush()
    else:
        for key, value in fields.items():
            setattr(opportunity, key, value)

    existing = db.scalars(select(Requirement).where(Requirement.opportunity_id == opportunity.id)).all()
    wanted = set(REQUIREMENTS)
    found = {(row.kind, row.operator, row.value) for row in existing}
    for row in existing:
        if (row.kind, row.operator, row.value) not in wanted:
            db.delete(row)
    for kind, operator, value in REQUIREMENTS:
        if (kind, operator, value) not in found:
            db.add(Requirement(opportunity_id=opportunity.id, kind=kind, operator=operator,
                               value=value, mandatory=True))
    if db.get(OrganizationOpportunity, (organization.id, opportunity.id)) is None:
        db.add(OrganizationOpportunity(organization_id=organization.id, opportunity_id=opportunity.id))
    return opportunity


def get_or_create_courses(db, organization):
    linked_courses = db.scalars(
        select(Course)
        .join(OrganizationCourse, OrganizationCourse.course_id == Course.id)
        .where(OrganizationCourse.organization_id == organization.id)
    ).all()
    rows = []
    for spec in COURSES:
        course = next((row for row in linked_courses if row.credential_value.casefold() == spec["skill"].casefold()), None)
        if course is None:
            course = db.scalar(select(Course).where(
                Course.credential_kind == "skill",
                Course.credential_value == spec["skill"],
                Course.source_name.in_([SOURCE, LEGACY_SOURCE]),
            ))
        fields = {
            "title": spec["title"],
            "start_date": None,
            "end_date": None,
            "duration_hours": spec["duration_hours"],
            "delivery_mode": "asincrono",
            "is_demo": True,
            "cost_bob": spec["cost_bob"],
            "credential_kind": "skill",
            "credential_value": spec["skill"],
            "credential_level": None,
            "issuer": SOURCE,
            "source_name": SOURCE,
            "source_kind": "demostracion",
            "summary": spec["summary"],
            "official_url": None,
            "source_url": None,
            "source_checked_on": None,
        }
        if course is None:
            course = Course(**fields)
            db.add(course)
            db.flush()
        else:
            for key, value in fields.items():
                setattr(course, key, value)
        if db.get(OrganizationCourse, (organization.id, course.id)) is None:
            db.add(OrganizationCourse(organization_id=organization.id, course_id=course.id))
        _seed_lessons(db, course, spec["lessons"])
        rows.append(course)
    return rows


def _seed_lessons(db, course, lessons):
    existing = db.scalars(select(CourseLesson).where(CourseLesson.course_id == course.id)).all()
    by_position = {lesson.position: lesson for lesson in existing}
    for position, (title, body) in enumerate(lessons, start=1):
        lesson = by_position.pop(position, None)
        if lesson is None:
            db.add(CourseLesson(course_id=course.id, position=position, title=title, body=body))
        else:
            lesson.title = title
            lesson.body = body
    for lesson in by_position.values():
        db.delete(lesson)


def main():
    if os.getenv("ALLOW_DEMO_SEED", "").lower() != "true":
        raise SystemExit("BLOQUEADO: ejecuta con ALLOW_DEMO_SEED=true solo en desarrollo")
    if settings.environment == "production":
        raise SystemExit("BLOQUEADO: este contenido no se crea en producción")

    with SessionLocal() as db:
        try:
            owner = db.scalar(select(AppUser).where(AppUser.email == OWNER_EMAIL))
            if owner is None:
                owner = AppUser(email=OWNER_EMAIL, role="empresa", active=False,
                                password_hash=hash_password(secrets.token_urlsafe(32)))
                db.add(owner)
                db.flush()
            elif owner.role != "empresa":
                raise SystemExit("CONFLICTO: la cuenta reservada para la institución tiene otro rol")

            organization = db.scalar(select(Organization).where(Organization.owner_user_id == owner.id))
            if organization is None:
                organization = Organization(owner_user_id=owner.id, name=SOURCE, verified=False)
                db.add(organization)
                db.flush()
            elif organization.verified:
                raise SystemExit("CONFLICTO: la institución de preparación no debe figurar como verificada")
            else:
                organization.name = SOURCE

            opportunity = get_or_create_opportunity(db, organization)
            courses = get_or_create_courses(db, organization)
            db.commit()
        except Exception:
            db.rollback()
            raise

        print(f"Institución #{organization.id}; oportunidad #{opportunity.id}; {len(courses)} cursos disponibles.")
        for course in courses:
            print(f"- {course.credential_value}: {course.cost_bob:.0f} Bs, {course.duration_hours} h")


if __name__ == "__main__":
    main()
