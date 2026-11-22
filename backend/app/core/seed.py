from datetime import date,timedelta
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.entities import Profile, Credential, Opportunity, Requirement, Course, Transaction

def seed(db:Session):
    if db.scalar(select(Profile.id).limit(1)) is not None:
        return
    today=date.today()
    db.add(Profile(id=1,name="Camila Rojas",career="Ingeniería de Sistemas",semester=6,age=21,city="La Paz"))
    db.add(Credential(student_id=1,kind="skill",value="Python",verified=False))
    db.add(Opportunity(id=1,title="Pasantía de Sistemas",category="pasantía",deadline=today+timedelta(days=30),official_url="",amount_bob=0,is_demo=True))
    for kind,operator,value in [("career","in","Ingeniería de Sistemas|Informática"),("semester",">=","5"),("age","between","18-25"),("skill","has","Python"),("language","B1","Inglés")]:
        db.add(Requirement(opportunity_id=1,kind=kind,operator=operator,value=value))
    db.add(Course(id=1,title="Inglés B1: fundamentos del idioma",end_date=today+timedelta(days=14),cost_bob=0,credential_kind="language",credential_value="Inglés",credential_level="B1",issuer="Academia Nexo U",is_demo=True))
    db.add(Transaction(student_id=1,amount_bob=420,category="saldo inicial",date=today))
    db.commit()
