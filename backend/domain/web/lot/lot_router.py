import traceback

from fastapi import APIRouter
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder

from domain.web.db_pool import get_cursor


router = APIRouter(
    prefix='/lot',
    tags=['Lot'],
    include_in_schema=True,
    default_response_class=JSONResponse,
)


async def sp_lot_tracking(gubun: str, lot_no: str, f_date: str, t_date: str):
    async with get_cursor() as cursor:
        await cursor.execute(
            """
            EXEC [dbo].[SP_AQMS_LOT_TRAKING]
                  @SP_GUBUN = ?
                , @SS_LOT_NO = ?
                , @SS_FDATE = ?
                , @SS_TDATE = ?
            """,
            (gubun, lot_no or '', f_date, t_date)
        )

        while cursor.description is None:
            if not await cursor.nextset():
                return []

        columns = [col[0] for col in cursor.description]

        rows = await cursor.fetchall()

        result = [
            dict(zip(columns, row))
            for row in rows
        ]

        return result


async def sp_mix_tracking(mixer_no: str, f_date: str, t_date: str):
    async with get_cursor() as cursor:
        await cursor.execute(
            """
            EXEC [dbo].[SP_AQMS_LOT_TRAKING]
                  @SP_GUBUN = ?
                , @SS_LOT_NO = ?
                , @SS_FDATE = ?
                , @SS_TDATE = ?
            """,
            ('SEARCH_MIX', mixer_no or '', f_date, t_date)
        )

        while cursor.description is None:
            if not await cursor.nextset():
                return []

        columns = [col[0] for col in cursor.description]
        rows = await cursor.fetchall()

        result = [
            dict(zip(columns, row))
            for row in rows
        ]

        return result


async def sp_lot_flow_tracking(gubun: str, lot_no: str):
    async with get_cursor() as cursor:
        await cursor.execute(
            """
            EXEC [dbo].[SP_AQMS_LOT_TRAKING]
                  @SP_GUBUN = ?
                , @SS_LOT_NO = ?
            """,
            (gubun, lot_no)
        )

        while cursor.description is None:
            if not await cursor.nextset():
                return []

        columns = [col[0] for col in cursor.description]
        rows = await cursor.fetchall()

        result = [
            dict(zip(columns, row))
            for row in rows
        ]

        return result


async def sp_aqms_lot_traking_each(gubun: str, lot_no: str):
    async with get_cursor() as cursor:
        await cursor.execute(
            """
            EXEC [dbo].[SP_AQMS_LOT_TRAKING_EACH]
                  @SP_GUBUN = ?
                , @SS_LOT_NO = ?
                , @SS_MIX = ?
                , @SS_FDATE = ?
                , @SS_TDATE = ?
            """,
            (gubun, lot_no, '', '', '')
        )

        columns = [col[0] for col in cursor.description]
        rows = await cursor.fetchall()

        result = [
            dict(zip(columns, row))
            for row in rows
        ]

        return result


@router.post("/get/lot-tracking", response_class=JSONResponse)
async def get_lot_tracking(req_lot_tracking: dict):
    gubun = req_lot_tracking.get('gubun')
    lot_no = req_lot_tracking.get('lot_no')
    f_date = req_lot_tracking.get('start_date')
    t_date = req_lot_tracking.get('end_date')


    try:
        rows = await sp_lot_tracking(gubun, lot_no, f_date, t_date)

        return JSONResponse({
            "status": "success",
            "lot_tracking_list": rows,
        })

    except Exception as e:
        traceback.print_exc()
        return JSONResponse(
            {"status": "error", "message": str(e)},
            status_code=500
        )


@router.post("/get/mix-tracking", response_class=JSONResponse)
async def get_mix_tracking(req_mix_tracking: dict):
    mixer_no = req_mix_tracking.get('mixer_no')
    f_date = req_mix_tracking.get('start_date')
    t_date = req_mix_tracking.get('end_date')

    try:
        rows = await sp_mix_tracking(mixer_no, f_date, t_date)

        return JSONResponse({
            "status": "success",
            "mix_tracking_list": rows,
        })

    except Exception as e:
        traceback.print_exc()
        return JSONResponse(
            {"status": "error", "message": str(e)},
            status_code=500
        )


@router.post("/get/flow-tracking", response_class=JSONResponse)
async def get_lot_tracking(req_lot_tracking: dict):
    gubun = req_lot_tracking.get('gubun')
    lot_no = req_lot_tracking.get('lot_no')

    try:
        rows = await sp_lot_flow_tracking(gubun, lot_no)

        return JSONResponse({
            "status": "success",
            "lot_flow_list": rows,
        })

    except Exception as e:
        traceback.print_exc()
        return JSONResponse(
            {"status": "error", "message": str(e)},
            status_code=500
        )


@router.post("/get/card-data", response_class=JSONResponse)
async def get_lot_tracking_card(req_card_data: dict):
    lot_no = req_card_data.get('lot_no')
    gubun = req_card_data.get('gubun')

    try:
        rows = await sp_aqms_lot_traking_each(gubun, lot_no)

        return JSONResponse(
            content=jsonable_encoder({
                "status": "success",
                "lot_flow_list": rows,
            })
        )

    except Exception as e:
        traceback.print_exc()
        return JSONResponse(
            {"status": "error", "message": str(e)},
            status_code=500
        )


