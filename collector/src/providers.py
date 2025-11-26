import abc
import random
import subprocess
import logging
from typing import Dict, Optional

logger = logging.getLogger(__name__)

class MetricProvider(abc.ABC):
    @abc.abstractmethod
    def get_metrics(self, client_mac: str) -> Optional[Dict]:
        """
        Returns a dict with keys: rssi, noise, tx_rate, rx_rate
        or None if client not found.
        """
        pass

class StubMetricsProvider(MetricProvider):
    def get_metrics(self, client_mac: str) -> Optional[Dict]:
        if random.random() < 0.05:
            return None
            
        base_rssi = -60
        rssi = base_rssi + random.randint(-5, 5)
        
        return {
            "rssi": rssi,
            "noise": -90 + random.randint(-2, 2),
            "tx_rate": 144.0,
            "rx_rate": 144.0
        }

class IwMetricsProvider(MetricProvider):
    def __init__(self, interface: str = "wlan0"):
        self.interface = interface

    def get_metrics(self, client_mac: str) -> Optional[Dict]:
        try:
            result = subprocess.run(
                ["iw", "dev", self.interface, "station", "dump"],
                capture_output=True,
                text=True,
                check=True
            )
            output = result.stdout
            
            blocks = output.split("Station ")
            for block in blocks:
                if not block.strip():
                    continue
                    
                lines = block.splitlines()
                current_mac = lines[0].split()[0]
                
                if current_mac.lower() == client_mac.lower():
                    metrics = {}
                    for line in lines:
                        line = line.strip()
                        if line.startswith("signal:"):
                            parts = line.split()
                            metrics["rssi"] = int(parts[1])
                        elif line.startswith("tx bitrate:"):
                            parts = line.split()
                            metrics["tx_rate"] = float(parts[2])
                        elif line.startswith("rx bitrate:"):
                            parts = line.split()
                            metrics["rx_rate"] = float(parts[2])
                            
                    metrics["noise"] = -90 
                    
                    if "rssi" in metrics:
                        return {
                            "rssi": metrics["rssi"],
                            "noise": metrics["noise"],
                            "tx_rate": metrics.get("tx_rate", 0.0),
                            "rx_rate": metrics.get("rx_rate", 0.0)
                        }
                        
            return None
            
        except Exception as e:
            logger.error(f"Error reading iw metrics: {e}")
            return None
