import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { type Sample } from '../lib/api';

interface LiveChartProps {
    data: Sample[];
    clientMac: string;
}

const LiveChart = ({ data, clientMac }: LiveChartProps) => {
    const clientData = data.filter(d => d.client_mac === clientMac);

    const formattedData = clientData.map(d => ({
        ...d,
        time: new Date(d.timestamp).toLocaleTimeString(),
    }));

    return (
        <div className="h-[300px] w-full bg-card p-4 rounded-lg border border-border">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Client: {clientMac}</h3>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formattedData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="time" stroke="#888" fontSize={12} tick={false} />
                    <YAxis domain={[-100, -30]} stroke="#888" fontSize={12} label={{ value: 'RSSI (dBm)', angle: -90, position: 'insideLeft', fill: '#888' }} />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                        itemStyle={{ color: '#fff' }}
                    />
                    <Line
                        type="monotone"
                        dataKey="rssi"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={false}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

export default LiveChart;
