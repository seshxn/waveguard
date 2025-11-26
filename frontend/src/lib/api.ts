const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export interface Sample {
    id: number;
    timestamp: string;
    router_id: string;
    client_mac: string;
    rssi: number;
    noise: number;
    tx_rate: number;
    rx_rate: number;
}

export interface MotionEvent {
    id: number;
    created_at: string;
    router_id: string;
    client_mac: string;
    severity: string;
    details: any;
}

export interface Config {
    armed: boolean;
    tracked_clients: string[];
    z_threshold: number;
    min_trigger_samples: number;
    debounce_seconds: number;
    telegram_bot_token?: string;
    telegram_chat_id?: string;
}

export const api = {
    getEvents: async (limit = 50): Promise<MotionEvent[]> => {
        const res = await fetch(`${API_BASE_URL}/events/?limit=${limit}`);
        if (!res.ok) throw new Error('Failed to fetch events');
        return res.json();
    },

    getConfig: async (): Promise<Config> => {
        const res = await fetch(`${API_BASE_URL}/config/`);
        if (!res.ok) throw new Error('Failed to fetch config');
        return res.json();
    },

    updateConfig: async (key: string, value: string, scope = 'global'): Promise<void> => {
        const res = await fetch(`${API_BASE_URL}/config/?key=${key}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ value, scope }),
        });
        if (!res.ok) throw new Error('Failed to update config');
    },
};
