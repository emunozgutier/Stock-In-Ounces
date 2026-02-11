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
import ChartHeader from './subcomponents1/ChartHeader';
import { calculateTrendlines } from '../utils/analysis';

import XAxis from './subcomponents1/XAxis';
import ToolTip from './subcomponents/ToolTip';

const Chart = () => {
    const { data, selectedTicker, timeRange, isLogScale, setIsLogScale, referenceMetal, metalColors } = useStore();
    const [trendlineType, setTrendlineType] = useState('none');
    const [showRainbow, setShowRainbow] = useState(false);

    const chartData = useMemo(() => {
        if (!data || !selectedTicker) return [];

        let filteredData = data.filter((item) => item.Ticker === selectedTicker);

        // Time Range Filtering
        if (timeRange !== 'Max' && filteredData.length > 0) {
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
                    startDate = new Date(0);
                    break;
            }

            if (timeRange !== 'Max') {
                filteredData = filteredData.filter(item => new Date(item.Date) >= startDate);
            }
        }

        // Calculate Trendlines if enabled
        if (trendlineType !== 'none' && filteredData.length > 1) {
            const metalKey = `Price${referenceMetal}`;
            // Calculate Metal Trends
            const metalTrendData = calculateTrendlines(filteredData, trendlineType, metalKey);
            // Calculate USD Trends
            const usdTrendData = calculateTrendlines(filteredData, trendlineType, 'PriceUSD');

            // Merge results
            return metalTrendData.map((d, i) => {
                const usdD = usdTrendData[i];
                return {
                    ...d,
                    // Metal Trends (mapped to generic keys for chart)
                    priceMetal: d[metalKey] || 0, // Ensure value exists
                    trendMetal: d.trendline,
                    trendMetalTop10: d.trendTop10,
                    trendMetalTop20: d.trendTop20,
                    trendMetalBottom20: d.trendBottom20,
                    trendMetalBottom10: d.trendBottom10,
                    // USD Trends
                    trendUSD: usdD.trendline,
                    trendUSDTop10: usdD.trendTop10,
                    trendUSDTop20: usdD.trendTop20,
                    trendUSDBottom20: usdD.trendBottom20,
                    trendUSDBottom10: usdD.trendBottom10
                };
            });
        }

        // If no trendlines, still map the metal price to a generic key for easier rendering
        return filteredData.map(d => ({
            ...d,
            priceMetal: d[`Price${referenceMetal}`] || 0
        }));

    }, [data, selectedTicker, timeRange, trendlineType, referenceMetal]);

    // Determine the scale for the Y-Axis based on the maximum value in the dataset
    const metalAxisConfig = useMemo(() => {
        if (chartData.length === 0) return { scale: 1, unit: 'Ounces', label: 'Oz' };

        const maxVal = Math.max(...chartData.map(d => Math.abs(d.priceMetal)));

        if (maxVal === 0) return { scale: 1, unit: 'Ounces', label: 'Oz' };

        if (maxVal < 0.001) {
            return { scale: 1000000, unit: 'micro Oz', label: 'µoz' };
        } else if (maxVal < 1) {
            return { scale: 1000, unit: 'milli Oz', label: 'moz' };
        } else {
            return { scale: 1, unit: 'Ounces', label: 'oz' };
        }
    }, [chartData]);

    const formatMetalAxisTick = (value) => {
        if (value === 0) return "0";
        return (value * metalAxisConfig.scale).toPrecision(4);
    };

    const formatMetalTooltip = (value) => {
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
            return <div className="d-flex justify-content-center align-items-center h-100 text-secondary">Select a stock to view its price in {referenceMetal}.</div>;
        }
        if (chartData.length === 0) {
            if (data.length === 0) return <div className="d-flex justify-content-center align-items-center h-100 text-secondary">Loading data...</div>;
            return <div className="d-flex justify-content-center align-items-center h-100 text-secondary">No data available for {selectedTicker} in this range.</div>;
        }
        return (
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ left: 10, right: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis timeRange={timeRange} />
                    <YAxis
                        referenceMetal={referenceMetal}
                        metalColors={metalColors}
                        metalAxisConfig={metalAxisConfig}
                        isLogScale={isLogScale}
                        formatMetalAxisTick={formatMetalAxisTick}
                        formatUSD={formatUSD}
                    />
                    <Tooltip
                        content={(props) => (
                            <ToolTip
                                {...props}
                                referenceMetal={referenceMetal}
                                metalColors={metalColors}
                                formatMetalTooltip={formatMetalTooltip}
                                formatUSD={formatUSD}
                            />
                        )}
                    />
                    <Legend wrapperStyle={{ color: '#adb5bd' }} />
                    <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="priceMetal"
                        stroke={metalColors[referenceMetal]}
                        name={`Price in ${referenceMetal} (${metalAxisConfig.label})`}
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

                    {/* Trendlines - Metal */}
                    {trendlineType !== 'none' && (
                        <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="trendMetal"
                            stroke={metalColors[referenceMetal]} // Same color but dashed
                            strokeDasharray="5 5"
                            name={`Trend (${referenceMetal})`}
                            dot={false}
                            strokeWidth={2}
                        />
                    )}

                    {/* Trendlines - USD */}
                    {trendlineType !== 'none' && (
                        <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="trendUSD"
                            stroke="#6EE7B7" // Light Green
                            strokeDasharray="5 5"
                            name="Trend (USD)"
                            dot={false}
                            strokeWidth={2}
                        />
                    )}

                    {/* Rainbow Bands - Metal */}
                    {trendlineType !== 'none' && showRainbow && (
                        <>
                            <Line yAxisId="left" type="monotone" dataKey="trendMetalTop10" stroke="#EF4444" dot={false} strokeWidth={1} name={`${referenceMetal} Top 10%`} />
                            <Line yAxisId="left" type="monotone" dataKey="trendMetalTop20" stroke={metalColors[referenceMetal]} dot={false} strokeWidth={1} name={`${referenceMetal} Top 20%`} />
                            <Line yAxisId="left" type="monotone" dataKey="trendMetalBottom20" stroke="#3B82F6" dot={false} strokeWidth={1} name={`${referenceMetal} Bottom 20%`} />
                            <Line yAxisId="left" type="monotone" dataKey="trendMetalBottom10" stroke="#8B5CF6" dot={false} strokeWidth={1} name={`${referenceMetal} Bottom 10%`} />
                        </>
                    )}

                    {/* Rainbow Bands - USD */}
                    {trendlineType !== 'none' && showRainbow && (
                        <>
                            <Line yAxisId="right" type="monotone" dataKey="trendUSDTop10" stroke="#EF4444" strokeDasharray="3 3" dot={false} strokeWidth={1} name="USD Top 10%" />
                            <Line yAxisId="right" type="monotone" dataKey="trendUSDTop20" stroke="#F59E0B" strokeDasharray="3 3" dot={false} strokeWidth={1} name="USD Top 20%" />
                            <Line yAxisId="right" type="monotone" dataKey="trendUSDBottom20" stroke="#3B82F6" strokeDasharray="3 3" dot={false} strokeWidth={1} name="USD Bottom 20%" />
                            <Line yAxisId="right" type="monotone" dataKey="trendUSDBottom10" stroke="#8B5CF6" strokeDasharray="3 3" dot={false} strokeWidth={1} name="USD Bottom 10%" />
                        </>
                    )}

                </ComposedChart>
            </ResponsiveContainer>
        );
    };


    return (
        <div className="d-flex flex-column h-100 w-100 bg-dark border border-secondary rounded overflow-hidden shadow-lg">
            <ChartHeader
                trendlineType={trendlineType}
                setTrendlineType={setTrendlineType}
                showRainbow={showRainbow}
                setShowRainbow={setShowRainbow}
                isLogScale={isLogScale}
                setIsLogScale={setIsLogScale}
            />

            <div className="flex-grow-1 min-h-0 w-100 p-2 position-relative">
                {renderContent()}
            </div>
        </div>
    );
};

export default Chart;
