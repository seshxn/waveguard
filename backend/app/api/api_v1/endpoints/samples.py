from typing import List, Union
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession
from app.db.session import get_session
from app.schemas import schemas
from app.models import models
from app.core import detection

router = APIRouter()

@router.post("/", response_model=schemas.Sample)
async def create_sample(
    sample: schemas.SampleCreate,
    db: AsyncSession = Depends(get_session)
):
    db_sample = models.Sample.model_validate(sample)
    db.add(db_sample)
    await db.commit()
    await db.refresh(db_sample)
    
    await detection.process_sample(sample, db)
    
    return db_sample

@router.post("/batch", response_model=List[schemas.Sample])
async def create_samples_batch(
    samples: List[schemas.SampleCreate],
    db: AsyncSession = Depends(get_session)
):
    db_samples = [models.Sample.model_validate(s) for s in samples]
    db.add_all(db_samples)
    await db.commit()
    for s in db_samples:
        await db.refresh(s)
        
    for s in samples:
        await detection.process_sample(s, db)
        
    return db_samples
