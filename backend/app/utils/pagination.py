"""Cotas de paginación para consultas ORM."""
def sanitize_pagination(limit:int=50,offset:int=0)->tuple[int,int]:
    return min(max(1,int(limit)),100),max(0,int(offset))
