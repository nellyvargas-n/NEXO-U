"""Carga idempotente de convocatorias públicas revisadas en fuentes externas.

No crea usuarios ni organizaciones, y no marca emisores externos como verificados.
Ejecutar después de la migración: python -m scripts.seed_curated_catalog
"""
from datetime import date
from sqlalchemy import select

from app.core.database import SessionLocal
from app.models.entities import Course, Opportunity, Requirement

CHECKED_ON = date(2026, 11, 22)

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
        "start_date": date(2026, 11, 23),
        "end_date": date(2026, 11, 27),
        "cost_bob": 900,
        "credential_kind": "skill",
        "credential_value": "Venta consultiva B2B",
        "credential_level": None,
        "issuer": "CENACE — UPSA",
        "source_name": "CENACE — UPSA",
        "source_kind": "institucion_oficial",
        "official_url": "https://formularios.upsa.edu.bo/formCenaceRegistro/?curso=12490",
        "source_url": "https://cenace.upsa.edu.bo/index.php/detalle-curso/de-experto-tecnico-a-vendedor-consultivo-en-entornos-b2b",
        "source_checked_on": CHECKED_ON,
        "summary": (
            "Del 23 al 27 de noviembre de 2026, 9 horas reloj, modalidad presencial u online, Bs 900. "
            "Taller para perfiles técnico-comerciales que practican diagnóstico de necesidades y venta consultiva."
        ),
    },
    {
        "title": "Excel Intermedio/Avanzado (27/11/2026)",
        "start_date": date(2026, 11, 27),
        "end_date": date(2026, 12, 11),
        "cost_bob": 850,
        "credential_kind": "certificate",
        "credential_value": "Excel Intermedio/Avanzado",
        "credential_level": None,
        "issuer": "CENACE — UPSA",
        "source_name": "CENACE — UPSA",
        "source_kind": "institucion_oficial",
        "official_url": "https://cenace.upsa.edu.bo/detalle-curso/excel-intermedioavanzado-27112026",
        "source_url": "https://cenace.upsa.edu.bo/detalle-curso/excel-intermedioavanzado-27112026",
        "source_checked_on": CHECKED_ON,
        "summary": (
            "Del 27 de noviembre al 11 de diciembre de 2026, 21 horas reloj, presencial u online, Bs 850. "
            "Requiere conocimientos operativos previos de Excel. CENACE informa certificado digital de aprobación "
            "con mínimo 80% de asistencia y nota 70/100."
        ),
    },
    {
        "title": "META ADS con Propósito",
        "start_date": date(2026, 12, 1),
        "end_date": date(2026, 12, 10),
        "cost_bob": 1100,
        "credential_kind": "skill",
        "credential_value": "Marketing digital con Meta Ads",
        "credential_level": None,
        "issuer": "CENACE — UPSA",
        "source_name": "CENACE — UPSA",
        "source_kind": "institucion_oficial",
        "official_url": "https://formularios.upsa.edu.bo/formCenaceRegistro/?curso=12492",
        "source_url": "https://cenace.upsa.edu.bo/index.php/detalle-curso/meta-ads-con-proposito",
        "source_checked_on": CHECKED_ON,
        "summary": (
            "Del 1 al 10 de diciembre de 2026, 12 horas reloj, modalidad presencial u online, Bs 1.100. "
            "Incluye configuración de Business Manager, campañas, audiencias y KPIs. El descuento por pronta "
            "inscripción terminó el 19 de noviembre; se registra el precio vigente publicado, sin ese descuento."
        ),
    },
    {
        "title": "Concept Art para Videojuegos y Cine",
        "start_date": date(2026, 12, 1),
        "end_date": date(2026, 12, 15),
        "cost_bob": 900,
        "credential_kind": "certificate",
        "credential_value": "Concept Art para Videojuegos y Cine",
        "credential_level": None,
        "issuer": "CENACE — UPSA",
        "source_name": "CENACE — UPSA",
        "source_kind": "institucion_oficial",
        "official_url": "https://formularios.upsa.edu.bo/formCenaceRegistro/?curso=12491",
        "source_url": "https://cenace.upsa.edu.bo/detalle-curso/concept-art-para-videojuegos-y-cine",
        "source_checked_on": CHECKED_ON,
        "summary": (
            "Del 1 al 15 de diciembre de 2026, 20 horas reloj, modalidad presencial, Bs 900. "
            "Dirigido a estudiantes y profesionales de diseño, ilustración, arte digital y animación, y a principiantes. "
            "UPSA informa certificado digital de asistencia con mínimo 80% de asistencia."
        ),
    },
    {
        "title": "Introduction to Cybersecurity",
        "end_date": None,
        "cost_bob": 0,
        "credential_kind": "skill",
        "credential_value": "Ciberseguridad básica",
        "credential_level": "beginner",
        "issuer": "Cisco Networking Academy",
        "source_name": "Cisco Networking Academy",
        "source_kind": "institucion_oficial",
        "official_url": "https://www.netacad.com/courses/introduction-to-cybersecurity",
        "source_url": "https://www.netacad.com/courses/introduction-to-cybersecurity",
        "source_checked_on": CHECKED_ON,
        "summary": (
            "Curso gratuito, auto-dirigido, nivel inicial, de unas 6 horas con 7 laboratorios. "
            "Cisco indica que no tiene prerrequisitos y que es adecuado para estudiantes de secundaria, "
            "estudiantes universitarios de ciclo corto y público general; se puede obtener una insignia digital."
        ),
    },
]


def upsert_opportunity(db, data):
    requirements = data.pop("requirements")
    row = db.scalar(select(Opportunity).where(
        Opportunity.source_name == data["source_name"], Opportunity.title == data["title"]))
    if row is None:
        row = Opportunity(is_demo=False, **data)
        db.add(row)
        db.flush()
    else:
        for key, value in data.items():
            setattr(row, key, value)
        row.is_demo = False
    for kind, operator, value in requirements:
        existing = db.scalar(select(Requirement).where(
            Requirement.opportunity_id == row.id,
            Requirement.kind == kind,
            Requirement.operator == operator,
            Requirement.value == value,
        ))
        if existing is None:
            db.add(Requirement(opportunity_id=row.id, kind=kind, operator=operator,
                               value=value, mandatory=True))


def upsert_course(db, data):
    row = db.scalar(select(Course).where(
        Course.source_name == data["source_name"], Course.title == data["title"]))
    if row is None:
        db.add(Course(**data))
    else:
        for key, value in data.items():
            setattr(row, key, value)


def main():
    with SessionLocal() as db:
        try:
            for item in OPPORTUNITIES:
                upsert_opportunity(db, item.copy())
            for item in COURSES:
                upsert_course(db, item)
            db.commit()
        except Exception:
            db.rollback()
            raise
        print(f"Catálogo revisado: {len(OPPORTUNITIES)} convocatorias y {len(COURSES)} cursos.")


if __name__ == "__main__":
    main()
