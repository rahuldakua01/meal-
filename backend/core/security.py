from datetime import datetime, timedelta,timezone
from dotenv import load_dotenv
import os
from jose import jwt,JWTError
from pwdlib import PasswordHash

load_dotenv()


SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
password_hash = PasswordHash.recommended()


def get_hash_password(password):
    return password_hash.hash(password)

def verify_password(plain_password,hash_password):
    return password_hash.verify(plain_password,hash_password)


def create_access_token(data:dict,expire_delta : timedelta | None = None):
    to_encoded = data.copy()

    if expire_delta:
        expire = (
            datetime.now(timezone.utc) + expire_delta
        )
    
    else:
        expire = (
            datetime.now(timezone.utc) + timedelta(minutes=30)
        )
    
    to_encoded.update({"exp" : expire})

    encoded_jwt = jwt.encode(to_encoded,SECRET_KEY,ALGORITHM)

    return encoded_jwt

def token_access(token:str):
    try:
        payload = jwt.decode(token,SECRET_KEY,ALGORITHM)
        return payload
    except JWTError:
        return None