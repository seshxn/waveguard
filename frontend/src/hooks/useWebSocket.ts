import { useEffect, useRef, useState } from 'react';
import type { Sample, MotionEvent } from '../lib/api';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws/live';

export const useWebSocket = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [lastSample, setLastSample] = useState<Sample | null>(null);
    const [lastEvent, setLastEvent] = useState<MotionEvent | null>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const connect = () => {
            const ws = new WebSocket(WS_URL);
            wsRef.current = ws;

            ws.onopen = () => {
                console.log('Connected to WebSocket');
                setIsConnected(true);
            };

            ws.onclose = () => {
                console.log('Disconnected from WebSocket');
                setIsConnected(false);
                reconnectTimeoutRef.current = setTimeout(connect, 3000);
            };

            ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    if (message.type === 'sample') {
                        setLastSample(message.data);
                    } else if (message.type === 'event') {
                        setLastEvent(message.data);
                    }
                } catch (e) {
                    console.error('Error parsing WebSocket message', e);
                }
            };
        };

        connect();

        return () => {
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, []);

    return { isConnected, lastSample, lastEvent };
}
