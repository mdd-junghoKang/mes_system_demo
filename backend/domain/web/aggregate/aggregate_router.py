import os
import time
import asyncio
import logging
import aiohttp
import traceback

from decimal import Decimal
from urllib.parse import unquote
from fastapi import APIRouter
from datetime import datetime, timedelta
from fastapi.security import APIKeyHeader
from fastapi.responses import Response, JSONResponse, FileResponse
from urllib.parse import quote

from domain.web.db_pool import get_cursor

from config import IMAGE_SERVER_BASE, NAS_USER_NAME, NAS_USER_PASSWORD

logger = logging.getLogger("perf")


router = APIRouter(
    prefix='/aggregate',
    tags=['Aggregate'],
    include_in_schema=True,
    default_response_class=JSONResponse,
)


async def aggregate_quality_space_00(date_str: str):
    date_str = date_str.replace('-', '')
    async with get_cursor() as cursor:
        await cursor.execute(
            """
            EXEC [dbo].[AGG_SP_WEB_AGGREGATE_QUALITY_SPACE_00]
                  @P_DATE = ?
            """,
            date_str
        )
        rows = await cursor.fetchall()
        line_list = [row[0] for row in rows]

        return line_list


async def agg_sp_web_aggregate_quality_summary(start_date: str, end_date: str, line_info: str):
    async with get_cursor() as cursor:
        await cursor.execute(
            """
            EXEC [dbo].[AGG_SP_WEB_AGGREGATE_QUALITY]
                  @SP_GUBUN = ?
                , @START_DATE = ?
                , @END_DATE = ?
                , @P_LINE_INFO = ?
                , @P_BATCH_NO = ?
            """,
            ('SUMMARY', start_date, end_date, line_info, '')
        )
        summary_rows = await cursor.fetchall()
        summary_list = []
        for row in summary_rows:
            row_values = []
            for val in row:
                if isinstance(val, Decimal):
                    row_values.append(float(val))
                else:
                    row_values.append(val)
            summary_list.append(row_values)

        return {
            "summary": summary_list
        }


async def _agg_quality_graph_single(gubun: str, start_date: str, end_date: str, line_info: str):
    async with get_cursor() as cursor:
        await cursor.execute(
            """
            EXEC [dbo].[AGG_SP_WEB_AGGREGATE_QUALITY]
                  @SP_GUBUN = ?
                , @START_DATE = ?
                , @END_DATE = ?
                , @P_LINE_INFO = ?
                , @P_BATCH_NO = ?
            """,
            (gubun, start_date, end_date, line_info, '')
        )
        rows = await cursor.fetchall()
        result_list = []
        for row in rows:
            row_values = []
            for idx, val in enumerate(row):
                if idx == 1 and isinstance(val, str):
                    try:
                        dt = datetime.strptime(val, "%Y-%m-%d %H:%M:%S.%f")
                        row_values.append(dt.strftime("%m-%d %H:%M:%S"))
                    except ValueError:
                        dt = datetime.strptime(val, "%Y-%m-%d %H:%M:%S")
                        row_values.append(dt.strftime("%m-%d %H:%M:%S"))
                elif isinstance(val, Decimal):
                    row_values.append(float(val))
                else:
                    row_values.append(val)
            result_list.append(row_values)
        return result_list


async def agg_sp_web_aggregate_quality_graph(start_date: str, end_date: str, line_info: str):
    graph_a_list, graph_p_list = await asyncio.gather(
        _agg_quality_graph_single('GRAPH_A', start_date, end_date, line_info),
        _agg_quality_graph_single('GRAPH_P', start_date, end_date, line_info),
    )
    return {
        "graph_a": graph_a_list,
        "graph_p": graph_p_list
    }


async def agg_sp_web_aggregate_quality_history(start_date: str, end_date: str, line_info: str):
    async with get_cursor() as cursor:
        await cursor.execute(
            """
            EXEC [dbo].[AGG_SP_WEB_AGGREGATE_QUALITY]
                  @SP_GUBUN = ?
                , @START_DATE = ?
                , @END_DATE = ?
                , @P_LINE_INFO = ?
                , @P_BATCH_NO = ?
            """,
            ('HISTORY', start_date, end_date, line_info, '')
        )
        history_rows = await cursor.fetchall()
        columns = [col[0] for col in cursor.description]
        history_list = []
        for row in history_rows:
            row_dict = {}
            for col_name, val in zip(columns, row):
                if isinstance(val, Decimal):
                    row_dict[col_name] = float(val)
                else:
                    row_dict[col_name] = val
            history_list.append(row_dict)

        return history_list


async def aggregate_quality_space_01(date_str: str, line_info: str):
    async with get_cursor() as cursor:
        await cursor.execute(
            """
            EXEC [dbo].[AGG_SP_WEB_AGGREGATE_QUALITY_SPACE_01]
                  @P_DATE = ?
                , @P_LINE_INFO = ?
            """,
            (date_str, line_info)
        )
        rows = await cursor.fetchall()

        assemble_rates = []

        for row in rows:
            row_values = []
            for val in row:
                if isinstance(val, Decimal):
                    row_values.append(float(val))
                else:
                    row_values.append(val)
            assemble_rates.append(row_values)

        return assemble_rates


async def aggregate_quality_space_02(assemble_type:str, date_str: str, line_info: str):
    async with get_cursor() as cursor:
        await cursor.execute(
            """
            EXEC [dbo].[AGG_SP_WEB_AGGREGATE_QUALITY_SPACE_02]
                @P_TYPE = ?
              , @P_DATE = ?
              , @P_LINE_INFO = ?
            """,
            (assemble_type, date_str, line_info)
        )
        rows = await cursor.fetchall()

        return rows


async def aggregate_quality_space_03(batch_no:str, line_info: str):
    async with get_cursor() as cursor:
        await cursor.execute(
            """
            EXEC [dbo].[AGG_SP_WEB_AGGREGATE_QUALITY_SPACE_03]
                @P_BATCH_NO = ?
              , @P_LINE_INFO = ?
            """,
            (batch_no, line_info)
        )
        rows = await cursor.fetchall()
        path_list = [
            {"real_img":row[0], "ai_img":row[1]} for row in rows
        ]

        return path_list


async def aggregate_quality_space_04(batch_no:str, line_info: str):
    async with get_cursor() as cursor:
        await cursor.execute(
            """
            EXEC [dbo].[AGG_SP_WEB_AGGREGATE_QUALITY_SPACE_04]
                @P_DATE = ?
              , @P_LINE_INFO = ?
            """,
            (batch_no, line_info)
        )
        rows = await cursor.fetchall()
        path_list = [row[0] for row in rows]

        return path_list


async def aggregate_quality_space_05(date_str: str, line_info: str, batch_no: str):
    async with get_cursor() as cursor:
        await cursor.execute(
            """
            EXEC [dbo].[AGG_SP_WEB_AGGREGATE_QUALITY_SPACE_05]
                @P_DATE = ?
              , @P_LINE_INFO = ?
              , @P_BATCH_NO = ?
            """,
            (date_str, line_info, batch_no)
        )
        all_batches = await cursor.fetchall()

        if await cursor.nextset():
            single_batch = await cursor.fetchall()
        else:
            single_batch = []

        all_batches_list = [row for row in all_batches]

        data_obj = {
            'all_batches_list': all_batches_list,
            'single_batch': single_batch
        }

        return data_obj


async def aggregate_quality_space_06(line_info: str):
    async with get_cursor() as cursor:
        await cursor.execute(
            """
            EXEC [dbo].[AGG_SP_WEB_AGGREGATE_QUALITY_SPACE_06]
                @P_LINE_INFO = ?
            """,
            line_info
        )
        rows = await cursor.fetchall()

        min_max_data_list = [row for row in rows]

        return min_max_data_list


@router.post("/get/agg-info", response_class=JSONResponse)
async def get_agg_info():
    async with get_cursor() as cursor:
        await cursor.execute(
            """
            SELECT
                LINE_ID,
                LINE_INFO,
                CASE AGG_INFO
                    WHEN 'stone_dust' THEN N'석분'
                    ELSE AGG_INFO
                END AS AGG_INFO,
                USE_YN
            FROM AQMS_INOBLOCK.dbo.AGG_TB_LINE_INFO
            ORDER BY LINE_ID;
            """
        )
        agg_rows = await cursor.fetchall()
        agg_cols = [col[0] for col in cursor.description]

        agg_info = [
            {
                col: float(val) if isinstance(val, Decimal) else val
                for col, val in zip(agg_cols, row)
            }
            for row in agg_rows
        ]

        return {"agg_info":agg_info}


@router.post("/graph-datas", response_class=JSONResponse)
async def get_graph_datas(req_status_info: dict):
    start_date = req_status_info.get('start_date')
    end_date = req_status_info.get('end_date')
    line_input = req_status_info.get('line_input')

    try:
        t0 = time.perf_counter()
        graph_data, assemble_data_rows = await asyncio.gather(
            agg_sp_web_aggregate_quality_graph(start_date, end_date, line_input),
            aggregate_quality_space_06(line_input),
        )
        logger.info(f"[aggregate] graph-datas gather done in {(time.perf_counter()-t0)*1000:.0f}ms")

        assemble_data_dict = {}

        for row in assemble_data_rows:
            if row[0] == 'H':
                assemble_data_dict['high_line'] = float(row[8])
            else:
                assemble_data_dict['low_line'] = float(row[8])

        return JSONResponse({
            "status": "success",
            "graph_data": graph_data,
            "assemble_data": assemble_data_dict
        })

    except Exception as e:
        print(f"에러 타입: {type(e).__name__}")
        traceback.print_exc()
        return JSONResponse({
            "status": "error",
            "message": str(e)
        }, status_code=500)


@router.post("/history-datas", response_class=JSONResponse)
async def get_history_datas(req_status_info: dict):
    start_date = req_status_info.get('start_date')
    end_date = req_status_info.get('end_date')
    line_input = req_status_info.get('line_input')

    try:
        history_data = await agg_sp_web_aggregate_quality_history(start_date, end_date, line_input)

        return JSONResponse({
            "status": "success",
            "history_data": history_data,
        })

    except Exception as e:
        print(f"에러 타입: {type(e).__name__}")
        traceback.print_exc()
        return JSONResponse({
            "status": "error",
            "message": str(e)
        }, status_code=500)


@router.post("/get/line-info", response_class=JSONResponse)
async def get_line_info(date_dict: dict):
    target_date = date_dict.get('date_value')

    try:
        line_list = await aggregate_quality_space_00(target_date)

        return JSONResponse({
            "status": "success",
            "line_list": line_list
        })
    except Exception as e:
        print(f"에러 타입: {type(e).__name__}")
        traceback.print_exc()
        return JSONResponse({
            "status": "error",
            "message": str(e)
        }, status_code=500)


@router.post("/get/assemble-rate", response_class=JSONResponse)
async def get_assemble_rates(req_assemble_rate: dict):

    start_date = req_assemble_rate.get('start_date')
    end_date = req_assemble_rate.get('end_date')
    line_input = req_assemble_rate.get('line_input')

    try:
        t0 = time.perf_counter()
        result = await agg_sp_web_aggregate_quality_summary(start_date, end_date, line_input)
        logger.info(f"[aggregate] assemble-rate SP done in {(time.perf_counter()-t0)*1000:.0f}ms")

        summary_rows = [
            row for row in result["summary"]
            if row[0] is not None and row[1] is not None
        ]

        assemble_rates = [
            {
                "FINENESS_MODULUS": float(row[0]),
                "SHAPE_INDEX": float(row[1]),
            }
            for row in summary_rows
        ]

        return JSONResponse({
            "status": "success",
            "assemble_rates": assemble_rates
        })
    except Exception as e:
        print(f"에러 타입: {type(e).__name__}")
        traceback.print_exc()
        return JSONResponse({
            "status": "error",
            "message": str(e)
        }, status_code=500)


@router.post("/get/lookup-assemble-rate", response_class=JSONResponse)
async def get_assemble_rates(req_assemble_rate: dict):
    date_value = req_assemble_rate.get('date_value')
    line_input = req_assemble_rate.get('line_input')

    try:
        result = await aggregate_quality_space_01(date_value, line_input)

        rows = [
            row for row in result
            if row[0] is not None and row[1] is not None
        ]

        assemble_rates = [
            {
                "FINENESS_MODULUS": float(row[0]),
                "SHAPE_INDEX": float(row[1]),
            }
            for row in rows
        ]

        return JSONResponse({
            "status": "success",
            "assemble_rates": assemble_rates
        })
    except Exception as e:
        print(f"에러 타입: {type(e).__name__}")
        traceback.print_exc()
        return JSONResponse({
            "status": "error",
            "message": str(e)
        }, status_code=500)


@router.post("/get/batch-info", response_class=JSONResponse)
async def get_batch_info(req_batch_info: dict):
    assemble_type = req_batch_info.get('assemble_type')
    target_date = req_batch_info.get('date_value')
    line_input = req_batch_info.get('line_input')

    try:
        rows = await aggregate_quality_space_02(assemble_type, target_date, line_input)

        batch_info_list = []

        for row in rows:
            batch_info = {
                'BATCH_NO': row[0],
                'GETHERING_TIME': row[1],
                'AVG_VALUE': float(row[2]),
                'MAX_VALUE': float(row[3]),
                'MIN_VALUE': float(row[4]),
            }
            batch_info_list.append(batch_info)

        return JSONResponse(batch_info_list)

    except Exception as e:
        print(f"에러 타입: {type(e).__name__}")
        traceback.print_exc()
        return JSONResponse({
            "status": "error",
            "message": str(e)
        }, status_code=500)


@router.post("/get/batch-no", response_class=JSONResponse)
async def get_batch_no(req_batch_no: dict):
    target_date = req_batch_no.get('date_value')
    line_input = req_batch_no.get('line_input')

    try:
        rows = await aggregate_quality_space_04(target_date, line_input)

        return JSONResponse({
            "status": "success",
            "batch_no_list": rows,
        })

    except Exception as e:
        print(f"에러 타입: {type(e).__name__}")
        traceback.print_exc()
        return JSONResponse({
            "status": "error",
            "message": str(e)
        }, status_code=500)


@router.post("/get/graph-data", response_class=JSONResponse)
async def get_graph_data(req_graph_data: dict):
    date_str = req_graph_data.get('date_value')
    line_input = req_graph_data.get('line_input')
    batch_no = req_graph_data.get('batch_no')

    avg_data_list = []
    low_data_list = []
    high_data_list = []

    try:
        avg_data_obj = await aggregate_quality_space_05(date_str, line_input, batch_no)
        avg_data_rows = avg_data_obj['all_batches_list']
        single_batch = avg_data_obj['single_batch']

        for row in avg_data_rows:
            graph_data = {
                'BATCH_NO': float(row[0]),
                'PASS_00_15': float(row[1]),
                'PASS_00_30': float(row[2]),
                'PASS_00_60': float(row[3]),
                'PASS_01_20': float(row[4]),
                'PASS_02_25': float(row[5]),
                'PASS_05_00': float(row[6]),
                'PASS_10_00': float(row[7]),
            }
            avg_data_list.append(graph_data)

        min_max_data_rows = await aggregate_quality_space_06(line_input)
        for row in min_max_data_rows:
            if row[0] == 'L':
                low_data_list.append(row[0])
                low_data_list.append(float(row[1]))
                low_data_list.append(float(row[2]))
                low_data_list.append(float(row[3]))
                low_data_list.append(float(row[4]))
                low_data_list.append(float(row[5]))
                low_data_list.append(float(row[6]))
                low_data_list.append(float(row[7]))
                low_data_list.append(float(row[8]))
            elif row[0] == 'H':
                high_data_list.append(row[0])
                high_data_list.append(float(row[1]))
                high_data_list.append(float(row[2]))
                high_data_list.append(float(row[3]))
                high_data_list.append(float(row[4]))
                high_data_list.append(float(row[5]))
                high_data_list.append(float(row[6]))
                high_data_list.append(float(row[7]))
                high_data_list.append(float(row[8]))

        if batch_no:
            single_batch_result = []
            if single_batch:
                row = single_batch[0]
                single_batch_result = [float(v) for v in row]

            return JSONResponse({
                "single_batch": single_batch_result,
                "low_data_list": low_data_list,
                "high_data_list": high_data_list
            })

        return JSONResponse({
            "avg_data_list": avg_data_list,
            "low_data_list": low_data_list,
            "high_data_list": high_data_list
        })
    except Exception as e:
        print(f"에러 타입: {type(e).__name__}")
        traceback.print_exc()
        return JSONResponse({
            "status": "error",
            "message": str(e)
        }, status_code=500)


@router.post("/get/assemble-graph-data", response_class=JSONResponse)
async def get_assemble_graph_data(req_graph_data: dict):
    assemble_type = req_graph_data.get('assemble_type')
    date_value = req_graph_data.get('date_value')
    line_input = req_graph_data.get('line_input')

    try:
        graph_data_rows = await aggregate_quality_space_02(
            assemble_type,
            date_value,
            line_input
        )
        assemble_data_rows = await aggregate_quality_space_06(line_input)

        graph_data_list = []
        assemble_data_dict = {}

        for row in graph_data_rows:
            gethering_time = row[1]
            avg_value = row[2]

            graph_data_list.append({
                "GETHERING_TIME": gethering_time,
                "AVG_VALUE": float(avg_value) if avg_value is not None else None
            })

        for row in assemble_data_rows:
            if row[0] == 'H':
                assemble_data_dict['high_line'] = float(row[8])
            else:
                assemble_data_dict['low_line'] = float(row[8])

        return JSONResponse({
            "status": "success",
            "graph_data": graph_data_list,
            "assemble_data": assemble_data_dict
        })

    except Exception as e:
        print(f"에러 타입: {type(e).__name__}")
        traceback.print_exc()
        return JSONResponse({
            "status": "error",
            "message": str(e)
        }, status_code=500)


@router.get("/image/proxy")
async def proxy_image(path: str):
    try:
        path = path.replace("Z:", "").replace("\\", "/")

        decoded_path = unquote(path)
        image_url = f"{IMAGE_SERVER_BASE}{decoded_path}"
        timeout = aiohttp.ClientTimeout(
            total=30,
            connect=10,
            sock_connect=10,
            sock_read=30
        )
        connector = aiohttp.TCPConnector(
            ssl=False,
            limit=1,
            limit_per_host=1,
            force_close=True,
            enable_cleanup_closed=True
        )
        auth = aiohttp.BasicAuth(NAS_USER_NAME, NAS_USER_PASSWORD)

        async with aiohttp.ClientSession(timeout=timeout,
                                         auth=auth,
                                         connector=connector) as session:
            async with session.get(image_url, ssl=False) as resp:
                if resp.status != 200:
                    return JSONResponse(
                        {"status": "error", "message": f"Image fetch failed: {resp.status}"},
                        status_code=404
                    )

                content = await resp.read()
                content_type = resp.headers.get("Content-Type", "image/jpeg")

                return Response(
                    content=content,
                    media_type=content_type,
                    headers={"Cache-Control": "public, max-age=300"}
                )

    except Exception as e:
        traceback.print_exc()
        return JSONResponse(
            {"status": "error", "message": str(e)},
            status_code=500
        )


@router.post("/get/image", response_class=JSONResponse)
async def get_image_info(req_image_info: dict):
    batch_no = req_image_info.get('batch_no')
    line_input = req_image_info.get('line_input')

    try:
        rows = await aggregate_quality_space_03(batch_no, line_input)

        image_urls = []
        for row in rows:
            real_rel_path = row['real_img']
            ai_rel_path = row['ai_img']

            image_urls.append(
                {
                    "real_path": f"/aggregate/image/proxy?path={quote(real_rel_path)}",
                    "ai_path": f"/aggregate/image/proxy?path={quote(ai_rel_path)}"
                }
            )

        return JSONResponse({
            "image_rows": image_urls
        })

    except Exception as e:
        traceback.print_exc()
        return JSONResponse(
            {"status": "error", "message": str(e)},
            status_code=500
        )


