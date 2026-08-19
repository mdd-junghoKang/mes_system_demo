from pydantic import BaseModel


class Base(BaseModel):
    def model_name(self):
        return self.__class__.__name__


