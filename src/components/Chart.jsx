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
    const { data, selectedTicker, timeRange, setTimeRange } = useStore();

    const chartData = useMemo(() => {
        if (!data || !selectedTicker) return [];

        let filteredData = data.filter((item) => item.Ticker === selectedTicker);

        // Time Range Filtering
        if (timeRange !== 'Max' && filteredData.length > 0) {
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
                    break;
            }

            filteredData = filteredData.filter(item => new Date(item.Date) >= startDate);
        }

        return filteredData;
    }, [data, selectedTicker, timeRange]);

    if (!selectedTicker) {
        return <div className="text-center text-secondary mt-5">Select a stock to view its price in Gold.</div>;
    }

    if (chartData.length === 0) {
        if (data.length === 0) return <div className="text-center text-secondary mt-5">Loading data...</div>;
        return <div className="text-center text-secondary mt-5">No data available for {selectedTicker} in this range.</div>;
    }

    return (
        <div className="card bg-dark border-secondary shadow-lg">
            <div className="card-header bg-transparent border-secondary d-flex justify-content-between align-items-center flex-wrap">
                <h2 className="h4 text-warning mb-0 me-3">{selectedTicker} / Gold</h2>

                <div className="btn-group btn-group-sm" role="group">
                    {['1Y', '5Y', '10Y', 'Max'].map(range => (
                        <button
                            key={range}
                            type="button"
                            className={`btn btn-outline-warning ${timeRange === range ? 'active' : ''}`}
                            onClick={() => setTimeRange(range)}
                        >
                            {range}
                        </button>
                    ))}
                </div>
            </div>

            <div className="card-body" style={{ height: '500px' }}>
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
                            minTickGap={30}
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
                            contentStyle={{ backgroundColor: '#212529', border: '1px solid #6c757d', color: '#f8f9fa' }}
                            labelStyle={{ color: '#ced4da' }}
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
            </div>
        </div>
    );
};

export default Chart;
