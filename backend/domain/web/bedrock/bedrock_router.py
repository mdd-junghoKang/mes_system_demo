import asyncio
import time
import logging
import traceback

from decimal import Decimal
from fastapi import APIRouter
from datetime import datetime, timedelta
from fastapi.responses import JSONResponse

from domain.web.db_pool import get_cursor

logger = logging.getLogger("perf")


router = APIRouter(
    prefix="/bedrock",
    tags=['Web'],
    include_in_schema=True,
    default_response_class=JSONResponse,
)

def serialize_row(row_dict: dict):
    return {
        k: float(v) if isinstance(v, Decimal) else v
        for k, v in row_dict.items()
    }


async def blt_sp_web_aggregate_quality_space00(start_date: str, end_date: str):
    async with get_cursor() as cursor:
        await cursor.execute(
            """
            EXEC [dbo].[BLT_SP_WEB_AGGREGATE_QUALITY_SPACE_00]
                  @START_DATE = ?
                , @END_DATE = ?
            """,
            (start_date, end_date)
        )
        rows = await cursor.fetchall()

        if not rows:
            return {
                "NORMAL_RATE": 0.0,
                "CAUTION_RATE": 0.0,
                "DANGER_RATE": 0.0,
                "TOTAL_COUNT": 0,
                "NORMAL_COUNT": 0,
                "CAUTION_COUNT": 0,
                "DANGER_COUNT": 0
            }

        column_names = [col[0] for col in cursor.description]
        row = rows[0]

        return {
            col: float(val) if isinstance(val, Decimal) else val
            for col, val in zip(column_names, row)
        }


async def blt_sp_web_aggregate_quality_space01(start_date: str, end_date: str):
    async with get_cursor() as cursor:
        await cursor.execute(
            """
            EXEC [dbo].[BLT_SP_WEB_AGGREGATE_QUALITY_SPACE_01]
                  @START_DATE = ?
                  , @END_DATE = ?
            """,
            (start_date, end_date)
        )
        rows = await cursor.fetchall()

        column_names = [col[0] for col in cursor.description]

        image_list = []

        for row in rows:
            row_dict = {}
            for col_name, value in zip(column_names, row):
                row_dict[col_name] = value
            image_list.append(row_dict)

        return image_list


async def blt_sp_web_aggregate_quality_space02(start_date: str, end_date:str):
    async with get_cursor() as cursor:
        await cursor.execute(
            """
            EXEC [dbo].[BLT_SP_WEB_AGGREGATE_QUALITY_SPACE_02]
                  @START_DATE = ?
                  , @END_DATE = ?
            """,
            (start_date, end_date)
        )
        rows = await cursor.fetchall()

        column_names = [col[0] for col in cursor.description]

        alarm_list = []

        for row in rows:
            row_dict = {}
            for col_name, value in zip(column_names, row):
                row_dict[col_name] = value
            alarm_list.append(serialize_row(row_dict))

        return alarm_list

async def blt_sp_web_aggregate_quality_space03(start_date: str, end_date: str):
    async with get_cursor() as cursor:
        await cursor.execute(
            """
            EXEC [dbo].[BLT_SP_WEB_AGGREGATE_QUALITY_SPACE_03]
                  @START_DATE = ?
                  , @END_DATE = ?
            """,
            (start_date, end_date)
        )
        rows = await cursor.fetchall()

        column_names = [col[0] for col in cursor.description]

        history_list = []

        for row in rows:
            row_dict = {}
            for col_name, value in zip(column_names, row):
                row_dict[col_name] = value
            history_list.append(serialize_row(row_dict))

        return history_list

async def blt_sp_web_aggregate_quality_space04(start_date: str, end_date: str):
    async with get_cursor() as cursor:
        await cursor.execute(
            """
            EXEC [dbo].[BLT_SP_WEB_AGGREGATE_QUALITY_SPACE_04]
                  @START_DATE = ?
                  , @END_DATE = ?
            """,
            (start_date, end_date)
        )
        rows = await cursor.fetchall()

        column_names = [col[0] for col in cursor.description]

        history_list = []

        for row in rows:
            row_dict = {}
            for col_name, value in zip(column_names, row):
                row_dict[col_name] = value
            history_list.append(serialize_row(row_dict))

        return history_list
@router.post("/datas", response_class=JSONResponse)
async def get_datas(req_status_info: dict):
    start_date = req_status_info.get('start_date_value')
    end_date = req_status_info.get('end_date_value')
    is_dashboard = req_status_info.get('is_dashboard')

    try:
        t0 = time.perf_counter()
        status_data = await blt_sp_web_aggregate_quality_space00(start_date, end_date)
        logger.info(f"[bedrock] SP_00 done in {(time.perf_counter()-t0)*1000:.0f}ms")
        if is_dashboard:
            return JSONResponse({
                "status": "success",
                "status_data": status_data,
            })

        t1 = time.perf_counter()
        alarm_data, history_data, chart_data = await asyncio.gather(
            blt_sp_web_aggregate_quality_space02(start_date, end_date),
            blt_sp_web_aggregate_quality_space03(start_date, end_date),
            blt_sp_web_aggregate_quality_space04(start_date, end_date),
        )
        logger.info(f"[bedrock] SP_02+03+04 gather done in {(time.perf_counter()-t1)*1000:.0f}ms")

        return JSONResponse({
            "status": "success",
            "status_data": status_data,
            "alarm_data": alarm_data,
            "history_data": history_data,
            "chart_data": chart_data
        })

    except Exception as e:
        print(f"에러 타입: {type(e).__name__}")
        traceback.print_exc()
        return JSONResponse({
            "status": "error",
            "message": str(e)
        }, status_code=500)

