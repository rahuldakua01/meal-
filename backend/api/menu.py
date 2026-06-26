from fastapi import APIRouter,Depends
from sqlalchemy.orm import Session
from core.dependency import get_db
from services.menu_service import get_today_menu,get_day_menu,get_weekly_menu


router = APIRouter(prefix="/menu", tags=["Menu"])


@router.get("/weekly")
def weekly_menu(db:Session=Depends(get_db)):
    return get_weekly_menu(db)


@router.get("/today_menu")
def today_menu(db:Session=Depends(get_db)):
    return get_today_menu(db)


@router.get("/menu/{day}")
def day_menu(day:str,db:Session=Depends(get_db)):
    return get_day_menu(day,db)