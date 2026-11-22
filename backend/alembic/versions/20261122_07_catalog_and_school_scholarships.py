"""Carga catálogo institucional y becas escolares verificadas.

Revision ID: 20261122_07
Revises: 20261122_06
"""
from datetime import date

from alembic import op
import sqlalchemy as sa

revision = "20261122_07"
down_revision = "20261122_06"
branch_labels = None
depends_on = None

CHECKED_ON = date(2026, 11, 22)
DEMO_SOURCE = "NEXO-U · Becas privadas"
DEMO_TITLE = "Beca por rendimiento escolar"

OPPORTUNITIES = [
    {
        "title": "300 Becas para Bachilleres 2026",
        "category": "beca",
        "deadline": date(2026, 11, 30),
        "official_url": "https://forms.gle/S7F2r8zsERb95WRu7",
        "amount_bob": 0,
        "source_name": "Universidad Central (UNICEN)",
        "source_kind": "institucion_oficial",
        "source_url": "https://unicen.edu.bo/noticias/300-becas-para-bachilleres-unicen-abre-convocatoria-2026-para-iniciar-una-carrera-universitaria/",
        "source_checked_on": CHECKED_ON,
        "summary": (
            "Convocatoria nacional para jóvenes de la promoción 2026 que quieren iniciar una carrera. "
            "UNICEN anuncia 300 becas con modalidades deportiva, cultural, anticipada, familiar y "
            "Bachiller Técnico Humanístico. La publicación no da un porcentaje único de descuento; "
            "consulta las condiciones de cada modalidad en el formulario oficial."
        ),
        "requirements": [("graduation_year", "eq", "2026")],
    },
    {
        "title": "Convocatoria de Becas 1-2027",
        "category": "beca",
        "deadline": date(2026, 11, 27),
        "official_url": "https://usalesiana.edu.bo/principal/banner/1400/",
        "amount_bob": 0,
        "source_name": "Universidad Salesiana de Bolivia",
        "source_kind": "institucion_oficial",
        "source_url": "https://usalesiana.edu.bo/principal/banner/1400/",
        "source_checked_on": CHECKED_ON,
        "summary": (
            "Postulaciones del 16 al 27 de noviembre de 2026 en La Paz, Cochabamba, Muyurina, "
            "Camiri, San Carlos y Yacuiba. El aviso indica que se ingresa por la plataforma del "
            "código QR, se adquiere el formulario en la pasarela habilitada y se entrega la documentación. "
            "El aviso consultado no publica porcentaje, monto ni requisitos académicos detallados."
        ),
        "requirements": [],
    },
    {
        "title": "Pasantía Protección de la Niñez — Plan 4000",
        "category": "pasantia",
        "deadline": date(2026, 11, 27),
        "official_url": "https://lnkd.in/dfi8ejzW",
        "amount_bob": 0,
        "source_name": "World Vision Bolivia",
        "source_kind": "canal_oficial",
        "source_url": "https://bo.linkedin.com/company/worldvisionbolivia",
        "source_checked_on": CHECKED_ON,
        "summary": (
            "Cuatro vacantes con base en el municipio Plan 4000, Santa Cruz. El aviso oficial pide "
            "ser mayor de 18 años y acepta universitarios o egresados de Ciencias Sociales, Psicología, "
            "Sociología, Trabajo Social, Educación, Comunicación, Derecho y ramas afines; también "
            "menciona miembros de iglesias y profesores. Incluye facilitar talleres y dinámicas grupales. "
            "El aviso consultado no especifica remuneración."
        ),
        "requirements": [("age", "range", "18-120")],
    },
    {
        "title": "Pasante — Área Comercial (Cochabamba)",
        "category": "pasantia",
        "deadline": date(2026, 11, 27),
        "official_url": "https://www.trabajopolis.bo/trabajo/1239923/pasante-area-comercial",
        "amount_bob": 0,
        "source_name": "Digicorp Ltda.",
        "source_kind": "bolsa_trabajo",
        "source_url": "https://www.trabajopolis.bo/trabajo/1239923/pasante-area-comercial",
        "source_checked_on": CHECKED_ON,
        "summary": (
            "Aviso publicado en Trabajopolis para Cochabamba, con vencimiento el 27 de noviembre de 2026. "
            "Busca estudiantes de últimos semestres o recién egresados de Ingeniería Comercial, Técnico "
            "Comercial, Administración de Empresas o carreras afines; la carta de pasantía es deseable. "
            "La bolsa indica que no paga salario y ofrece bono de transporte."
        ),
        "requirements": [],
    },
    {
        "title": "Pasante — Área Comercial (El Alto)",
        "category": "pasantia",
        "deadline": date(2026, 12, 17),
        "official_url": "https://www.trabajopolis.bo/trabajo/1240695/pasante-area-comercial",
        "amount_bob": 0,
        "source_name": "Digicorp Ltda.",
        "source_kind": "bolsa_trabajo",
        "source_url": "https://www.trabajopolis.bo/trabajo/1240695/pasante-area-comercial",
        "source_checked_on": CHECKED_ON,
        "summary": (
            "Aviso publicado en Trabajopolis para la sucursal de El Alto, con vencimiento el 17 de diciembre de 2026. "
            "Busca estudiantes de últimos semestres o recién egresados de Ingeniería Comercial, Técnico Comercial, "
            "Administración de Empresas o carreras afines; solicita disponibilidad de horario de oficina. "
            "La bolsa indica que no paga salario y ofrece bono de transporte."
        ),
        "requirements": [],
    },
]

COURSES = [
    {
        "title": "De Experto Técnico a Vendedor Consultivo en Entornos B2B",
        "start_date": date(2026, 11, 23), "end_date": date(2026, 11, 27),
        "cost_bob": 900, "credential_kind": "skill", "credential_value": "Venta consultiva B2B",
        "credential_level": None, "duration_hours": 9, "delivery_mode": "hibrido", "is_demo": False,
        "issuer": "CENACE — UPSA", "source_name": "CENACE — UPSA", "source_kind": "institucion_oficial",
        "official_url": "https://formularios.upsa.edu.bo/formCenaceRegistro/?curso=12490",
        "source_url": "https://cenace.upsa.edu.bo/index.php/detalle-curso/de-experto-tecnico-a-vendedor-consultivo-en-entornos-b2b",
        "source_checked_on": CHECKED_ON,
        "summary": "Del 23 al 27 de noviembre de 2026, 9 horas reloj, modalidad presencial u online, Bs 900. Taller de venta consultiva.",
    },
    {
        "title": "Excel Intermedio/Avanzado (27/11/2026)",
        "start_date": date(2026, 11, 27), "end_date": date(2026, 12, 11),
        "cost_bob": 850, "credential_kind": "certificate", "credential_value": "Excel Intermedio/Avanzado",
        "credential_level": None, "duration_hours": 21, "delivery_mode": "hibrido", "is_demo": False,
        "issuer": "CENACE — UPSA", "source_name": "CENACE — UPSA", "source_kind": "institucion_oficial",
        "official_url": "https://cenace.upsa.edu.bo/detalle-curso/excel-intermedioavanzado-27112026",
        "source_url": "https://cenace.upsa.edu.bo/detalle-curso/excel-intermedioavanzado-27112026",
        "source_checked_on": CHECKED_ON,
        "summary": "Del 27 de noviembre al 11 de diciembre de 2026, 21 horas reloj, presencial u online, Bs 850. Requiere conocimientos previos de Excel.",
    },
    {
        "title": "META ADS con Propósito",
        "start_date": date(2026, 12, 1), "end_date": date(2026, 12, 10),
        "cost_bob": 1100, "credential_kind": "skill", "credential_value": "Marketing digital con Meta Ads",
        "credential_level": None, "duration_hours": 12, "delivery_mode": "hibrido", "is_demo": False,
        "issuer": "CENACE — UPSA", "source_name": "CENACE — UPSA", "source_kind": "institucion_oficial",
        "official_url": "https://formularios.upsa.edu.bo/formCenaceRegistro/?curso=12492",
        "source_url": "https://cenace.upsa.edu.bo/index.php/detalle-curso/meta-ads-con-proposito",
        "source_checked_on": CHECKED_ON,
        "summary": "Del 1 al 10 de diciembre de 2026, 12 horas reloj, modalidad presencial u online, Bs 1.100. El precio ya no incluye el descuento por pronta inscripción vencido el 19 de noviembre.",
    },
    {
        "title": "Concept Art para Videojuegos y Cine",
        "start_date": date(2026, 12, 1), "end_date": date(2026, 12, 15),
        "cost_bob": 900, "credential_kind": "certificate", "credential_value": "Concept Art para Videojuegos y Cine",
        "credential_level": None, "duration_hours": 20, "delivery_mode": "presencial", "is_demo": False,
        "issuer": "CENACE — UPSA", "source_name": "CENACE — UPSA", "source_kind": "institucion_oficial",
        "official_url": "https://formularios.upsa.edu.bo/formCenaceRegistro/?curso=12491",
        "source_url": "https://cenace.upsa.edu.bo/detalle-curso/concept-art-para-videojuegos-y-cine",
        "source_checked_on": CHECKED_ON,
        "summary": "Del 1 al 15 de diciembre de 2026, 20 horas reloj, modalidad presencial, Bs 900. Dirigido a estudiantes y profesionales de diseño, ilustración y animación.",
    },
    {
        "title": "Introduction to Cybersecurity",
        "start_date": None, "end_date": None, "cost_bob": 0,
        "credential_kind": "skill", "credential_value": "Ciberseguridad básica", "credential_level": "beginner",
        "duration_hours": 6, "delivery_mode": "asincrono", "is_demo": False,
        "issuer": "Cisco Networking Academy", "source_name": "Cisco Networking Academy",
        "source_kind": "institucion_oficial",
        "official_url": "https://www.netacad.com/courses/introduction-to-cybersecurity",
        "source_url": "https://www.netacad.com/courses/introduction-to-cybersecurity",
        "source_checked_on": CHECKED_ON,
        "summary": "Curso gratuito y auto-dirigido de unas 6 horas con 7 laboratorios, sin prerrequisitos. Adecuado también para estudiantes de secundaria.",
    },
]

PROGRAMS = [
    {
        "title": "Programa Beca a la Excelencia Académica",
        "category": "beca", "deadline": None,
        "official_url": "https://www.univalle.edu/wp-content/uploads/2026/04/BECA-A-LA-EXCELENCIA-ACADEMICA_V3.pdf",
        "amount_bob": 0, "is_demo": False,
        "source_name": "Universidad Privada del Valle (UNIVALLE)", "source_kind": "canal_oficial",
        "source_url": "https://www.univalle.edu/wp-content/uploads/2026/04/BECA-A-LA-EXCELENCIA-ACADEMICA_V3.pdf",
        "source_checked_on": CHECKED_ON,
        "summary": (
            "Programa institucional, no una convocatoria con fecha de cierre vigente. El protocolo oficial V.3 "
            "indica 50% para promedio 70–79, 60% para 80–89 y 70% para 90–100, calculado con 4.º y 5.º de secundaria. "
            "Matemáticas no figura como criterio. La universidad determina fechas y cupos de cada convocatoria; "
            "el perfil NEXO-U solo permite una estimación orientativa."
        ),
        "requirements": [("average_grade", ">=", "70")],
        "bands": [(50, "70.00", "0.00"), (60, "80.00", "0.00"), (70, "90.00", "0.00")],
    },
    {
        "title": "Beca Fundación UPSA",
        "category": "beca", "deadline": None,
        "official_url": "https://www.upsa.edu.bo/comunidad-upsa/becas-y-ayuda-financiera/",
        "amount_bob": 0, "is_demo": False,
        "source_name": "Universidad Privada de Santa Cruz de la Sierra (UPSA)", "source_kind": "canal_oficial",
        "source_url": "https://www.upsa.edu.bo/comunidad-upsa/becas-y-ayuda-financiera/",
        "source_checked_on": CHECKED_ON,
        "summary": (
            "Programa para nuevos estudiantes: la página oficial publica una ayuda de 20% a 50% del semestre, "
            "con promedio mínimo 70/100 en los últimos cuatro años y evaluación socioeconómica. No publica "
            "una fórmula que asigne el porcentaje exacto según promedio o Matemáticas; por eso NEXO-U no inventa una banda. "
            "Confirma fechas y requisitos directamente con UPSA."
        ),
        "requirements": [("average_grade", ">=", "70"), ("financial_report", "required", "Informe socioeconómico")],
        "bands": [],
    },
]

DEMO = {
    "title": DEMO_TITLE,
    "category": "beca",
    "deadline": date(2027, 11, 22),
    "official_url": "",
    "amount_bob": 0,
    "is_demo": True,
    "source_name": DEMO_SOURCE,
    "source_kind": "demostracion",
    "source_url": None,
    "source_checked_on": None,
    "summary": (
        "Escala totalmente ficticia para probar becas escolares de ingreso a universidades privadas. "
        "Los porcentajes, requisitos y fecha de cierre son de demostración: ninguna universidad los ha publicado ni garantizado."
    ),
    "requirements": [("average_grade", ">=", "75"), ("math_grade", ">=", "70")],
    "bands": [(25, "75.00", "70.00"), (40, "85.00", "80.00"),
              (60, "90.00", "85.00"), (80, "95.00", "90.00")],
}


def _tables():
    opportunity = sa.table(
        "opportunities", sa.column("id", sa.Integer), sa.column("title", sa.String),
        sa.column("category", sa.String), sa.column("deadline", sa.Date),
        sa.column("official_url", sa.String), sa.column("amount_bob", sa.Float),
        sa.column("is_demo", sa.Boolean), sa.column("source_name", sa.String),
        sa.column("source_kind", sa.String), sa.column("summary", sa.Text),
        sa.column("source_url", sa.String), sa.column("source_checked_on", sa.Date),
    )
    course = sa.table(
        "courses", sa.column("id", sa.Integer), sa.column("title", sa.String),
        sa.column("start_date", sa.Date), sa.column("end_date", sa.Date),
        sa.column("cost_bob", sa.Float), sa.column("credential_kind", sa.String),
        sa.column("credential_value", sa.String), sa.column("credential_level", sa.String),
        sa.column("duration_hours", sa.Integer), sa.column("delivery_mode", sa.String),
        sa.column("is_demo", sa.Boolean), sa.column("issuer", sa.String),
        sa.column("source_name", sa.String), sa.column("source_kind", sa.String),
        sa.column("summary", sa.Text), sa.column("official_url", sa.String),
        sa.column("source_url", sa.String), sa.column("source_checked_on", sa.Date),
    )
    requirement = sa.table(
        "requirements", sa.column("id", sa.Integer), sa.column("opportunity_id", sa.Integer),
        sa.column("kind", sa.String), sa.column("operator", sa.String),
        sa.column("value", sa.String), sa.column("mandatory", sa.Boolean),
    )
    band = sa.table(
        "scholarship_bands", sa.column("id", sa.Integer),
        sa.column("opportunity_id", sa.Integer), sa.column("percent_discount", sa.Integer),
        sa.column("min_average", sa.Numeric(5, 2)), sa.column("min_math", sa.Numeric(5, 2)),
        sa.column("official_published", sa.Boolean), sa.column("approved_by_admin", sa.Boolean),
        sa.column("official_url", sa.String),
    )
    return opportunity, course, requirement, band


def _upsert_opportunity(bind, table, requirements, bands, data):
    values = {key: value for key, value in data.items() if key not in ("requirements", "bands")}
    opportunity_id = bind.execute(sa.select(table.c.id).where(
        table.c.source_name == values["source_name"], table.c.title == values["title"]
    )).scalar_one_or_none()
    if opportunity_id is None:
        opportunity_id = bind.execute(table.insert().values(**values).returning(table.c.id)).scalar_one()
    else:
        bind.execute(table.update().where(table.c.id == opportunity_id).values(**values))

    for kind, operator, value in data.get("requirements", []):
        exists = bind.execute(sa.select(requirements.c.id).where(
            requirements.c.opportunity_id == opportunity_id,
            requirements.c.kind == kind, requirements.c.operator == operator,
            requirements.c.value == value,
        )).first()
        if exists is None:
            bind.execute(requirements.insert().values(
                opportunity_id=opportunity_id, kind=kind, operator=operator,
                value=value, mandatory=True,
            ))

    for percent, minimum_average, minimum_math in data.get("bands", []):
        existing = bind.execute(sa.select(bands.c.id).where(
            bands.c.opportunity_id == opportunity_id, bands.c.percent_discount == percent,
        )).scalar_one_or_none()
        band_values = {
            "min_average": minimum_average, "min_math": minimum_math,
            "official_published": not values["is_demo"],
            # Curated rules are reviewed against the directly linked official source.
            # Institution-submitted bands still pass through the admin review endpoint.
            "approved_by_admin": False,
            "official_url": values["official_url"] if not values["is_demo"] else "",
        }
        if existing is None:
            bind.execute(bands.insert().values(
                opportunity_id=opportunity_id, percent_discount=percent, **band_values,
            ))
        else:
            bind.execute(bands.update().where(bands.c.id == existing).values(**band_values))


def upgrade():
    op.alter_column("opportunities", "deadline", existing_type=sa.Date(), nullable=True)
    bind = op.get_bind()
    opportunity, course, requirement, band = _tables()

    for item in OPPORTUNITIES + PROGRAMS + [DEMO]:
        _upsert_opportunity(bind, opportunity, requirement, band, item)

    for item in COURSES:
        values = dict(item)
        course_id = bind.execute(sa.select(course.c.id).where(
            course.c.source_name == values["source_name"], course.c.title == values["title"]
        )).scalar_one_or_none()
        if course_id is None:
            bind.execute(course.insert().values(**values))
        else:
            bind.execute(course.update().where(course.c.id == course_id).values(**values))


def downgrade():
    bind = op.get_bind()
    opportunity = sa.table(
        "opportunities", sa.column("id", sa.Integer), sa.column("title", sa.String),
        sa.column("source_name", sa.String), sa.column("deadline", sa.Date),
    )
    seeded = sa.select(opportunity.c.id).where(sa.or_(
        sa.and_(opportunity.c.source_name == "Universidad Privada del Valle (UNIVALLE)",
                opportunity.c.title == "Programa Beca a la Excelencia Académica"),
        sa.and_(opportunity.c.source_name == "Universidad Privada de Santa Cruz de la Sierra (UPSA)",
                opportunity.c.title == "Beca Fundación UPSA"),
        sa.and_(opportunity.c.source_name == DEMO_SOURCE, opportunity.c.title == DEMO_TITLE),
    ))
    ids = list(bind.execute(seeded).scalars())
    if ids:
        saved = sa.table("saved_opportunities", sa.column("opportunity_id", sa.Integer))
        saved_count = bind.execute(sa.select(sa.func.count()).select_from(saved).where(
            saved.c.opportunity_id.in_(ids)
        )).scalar()
        if saved_count:
            raise RuntimeError("No se revierte la migración: una beca ya fue guardada por estudiantes.")
        bands = sa.table("scholarship_bands", sa.column("opportunity_id", sa.Integer))
        requirements = sa.table("requirements", sa.column("opportunity_id", sa.Integer))
        bind.execute(bands.delete().where(bands.c.opportunity_id.in_(ids)))
        bind.execute(requirements.delete().where(requirements.c.opportunity_id.in_(ids)))
        bind.execute(opportunity.delete().where(opportunity.c.id.in_(ids)))

    null_count = bind.execute(sa.text("SELECT count(*) FROM opportunities WHERE deadline IS NULL")).scalar()
    if null_count:
        raise RuntimeError("No se revierte deadline nullable: aún hay oportunidades sin fecha de cierre.")
    op.alter_column("opportunities", "deadline", existing_type=sa.Date(), nullable=False)
