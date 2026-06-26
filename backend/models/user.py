from backend.db.base import Base
from sqlalchemy import Column,Integer,String
from sqlalchemy.orm import relationship

class User(Base):
    __tablename__ = "user"

    id = Column(Integer,primary_key=True,index=True)
    name = Column(String,nullable=False)
    phone = Column(String,unique=True,nullable=False)
    mail = Column(String,unique=True,nullable=False)
    password = Column(String,nullable=False)
    role = Column(String,default="user")
    status = Column(String,default="Non-Active")



    subscriptions = relationship(
        "Subscription",
        back_populates="user",
        cascade="all, delete"
    )
    
