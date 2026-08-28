from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import AggregateLine, AggregateMeasurement

router = APIRouter()

LOW_A = 5.55
HIGH_A = 5.85
SIEVE_FIELDS = [
    "pass_00_15",
    "pass_00_30",
    "pass_00_60",
    "pass_01_20",
    "pass_02_25",
    "pass_05_00",
    "pass_10_00",
]
SIEVE_KEYS = [f.upper() for f in SIEVE_FIELDS]
LOW_DATA_LIST = ["L", 0, 0, 0, 0, 0, 20, 100, LOW_A]
HIGH_DATA_LIST = ["H", 1, 3, 4, 5, 10, 60, 100, HIGH_A]


@router.get("/info")
async def get_agg_info(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(AggregateLine))
    lines = result.scalars().all()
    return {"agg_info": [{"LINE_INFO": l.line_info, "AGG_INFO": l.agg_info, "USE_YN": l.use_yn} for l in lines]}


@router.get("/particle")
async def get_aggregate_particle(start: str, end: str, line: str, db: AsyncSession = Depends(get_db)):
    start_at = datetime.strptime(start, "%Y-%m-%d")
    end_at = datetime.strptime(end, "%Y-%m-%d").replace(hour=23, minute=59, second=59)

    stmt = (
        select(AggregateMeasurement)
        .where(
            AggregateMeasurement.line_info == line,
            AggregateMeasurement.gathering_time >= start_at,
            AggregateMeasurement.gathering_time <= end_at,
        )
        .order_by(AggregateMeasurement.gathering_time)
    )
    rows = (await db.execute(stmt)).scalars().all()

    assemble_rates = []
    if rows:
        latest = rows[-1]
        assemble_rates = [{"FINENESS_MODULUS": latest.a_value, "SHAPE_INDEX": latest.p_value}]

    graph_a = [[i, r.gathering_time.strftime("%Y-%m-%d %H:%M:%S"), r.a_value] for i, r in enumerate(rows)]
    graph_p = [[i, r.gathering_time.strftime("%Y-%m-%d %H:%M:%S"), r.p_value] for i, r in enumerate(rows)]

    by_day: dict[str, list[AggregateMeasurement]] = {}
    for r in rows:
        by_day.setdefault(r.gathering_time.strftime("%Y-%m-%d"), []).append(r)

    history_data = []
    for day, day_rows in sorted(by_day.items()):
        a_values = [r.a_value for r in day_rows]
        p_values = [r.p_value for r in day_rows]
        last = day_rows[-1]
        history_data.append(
            {
                "BATCH_NO": last.batch_no,
                "GETHERING_TIME": last.gathering_time.strftime("%Y-%m-%d %H:%M:%S"),
                "A_AVG_VALUE": round(sum(a_values) / len(a_values), 2),
                "A_MAX_VALUE": round(max(a_values), 2),
                "A_MIN_VALUE": round(min(a_values), 2),
                "P_AVG_VALUE": round(sum(p_values) / len(p_values), 2),
                "P_MAX_VALUE": round(max(p_values), 2),
                "P_MIN_VALUE": round(min(p_values), 2),
            }
        )

    return {
        "assemble": {"assemble_rates": assemble_rates},
        "graph": {
            "graph_data": {"graph_a": graph_a, "graph_p": graph_p},
            "assemble_data": {"low_line": LOW_A, "high_line": HIGH_A},
        },
        "history": {"status": "success", "history_data": history_data},
    }


@router.get("/gradation-history")
async def get_gradation_history(start: str, end: str, line: str, db: AsyncSession = Depends(get_db)):
    particle = await get_aggregate_particle(start, end, line, db)
    return {"history": particle["history"], "graph": particle["graph"]}


@router.get("/gradation-curve")
async def get_gradation_curve(date: str, line: str, batch_no: str | None = None, db: AsyncSession = Depends(get_db)):
    day_start = datetime.strptime(date, "%Y-%m-%d")
    day_end = day_start.replace(hour=23, minute=59, second=59)

    if batch_no:
        stmt = (
            select(AggregateMeasurement)
            .where(AggregateMeasurement.line_info == line, AggregateMeasurement.batch_no == batch_no)
            .order_by(AggregateMeasurement.gathering_time.desc())
            .limit(1)
        )
        row = (await db.execute(stmt)).scalars().first()
        single_batch = [getattr(row, f) for f in SIEVE_FIELDS] if row else []
        return {
            "status": "success",
            "single_batch": single_batch,
            "low_data_list": LOW_DATA_LIST,
            "high_data_list": HIGH_DATA_LIST,
        }

    stmt = select(AggregateMeasurement).where(
        AggregateMeasurement.line_info == line,
        AggregateMeasurement.gathering_time >= day_start,
        AggregateMeasurement.gathering_time <= day_end,
    )
    rows = (await db.execute(stmt)).scalars().all()

    avg_data_list = [
        {"BATCH_NO": int(r.batch_no) if r.batch_no.isdigit() else 0, **{k: getattr(r, f) for k, f in zip(SIEVE_KEYS, SIEVE_FIELDS)}}
        for r in rows
    ]

    return {
        "status": "success",
        "avg_data_list": avg_data_list,
        "low_data_list": LOW_DATA_LIST,
        "high_data_list": HIGH_DATA_LIST,
    }


@router.get("/gradation-lookup")
async def get_gradation_lookup(
    date: str, line: str, assemble_type: str, db: AsyncSession = Depends(get_db)
):
    day_start = datetime.strptime(date, "%Y-%m-%d")
    day_end = day_start.replace(hour=23, minute=59, second=59)

    stmt = (
        select(AggregateMeasurement)
        .where(
            AggregateMeasurement.line_info == line,
            AggregateMeasurement.gathering_time >= day_start,
            AggregateMeasurement.gathering_time <= day_end,
        )
        .order_by(AggregateMeasurement.gathering_time)
    )
    rows = (await db.execute(stmt)).scalars().all()

    by_batch: dict[str, list[AggregateMeasurement]] = {}
    for r in rows:
        by_batch.setdefault(r.batch_no, []).append(r)

    batch_info = []
    for batch, batch_rows in by_batch.items():
        a_values = [r.a_value for r in batch_rows]
        batch_info.append(
            {
                "BATCH_NO": batch,
                "GETHERING_TIME": batch_rows[-1].gathering_time.strftime("%Y-%m-%d %H:%M:%S"),
                "AVG_VALUE": round(sum(a_values) / len(a_values), 2),
                "MAX_VALUE": round(max(a_values), 2),
                "MIN_VALUE": round(min(a_values), 2),
            }
        )

    assemble_rate = {"assemble_rates": []}
    graph = {"status": "success", "graph_data": []}
    if assemble_type != "select-none" and rows:
        latest = rows[-1]
        assemble_rate = {
            "assemble_rates": [{"FINENESS_MODULUS": latest.a_value, "SHAPE_INDEX": latest.p_value}]
        }
        is_a = assemble_type == "A"
        graph = {
            "status": "success",
            "graph_data": [
                {
                    "GETHERING_TIME": r.gathering_time.strftime("%Y-%m-%d %H:%M:%S"),
                    "AVG_VALUE": r.a_value if is_a else r.p_value,
                }
                for r in rows
            ],
            **({"assemble_data": {"low_line": LOW_A, "high_line": HIGH_A}} if is_a else {}),
        }

    return {"batchInfo": batch_info, "assembleRate": assemble_rate, "graph": graph}


@router.get("/images")
async def get_batch_images(batch_no: str, line: str):
    return {"image_rows": []}
