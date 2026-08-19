import time
import asyncio
import logging
import traceback

from decimal import Decimal
from fastapi import APIRouter
from datetime import datetime, timedelta
from fastapi.responses import JSONResponse

from domain.web.db_pool import get_cursor

logger = logging.getLogger("perf")

router = APIRouter(
    prefix='/monitoring',
    tags=['Monitoring'],
    include_in_schema=True,
    default_response_class=JSONResponse,
)


async def sp_aqms_qms_monitoring_curing(start_date, end_date, item_cd):
    async with get_cursor() as cursor:
        try:
            await cursor.execute(
                """
                EXEC [dbo].[SP_AQMS_QMS_MONITORING]
                      @SP_GUBUN = 'SEARCH_CUR',
                      @SS_FDATE = ?,
                      @SS_TDATE = ?,
                      @SS_ITEM_CD = ?
                """,
                (start_date, end_date, item_cd)
            )

            while cursor.description is None:
                if not await cursor.nextset():
                    return []

            columns = [col[0] for col in cursor.description]

            rows = await cursor.fetchall()

            result = []
            for row in rows:
                row_dict = dict(zip(columns, row))
                for k, v in row_dict.items():
                    if isinstance(v, Decimal):
                        row_dict[k] = float(v)
                result.append(row_dict)

            return result

        except Exception as e:
            print("SQL ERROR:", e)
            traceback.print_exc()
            raise


async def sp_aqms_qms_monitoring_weight(start_date, end_date, item_cd):
    async with get_cursor() as cursor:
        try:
            await cursor.execute(
                """
                EXEC [dbo].[SP_AQMS_QMS_MONITORING]
                      @SP_GUBUN = ?
                    , @SS_FDATE = ?
                    , @SS_TDATE = ?
                    , @SS_ITEM_CD = ?
                """,
                ('SEARCH_HEIGHT', start_date, end_date, item_cd)
            )

            columns = [col[0] for col in cursor.description]

            rows = await cursor.fetchall()

            result = []
            for row in rows:
                row_dict = dict(zip(columns, row))
                for k, v in row_dict.items():
                    if isinstance(v, Decimal):
                        row_dict[k] = float(v)
                result.append(row_dict)

            return result

        except Exception as e:
            print("SQL ERROR:", e)
            raise


async def _sp_inj_monitoring_single(gubun: str):
    async with get_cursor() as cursor:
        await cursor.execute(
            """
            EXEC [dbo].[SP_AQMS_INJ_MONITORING]
                  @SP_GUBUN = ?
            """,
            gubun
        )
        rows = await cursor.fetchall()
        columns = [col[0] for col in cursor.description]

        data_list = []
        for row in rows:
            row_dict = {}
            for col_name, val in zip(columns, row):
                if isinstance(val, Decimal):
                    row_dict[col_name] = float(val)
                elif isinstance(val, datetime):
                    row_dict[col_name] = val.strftime('%Y-%m-%d %H:%M:%S')
                else:
                    row_dict[col_name] = val
            data_list.append(row_dict)

        return gubun, data_list


async def sp_aqms_prod_monitoring():
    results = await asyncio.gather(
        _sp_inj_monitoring_single('INJ_MONI'),
        _sp_inj_monitoring_single('INJ_MONI_GRAPH_1'),
        _sp_inj_monitoring_single('INJ_MONI_GRAPH_2'),
    )
    return {gubun: data for gubun, data in results}


async def _sp_mix_accdef_single(gubun, start_date, start_time, end_date, end_time):
    async with get_cursor() as cursor:
        await cursor.execute(
            """
            EXEC [dbo].[SP_AQMS_MIX_ACCDEF]
                  @SP_GUBUN = ?
                , @SS_FDATE = ?
                , @SS_FHOUR = ?
                , @SS_TDATE = ?
                , @SS_THOUR = ?
                , @SS_MAT = ?
            """,
            (gubun, start_date, start_time, end_date, end_time, '')
        )
        rows = await cursor.fetchall()
        columns = [col[0] for col in cursor.description]

        data_list = []
        for row in rows:
            row_dict = {}
            for col_name, val in zip(columns, row):
                if isinstance(val, Decimal):
                    row_dict[col_name] = float(val)
                elif isinstance(val, datetime):
                    row_dict[col_name] = val.strftime('%Y-%m-%d %H:%M:%S')
                else:
                    row_dict[col_name] = val
            data_list.append(row_dict)

        return gubun, data_list


async def sp_aqms_mix_monitoring(start_date, start_time, end_date, end_time):
    results = await asyncio.gather(
        _sp_mix_accdef_single('SUMMARY', start_date, start_time, end_date, end_time),
        _sp_mix_accdef_single('GRAPH1', start_date, start_time, end_date, end_time),
        _sp_mix_accdef_single('GRAPH2', start_date, start_time, end_date, end_time),
        _sp_mix_accdef_single('ROW', start_date, start_time, end_date, end_time),
    )
    return {gubun: data for gubun, data in results}


async def sp_aqms_monitoring(start_date: str = '', end_date: str = ''):
    async with get_cursor() as cursor:
        try:
            await cursor.execute(
                """
                EXEC [dbo].[SP_AQMS_QMS_MONITORING]
                      @SP_GUBUN = ?
                    , @SS_FDATE = ?
                    , @SS_TDATE = ?
                    , @SS_ITEM_CD = ?
                """,
                ('SEARCH_ITEM', start_date, end_date, '')
            )
            columns = [col[0] for col in cursor.description]

            rows = await cursor.fetchall()

            result = []
            for row in rows:
                row_dict = dict(zip(columns, row))
                for k, v in row_dict.items():
                    if isinstance(v, Decimal):
                        row_dict[k] = float(v)
                result.append(row_dict)

            return result

        except Exception as e:
            print("SQL ERROR:", e)
            raise


async def sp_aqms_qms_monitoring_raw(start_date: str, end_date: str, item_cd: str):
    async with get_cursor() as cursor:
        try:
            await cursor.execute(
                """
                EXEC [dbo].[SP_AQMS_QMS_MONITORING]
                      @SP_GUBUN = ?
                    , @SS_FDATE = ?
                    , @SS_TDATE = ?
                    , @SS_ITEM_CD = ?
                """,
                ('SEARCH_RAW', start_date, end_date, item_cd)
            )
            columns = [col[0] for col in cursor.description]

            rows = await cursor.fetchall()

            result = []
            for row in rows:
                row_dict = {}
                for col_name, val in zip(columns, row):
                    if isinstance(val, Decimal):
                        row_dict[col_name] = float(val)
                    elif isinstance(val, datetime):
                        row_dict[col_name] = val.strftime('%Y-%m-%d %H:%M:%S')
                    else:
                        row_dict[col_name] = val
                result.append(row_dict)

            return result

        except Exception as e:
            print("SQL ERROR:", e)
            raise


async def sp_aqms_qms_monitoring_limit(start_date: str, end_date: str, item_cd: str):
    async with get_cursor() as cursor:
        try:
            await cursor.execute(
                """
                EXEC [dbo].[SP_AQMS_QMS_MONITORING]
                      @SP_GUBUN = ?
                    , @SS_FDATE = ?
                    , @SS_TDATE = ?
                    , @SS_ITEM_CD = ?
                """,
                ('SEARCH_LIMIT', start_date, end_date, item_cd)
            )
            columns = [col[0] for col in cursor.description]

            rows = await cursor.fetchall()

            if not rows:
                return None

            row_dict = dict(zip(columns, rows[0]))
            for k, v in row_dict.items():
                if isinstance(v, Decimal):
                    row_dict[k] = float(v)
            return row_dict

        except Exception as e:
            print("SQL ERROR:", e)
            raise


async def sp_aqms_qms_monitoring_distribution(gubun: str, start_date: str, end_date: str, item_cd: str):
    async with get_cursor() as cursor:
        try:
            await cursor.execute(
                """
                EXEC [dbo].[SP_AQMS_QMS_MONITORING]
                      @SP_GUBUN = ?
                    , @SS_FDATE = ?
                    , @SS_TDATE = ?
                    , @SS_ITEM_CD = ?
                """,
                (gubun, start_date, end_date, item_cd)
            )
            columns = [col[0] for col in cursor.description]

            rows = await cursor.fetchall()

            result = []
            for row in rows:
                row_dict = dict(zip(columns, row))
                for k, v in row_dict.items():
                    if isinstance(v, Decimal):
                        row_dict[k] = float(v)
                result.append(row_dict)

            return result

        except Exception as e:
            print("SQL ERROR:", e)
            raise


async def sp_aqms_qms_monitoring_summary(start_date: str, end_date: str, item_cd: str):
    async with get_cursor() as cursor:
        try:
            await cursor.execute(
                """
                EXEC [dbo].[SP_AQMS_QMS_MONITORING]
                      @SP_GUBUN = ?
                    , @SS_FDATE = ?
                    , @SS_TDATE = ?
                    , @SS_ITEM_CD = ?
                """,
                ('SEARCH_SUMMARY', start_date, end_date, item_cd)
            )
            columns = [col[0] for col in cursor.description]

            rows = await cursor.fetchall()

            result = []
            for row in rows:
                row_dict = dict(zip(columns, row))
                for k, v in row_dict.items():
                    if isinstance(v, Decimal):
                        row_dict[k] = float(v)
                result.append(row_dict)

            return result[0] if result else None

        except Exception as e:
            print("SQL ERROR:", e)
            raise


@router.post("/get/prod/", response_class=JSONResponse)
async def get_aqms_prod_monitoring():
    try:
        t0 = time.perf_counter()
        rows = await sp_aqms_prod_monitoring()
        logger.info(f"[monitoring] prod SP done in {(time.perf_counter()-t0)*1000:.0f}ms")

        return JSONResponse({
            "status": "success",
            "monitoring_list": rows,
        })

    except Exception as e:
        traceback.print_exc()
        return JSONResponse(
            {"status": "error", "message": str(e)},
            status_code=500
        )

@router.post("/get/item/", response_class=JSONResponse)
async def get_aqms_item_monitoring(req_status_info: dict):
    start_date = req_status_info.get('start_date', '')
    end_date = req_status_info.get('end_date', '')

    try:
        rows = await sp_aqms_monitoring(start_date, end_date)

        return JSONResponse({
            "status": "success",
            "item_list": rows,
        })

    except Exception as e:
        traceback.print_exc()
        return JSONResponse(
            {"status": "error", "message": str(e)},
            status_code=500
        )


@router.post("/get/summary/", response_class=JSONResponse)
async def get_aqms_qms_summary(req_status_info: dict):
    start_date = req_status_info.get('start_date', '')
    end_date = req_status_info.get('end_date', '')
    item_cd = req_status_info.get('item_cd', '')

    try:
        summary = await sp_aqms_qms_monitoring_summary(start_date, end_date, item_cd)

        return JSONResponse({
            "status": "success",
            "summary": summary,
        })

    except Exception as e:
        traceback.print_exc()
        return JSONResponse(
            {"status": "error", "message": str(e)},
            status_code=500
        )


@router.post("/get/dimension/", response_class=JSONResponse)
async def get_aqms_qms_dimension(req_status_info: dict):
    start_date = req_status_info.get('start_date', '')
    end_date = req_status_info.get('end_date', '')
    item_cd = req_status_info.get('item_cd', '')

    try:
        raw, limit = await asyncio.gather(
            sp_aqms_qms_monitoring_raw(start_date, end_date, item_cd),
            sp_aqms_qms_monitoring_limit(start_date, end_date, item_cd),
        )

        return JSONResponse({
            "status": "success",
            "raw": raw,
            "limit": limit,
        })

    except Exception as e:
        traceback.print_exc()
        return JSONResponse(
            {"status": "error", "message": str(e)},
            status_code=500
        )


@router.post("/get/distributions/", response_class=JSONResponse)
async def get_aqms_qms_distributions(req_status_info: dict):
    start_date = req_status_info.get('start_date', '')
    end_date = req_status_info.get('end_date', '')
    item_cd = req_status_info.get('item_cd', '')

    try:
        cycle, press, height1, height2, height3, weight = await asyncio.gather(
            sp_aqms_qms_monitoring_distribution('SEARCH_CYCLE_DIST', start_date, end_date, item_cd),
            sp_aqms_qms_monitoring_distribution('SEARCH_PRESS_DIST', start_date, end_date, item_cd),
            sp_aqms_qms_monitoring_distribution('SEARCH_HEIGHT1_DIST', start_date, end_date, item_cd),
            sp_aqms_qms_monitoring_distribution('SEARCH_HEIGHT2_DIST', start_date, end_date, item_cd),
            sp_aqms_qms_monitoring_distribution('SEARCH_HEIGHT3_DIST', start_date, end_date, item_cd),
            sp_aqms_qms_monitoring_distribution('SEARCH_WEIGHT_DIST', start_date, end_date, item_cd),
        )

        return JSONResponse({
            "status": "success",
            "cycle": cycle,
            "press": press,
            "height1": height1,
            "height2": height2,
            "height3": height3,
            "weight": weight,
        })

    except Exception as e:
        traceback.print_exc()
        return JSONResponse(
            {"status": "error", "message": str(e)},
            status_code=500
        )


@router.post("/get/material/", response_class=JSONResponse)
async def get_aqms_mix_monitoring(req_status_info: dict):
    start_date = req_status_info.get('start_date')
    start_time = req_status_info.get('start_time')
    end_date = req_status_info.get('end_date')
    end_time = req_status_info.get('end_time')

    try:
        rows = await sp_aqms_mix_monitoring(start_date, start_time, end_date, end_time)

        return JSONResponse({
            "status": "success",
            "monitoring_list": rows,
        })

    except Exception as e:
        traceback.print_exc()
        return JSONResponse(
            {"status": "error", "message": str(e)},
            status_code=500
        )

@router.post("/get/curing/", response_class=JSONResponse)
async def get_aqms_mix_monitoring(req_status_info: dict):
    start_date = req_status_info.get('start_date')
    end_date = req_status_info.get('end_date')
    item_cd = req_status_info.get('item_cd')

    try:
        rows = await sp_aqms_qms_monitoring_curing(start_date, end_date, item_cd)

        return JSONResponse({
            "status": "success",
            "curing_list": rows,
        })

    except Exception as e:
        traceback.print_exc()
        return JSONResponse(
            {"status": "error", "message": str(e)},
            status_code=500
        )


@router.post("/get/weight/", response_class=JSONResponse)
async def get_aqms_mix_monitoring(req_status_info: dict):
    start_date = req_status_info.get('start_date')
    end_date = req_status_info.get('end_date')
    item_cd = req_status_info.get('item_cd')

    try:
        rows = await sp_aqms_qms_monitoring_weight(start_date, end_date, item_cd)

        return JSONResponse({
            "status": "success",
            "weight_list": rows,
        })

    except Exception as e:
        traceback.print_exc()
        return JSONResponse(
            {"status": "error", "message": str(e)},
            status_code=500
        )


