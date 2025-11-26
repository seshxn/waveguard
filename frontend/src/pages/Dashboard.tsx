import { useEffect, useState } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { api, type Sample, type MotionEvent, type Config } from '../lib/api';
import LiveChart from '../components/LiveChart';

const Dashboard = () => {
    const { isConnected, lastSample, lastEvent } = useWebSocket();
    const [samples, setSamples] = useState<Sample[]>([]);
    const [events, setEvents] = useState<MotionEvent[]>([]);
    const [config, setConfig] = useState<Config | null>(null);
    const [trackedMacs, setTrackedMacs] = useState<string[]>([]);

    useEffect(() => {
        api.getConfig().then(c => {
            setConfig(c);
            setTrackedMacs(c.tracked_clients);
        });
        api.getEvents(5).then(setEvents);
    }, []);

    useEffect(() => {
        if (lastSample) {
            setSamples(prev => {
                const newSamples = [...prev, lastSample];
                if (newSamples.length > 500) return newSamples.slice(newSamples.length - 500);
                return newSamples;
            });
        }
    }, [lastSample]);

    useEffect(() => {
        if (lastEvent) {
            setEvents(prev => [lastEvent, ...prev].slice(0, 10));
        }
    }, [lastEvent]);

    const toggleArm = async () => {
        if (!config) return;
        const newState = !config.armed;
        await api.updateConfig('armed', String(newState));
        setConfig({ ...config, armed: newState });
    };

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
                <div className="p-6 bg-card rounded-lg border border-border">
                    <h3 className="text-sm font-medium text-muted-foreground">System Status</h3>
                    <div className="mt-2 flex items-center justify-between">
                        <span className={`text-2xl font-bold ${config?.armed ? 'text-green-500' : 'text-yellow-500'}`}>
                            {config?.armed ? 'ARMED' : 'DISARMED'}
                        </span>
                        <button
                            onClick={toggleArm}
                            className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                        >
                            {config?.armed ? 'Disarm' : 'Arm'}
                        </button>
                    </div>
                </div>

                <div className="p-6 bg-card rounded-lg border border-border">
                    <h3 className="text-sm font-medium text-muted-foreground">Connection</h3>
                    <div className="mt-2 flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className="text-2xl font-bold">{isConnected ? 'Online' : 'Offline'}</span>
                    </div>
                </div>

                <div className="p-6 bg-card rounded-lg border border-border">
                    <h3 className="text-sm font-medium text-muted-foreground">Last Event</h3>
                    <div className="mt-2">
                        <span className="text-xl font-bold">
                            {events[0] ? new Date(events[0].created_at).toLocaleTimeString() : 'None'}
                        </span>
                        {events[0] && (
                            <p className="text-sm text-muted-foreground">
                                {events[0].client_mac} ({events[0].severity})
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {trackedMacs.map(mac => (
                    <LiveChart key={mac} data={samples} clientMac={mac} />
                ))}
                {trackedMacs.length === 0 && (
                    <div className="col-span-2 p-12 text-center text-muted-foreground border border-dashed border-border rounded-lg">
                        No tracked clients configured. Go to Settings to add MAC addresses.
                    </div>
                )}
            </div>

            <div className="bg-card rounded-lg border border-border">
                <div className="p-6 border-b border-border">
                    <h3 className="text-lg font-semibold">Recent Events</h3>
                </div>
                <div className="p-6">
                    <table className="w-full text-sm text-left">
                        <thead className="text-muted-foreground">
                            <tr>
                                <th className="pb-3">Time</th>
                                <th className="pb-3">Client</th>
                                <th className="pb-3">Router</th>
                                <th className="pb-3">Severity</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {events.map(event => (
                                <tr key={event.id}>
                                    <td className="py-3">{new Date(event.created_at).toLocaleString()}</td>
                                    <td className="py-3 font-mono">{event.client_mac}</td>
                                    <td className="py-3">{event.router_id}</td>
                                    <td className="py-3">
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-500">
                                            {event.severity}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {events.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="py-4 text-center text-muted-foreground">No recent events</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
