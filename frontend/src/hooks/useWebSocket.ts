import { useEffect, useRef, useState } from 'react';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws/live';

export const useWebSocket = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [lastSample, setLastSample] = useState<any>(null);
    const [lastEvent, setLastEvent] = useState<any>(null);
    const wsRef = useRef<WebSocket | null>(null);

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
                setTimeout(connect, 3000);
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
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, []);

    return { isConnected, lastSample, lastEvent };
}
