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
    prefix="/product",
    tags=['Web'],
    include_in_schema=True,
    default_response_class=JSONResponse,
)


async def fp_sp_search_system_summary(start_date: str, end_date: str):
    t = time.perf_counter()
    async with get_cursor() as cursor:
        await cursor.execute(
            """
            EXEC [dbo].[FP_SP_SEARCH_SYSTEM]
                  @SP_GUBUN	= ?
                , @START_DATE = ?
                , @END_DATE = ?
                , @ID = ?
            """,
            ('SUMMARY', start_date, end_date, '0')
        )
        summary_rows = await cursor.fetchall()
        logger.info(f"[product] SUMMARY done in {(time.perf_counter()-t)*1000:.0f}ms")

        if not summary_rows:
            return {
                "CYCLECOUNT": '-',
                "LOTOK": '-',
                "LOGNG": '-'
            }

        summary_column_names = [col[0] for col in cursor.description]

        summary_result = []

        for row in summary_rows:
            row_dict = {}

            for col_name, value in zip(summary_column_names, row):
                if isinstance(value, Decimal):
                    row_dict[col_name] = float(value)
                else:
                    row_dict[col_name] = value
            summary_result.append(row_dict)

        return summary_result

async def fp_sp_search_system_graph(start_date: str, end_date: str):
    t = time.perf_counter()
    async with get_cursor() as cursor:
        await cursor.execute(
            """
            EXEC [dbo].[FP_SP_SEARCH_SYSTEM]
                  @SP_GUBUN	= ?
                , @START_DATE = ?
                , @END_DATE = ?
                , @ID = ?
            """,
            ('GRAPH', start_date, end_date, '0')
        )
        graph_rows = await cursor.fetchall()
        logger.info(f"[product] GRAPH done in {(time.perf_counter()-t)*1000:.0f}ms")

        if not graph_rows:
            return {
                "GET_DATE": '-',
                "CYCLECOUNT": '-',
                "LOTNG": '-'
            }

        graph_column_names = [col[0] for col in cursor.description]

        graph_result = []

        for row in graph_rows:
            row_dict = {}

            for col_name, value in zip(graph_column_names, row):
                if isinstance(value, Decimal):
                    row_dict[col_name] = float(value)
                else:
                    row_dict[col_name] = value
            graph_result.append(row_dict)

        return graph_result

async def fp_sp_search_system_row(start_date: str, end_date: str):
    t = time.perf_counter()
    async with get_cursor() as cursor:
        await cursor.execute(
            """
            EXEC [dbo].[FP_SP_SEARCH_SYSTEM]
                  @SP_GUBUN	= ?
                , @START_DATE = ?
                , @END_DATE = ?
                , @ID = ?
            """,
            ('ROW', start_date, end_date, '0')
        )
        row_rows = await cursor.fetchall()
        logger.info(f"[product] ROW done in {(time.perf_counter()-t)*1000:.0f}ms")

        if not row_rows:
            return {
                "ID": '-',
                "GET_DATE": '-',
                "GET_TIME": '-',
                "LOT_NO": '-',
                "ITEM_CD": '-',
                "ITEM_NM": '-',
                "ORIGIN_IMG_FILE_PATH": '-'
            }

        row_column_names = [col[0] for col in cursor.description]

        row_result = []

        for row in row_rows:
            row_dict = {}

            for col_name, value in zip(row_column_names, row):
                if isinstance(value, Decimal):
                    row_dict[col_name] = float(value)
                else:
                    row_dict[col_name] = value
            row_result.append(row_dict)

        return row_result

@router.post("/datas", response_class=JSONResponse)
async def get_datas(req_status_info: dict):
    start_date = req_status_info.get('start_date_value')
    end_date = req_status_info.get('end_date_value')

    try:
        t0 = time.perf_counter()
        summary_data, graph_data, row_data = await asyncio.gather(
            fp_sp_search_system_summary(start_date, end_date),
            fp_sp_search_system_graph(start_date, end_date),
            fp_sp_search_system_row(start_date, end_date),
        )
        logger.info(f"[product] gather(summary+graph+row) done in {(time.perf_counter()-t0)*1000:.0f}ms")

        return JSONResponse({
            "status": "success",
            "summary_data": summary_data,
            "graph_data": graph_data,
            "row_data": row_data,
        })

    except Exception as e:
        print(f"에러 타입: {type(e).__name__}")
        traceback.print_exc()
        return JSONResponse({
            "status": "error",
            "message": str(e)
        }, status_code=500)


