from fastapi import APIRouter, HTTPException

router = APIRouter()


@router.get("")
async def get_main_dashboard(start: str, end: str, line: str | None = None):
    # replaces useMainDashboard.ts
    raise HTTPException(status_code=501, detail="not implemented")
