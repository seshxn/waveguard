from datetime import datetime
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, ConfigDict

# Shared properties
class SampleBase(BaseModel):
    router_id: str
    client_mac: str
    rssi: int
    noise: int
    tx_rate: float
    rx_rate: float
    timestamp: Optional[datetime] = None

# Properties to receive on creation
class SampleCreate(SampleBase):
    pass

# Properties to return to client
class Sample(SampleBase):
    id: int
    timestamp: datetime
    model_config = ConfigDict(from_attributes=True)

class MotionEventBase(BaseModel):
    router_id: str
    client_mac: str
    severity: str
    details: Optional[Dict[str, Any]] = None

class MotionEventCreate(MotionEventBase):
    pass

class MotionEvent(MotionEventBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class ConfigBase(BaseModel):
    key: str
    value: str
    scope: str = "global"

class ConfigCreate(ConfigBase):
    pass

class ConfigUpdate(BaseModel):
    value: str
    scope: Optional[str] = None

class Config(ConfigBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class ConfigResponse(BaseModel):
    armed: bool
    tracked_clients: List[str]
    z_threshold: float
    min_trigger_samples: int
    debounce_seconds: int
    telegram_bot_token: Optional[str] = None
    telegram_chat_id: Optional[str] = None
