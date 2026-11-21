from types import SimpleNamespace
from app.services.matching_service import matches_requirement,recommended_courses

def obj(**kwargs): return SimpleNamespace(**kwargs)

def test_missing_language():
    p=obj(career="Ingeniería de Sistemas",semester=6,age=21)
    req=obj(kind="language",value="Inglés",operator="B1")
    assert not matches_requirement(req,p,[])
    assert matches_requirement(req,p,[obj(kind="language",value="Inglés",level="B1")])

def test_course_must_finish_before_deadline():
    from datetime import date
    req=obj(kind="language",value="Inglés",operator="B1")
    course=obj(id=1,title="B1",end_date=date(2027,2,1),cost_bob=0,credential_kind="language",credential_value="Inglés",credential_level="B1")
    assert recommended_courses(req,[course],date(2027,1,1)) == []
