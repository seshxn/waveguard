from fastapi import APIRouter
from app.api.api_v1.endpoints import samples, events, config

api_router = APIRouter()
api_router.include_router(samples.router, prefix="/samples", tags=["samples"])
api_router.include_router(events.router, prefix="/events", tags=["events"])
api_router.include_router(config.router, prefix="/config", tags=["config"])
