from typing import Optional
from pydantic import Field, constr, EmailStr


from .base import *

regex_pw = r'^[A-Za-z\d!@#$%^&*]+$'


class Login(Base):
    email: EmailStr = Field('example@example.com', description='유저 이메일')
    password: constr(min_length=8, max_length=20, pattern=regex_pw) = Field(description='영문(대소문자 무관), 숫자, 특수문자 포함 8 ~ 20자')

class Join(Base):
    email: EmailStr = Field('example@example.com', description='유저 이메일')
    name: constr(min_length=2, max_length=20) = Field(description='이름')
    password: constr(min_length=8, max_length=20, pattern=regex_pw) = Field(description='영문(대소문자 무관), 숫자, 특수문자 포함 8 ~ 20자')
    confirm_password: constr(min_length=8, max_length=20, pattern=regex_pw) = Field(description='영문(대소문자 무관), 숫자, 특수문자 포함 8 ~ 20자')
