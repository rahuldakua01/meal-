from pydantic import BaseModel
from typing import Optional

class SubscriptionCreate(BaseModel):
    meal_plan_name: str
    price : int
    plan_id: Optional[int] = None