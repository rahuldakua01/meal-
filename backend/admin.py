from backend.db.session import SessionLocal, engine
from backend.db.base import Base
from backend.models.user import User
from backend.core.security import get_hash_password

Base.metadata.create_all(bind=engine)

db = SessionLocal()

existing_admin = db.query(User).filter(
    User.role == "admin"
).first()

if existing_admin:
    print("Admin already exists")
else:
    admin = User(
        name="admin",
        phone=9999999999,
        mail="admin@gmail.com",
        password=get_hash_password("Admin@123"),
        role="admin",
        status = "Always Active"
    )


    db.add(admin)
    db.commit()

    print("Admin created")
