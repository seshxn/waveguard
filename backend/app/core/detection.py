import logging
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Deque
from collections import deque
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.schemas import schemas
from app.models import models
from app.core.config import settings
from app.websockets.manager import manager
from app.services.telegram import send_telegram_alert

logger = logging.getLogger(__name__)

rssi_windows: Dict[str, Deque] = {}
z_score_buffers: Dict[str, Deque] = {}
last_triggers: Dict[str, datetime] = {}

async def process_sample(sample: schemas.SampleCreate, db: AsyncSession):
    await manager.broadcast({
        "type": "sample",
        "data": sample.model_dump(mode="json")
    })

    result = await db.exec(select(models.Config).where(models.Config.key == "armed"))
    armed_config = result.first()
    is_armed = armed_config.value.lower() == "true" if armed_config else settings.WAVEGUARD_ARMED_DEFAULT

    if not is_armed:
        return

    result = await db.exec(select(models.Config).where(models.Config.key == "tracked_clients"))
    tracked_config = result.first()
    tracked_clients = tracked_config.value.split(",") if tracked_config and tracked_config.value else []
    
    if not tracked_clients and settings.WAVEGUARD_TRACKED_MACS:
        tracked_clients = settings.WAVEGUARD_TRACKED_MACS.split(",")
        
    if sample.client_mac not in tracked_clients:
        return

    key = f"{sample.router_id}:{sample.client_mac}"
    
    if key not in rssi_windows:
        rssi_windows[key] = deque()
    
    window = rssi_windows[key]
    current_time = datetime.utcnow()
    
    window.append((current_time, sample.rssi))
    
    window_seconds = settings.WAVEGUARD_WINDOW_SECONDS
    cutoff = current_time - timedelta(seconds=window_seconds)
    
    while window and window[0][0] < cutoff:
        window.popleft()
        
    if len(window) < 10:
        return
        
    rssi_values = [x[1] for x in window]
    mean_rssi = np.mean(rssi_values)
    std_rssi = np.std(rssi_values)
    
    if std_rssi == 0:
        return
        
    z_score = (sample.rssi - mean_rssi) / std_rssi
    
    if key not in z_score_buffers:
        z_score_buffers[key] = deque(maxlen=5)
        
    z_buffer = z_score_buffers[key]
    z_buffer.append(z_score)
    
    if len(z_buffer) < 3:
        return
        
    threshold = settings.WAVEGUARD_Z_THRESHOLD
    count_over_threshold = sum(1 for z in z_buffer if abs(z) > threshold)
    
    if count_over_threshold >= settings.WAVEGUARD_MIN_TRIGGER_SAMPLES:
        last_trigger = last_triggers.get(key)
        if last_trigger and (current_time - last_trigger).total_seconds() < settings.WAVEGUARD_DEBOUNCE_SECONDS:
            return
            
        last_triggers[key] = current_time
        
        event = models.MotionEvent(
            router_id=sample.router_id,
            client_mac=sample.client_mac,
            severity="medium",
            details={"z_score": float(z_score), "mean": float(mean_rssi), "std": float(std_rssi)}
        )
        db.add(event)
        await db.commit()
        await db.refresh(event)
        
        await manager.broadcast({
            "type": "event",
            "data": event.model_dump(mode="json")
        })
        
        msg = f"🚨 Motion detected! Client: {sample.client_mac}, Router: {sample.router_id}, Z-Score: {z_score:.2f}"
        await send_telegram_alert(msg)
