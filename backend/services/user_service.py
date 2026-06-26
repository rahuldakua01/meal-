from sqlalchemy.orm import Session
from models.user import User
from models.subscription import Subscription
from fastapi import HTTPException
from core.security import get_hash_password,verify_password,create_access_token,token_access
from schemas.user import UserRole
from datetime import timedelta
from services.mail_service import send_verification_email
# from services.subscription_service import check_subscription



async def register_user(data, db:Session):
    existing_user = db.query(User).filter((User.mail == data.mail) | (User.phone == data.phone)).first()
    if existing_user:
        raise HTTPException(
            status_code=401,
            detail="User Already Exist"
        )
    hashed_password = get_hash_password(data.password)
    
    user = User(
        name = data.name,
        phone = data.phone,
        mail = data.mail,
        password = hashed_password,
        role=UserRole.USER.value,
        status="Non-Active"
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return {"Message" : "Register Successfully"}
    


# async def register_user(data, db: Session):
#     existing_user = db.query(User).filter((User.mail == data.mail) | (User.phone == data.phone)).first()
#     if existing_user:
#         raise HTTPException(
#             status_code=401,
#             detail="User Already Exist"
#         )
#     token = create_access_token(
#         {
#             "purpose": "email_verification",
#             "name": data.name,
#             "phone": data.phone,
#             "mail": str(data.mail),
#             "password": get_hash_password(data.password),
#             "role": UserRole.USER.value,
#         },
#         timedelta(minutes=30),
#     )
    
#     await send_verification_email(str(data.mail), token)
#     return {
#         "Message": "Verification email sent. Please verify your email to complete registration.",
#     }
# def verify_registered_user(token: str, db: Session):
#     payload = token_access(token)

#     if not payload or payload.get("purpose") != "email_verification":
#         raise HTTPException(
#             status_code=400, 
#             detail="Invalid or expired verification token"
#         )
    

#     existing_user = db.query(User).filter((User.mail == payload["mail"]) | (User.phone == payload["phone"])).first()

#     if existing_user:
#         raise HTTPException(
#             status_code=400, 
#             detail="User already verified"
#         )
#     user = User(
#         name=payload["name"],
#         phone=payload["phone"],
#         role=payload.get("role", UserRole.USER.value),
#         mail=payload["mail"],
#         password=payload["password"],
#         status="Non-Active"
#     )
#     db.add(user)
#     db.commit()
#     db.refresh(user)
#     return user

def user_login(data,db:Session):
    user = db.query(User).filter(User.mail == data.mail).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not Found"
        )
    if not verify_password(data.password,user.password):
        raise HTTPException(
            status_code=401,
            detail="Invalid Username and Password"
            )
    

    user={
        'user_id':user.id,
        'mail':user.mail,
        'role':user.role
    }
    token=create_access_token(user)
    return {"Message" : "Login Successfully",'token':token}


