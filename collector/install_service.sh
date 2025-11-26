#!/bin/bash

# WaveGuard Collector Service Installer
# This script generates a systemd service file with the correct paths and user,
# then installs and starts the service.

set -e

# Ensure we are in the collector directory
if [ ! -f "src/main.py" ]; then
    echo "❌ Error: Please run this script from the 'collector' directory."
    echo "   cd collector && ./install_service.sh"
    exit 1
fi

# Detect environment
CURRENT_USER=$(whoami)
CURRENT_DIR=$(pwd)
PYTHON_PATH=$(which python3)
ROOT_DIR=$(dirname "$CURRENT_DIR")
ENV_FILE="$ROOT_DIR/.env"

echo "🌊 WaveGuard Collector Installer"
echo "--------------------------------"
echo "User:       $CURRENT_USER"
echo "Directory:  $CURRENT_DIR"
echo "Python:     $PYTHON_PATH"
echo "Config:     $ENV_FILE"
echo "--------------------------------"

# Check for .env file
if [ ! -f "$ENV_FILE" ]; then
    echo "⚠️  Warning: .env file not found at $ENV_FILE"
    echo "   Please make sure to create it from .env.example before starting the service."
fi

SERVICE_NAME="waveguard-collector.service"
TEMP_SERVICE_FILE="/tmp/$SERVICE_NAME"

# Generate service file
echo "📝 Generating service file..."
cat > $TEMP_SERVICE_FILE <<EOF
[Unit]
Description=WaveGuard Collector Service
After=network.target

[Service]
Type=simple
User=$CURRENT_USER
WorkingDirectory=$CURRENT_DIR
EnvironmentFile=$ENV_FILE
ExecStart=$PYTHON_PATH -m src.main
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

# Install service
echo "🚀 Installing service..."
if [ -f "/etc/systemd/system/$SERVICE_NAME" ]; then
    echo "   Stopping existing service..."
    sudo systemctl stop $SERVICE_NAME
fi

sudo mv $TEMP_SERVICE_FILE /etc/systemd/system/$SERVICE_NAME
sudo chown root:root /etc/systemd/system/$SERVICE_NAME
sudo chmod 644 /etc/systemd/system/$SERVICE_NAME

echo "🔄 Reloading systemd..."
sudo systemctl daemon-reload

echo "✅ Enabling and starting service..."
sudo systemctl enable $SERVICE_NAME
sudo systemctl restart $SERVICE_NAME

echo "--------------------------------"
echo "🎉 Installation complete!"
echo "   Status: sudo systemctl status $SERVICE_NAME"
echo "   Logs:   journalctl -u $SERVICE_NAME -f"
