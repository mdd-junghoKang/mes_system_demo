import time
import logging
import traceback

from decimal import Decimal
from fastapi import APIRouter, Query
from datetime import datetime, timedelta
from fastapi.responses import JSONResponse

from domain.web.db_pool import get_cursor

logger = logging.getLogger("perf")


router = APIRouter(
    prefix="/semi-product",
    tags=['Web'],
    include_in_schema=True,
    default_response_class=JSONResponse,
)

async def sfp_sp_search_summary(start_date: str, end_date: str):
    async with get_cursor() as cursor:
        await cursor.execute(
            """
            EXEC [dbo].[SFP_SP_SEARCH_SYSTEM]
                  @SP_GUBUN	= ?
                , @START_DATE = ?
                , @END_DATE = ?
            """,
            ('SUMMARY', start_date, end_date)
        )
        summary_rows = await cursor.fetchall()

        if not summary_rows:
            return {
                "CYCLECOUNT": '-',
                "BAD": '-',
                "DEFECTIVE": '-'
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

async def sfp_sp_search_graph(start_date: str, end_date: str):
    async with get_cursor() as cursor:
        await cursor.execute(
            """
            EXEC [dbo].[SFP_SP_SEARCH_SYSTEM]
                  @SP_GUBUN	= ?
                , @START_DATE = ?
                , @END_DATE = ?
            """,
            ('GRAPH', start_date, end_date)
        )
        graph_rows = await cursor.fetchall()

        if not graph_rows:
            return {
                "GET_DATE": '-',
                "CYCLECOUNT": '-',
                "DEFECTIVE": '-'
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

async def sfp_sp_search_row(start_date: str, end_date: str):
    async with get_cursor() as cursor:
        await cursor.execute(
            """
            EXEC [dbo].[SFP_SP_SEARCH_SYSTEM]
                  @SP_GUBUN	= ?
                , @START_DATE = ?
                , @END_DATE = ?
            """,
            ('ROW', start_date, end_date)
        )
        rows = await cursor.fetchall()

        if not rows:
            return {
                "GET_DATE": '-',
                "GET_TIME": '-',
                "DATA_NAME": '-',
                "ITEM_CD": '-',
                "ITEM_NM": '-',
                "LOT_NO": '-',
                "RESULT": '-',
                "IMG_PATH": '-',
                "COLOR_DATA": '-',
                "DEFECT_DATA": '-',
            }

        column_names = [col[0] for col in cursor.description]

        result = []

        for row in rows:
            row_dict = {}

            for col_name, value in zip(column_names, row):
                if isinstance(value, Decimal):
                    row_dict[col_name] = float(value)
                else:
                    row_dict[col_name] = value
            result.append(row_dict)

        return result


async def sfp_sp_search_all(start_date: str, end_date: str):
    async with get_cursor() as cursor:
        start_ts = time.perf_counter()

        result = {}

        for gubun in ('SUMMARY', 'GRAPH', 'ROW'):
            step_start = time.perf_counter()

            await cursor.execute(
                """
                EXEC [dbo].[SFP_SP_SEARCH_SYSTEM]
                      @SP_GUBUN = ?
                    , @START_DATE = ?
                    , @END_DATE = ?
                """,
                (gubun, start_date, end_date)
            )

            rows = await cursor.fetchall()
            cols = [c[0] for c in cursor.description]

            result[gubun] = [
                {
                    col: float(val) if isinstance(val, Decimal) else val
                    for col, val in zip(cols, row)
                }
                for row in rows
            ]

        return result


async def sfp_search_rows_paged(start_date: str, end_date: str, page: int = 1, page_size: int = 50):
    async with get_cursor() as cursor:
        start_ts = time.perf_counter()

        offset = (page - 1) * page_size

        await cursor.execute(
            """
            SELECT
                CONVERT(char(10), CONVERT(date, CAST(A.GET_DATE AS char(8)), 112), 23) AS GET_DATE,
                STUFF(
                    STUFF(RIGHT('000000' + CAST(A.GET_TIME AS varchar(6)), 6), 3, 0, ':'),
                    6, 0, ':'
                ) AS GET_TIME,
                A.DATA_NAME,
                ISNULL(A.ITEM_GN,'') AS ITEM_CD,
                ISNULL(B.ITEM_NM,'') AS ITEM_NM,
                ISNULL(A.ITEM_SN,'') AS LOT_NO,
                CASE WHEN A.CYCLE_STATE = 0 THEN 'OK' ELSE 'NG' END AS RESULT,
                A.IMG_PATH,
                A.COLOR_DATA,
                A.DEFECT_DATA
            FROM [AQMS_INOBLOCK].[dbo].[SFP_TB_CYCLE_DATA] A
            LEFT JOIN [INO_MES].[INNO_MES].[dbo].[cheum_V_TBA0100] B
                   ON A.ITEM_GN = B.ITEMSEQ
            WHERE A.GET_DATE >= ?
              AND A.GET_DATE <= ?
            ORDER BY A.CYCLE_ID DESC
            OFFSET ? ROWS FETCH NEXT ? ROWS ONLY
            """,
            (start_date, end_date, offset, page_size)
        )

        rows = await cursor.fetchall()
        cols = [c[0] for c in cursor.description]

        data = [
            {
                col: float(val) if isinstance(val, Decimal) else val
                for col, val in zip(cols, row)
            }
            for row in rows
        ]

        return data


@router.get("/rows", response_class=JSONResponse)
async def get_rows(start_date_value: str, end_date_value: str, page: int = Query(1, ge=1), page_size: int = Query(50, ge=10, le=200)):
    try:
        rows = await sfp_search_rows_paged(
            start_date=start_date_value,
            end_date=end_date_value,
            page=page,
            page_size=page_size
        )

        return JSONResponse({
            "status": "success",
            "page": page,
            "page_size": page_size,
            "rows": rows
        })

    except Exception as e:
        return JSONResponse(
            {
                "status": "error",
                "message": str(e)
            },
            status_code=500
        )


async def sfp_search_rows_count(start_date: str, end_date: str):
    async with get_cursor() as cursor:
        await cursor.execute(
            """
            SELECT COUNT(1)
            FROM [AQMS_INOBLOCK].[dbo].[SFP_TB_CYCLE_DATA]
            WHERE GET_DATE >= ?
              AND GET_DATE <= ?
            """,
            (start_date, end_date)
        )
        row = await cursor.fetchone()
        return row[0]


@router.get("/rows/count", response_class=JSONResponse)
async def get_rows_count(start_date_value: str, end_date_value: str):
    count = await sfp_search_rows_count(start_date_value, end_date_value)
    return JSONResponse({
        "status": "success",
        "total_count": count
    })



@router.post("/datas", response_class=JSONResponse)
async def get_datas(req_status_info: dict):
    start_date = req_status_info.get('start_date_value')
    end_date = req_status_info.get('end_date_value')

    try:
        t0 = time.perf_counter()
        data = await sfp_sp_search_all(start_date, end_date)
        logger.info(f"[semi-product] sfp_sp_search_all done in {(time.perf_counter()-t0)*1000:.0f}ms")

        return JSONResponse({
            "status": "success",
            "summary_data": data['SUMMARY'],
            "graph_data": data['GRAPH'],
            "row_data": data['ROW'],
        })
    except Exception as e:
        print(f"에러 타입: {type(e).__name__}")
        traceback.print_exc()
        return JSONResponse({
            "status": "error",
            "message": str(e)
        }, status_code=500)


