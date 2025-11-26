from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from app.db.session import get_session
from app.schemas import schemas
from app.models import models
from app.core.config import settings

router = APIRouter()

async def get_config_value(db: AsyncSession, key: str, default: str) -> str:
    result = await db.exec(select(models.Config).where(models.Config.key == key))
    config = result.first()
    return config.value if config else default

@router.get("/", response_model=schemas.ConfigResponse)
async def get_config(db: AsyncSession = Depends(get_session)):
    result = await db.exec(select(models.Config))
    configs = {c.key: c.value for c in result.all()}
    
    return schemas.ConfigResponse(
        armed=configs.get("armed", str(settings.WAVEGUARD_ARMED_DEFAULT)).lower() == "true",
        tracked_clients=configs.get("tracked_clients", "").split(",") if configs.get("tracked_clients") else [],
        z_threshold=float(configs.get("z_threshold", str(settings.WAVEGUARD_Z_THRESHOLD))),
        min_trigger_samples=int(configs.get("min_trigger_samples", str(settings.WAVEGUARD_MIN_TRIGGER_SAMPLES))),
        debounce_seconds=int(configs.get("debounce_seconds", str(settings.WAVEGUARD_DEBOUNCE_SECONDS))),
        telegram_bot_token=configs.get("telegram_bot_token", settings.TELEGRAM_BOT_TOKEN),
        telegram_chat_id=configs.get("telegram_chat_id", settings.TELEGRAM_CHAT_ID)
    )

@router.post("/", response_model=schemas.Config)
async def update_config(
    config_in: schemas.ConfigUpdate,
    key: str,
    db: AsyncSession = Depends(get_session)
):
    result = await db.exec(select(models.Config).where(models.Config.key == key))
    config = result.first()
    
    if config:
        config.value = config_in.value
        if config_in.scope:
            config.scope = config_in.scope
    else:
        config = models.Config(key=key, value=config_in.value, scope=config_in.scope or "global")
        db.add(config)
        
    await db.commit()
    await db.refresh(config)
    return config
