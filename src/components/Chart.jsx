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
import TimeScale from './TimeScale';

const Chart = () => {
    const { data, selectedTicker, timeRange } = useStore();

    const formatGoldPrice = (value) => {
        if (value === 0) return "0 oz";
        const absValue = Math.abs(value);

        if (absValue >= 1) {
            return `${value.toPrecision(4)} oz`;
        } else if (absValue >= 0.001) {
            return `${(value * 1000).toPrecision(4)} m oz`;
        } else {
            return `${(value * 1000000).toPrecision(4)} µ oz`;
        }
    };

    const formatUSD = (value) => {
        return `$${value.toFixed(2)}`;
    };

    const chartData = useMemo(() => {
        if (!data || !selectedTicker) return [];

        let filteredData = data.filter((item) => item.Ticker === selectedTicker);

        // Time Range Filtering
        if (timeRange !== 'Max' && filteredData.length > 0) {
            // Ensure filteredData is sorted (it should be from App.jsx, but good to be safe for local logic)
            filteredData.sort((a, b) => new Date(a.Date) - new Date(b.Date));

            const lastDate = new Date(filteredData[filteredData.length - 1].Date);
            let startDate = new Date(lastDate);

            switch (timeRange) {
                case '1Y':
                    startDate.setFullYear(lastDate.getFullYear() - 1);
                    break;
                case '5Y':
                    startDate.setFullYear(lastDate.getFullYear() - 5);
                    break;
                case '10Y':
                    startDate.setFullYear(lastDate.getFullYear() - 10);
                    break;
                default:
                    // Max: set to very old date or just don't filter
                    startDate = new Date(0);
                    break;
            }

            if (timeRange !== 'Max') {
                filteredData = filteredData.filter(item => new Date(item.Date) >= startDate);
            }
        }

        return filteredData;
    }, [data, selectedTicker, timeRange]);

    const renderContent = () => {
        if (!selectedTicker) {
            return <div className="d-flex justify-content-center align-items-center h-100 text-secondary">Select a stock to view its price in Gold.</div>;
        }
        if (chartData.length === 0) {
            if (data.length === 0) return <div className="d-flex justify-content-center align-items-center h-100 text-secondary">Loading data...</div>;
            return <div className="d-flex justify-content-center align-items-center h-100 text-secondary">No data available for {selectedTicker} in this range.</div>;
        }
        return (
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                        dataKey="Date"
                        stroke="#9CA3AF"
                        tickFormatter={(str) => {
                            const date = new Date(str);
                            if (timeRange === '1Y') {
                                return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                            }
                            return date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
                        }}
                        minTickGap={30}
                    />
                    <YAxis
                        yAxisId="left"
                        stroke="#F59E0B"
                        label={{ value: 'Ounces of Gold', angle: -90, position: 'insideLeft', fill: '#F59E0B', dy: 50 }}
                        tickFormatter={formatGoldPrice}
                    />
                    <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="#10B981"
                        label={{ value: 'Price (USD)', angle: 90, position: 'insideRight', fill: '#10B981' }}
                        tickFormatter={formatUSD}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#212529', border: '1px solid #6c757d', color: '#f8f9fa' }}
                        labelStyle={{ color: '#ced4da' }}
                        formatter={(value, name) => {
                            if (name === "Price in Gold (oz)") return [formatGoldPrice(value), name];
                            if (name === "Price in USD ($)") return [formatUSD(value), name];
                            return [value, name];
                        }}
                    />
                    <Legend wrapperStyle={{ color: '#adb5bd' }} />
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
        );
    };

    return (
        <div className="d-flex flex-column h-100 w-100 bg-dark border border-secondary rounded overflow-hidden shadow-lg">
            <div className="p-2 d-flex justify-content-between align-items-center border-bottom border-secondary" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                <h2 className="h6 text-warning mb-0">{selectedTicker} / Gold</h2>
                <TimeScale />
            </div>

            <div className="flex-grow-1 min-h-0 w-100 p-2 position-relative">
                {renderContent()}
            </div>
        </div>
    );
};

export default Chart;
