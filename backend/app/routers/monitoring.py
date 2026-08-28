import statistics
from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import MaterialBatchEntry, ProductionSnapshot, QualityMeasurement

router = APIRouter()

CATEGORIES = ["골재류", "시멘트류", "혼화제", "안료"]
HEIGHT_SPEC = 80.0
USL = 81.5
LSL = 78.5
ZONE_TAGS = ["05", "06", "07", "08", "09", "10", "11", "12", "13"]
MOTION_KEYS = [str(202 + i) for i in range(10)]


@router.get("/material")
async def get_material_monitoring(
    start_date: str,
    start_time: str,
    end_date: str,
    end_time: str,
    db: AsyncSession = Depends(get_db),
):
    start_at = datetime.strptime(f"{start_date} {start_time}", "%Y-%m-%d %H")
    end_at = datetime.strptime(f"{end_date} {end_time}", "%Y-%m-%d %H")

    stmt = select(MaterialBatchEntry).where(
        MaterialBatchEntry.recorded_at >= start_at, MaterialBatchEntry.recorded_at <= end_at
    )
    result = await db.execute(stmt)
    rows = result.scalars().all()

    by_material: dict[str, dict] = {}
    for r in rows:
        agg = by_material.setdefault(r.mat_name, {"gubun": r.gubun, "set": 0.0, "act": 0.0})
        agg["set"] += r.set_qty
        agg["act"] += r.act_qty

    row_data = []
    for mat_name, agg in by_material.items():
        set_qty, act_qty = agg["set"], agg["act"]
        def_qty = act_qty - set_qty
        def_rate = (def_qty / set_qty * 100) if set_qty else 0.0
        row_data.append(
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

    sum_set = sum(r["SET"] for r in row_data)
    sum_act = sum(r["ACT"] for r in row_data)

    graph1 = {}
    for cat in CATEGORIES:
        graph1[f"{cat}_SET"] = round(sum(r["SET"] for r in row_data if r["GUBUN"] == cat), 1)
        graph1[f"{cat}_ACT"] = round(sum(r["ACT"] for r in row_data if r["GUBUN"] == cat), 1)

    return {
        "status": "success",
        "monitoring_list": {
            "SUMMARY": [
                {
                    "SUM_SET": round(sum_set, 1),
                    "SUM_ACT": round(sum_act, 1),
                    "SUM_DEF": round(sum_act - sum_set, 1),
                    "SUM_DEFRATE": round((sum_act - sum_set) / sum_set * 100, 3) if sum_set else 0.0,
                    "QTY_MAT": len(row_data),
                }
            ],
            "GRAPH1": [graph1],
            "GRAPH2": [{"MAT_NAME": r["MAT_NAME"], "DEF_RATE": r["DEF_RATE"]} for r in row_data],
            "ROW": row_data,
        },
    }


@router.get("/production")
async def get_prod_monitoring(db: AsyncSession = Depends(get_db)):
    latest_stmt = select(ProductionSnapshot).order_by(ProductionSnapshot.recorded_at.desc()).limit(1)
    latest = (await db.execute(latest_stmt)).scalar_one_or_none()

    history_stmt = select(ProductionSnapshot).order_by(ProductionSnapshot.recorded_at.desc()).limit(20)
    history = list(reversed((await db.execute(history_stmt)).scalars().all()))

    current_row = None
    if latest:
        current_row = {
            "PLAY_YN": latest.play_yn,
            "HEIGHT": latest.height_ref,
            "INJECT_001": latest.product_no,
            "INJECT_002": latest.product_name,
            "INJECT_003": latest.cycle_count,
            "INJECT_005": latest.mold_no,
            "INJECT_006": latest.mold_name,
            "INJECT_106": latest.cycle_time_raw,
            "INJECT_107": latest.press_time_raw,
            "INJECT_193": latest.weight,
        }
        for tag in ZONE_TAGS:
            current_row[f"INJECT_Tag{tag}"] = latest.zone_thickness.get(tag, 0)
        for key in MOTION_KEYS:
            current_row[f"INJECT_{key}"] = latest.motion_speeds.get(key, 0)

    return {
        "status": "success",
        "monitoring_list": {
            "INJ_MONI": [current_row] if current_row else [],
            "INJ_MONI_GRAPH_1": [
                {"INDATE": r.recorded_at.strftime("%H:%M"), "INJECT_153": r.cycle_time_raw} for r in history
            ],
            "INJ_MONI_GRAPH_2": [
                {"INDATE": r.recorded_at.strftime("%H:%M"), "INJECT_106": r.cycle_time_raw} for r in history
            ],
        },
    }


@router.get("/quality/items")
async def get_quality_items(start: str, end: str, db: AsyncSession = Depends(get_db)):
    start_at = datetime.strptime(start, "%Y-%m-%d")
    end_at = datetime.strptime(end, "%Y-%m-%d").replace(hour=23, minute=59, second=59)

    stmt = select(QualityMeasurement.item_nm).where(
        QualityMeasurement.recorded_at >= start_at, QualityMeasurement.recorded_at <= end_at
    ).distinct()
    names = (await db.execute(stmt)).scalars().all()
    return {"status": "success", "item_list": [{"INJECT_002": name} for name in names]}


def _histogram(values: list[float], field: str, bins: int = 8):
    if not values:
        return []
    lo, hi = min(values), max(values)
    if lo == hi:
        hi = lo + 1
    step = (hi - lo) / bins
    edges = [lo + step * i for i in range(bins)]
    counts = [0] * bins
    for v in values:
        idx = min(bins - 1, int((v - lo) / step))
        counts[idx] += 1
    return [{field: round(edges[i], 1), "CNT": counts[i]} for i in range(bins)]


@router.get("/quality/detail")
async def get_quality_detail(start: str, end: str, item_cd: str, db: AsyncSession = Depends(get_db)):
    start_at = datetime.strptime(start, "%Y-%m-%d")
    end_at = datetime.strptime(end, "%Y-%m-%d").replace(hour=23, minute=59, second=59)

    stmt = select(QualityMeasurement).where(
        QualityMeasurement.recorded_at >= start_at,
        QualityMeasurement.recorded_at <= end_at,
        QualityMeasurement.item_nm == item_cd,
    ).order_by(QualityMeasurement.recorded_at)
    rows = (await db.execute(stmt)).scalars().all()

    def avg(values: list[float]) -> float:
        return round(sum(values) / len(values), 2) if values else 0.0

    summary = {
        "HEIGHT_1_AVG": avg([r.height_1_avg for r in rows]),
        "HEIGHT_2_AVG": avg([r.height_2_avg for r in rows]),
        "HEIGHT_3_AVG": avg([r.height_3_avg for r in rows]),
        "CYCLE_TIME": avg([r.cycle_time for r in rows]),
        "PRESS_TIME": avg([r.press_time for r in rows]),
        "WEIGHT": avg([r.weight for r in rows]),
    }

    by_day: dict[str, list[QualityMeasurement]] = {}
    for r in rows:
        by_day.setdefault(r.recorded_at.strftime("%Y-%m-%d"), []).append(r)

    dimension_raw = [
        {
            "INDATE": day,
            "HEIGHT_1_AVG": avg([r.height_1_avg for r in day_rows]),
            "HEIGHT_2_AVG": avg([r.height_2_avg for r in day_rows]),
            "HEIGHT_3_AVG": avg([r.height_3_avg for r in day_rows]),
            "WEIGHT": avg([r.weight for r in day_rows]),
        }
        for day, day_rows in sorted(by_day.items())
    ]

    all_heights = [r.height_1_avg for r in rows] + [r.height_2_avg for r in rows] + [r.height_3_avg for r in rows]
    mean = statistics.fmean(all_heights) if all_heights else HEIGHT_SPEC
    sigma = statistics.pstdev(all_heights) if len(all_heights) > 1 else 0.0
    cpk = round(min(USL - mean, mean - LSL) / (3 * sigma), 2) if sigma else 0.0

    limit = {"HEIGHT": HEIGHT_SPEC, "UCL": USL, "LCL": LSL, "AVG_VALUE": round(mean, 2), "CPK": cpk}

    return {
        "status": "success",
        "summary": {"status": "success", "summary": summary if rows else None},
        "dimension": {"status": "success", "raw": dimension_raw, "limit": limit if rows else None},
        "distributions": {
            "status": "success",
            "cycle": _histogram([r.cycle_time for r in rows], "CYCLE_TIME"),
            "press": _histogram([r.press_time for r in rows], "PRESS_TIME"),
            "height1": _histogram([r.height_1_avg for r in rows], "HEIGHT_1_AVG"),
            "height2": _histogram([r.height_2_avg for r in rows], "HEIGHT_2_AVG"),
            "height3": _histogram([r.height_3_avg for r in rows], "HEIGHT_3_AVG"),
            "weight": _histogram([r.weight for r in rows], "WEIGHT"),
        },
    }
