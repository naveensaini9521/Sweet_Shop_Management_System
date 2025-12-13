from app.db.session import Base, engine
from app.models import user, sweet

def init_db():
    Base.metadata.create_all(bind=engine)
