from datetime import date
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.entities import Profile, Credential, Opportunity, Requirement, Course

LEVELS = {"A1":1,"A2":2,"B1":3,"B2":4,"C1":5,"C2":6}

def matches_requirement(req, profile, credentials):
    if req.kind == "career":
        return profile.career.casefold() in [x.strip().casefold() for x in req.value.split("|")]
    if req.kind == "semester":
        return profile.semester >= int(req.value)
    if req.kind == "age":
        low, high = map(int, req.value.split("-"))
        return low <= profile.age <= high
    if req.kind in ("skill", "language", "certificate"):
        for c in credentials:
            if c.kind != req.kind or c.value.casefold() != req.value.casefold():
                continue
            if req.kind == "language":
                if LEVELS.get((c.level or "").upper(),0) >= LEVELS.get(req.operator.upper(),99):
                    return True
            else:
                return True
    return False

def recommended_courses(req, courses, deadline):
    if req.kind not in ("skill", "language", "certificate"):
        return []
    result=[]
    for course in courses:
        if course.end_date > deadline or course.credential_kind != req.kind or course.credential_value.casefold() != req.value.casefold():
            continue
        if req.kind == "language" and LEVELS.get((course.credential_level or "").upper(),0) < LEVELS.get(req.operator.upper(),99):
            continue
        result.append({"id":course.id,"title":course.title,"ends_on":course.end_date.isoformat(),"cost_bob":course.cost_bob})
    return sorted(result,key=lambda c:(c["cost_bob"],c["ends_on"]))

def evaluate(db:Session, student_id:int=1):
    profile=db.get(Profile,student_id)
    if not profile:
        return []
    credentials=db.scalars(select(Credential).where(Credential.student_id==student_id)).all()
    courses=db.scalars(select(Course)).all()
    results=[]
    for opportunity in db.scalars(select(Opportunity)).all():
        requirements=db.scalars(select(Requirement).where(Requirement.opportunity_id==opportunity.id,Requirement.mandatory.is_(True))).all()
        checks=[]
        for req in requirements:
            ok=matches_requirement(req,profile,credentials)
            checks.append({"kind":req.kind,"required":req.value,"status":"cumple" if ok else "falta","courses":[] if ok else recommended_courses(req,courses,opportunity.deadline)})
        total=len(checks); met=sum(x["status"]=="cumple" for x in checks)
        results.append({"opportunity_id":opportunity.id,"title":opportunity.title,"deadline":opportunity.deadline.isoformat(),"met":met,"total":total,"percent":round(100*met/total) if total else 100,"eligible":met==total,"requirements":checks})
    return results
