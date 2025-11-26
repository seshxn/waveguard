from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from app.db.session import get_session
from app.schemas import schemas
from app.models import models

router = APIRouter()

@router.get("/", response_model=List[schemas.MotionEvent])
async def read_events(
    skip: int = 0,
    limit: int = 100,
    router_id: Optional[str] = None,
    client_mac: Optional[str] = None,
    db: AsyncSession = Depends(get_session)
):
    query = select(models.MotionEvent)
    if router_id:
        query = query.where(models.MotionEvent.router_id == router_id)
    if client_mac:
        query = query.where(models.MotionEvent.client_mac == client_mac)
    
    query = query.offset(skip).limit(limit).order_by(models.MotionEvent.created_at.desc())
    result = await db.exec(query)
    return result.all()
