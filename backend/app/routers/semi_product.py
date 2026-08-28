from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import SemiProductInspection

router = APIRouter()


@router.get("")
async def get_semi_product_data(start: str, end: str, db: AsyncSession = Depends(get_db)):
    stmt = select(SemiProductInspection).where(
        SemiProductInspection.get_date >= start, SemiProductInspection.get_date <= end
    )
    result = await db.execute(stmt)
    rows = result.scalars().all()

    total_cycle = len(rows)
    total_defective = sum(1 for r in rows if r.result == "NG")

    days = sorted({r.get_date for r in rows})
    graph_data = [
        {
            "GET_DATE": day,
            "CYCLECOUNT": sum(1 for r in rows if r.get_date == day),
            "DEFECTIVE": sum(1 for r in rows if r.get_date == day and r.result == "NG"),
        }
        for day in days
    ]

    return {
        "status": "success",
        "summary_data": [{"CYCLECOUNT": total_cycle, "BAD": None, "DEFECTIVE": total_defective}],
        "graph_data": graph_data,
        "row_data": [
            {
                "GET_DATE": r.get_date,
                "GET_TIME": r.get_time,
                "DATA_NAME": r.data_name,
                "ITEM_CD": r.item_cd,
                "ITEM_NM": r.item_nm,
                "LOT_NO": r.lot_no,
                "RESULT": r.result,
                "IMG_PATH": r.img_path,
                "COLOR_DATA": r.color_data,
                "DEFECT_DATA": r.defect_data,
            }
            for r in rows
        ],
    }
