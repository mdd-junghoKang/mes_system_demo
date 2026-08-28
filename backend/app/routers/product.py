from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import ProductInspection

router = APIRouter()


@router.get("")
async def get_product_data(start: str, end: str, db: AsyncSession = Depends(get_db)):
    stmt = select(ProductInspection).where(
        ProductInspection.get_date >= start, ProductInspection.get_date <= end
    )
    result = await db.execute(stmt)
    rows = result.scalars().all()

    total_cycle = len(rows)
    total_ng = sum(1 for r in rows if r.result == "NG")

    days = sorted({r.get_date for r in rows})
    graph_data = [
        {
            "GET_DATE": day,
            "CYCLECOUNT": sum(1 for r in rows if r.get_date == day),
            "LOTNG": sum(1 for r in rows if r.get_date == day and r.result == "NG"),
        }
        for day in days
    ]

    return {
        "status": "success",
        "summary_data": [{"CYCLECOUNT": total_cycle, "LOTOK": total_cycle - total_ng, "LOTNG": total_ng}],
        "graph_data": graph_data,
        "row_data": [
            {
                "ID": r.id,
                "GET_DATE": r.get_date,
                "GET_TIME": r.get_time,
                "LOT_NO": r.lot_no,
                "ITEM_CD": r.item_cd,
                "ITEM_NM": r.item_nm,
                "ORIGIN_IMG_FILE_PATH": r.origin_img_file_path,
            }
            for r in rows
        ],
    }
