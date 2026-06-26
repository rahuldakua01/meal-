from fastapi import APIRouter, Depends,Form,UploadFile,File
from services.meal import create_breakfast,create_lunch,create_dinner
from core.dependency import admin_requird,get_db
from schemas.meal import MealCreate1,MealCreate2,MealCreate3
from sqlalchemy.orm import Session
from typing import Optional
from services.meal import update_breakfast,update_lunch,update_dinner
from services.subscription_service import expire_subscriptions
from services.admin_service import get_active_users
from models.user import User
from sqlalchemy import func
from models.subscription import Subscription




router = APIRouter(prefix="/admin",tags=["Admin"])


@router.get("/dashboard")
def admin_dashboard(admin_user=Depends(admin_requird),db:Session=Depends(get_db)):

    expire_subscriptions(db)
    total_students = db.query(User).count()
    
    active_plans = db.query(User).filter(User.status == "Active").count()

    monthly_revenue = db.query(func.sum(Subscription.price)).scalar() or 0
    

    return {
        "total_students": total_students,
        "active_plans": active_plans,
        "monthly_revenue": monthly_revenue
    }




@router.post("/add_breakfast")
async def breakfast(
    day : str=Form(...),
    name : str=Form(...),
    catagory : str=Form(...),
    calories : int=Form(...),
    description : str=Form(...),
    image : Optional[UploadFile]=File(None),
    # imageurl : Optional[str]=Form(None),
    current_user : Session=Depends(admin_requird),
    db : Session=Depends(get_db)
    ):
    return await create_breakfast(
        day = day,
        name = name,
        catagory = catagory,
        calories = calories,
        description = description,
        image = image,
        # imageurl = imageurl,
        db = db
    )



@router.post("/add_lunch")
async def lunch(
    day : str=Form(...),
    name : str=Form(...),
    catagory : str=Form(...),
    calories : int=Form(...),
    description : str=Form(...),
    image : Optional[UploadFile]=File(None),
    # imageurl : Optional[str]=Form(None),
    current_user : Session=Depends(admin_requird),
    db:Session=Depends(get_db)
    ):
    return await create_lunch(
        day = day,
        name = name,
        catagory = catagory,
        calories = calories,
        description = description,
        image = image,
        # imageurl = imageurl,
        db = db
    )



@router.post("/add_dinner")
async def dinner(
    day : str=Form(...),
    name : str=Form(...),
    catagory : str=Form(...),
    calories : int=Form(...),
    description : str=Form(...),
    image : Optional[UploadFile]=File(None),
    # imageurl : Optional[str]=Form(None),
    current_user : Session=Depends(admin_requird),
    db:Session=Depends(get_db)
    ):
    return await create_dinner(
        day = day,
        name = name,
        catagory = catagory,
        calories = calories,
        description = description,
        image = image,
        # imageurl = imageurl,
        db = db
    )


@router.put("/update_breakfast/{meal_day}/{meal_catagory}")
async def update_breakfast_api(
    meal_day : str,
    meal_catagory : str,
    name: str = Form(...),
    calories : int=Form(...),
    description : str=Form(...),
    image : Optional[UploadFile]=File(None),
    current_user=Depends(admin_requird),
    db: Session = Depends(get_db)
):
    return await update_breakfast(
        meal_day=meal_day,
        meal_catagory = meal_catagory,
        name=name,
        calories = calories,
        description = description,
        image=image,
        db=db
    )


@router.put("/update_lunch/{meal_day}/{meal_catagory}")
async def update_lunch_api(
    meal_day : str,
    meal_catagory : str,
    name: str = Form(...),
    calories : int=Form(...),
    description : str=Form(...),
    image : Optional[UploadFile]=File(None),
    current_user=Depends(admin_requird),
    db: Session = Depends(get_db)
):
    return await update_lunch(
        meal_day=meal_day,
        meal_catagory = meal_catagory,
        name=name,
        calories = calories,
        description = description,
        image=image,
        db=db
    )


@router.put("/update_dinner/{meal_day}/{meal_catagory}")
async def update_dinner_api(
    meal_day : str,
    meal_catagory : str,
    name: str = Form(...),
    calories : int=Form(...),
    description : str=Form(...),
    image : Optional[UploadFile]=File(None),
    current_user=Depends(admin_requird),
    db: Session = Depends(get_db)
):
    return await update_dinner(
        meal_day=meal_day,
        meal_catagory = meal_catagory,
        name=name,
        calories = calories,
        description = description,
        image=image,
        db=db
    )


@router.get("/user_view")
def active_user(current_user:Session=Depends(admin_requird),db:Session=Depends(get_db)):
    return get_active_users(db)