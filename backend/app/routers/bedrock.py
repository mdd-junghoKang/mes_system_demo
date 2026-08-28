from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import BedrockDetection

router = APIRouter()


def _to_datetime(row: BedrockDetection) -> datetime:
    return datetime.strptime(f"{row.get_date} {row.get_time.zfill(6)}", "%Y-%m-%d %H%M%S")


def _format_time_ago(now: datetime, at: datetime) -> str:
    diff_min = max(1, round((now - at).total_seconds() / 60))
    if diff_min < 60:
        return f"{diff_min}분 전"
    diff_hour = round(diff_min / 60)
    if diff_hour < 24:
        return f"{diff_hour}시간 전"
    return f"{round(diff_hour / 24)}일 전"


@router.get("")
async def get_bedrock_data(start: str, end: str, db: AsyncSession = Depends(get_db)):
    stmt = select(BedrockDetection).where(
        BedrockDetection.get_date >= start, BedrockDetection.get_date <= end
    )
    result = await db.execute(stmt)
    rows = result.scalars().all()

    total = len(rows)
    danger = [r for r in rows if r.warning_level == "DANGER"]
    caution = [r for r in rows if r.warning_level == "CAUTION"]
    normal_count = total - len(danger) - len(caution)

    def rate(count: int) -> float:
        return round(count / total * 100, 3) if total else 0.0

    most_recent_alarms = sorted(
        (r for r in rows if r.warning_level != "NORMAL"), key=_to_datetime, reverse=True
    )
    now = datetime.now()

    days = sorted({r.get_date for r in rows})

    return {
        "status": "success",
        "status_data": {
            "NORMAL_RATE": rate(normal_count),
            "CAUTION_RATE": rate(len(caution)),
            "DANGER_RATE": rate(len(danger)),
            "TOTAL_COUNT": total,
            "NORMAL_COUNT": normal_count,
            "CAUTION_COUNT": len(caution),
            "DANGER_COUNT": len(danger),
        },
        "alarm_data": [
            {
                "WARNING_LEVEL": r.warning_level,
                "AREA_CM": r.area_cm,
                "TIME_AGO": _format_time_ago(now, _to_datetime(r)),
            }
            for r in most_recent_alarms[:8]
        ],
        "history_data": [
            {
                "GET_DATE": r.get_date.replace("-", ""),
                "GET_TIME": r.get_time,
                "AREA_CM": r.area_cm,
                "WARNING_LEVEL": r.warning_level,
                "ORIGIN_IMG_FILE_PATH": r.origin_img_file_path,
                "RESULT_IMG_FILE_PATH": r.result_img_file_path,
            }
            for r in rows
        ],
        "chart_data": [
            {
                "GET_DATE": day,
                "CAUTION_COUNT": sum(1 for r in rows if r.get_date == day and r.warning_level == "CAUTION"),
                "DANGER_COUNT": sum(1 for r in rows if r.get_date == day and r.warning_level == "DANGER"),
            }
            for day in days
        ],
    }
