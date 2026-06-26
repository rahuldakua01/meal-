from fastapi import HTTPException
from core.dependency import user_requird
from sqlalchemy.orm import Session
import os
from models.meal import Meal1,Meal2,Meal3


async def create_breakfast(day,name,catagory,calories,description,image,db:Session):
    
    
    if image:
        os.makedirs("upload",exist_ok=True)
        file_path = f"upload/{image.filename}"
        with open(file_path , "wb") as buffer:
            buffer.write(await image.read())
        img_val = file_path
    else:
        img_val = image or 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600'

    meal = Meal1(
        day = day,
        name = name,
        category = catagory,
        calories = calories,
        description = description,
        image = img_val
    )

    db.add(meal)
    db.commit()
    db.refresh(meal)

    return {"Message" : "Breakfast add Successfully"}




async def create_lunch(day,name,catagory,calories,description,image,db:Session):
    
    
    if image:
        os.makedirs("upload",exist_ok=True)
        file_path = f"upload/{image.filename}"
        with open(file_path , "wb") as buffer:
            buffer.write(await image.read())
        img_val = file_path
    else:
        img_val = image or 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600'

    meal = Meal2(
        day = day,
        name = name,
        category = catagory,
        calories = calories,
        description = description,
        image = img_val
    )

    db.add(meal)
    db.commit()
    db.refresh(meal)

    return {"Message" : "Lunch add Successfully"}



async def create_dinner(day,name,catagory,calories,description,image,db:Session):
    
    
    if image:
        os.makedirs("upload",exist_ok=True)
        file_path = f"upload/{image.filename}"
        with open(file_path , "wb") as buffer:
            buffer.write(await image.read())
        img_val = file_path
    else:
        img_val = image or 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600'

    meal = Meal3(
        day = day,
        name = name,
        category = catagory,
        calories = calories,
        description = description,
        image = img_val
    )

    db.add(meal)
    db.commit()
    db.refresh(meal)

    return {"Message" : "Dinner add Successfully"}



async def update_breakfast(meal_day : str,meal_catagory : str,name: str,image,calories:int,description:str,db: Session):

    meal = db.query(Meal1).filter((Meal1.day == meal_day) & (Meal1.category == meal_catagory)).first()

    if not meal:
        raise HTTPException(
            status_code=404,
            detail="Meal not Found"
        )

    meal.name = name
    meal.calories = calories
    meal.description = description

    if image:
        if meal.image and os.path.exists(meal.image):
            try:
                os.remove(meal.image)
            except Exception as e:
                print(f"Failed to delete old image file: {e}")
        os.makedirs("upload", exist_ok=True)
        file_path = f"upload/{image.filename}"
        with open(file_path, "wb") as buffer:
            buffer.write(await image.read())
        meal.image = file_path

    db.commit()
    db.refresh(meal)

    return {
        "Message": "Breakfast updated Successfully"
    }



async def update_lunch(meal_day : str,meal_catagory : str,name: str,calories:int,description:str,image,db: Session):

    meal = db.query(Meal2).filter((Meal2.day == meal_day) & (Meal2.category == meal_catagory)).first()

    if not meal:
        raise HTTPException(
            status_code=404,
            detail="Meal not Found"
        )

    meal.name = name
    meal.calories = calories
    meal.description = description

    if image:
        if meal.image and os.path.exists(meal.image):
            try:
                os.remove(meal.image)
            except Exception as e:
                print(f"Failed to delete old image file: {e}")
        os.makedirs("upload", exist_ok=True)
        file_path = f"upload/{image.filename}"
        with open(file_path, "wb") as buffer:
            buffer.write(await image.read())
        meal.image = file_path

    db.commit()
    db.refresh(meal)

    return {
        "Message": "Lunch updated Successfully"
    }



async def update_dinner(meal_day : str,meal_catagory : str,name: str,calories:int,description:str,image,db: Session):

    meal = db.query(Meal3).filter((Meal3.day == meal_day) & (Meal3.category == meal_catagory)).first()

    if not meal:
        raise HTTPException(
            status_code=404,
            detail="Meal not Found"
        )

    meal.name = name
    meal.calories = calories
    meal.description = description

    if image:
        if meal.image and os.path.exists(meal.image):
            try:
                os.remove(meal.image)
            except Exception as e:
                print(f"Failed to delete old image file: {e}")
        os.makedirs("upload", exist_ok=True)
        file_path = f"upload/{image.filename}"
        with open(file_path, "wb") as buffer:
            buffer.write(await image.read())
        meal.image = file_path

    db.commit()
    db.refresh(meal)

    return {
        "Message": "Dinner updated Successfully"
    }