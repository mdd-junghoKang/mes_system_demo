from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.routers.aggregate import get_aggregate_particle
from app.routers.bedrock import get_bedrock_data
from app.routers.product import get_product_data
from app.routers.semi_product import get_semi_product_data

router = APIRouter()


@router.get("")
async def get_main_dashboard(start: str, end: str, line: str | None = None, db: AsyncSession = Depends(get_db)):
    bedrock = await get_bedrock_data(start, end, db)
    semi = await get_semi_product_data(start, end, db)
    product = await get_product_data(start, end, db)

    assemble = {"assemble_rates": []}
    agg_graph = {"graph_data": {"graph_a": [], "graph_p": []}}
    if line:
        particle = await get_aggregate_particle(start, end, line, db)
        assemble = particle["assemble"]
        agg_graph = particle["graph"]

    bed_status = bedrock["status_data"]

    return {
        "assemble": assemble,
        "aggGraph": agg_graph,
        "bedStatus": {
            "status_data": {
                "DANGER_RATE": bed_status["DANGER_RATE"],
                "DANGER_COUNT": bed_status["DANGER_COUNT"],
                "TOTAL_COUNT": bed_status["TOTAL_COUNT"],
            }
        },
        "bedAlarms": bedrock["alarm_data"],
        "bedGraph": {"chart_data": bedrock["chart_data"]},
        "semi": {"graph_data": semi["graph_data"]},
        "product": {"graph_data": product["graph_data"]},
    }
