import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ComposedChart
} from 'recharts';
import useStore from '../store';
import { useMemo } from 'react';

const Chart = () => {
    const { data, selectedTicker } = useStore();

    const chartData = useMemo(() => {
        if (!data || !selectedTicker) return [];
        return data.filter((item) => item.Ticker === selectedTicker);
    }, [data, selectedTicker]);

    if (!selectedTicker) {
        return <div className="text-center text-gray-500 mt-10">Select a stock to view its price in Gold.</div>;
    }

    if (chartData.length === 0) {
        return <div className="text-center text-gray-500 mt-10">Loading data or no data available for {selectedTicker}...</div>;
    }

    return (
        <div className="w-full h-[500px] bg-slate-800 p-4 rounded-lg shadow-xl border border-slate-700">
            <h2 className="text-2xl font-bold text-center mb-4 text-gold-400">
                {selectedTicker} Price in Gold vs USD
            </h2>
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                        dataKey="Date"
                        stroke="#9CA3AF"
                        tickFormatter={(str) => {
                            const date = new Date(str);
                            return date.toLocaleDateString();
                        }}
                    />
                    <YAxis
                        yAxisId="left"
                        stroke="#F59E0B"
                        label={{ value: 'Ounces of Gold', angle: -90, position: 'insideLeft', fill: '#F59E0B' }}
                    />
                    <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="#10B981"
                        label={{ value: 'Price (USD)', angle: 90, position: 'insideRight', fill: '#10B981' }}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                        labelStyle={{ color: '#D1D5DB' }}
                    />
                    <Legend />
                    <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="PriceGold"
                        stroke="#F59E0B"
                        name="Price in Gold (oz)"
                        dot={false}
                        strokeWidth={2}
                    />
                    <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="PriceUSD"
                        stroke="#10B981"
                        name="Price in USD ($)"
                        dot={false}
                        strokeWidth={2}
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
};

export default Chart;
