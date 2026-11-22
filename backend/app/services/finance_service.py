from datetime import date, timedelta
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.entities import Transaction

def reach(db:Session,student_id:int=1, daily_expense:float=30.0, reserve:float=0.0):
    transactions=db.scalars(select(Transaction).where(Transaction.student_id==student_id)).all()
    balance=round(sum(t.amount_bob for t in transactions),2)
    if daily_expense <= 0:
        return {"balance_bob":balance,"daily_expense_bob":daily_expense,"last_day":None,"note":"Sin gasto diario positivo no hay fecha estimable"}
    days=max(0,int((balance-reserve)//daily_expense))
    return {"balance_bob":balance,"daily_expense_bob":daily_expense,"last_day":(date.today()+timedelta(days=days)).isoformat(),"days":days,"note":"Estimación con gasto diario fijo; no es un pronóstico financiero"}
