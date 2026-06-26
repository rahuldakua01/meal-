from pydantic import BaseModel,Field,EmailStr

import enum

class UserRole(str, enum.Enum):
     USER= "user"
     ADMIN= "admin"

class RegisterUser(BaseModel):
    name : str
    phone : str
    mail : EmailStr
    password : str=Field(min_length=6)
    


class LoginUser(BaseModel):
     mail : EmailStr
     password : str