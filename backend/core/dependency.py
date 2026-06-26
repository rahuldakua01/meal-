from backend.db.session import SessionLocal
from fastapi import Depends,HTTPException
from fastapi.security import HTTPAuthorizationCredentials,HTTPBearer
from jose import jwt,JWTError
from backend.core.security import SECRET_KEY,ALGORITHM

security = HTTPBearer()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(credential : HTTPAuthorizationCredentials=Depends(security)):
    try:
        payload = jwt.decode(credential.credentials,SECRET_KEY,ALGORITHM)
        return payload
    except JWTError:
        raise HTTPException(
            status_code=400,
            detail="Invalid Token"
        )
    

def admin_requird(current_user = Depends(get_current_user)):
    if current_user["role"] != "admin":

        raise HTTPException(
            status_code=401,
            detail="Admin Required"
        )
    return current_user


def user_requird(current_user = Depends(get_current_user)):
    if current_user["role"] != "user":

        raise HTTPException(
            status_code=401,
            detail="User Required"
        )
    return current_user
