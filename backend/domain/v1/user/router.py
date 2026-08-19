import bcrypt

from fastapi import APIRouter, Request, Depends, Form
from fastapi.security import APIKeyCookie

from db import db, AsyncSession, Base
from domain import exceptions
from config import models

router = APIRouter(
    prefix='/api/v1/user',
    tags=['User'],
    include_in_schema=True,
)

session_cookie = APIKeyCookie(name="session")


async def get_id(request: Request, _=Depends(session_cookie)):
    user_id = request.session.get('user_id')
    print(user_id)
    if not user_id:
        print("유저아이디없음")
        raise exceptions.api.FailedCredential

    return user_id


@router.post('/join')
async def join(join_data: models.Join = Form(), session: AsyncSession = Depends(db.get_session)):
    user_model = Base.classes.TB_USER
    user = await db.select(session, user_model,
                           conditions=(user_model.EMAIL == join_data.email,),
                           execute=False, is_single=True)

    if user:
        raise exceptions.api.AlreadyExistsUser

    hashed_pw = bcrypt.hashpw(
        join_data.password.encode("utf-8"),
        bcrypt.gensalt()
    )

    join_model = user_model(
        EMAIL=join_data.email,
        NAME=join_data.name,
        PASSWORD=hashed_pw,  # bytes
    )

    await db.insert(session, join_model)

    return dict(result='success')


@router.post('/login')
async def login(request: Request, login_data: models.Login = Form(), session: AsyncSession = Depends(db.get_session)):
    user_model = Base.classes.TB_USER
    user = await db.select(session, user_model,
                           conditions=(user_model.EMAIL == login_data.email,),
                           execute=False, is_single=True)

    if not user:
        raise exceptions.api.InvalidInputData

    if not await db.check_password(login_data.password, user.PASSWORD):
        raise exceptions.api.InvalidInputData

    request.session['user_id'] = user.ID

    return dict(result='success')


@router.post('/logout')
async def logout(request: Request, _=Depends(get_id)):
    request.session.clear()

    return dict(result='success')


@router.post('/session')
async def check_session(_=Depends(get_id)):
    return dict(result='success')
