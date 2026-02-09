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
import { useMemo, useState } from 'react';
import TimeScale from './TimeScale';
import { calculateTrendlines } from '../utils/analysis';

const Chart = () => {
    const { data, selectedTicker, timeRange, isLogScale, setIsLogScale } = useStore();
    const [trendlineType, setTrendlineType] = useState('none');
    const [showRainbow, setShowRainbow] = useState(false);

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

        // Calculate Trendlines if enabled
        if (trendlineType !== 'none' && filteredData.length > 1) {
            const trendData = calculateTrendlines(filteredData, trendlineType);
            // trendData already matches the structure we need
            return trendData;
        }

        return filteredData;
    }, [data, selectedTicker, timeRange, trendlineType]);

    // Determine the scale for the Y-Axis based on the maximum value in the dataset
    const goldAxisConfig = useMemo(() => {
        if (chartData.length === 0) return { scale: 1, unit: 'Ounces', label: 'Oz' };

        const maxVal = Math.max(...chartData.map(d => Math.abs(d.PriceGold)));

        if (maxVal === 0) return { scale: 1, unit: 'Ounces', label: 'Oz' };

        if (maxVal < 0.001) {
            return { scale: 1000000, unit: 'micro Oz', label: 'µoz' };
        } else if (maxVal < 1) {
            return { scale: 1000, unit: 'milli Oz', label: 'moz' };
        } else {
            return { scale: 1, unit: 'Ounces', label: 'oz' };
        }
    }, [chartData]);

    const formatGoldAxisTick = (value) => {
        if (value === 0) return "0";
        return (value * goldAxisConfig.scale).toPrecision(4);
    };

    const formatGoldTooltip = (value) => {
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
                <ComposedChart data={chartData} margin={{ left: 10, right: 10 }}>
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
                        width={80} // Increased width to prevent overlap
                        label={{
                            value: `Price (${goldAxisConfig.unit} Gold)`,
                            angle: -90,
                            position: 'insideLeft',
                            fill: '#F59E0B',
                            style: { textAnchor: 'middle' }
                        }}
                        tickFormatter={formatGoldAxisTick}
                        scale={isLogScale ? 'log' : 'linear'}
                        domain={['auto', 'auto']}
                    />
                    <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="#10B981"
                        width={80} // Increased width for right axis too
                        label={{
                            value: 'Price (USD)',
                            angle: 90,
                            position: 'insideRight',
                            fill: '#10B981',
                            style: { textAnchor: 'middle' },
                            dy: -50 // Adjust vertical position if needed, though 'middle' usually handles center. Recharts positioning can be tricky.
                        }}
                        tickFormatter={formatUSD}
                        scale={isLogScale ? 'log' : 'linear'}
                        domain={['auto', 'auto']}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ color: '#adb5bd' }} />
                    <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="PriceGold"
                        stroke="#F59E0B"
                        name={`Price in Gold (${goldAxisConfig.label})`}
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

                    {/* Trendlines */}
                    {trendlineType !== 'none' && (
                        <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="trendline"
                            stroke="#ffffff"
                            strokeDasharray="5 5"
                            name="Trendline"
                            dot={false}
                            strokeWidth={2}
                        />
                    )}

                    {/* Rainbow Bands */}
                    {trendlineType !== 'none' && showRainbow && (
                        <>
                            <Line yAxisId="left" type="monotone" dataKey="trendTop10" stroke="#EF4444" dot={false} strokeWidth={1} name="Top 10%" />
                            <Line yAxisId="left" type="monotone" dataKey="trendTop20" stroke="#F59E0B" dot={false} strokeWidth={1} name="Top 20%" />
                            <Line yAxisId="left" type="monotone" dataKey="trendBottom20" stroke="#3B82F6" dot={false} strokeWidth={1} name="Bottom 20%" />
                            <Line yAxisId="left" type="monotone" dataKey="trendBottom10" stroke="#8B5CF6" dot={false} strokeWidth={1} name="Bottom 10%" />
                        </>
                    )}

                </ComposedChart>
            </ResponsiveContainer>
        );
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            // payload[0] is usually Price in Gold (left axis), payload[1] is Price in USD (right axis)
            // But better to find by dataKey or name if order changes
            const goldItem = payload.find(p => p.dataKey === 'PriceGold');
            const usdItem = payload.find(p => p.dataKey === 'PriceUSD');

            const priceGold = goldItem ? goldItem.value : 0;
            const priceUSD = usdItem ? usdItem.value : 0;

            // Calculate Gold Price (USD per Oz)
            // Asset Price (USD) = Asset Price (USD) / Asset Price (Gold Oz) -> Wait no
            // Gold Price (USD/Oz) = Asset Price (USD) / Asset Price (Gold Oz)
            let goldPriceUSD = 0;
            if (priceGold > 0) {
                goldPriceUSD = priceUSD / priceGold;
            }

            return (
                <div className="custom-tooltip bg-dark p-2 border border-secondary rounded shadow-sm" style={{ backgroundColor: '#212529', minWidth: '200px' }}>
                    <p className="label text-light mb-2 fw-bold border-bottom border-secondary pb-1">
                        {new Date(label).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                    <div className="d-flex justify-content-between mb-1">
                        <span style={{ color: '#F59E0B' }}>Price in Gold:</span>
                        <span className="fw-mono text-light">{formatGoldTooltip(priceGold)}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-1">
                        <span style={{ color: '#10B981' }}>Price in USD:</span>
                        <span className="fw-mono text-light">{formatUSD(priceUSD)}</span>
                    </div>
                    {goldPriceUSD > 0 && (
                        <div className="d-flex justify-content-between mt-2 pt-2 border-top border-secondary">
                            <span className="text-warning small fst-italic">1 Oz Gold:</span>
                            <span className="fw-mono text-light small">{formatUSD(goldPriceUSD)}</span>
                        </div>
                    )}
                </div>
            );
        }

        return null;
    };

    return (
        <div className="d-flex flex-column h-100 w-100 bg-dark border border-secondary rounded overflow-hidden shadow-lg">
            <div className="p-2 d-flex justify-content-between align-items-center border-bottom border-secondary" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                <h2 className="h6 text-warning mb-0">{selectedTicker} / Gold</h2>
                <div className="d-flex align-items-center gap-3">
                    {/* Trendline Controls */}
                    <div className="d-flex align-items-center gap-2">
                        <label className="text-secondary small mb-0 me-1">Trend:</label>
                        <select
                            className="form-select form-select-sm bg-dark text-light border-secondary"
                            style={{ width: 'auto', paddingRight: '2.5rem' }}
                            value={trendlineType}
                            onChange={(e) => setTrendlineType(e.target.value)}
                        >
                            <option value="none">None</option>
                            <option value="linear">Linear</option>
                            <option value="log">Log</option>
                        </select>

                        {trendlineType !== 'none' && (
                            <div className="form-check form-switch mb-0 ms-2">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    role="switch"
                                    id="rainbowSwitch"
                                    checked={showRainbow}
                                    onChange={(e) => setShowRainbow(e.target.checked)}
                                    style={{ cursor: 'pointer' }}
                                />
                                <label className="form-check-label text-secondary small" htmlFor="rainbowSwitch" style={{ cursor: 'pointer' }}>
                                    Rainbow
                                </label>
                            </div>
                        )}
                    </div>

                    <div className="form-check form-switch mb-0 ms-2">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                            id="logScaleSwitch"
                            checked={isLogScale}
                            onChange={(e) => setIsLogScale(e.target.checked)}
                            style={{ cursor: 'pointer' }}
                        />
                        <label className="form-check-label text-secondary small" htmlFor="logScaleSwitch" style={{ cursor: 'pointer' }}>
                            Log Scale
                        </label>
                    </div>
                    <TimeScale />
                </div>
            </div>

            <div className="flex-grow-1 min-h-0 w-100 p-2 position-relative">
                {renderContent()}
            </div>
        </div>
    );
};

export default Chart;
