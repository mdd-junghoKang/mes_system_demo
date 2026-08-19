from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.ext.automap import automap_base


class Base(DeclarativeBase):
    @classmethod
    def table_columns(cls):
        return cls.__table__.columns.keys()

    def to_dict(self):
        return {field.name: getattr(self, field.name) for field in self.__table__.c}


Base = automap_base(Base)
