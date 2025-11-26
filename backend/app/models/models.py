from datetime import datetime
from typing import Optional, List
from sqlmodel import SQLModel, Field, JSON
from sqlalchemy import Column
from sqlalchemy.dialects.postgresql import JSONB

class Sample(SQLModel, table=True):
    __tablename__ = "samples"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    timestamp: datetime = Field(default_factory=datetime.utcnow, index=True)
    router_id: str = Field(index=True)
    client_mac: str = Field(index=True)
    rssi: int
    noise: int
    tx_rate: float
    rx_rate: float

class MotionEvent(SQLModel, table=True):
    __tablename__ = "motion_events"

    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    router_id: str
    client_mac: str
    severity: str
    details: Optional[dict] = Field(default=None, sa_column=Column(JSONB))

class Config(SQLModel, table=True):
    __tablename__ = "config"

    id: Optional[int] = Field(default=None, primary_key=True)
    key: str = Field(unique=True, index=True)
    value: str
    scope: str = Field(default="global")
