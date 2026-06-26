from pydantic import BaseModel


class MealCreate1(BaseModel):
    day : str
    name : str
    category : str
    calories : int
    description : str

class MealCreate2(BaseModel):
    day : str
    name : str
    category : str
    calories : int
    description : str

class MealCreate3(BaseModel):
    day : str
    name : str
    category : str
    calories : int
    description : str