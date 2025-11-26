'use client';

import { useEffect, useState } from 'react';
import { api, Config } from '@/lib/api';

const SettingsPage = () => {
    const [config, setConfig] = useState<Config | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [trackedClients, setTrackedClients] = useState('');
    const [zThreshold, setZThreshold] = useState('');
    const [debounce, setDebounce] = useState('');
    const [telegramToken, setTelegramToken] = useState('');
    const [telegramChat, setTelegramChat] = useState('');

    useEffect(() => {
        api.getConfig().then(c => {
            setConfig(c);
            setTrackedClients(c.tracked_clients.join(', '));
            setZThreshold(String(c.z_threshold));
            setDebounce(String(c.debounce_seconds));
            setTelegramToken(c.telegram_bot_token || '');
            setTelegramChat(c.telegram_chat_id || '');
            setLoading(false);
        });
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.updateConfig('tracked_clients', trackedClients);
            await api.updateConfig('z_threshold', zThreshold);
            await api.updateConfig('debounce_seconds', debounce);
            await api.updateConfig('telegram_bot_token', telegramToken);
            await api.updateConfig('telegram_chat_id', telegramChat);
            alert('Settings saved successfully');
        } catch (e) {
            alert('Failed to save settings');
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading settings...</div>;

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold">Settings</h1>

            <div className="space-y-6 bg-card p-6 rounded-lg border border-border">
                <h2 className="text-xl font-semibold border-b border-border pb-2">Detection</h2>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Tracked Client MACs (comma separated)</label>
                    <input
                        type="text"
                        value={trackedClients}
                        onChange={e => setTrackedClients(e.target.value)}
                        className="w-full p-2 rounded-md bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="AA:BB:CC:DD:EE:FF, 11:22:33:44:55:66"
                    />
                    <p className="text-xs text-muted-foreground">Only these clients will be monitored for motion.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Z-Score Threshold</label>
                        <input
                            type="number"
                            step="0.1"
                            value={zThreshold}
                            onChange={e => setZThreshold(e.target.value)}
                            className="w-full p-2 rounded-md bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <p className="text-xs text-muted-foreground">Higher = less sensitive (default 2.5)</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Debounce (seconds)</label>
                        <input
                            type="number"
                            value={debounce}
                            onChange={e => setDebounce(e.target.value)}
                            className="w-full p-2 rounded-md bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <p className="text-xs text-muted-foreground">Minimum time between alerts</p>
                    </div>
                </div>
            </div>

            <div className="space-y-6 bg-card p-6 rounded-lg border border-border">
                <h2 className="text-xl font-semibold border-b border-border pb-2">Notifications (Telegram)</h2>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Bot Token</label>
                    <input
                        type="password"
                        value={telegramToken}
                        onChange={e => setTelegramToken(e.target.value)}
                        className="w-full p-2 rounded-md bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Chat ID</label>
                    <input
                        type="text"
                        value={telegramChat}
                        onChange={e => setTelegramChat(e.target.value)}
                        className="w-full p-2 rounded-md bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="12345678"
                    />
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-2 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 disabled:opacity-50"
                >
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </div>
    );
}

export default SettingsPage;
