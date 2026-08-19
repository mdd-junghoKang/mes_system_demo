import time
import logging
from contextlib import asynccontextmanager

from uvicorn import run
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

from domain import v1
from domain.web import aggregate, bedrock, semi_product, product, lot, monitoring
from domain.web.db_pool import init_pool, close_pool

from config import secret_key, session_max_age

logger = logging.getLogger("perf")
logging.basicConfig(level=logging.INFO)


@asynccontextmanager
async def lifespan(_app: FastAPI):
    await init_pool()
    yield
    await close_pool()

app = FastAPI(
    title='Inoblock',
    version='0.0.1',
    lifespan=lifespan,
)


@app.middleware("http")
async def log_request_time(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    elapsed = (time.perf_counter() - start) * 1000
    logger.info(f"[PERF] {request.method} {request.url.path} -> {response.status_code} | {elapsed:.0f}ms")
    return response


app.add_middleware(SessionMiddleware, secret_key=secret_key, max_age=session_max_age, same_site="strict")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(v1.user.router)
app.include_router(aggregate.router)
app.include_router(bedrock.router)
app.include_router(semi_product.router)
app.include_router(product.router)
app.include_router(lot.router)
app.include_router(monitoring.router)


if __name__ == '__main__':
    run('app:app', host='0.0.0.0', port=8000, reload=True)
