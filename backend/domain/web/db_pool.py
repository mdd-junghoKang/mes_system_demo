import aioodbc.connection
from contextlib import asynccontextmanager
from db import DB_USER, PASSWORD, HOST, PORT, DB_NAME

DSN = (
    "DRIVER={ODBC Driver 18 for SQL Server};"
    f"SERVER={HOST},{PORT};"
    f"DATABASE={DB_NAME};"
    f"UID={DB_USER};"
    f"PWD={PASSWORD};"
    "Encrypt=yes;"
    "TrustServerCertificate=yes;"
)

_pool = None


async def init_pool(minsize=2, maxsize=10):
    global _pool
    _pool = await aioodbc.create_pool(dsn=DSN, minsize=minsize, maxsize=maxsize)


async def close_pool():
    global _pool
    if _pool:
        _pool.close()
        await _pool.wait_closed()
        _pool = None


@asynccontextmanager
async def get_cursor():
    async with _pool.acquire() as conn:
        conn._conn.timeout = 120
        async with conn.cursor() as cursor:
            await cursor.execute("""
                SET ARITHABORT ON;
                SET ANSI_WARNINGS ON;
                SET ANSI_NULLS ON;
                SET QUOTED_IDENTIFIER ON;
            """)
            yield cursor
