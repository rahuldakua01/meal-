from fastapi import APIRouter
from api import auth,admin,subscribe,menu,payment,plan


api_router = APIRouter()


api_router.include_router(auth.router)
api_router.include_router(admin.router)
api_router.include_router(plan.router)
api_router.include_router(menu.router)
api_router.include_router(subscribe.router)
api_router.include_router(payment.router)