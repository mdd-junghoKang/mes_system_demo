from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import (
    AggregateMeasurement,
    CuringLog,
    Lot,
    MaterialBatchEntry,
    ProductInspection,
    ProductionSnapshot,
    SemiProductInspection,
)
from app.routers.monitoring import MOTION_KEYS, ZONE_TAGS

router = APIRouter()


@router.get("/tracking")
async def get_lot_tracking(
    start: str,
    end: str,
    query: str = "",
    field: str = "LOT_NO",
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Lot).where(Lot.work_date >= start, Lot.work_date <= end)
    if query:
        column = Lot.lot_no if field == "LOT_NO" else Lot.mix_no
        stmt = stmt.where(column.contains(query))

    result = await db.execute(stmt)
    rows = result.scalars().all()
    lot_list = [
        {
            "WORK_DATE": r.work_date,
            "LOT_NO": r.lot_no,
            "MIX_NO": r.mix_no,
            "ITEM_CD": r.item_cd,
            "ITEM_NM": r.item_nm,
            "ORDER_NO": r.order_no,
            "COLOR_QUALITY": r.color_quality,
            "CURING_LOG": r.curing_log,
            "APPEARANCE_QUALITY": r.appearance_quality,
            "FINISHED_LOT": r.finished_lot,
        }
        for r in rows
    ]
    return {"status": "success", "lot_tracking_list": lot_list, "mix_tracking_list": lot_list}


@router.get("/card/{lot_no}")
async def get_lot_card_data(lot_no: str, gubun: str, db: AsyncSession = Depends(get_db)):
    if gubun == "AGG":
        rows = (
            await db.execute(select(AggregateMeasurement).where(AggregateMeasurement.lot_no == lot_no))
        ).scalars().all()
        by_batch: dict[tuple[str, str], list[AggregateMeasurement]] = {}
        for r in rows:
            by_batch.setdefault((r.line_info, r.batch_no), []).append(r)
        lot_flow_list = [
            {
                "LINE_INFO": line_info,
                "BATCH_NO": batch_no,
                "A_AVG_VALUE": round(sum(r.a_value for r in group) / len(group), 2),
                "A_MAX_VALUE": round(max(r.a_value for r in group), 2),
                "A_MIN_VALUE": round(min(r.a_value for r in group), 2),
                "P_AVG_VALUE": round(sum(r.p_value for r in group) / len(group), 2),
                "P_MAX_VALUE": round(max(r.p_value for r in group), 2),
                "P_MIN_VALUE": round(min(r.p_value for r in group), 2),
            }
            for (line_info, batch_no), group in by_batch.items()
        ]
        return {"status": "success", "lot_flow_list": lot_flow_list}

    if gubun == "MIX":
        rows = (
            await db.execute(select(MaterialBatchEntry).where(MaterialBatchEntry.lot_no == lot_no))
        ).scalars().all()
        by_material: dict[str, dict] = {}
        for r in rows:
            agg = by_material.setdefault(r.mat_name, {"gubun": r.gubun, "set": 0.0, "act": 0.0})
            agg["set"] += r.set_qty
            agg["act"] += r.act_qty
        lot_flow_list = []
        for mat_name, agg in by_material.items():
            set_qty, act_qty = agg["set"], agg["act"]
            def_qty = act_qty - set_qty
            def_rate = (def_qty / set_qty * 100) if set_qty else 0.0
            lot_flow_list.append(
                {
                    "GUBUN": agg["gubun"],
                    "MAT_NAME": mat_name,
                    "SET": round(set_qty, 1),
                    "ACT": round(act_qty, 1),
                    "DEF": round(def_qty, 1),
                    "DEF_RATE": round(def_rate, 3),
                    "ACC_RATE": round(max(0.0, 100 - abs(def_rate)), 1),
                }
            )
        return {"status": "success", "lot_flow_list": lot_flow_list}

    if gubun == "MOLD":
        row = (
            await db.execute(select(ProductionSnapshot).where(ProductionSnapshot.lot_no == lot_no).limit(1))
        ).scalars().first()
        if not row:
            return {"status": "success", "lot_flow_list": []}
        card = {
            "HEIGHT": row.height_ref,
            "ITEM_CD": row.item_cd,
            "LOT_NO": row.lot_no,
            "ORDER_NO": row.order_no,
            "INJECT_001": row.product_no,
            "INJECT_193": row.weight,
        }
        for tag in ZONE_TAGS:
            card[f"INJECT_Tag{tag}"] = row.zone_thickness.get(tag, 0)
        for key in MOTION_KEYS:
            card[f"INJECT_{key}"] = row.motion_speeds.get(key, 0)
        return {"status": "success", "lot_flow_list": [card]}

    if gubun == "SFP":
        row = (
            await db.execute(select(SemiProductInspection).where(SemiProductInspection.lot_no == lot_no).limit(1))
        ).scalars().first()
        if not row:
            return {"status": "success", "lot_flow_list": []}
        return {
            "status": "success",
            "lot_flow_list": [
                {
                    "IMG_PATH": row.img_path,
                    "COLOR_DATA": row.color_data,
                    "DEFECT_DATA": row.defect_data,
                    "CYCLE_ID": row.cycle_id,
                    "CYCLE_STATE": row.cycle_state,
                    "DATA_NAME": row.data_name,
                    "GET_DATE": row.get_date,
                    "GET_TIME": row.get_time,
                    "ITEM_GN": row.item_gn,
                    "ITEM_SN": row.item_sn,
                }
            ],
        }

    if gubun == "CURING":
        rows = (
            await db.execute(
                select(CuringLog).where(CuringLog.lot_no == lot_no).order_by(CuringLog.recorded_at)
            )
        ).scalars().all()
        return {
            "status": "success",
            "lot_flow_list": [
                {
                    "DATETIME": r.recorded_at.strftime("%m-%d %H:%M"),
                    "ZONE_1": r.zone_1,
                    "ZONE_2": r.zone_2,
                    "ZONE_3": r.zone_3,
                    "ZONE_4": r.zone_4,
                    "ZONE_5": r.zone_5,
                    "ZONE_6": r.zone_6,
                }
                for r in rows
            ],
        }

    if gubun == "FP":
        row = (
            await db.execute(select(ProductInspection).where(ProductInspection.lot_no == lot_no).limit(1))
        ).scalars().first()
        if not row:
            return {"status": "success", "lot_flow_list": []}
        return {
            "status": "success",
            "lot_flow_list": [
                {
                    "GET_DATE": row.get_date,
                    "GET_TIME": row.get_time,
                    "ORIGIN_IMG_FILE_PATH": row.origin_img_file_path,
                    "LOT_NO": row.lot_no,
                    "ITEM_CD": row.item_cd,
                }
            ],
        }

    raise HTTPException(status_code=400, detail=f"unknown gubun: {gubun}")


@router.get("/flow/{lot_no}")
async def get_lot_flow(lot_no: str, db: AsyncSession = Depends(get_db)):
    flow_list = []

    agg_rows = (
        await db.execute(select(AggregateMeasurement).where(AggregateMeasurement.lot_no == lot_no))
    ).scalars().all()
    if agg_rows:
        latest = max(agg_rows, key=lambda r: r.gathering_time)
        flow_list += [
            {"GUBUN": "001", "TYPE": "조립률", "VALUE": str(latest.a_value)},
            {"GUBUN": "001", "TYPE": "입형률", "VALUE": str(latest.p_value)},
        ]

    mix_rows = (
        await db.execute(select(MaterialBatchEntry).where(MaterialBatchEntry.lot_no == lot_no))
    ).scalars().all()
    if mix_rows:
        flow_list += [
            {"GUBUN": "002", "TYPE": "설정량", "VALUE": str(round(sum(r.set_qty for r in mix_rows), 1))},
            {"GUBUN": "002", "TYPE": "실제량", "VALUE": str(round(sum(r.act_qty for r in mix_rows), 1))},
        ]

    mold_row = (
        await db.execute(select(ProductionSnapshot).where(ProductionSnapshot.lot_no == lot_no).limit(1))
    ).scalars().first()
    if mold_row:
        flow_list += [
            {"GUBUN": "003", "TYPE": "중량", "VALUE": str(mold_row.weight)},
            {"GUBUN": "003", "TYPE": "두께", "VALUE": str(mold_row.height_ref)},
        ]

    sfp_row = (
        await db.execute(select(SemiProductInspection).where(SemiProductInspection.lot_no == lot_no).limit(1))
    ).scalars().first()
    if sfp_row:
        flow_list += [
            {"GUBUN": "004", "TYPE": "OK/NG", "VALUE": sfp_row.result},
            {"GUBUN": "004", "TYPE": "검사시각", "VALUE": sfp_row.get_time},
        ]

    curing_rows = (
        await db.execute(select(CuringLog).where(CuringLog.lot_no == lot_no))
    ).scalars().all()
    if curing_rows:
        avg_temp = sum(
            (r.zone_1 + r.zone_2 + r.zone_3 + r.zone_4 + r.zone_5 + r.zone_6) / 6 for r in curing_rows
        ) / len(curing_rows)
        flow_list.append({"GUBUN": "005", "TYPE": "ZONE 평균온도", "VALUE": str(round(avg_temp, 1))})

    fp_row = (
        await db.execute(select(ProductInspection).where(ProductInspection.lot_no == lot_no).limit(1))
    ).scalars().first()
    if fp_row:
        flow_list += [
            {"GUBUN": "007", "TYPE": "검사시각", "VALUE": fp_row.get_time},
            {"GUBUN": "007", "TYPE": "결과", "VALUE": fp_row.result},
        ]

    return {"status": "success", "lot_flow_list": flow_list}
