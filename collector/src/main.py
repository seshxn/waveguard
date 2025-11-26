import asyncio
import logging
import os
import time
from typing import List
import httpx
from pydantic_settings import BaseSettings

from src.providers import MetricProvider, StubMetricsProvider, IwMetricsProvider

class Settings(BaseSettings):
    WAVEGUARD_BACKEND_URL: str = "http://localhost:8000"
    WAVEGUARD_ROUTER_ID: str = "router-1"
    WAVEGUARD_TRACKED_MACS: str = ""
    WAVEGUARD_COLLECTION_INTERVAL_SECONDS: float = 1.0
    WAVEGUARD_METRIC_PROVIDER: str = "stub"
    WAVEGUARD_INTERFACE: str = "wlan0"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("collector")

def get_provider() -> MetricProvider:
    if settings.WAVEGUARD_METRIC_PROVIDER == "iw":
        return IwMetricsProvider(interface=settings.WAVEGUARD_INTERFACE)
    return StubMetricsProvider()

async def collect_and_send():
    provider = get_provider()
    macs = [m.strip() for m in settings.WAVEGUARD_TRACKED_MACS.split(",") if m.strip()]
    
    if not macs:
        logger.warning("No tracked MACs configured.")
        return

    logger.info(f"Starting collector for {len(macs)} clients. Provider: {settings.WAVEGUARD_METRIC_PROVIDER}")
    
    async with httpx.AsyncClient() as client:
        while True:
            start_time = time.time()
            
            for mac in macs:
                metrics = provider.get_metrics(mac)
                if metrics:
                    payload = {
                        "router_id": settings.WAVEGUARD_ROUTER_ID,
                        "client_mac": mac,
                        "rssi": metrics["rssi"],
                        "noise": metrics["noise"],
                        "tx_rate": metrics["tx_rate"],
                        "rx_rate": metrics["rx_rate"]
                    }
                    
                    try:
                        resp = await client.post(
                            f"{settings.WAVEGUARD_BACKEND_URL}/api/v1/samples/",
                            json=payload,
                            timeout=2.0
                        )
                        if resp.status_code != 200:
                            logger.error(f"Failed to send sample: {resp.status_code} {resp.text}")
                    except Exception as e:
                        logger.error(f"Error sending sample: {e}")
                else:
                    pass
            
            elapsed = time.time() - start_time
            sleep_time = max(0, settings.WAVEGUARD_COLLECTION_INTERVAL_SECONDS - elapsed)
            await asyncio.sleep(sleep_time)

if __name__ == "__main__":
    try:
        asyncio.run(collect_and_send())
    except KeyboardInterrupt:
        logger.info("Collector stopped.")
