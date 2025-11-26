import { useEffect, useState } from 'react';
import { api, type MotionEvent } from '../lib/api';

const EventsPage = () => {
    const [events, setEvents] = useState<MotionEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.getEvents(100).then(data => {
            setEvents(data);
            setLoading(false);
        });
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Motion Events</h1>
                <button
                    onClick={() => {
                        setLoading(true);
                        api.getEvents(100).then(data => {
                            setEvents(data);
                            setLoading(false);
                        });
                    }}
                    className="px-4 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80"
                >
                    Refresh
                </button>
            </div>

            <div className="bg-card rounded-lg border border-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-muted-foreground bg-muted/50">
                            <tr>
                                <th className="px-6 py-3">Time</th>
                                <th className="px-6 py-3">Client MAC</th>
                                <th className="px-6 py-3">Router ID</th>
                                <th className="px-6 py-3">Severity</th>
                                <th className="px-6 py-3">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">Loading events...</td>
                                </tr>
                            ) : events.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No events found</td>
                                </tr>
                            ) : (
                                events.map(event => (
                                    <tr key={event.id} className="hover:bg-muted/50">
                                        <td className="px-6 py-4">{new Date(event.created_at).toLocaleString()}</td>
                                        <td className="px-6 py-4 font-mono">{event.client_mac}</td>
                                        <td className="px-6 py-4">{event.router_id}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${event.severity === 'high' ? 'bg-red-500/10 text-red-500' :
                                                    event.severity === 'medium' ? 'bg-yellow-500/10 text-yellow-500' :
                                                        'bg-blue-500/10 text-blue-500'}`}>
                                                {event.severity}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground max-w-xs truncate">
                                            {JSON.stringify(event.details)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default EventsPage;
