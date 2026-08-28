from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Lot

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


@router.get("/card/{lot_id}")
async def get_lot_card_data(lot_id: str):
    # replaces useLotCardData.ts
    raise HTTPException(status_code=501, detail="not implemented")
