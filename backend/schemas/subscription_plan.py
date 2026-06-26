from pydantic import BaseModel

class PlanCreated(BaseModel):
    name : str
    price : int