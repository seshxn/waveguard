# WaveGuard

WaveGuard is a Wi-Fi RF-based motion detection system that uses changes in RSSI and signal quality from a normal home router to detect human movement. It is designed to run on a Raspberry Pi 5 using Docker Compose.

## Architecture

WaveGuard consists of three main services:

1.  **Collector**: A Python service running on the Pi that gathers Wi-Fi signal metrics (RSSI, noise, etc.) using `iw` or a router API and sends them to the backend.
2.  **Backend**: A FastAPI service that ingests samples, runs a sliding-window Z-score detection algorithm, and manages configuration and alerts.
3.  **Frontend**: A Vite + React dashboard for real-time visualization of RSSI data, event logs, and system configuration.

## Setup

### Prerequisites

-   Raspberry Pi 5 (or any Linux host)
-   Docker & Docker Compose
-   A Wi-Fi interface (wlan0) connected to the target router

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/seshxn/waveguard.git
    cd waveguard
    ```

2.  **Configure environment**:
    ```bash
    cp .env.example .env
    # Edit .env with your specific settings (MAC addresses, Telegram keys, etc.)
    nano .env
    ```

3.  **Run with Docker Compose**:
    ```bash
    docker compose up --build -d
    ```

4.  **Access the Dashboard**:
    Open `http://<pi-ip>:3000` in your browser.

### Collector Service (Systemd)

For a more robust deployment on the Raspberry Pi, you can run the collector as a systemd service instead of a Docker container (useful if you need direct hardware access without container privileges).

1.  Navigate to the collector directory:
    ```bash
    cd collector
    ```
2.  Run the installation script:
    ```bash
    ./install_service.sh
    ```
    This will automatically:
    - Detect your user and paths.
    - Generate a `waveguard-collector.service` file.
    - Install, enable, and start the service.

## Configuration

-   **Tracked MACs**: Set `WAVEGUARD_TRACKED_MACS` in `.env` (comma-separated).
-   **Sensitivity**: Adjust `WAVEGUARD_Z_THRESHOLD` (default 2.5) to change detection sensitivity.
-   **Notifications**: Add `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` to enable alerts.

## Limitations

-   **Hardware**: Requires a Wi-Fi card supporting `iw` station dump or similar metrics.
-   **Sensitivity**: Best for detecting medium-to-large movements (walking) rather than fine gestures.
-   **Environment**: Performance depends heavily on router placement and RF environment.

## Testing

See `README.md` in each service directory for specific testing instructions.

To run all tests:
```bash
# Backend
docker compose run --rm waveguard-backend pytest

# Collector
docker compose run --rm waveguard-collector pytest
```
