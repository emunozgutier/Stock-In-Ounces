import {
    LineChart,
    Line,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ComposedChart
} from 'recharts';
import useStore from '../store';
import { useMemo, useState, useEffect } from 'react';
import ChartHeader from './subcomponents1/ChartHeader';

import YAxis from './subcomponents1/YAxis';
import XAxis from './subcomponents1/XAxis';
import ToolTip from "./subcomponents1/ToolTip";

const Chart = () => {
    const { data, selectedTicker, timeRange, isLogScale, setIsLogScale, referenceMetal, metalColors } = useStore();
    const [viewMode, setViewMode] = useState('units'); // 'units', 'relative', 'absolute'

    // Mobile Detection
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [activeAxis, setActiveAxis] = useState('metal'); // 'metal' or 'usd'

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const chartData = useMemo(() => {
        if (!data || !selectedTicker) return [];

        // Data is now an object: { "1y": [...], "5y": [...] }
        let timeFrameData = [];

        if (Array.isArray(data)) {
            timeFrameData = data;
        } else {
            timeFrameData = data[timeRange.toLowerCase()] || data[timeRange] || [];
        }

        if (timeFrameData.length === 0) return [];

        // Prepare data for chart
        let processedData = timeFrameData.map((item) => {
            const date = new Date(item.Date);
            const formattedDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;

            let priceUSD = item[selectedTicker];
            let priceReference = item[referenceMetal];

            // Calculate Price in Metal Terms: Stock Price (USD) / Metal Price (USD)
            let priceMetal = null;
            if (priceUSD != null && priceReference != null && priceReference !== 0) {
                priceMetal = priceUSD / priceReference;
            }

            // Handle Log Scale Zeroes/Negatives: replace with null so Recharts ignores them
            if (isLogScale) {
                priceMetal = (priceMetal != null && priceMetal <= 0) ? null : priceMetal;
                priceUSD = (priceUSD != null && priceUSD <= 0) ? null : priceUSD;
            }

            return {
                Date: formattedDate,
                priceMetal: priceMetal,
                PriceUSD: priceUSD,
            };
        });

        // Filter out entries where both prices are null (optional, cleans up chart)
        processedData = processedData.filter(d => d.priceMetal !== null || d.PriceUSD !== null);

        return processedData;
    }, [data, selectedTicker, timeRange, isLogScale, referenceMetal]);

    // Determine the scale for the Y-Axis based on the maximum value in the dataset
    const metalAxisConfig = useMemo(() => {
        if (chartData.length === 0) return { scale: 1, unit: 'Ounces', label: 'Oz' };

        const maxVal = Math.max(...chartData.map(d => Math.abs(d.priceMetal || 0)));

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
        if (viewMode !== 'units') return `${value.toFixed(0)}%`;
        if (value === 0) return "0";
        return (value * metalAxisConfig.scale).toPrecision(4);
    };

    const formatMetalTooltip = (value) => {
        if (viewMode !== 'units') return `${value.toFixed(2)}%`;
        if (value === 0 || value === null) return "0 oz";
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
        if (viewMode !== 'units') return `${value.toFixed(2)}%`;
        return `$${value.toFixed(2)}`;
    };

    const { metalNeedsPadding, usdNeedsPadding } = useMemo(() => {
        if (chartData.length === 0) return { metalNeedsPadding: false, usdNeedsPadding: false };

        // Define "Left Zone" (Tooltip area) as first 20% of data points
        const sampleSize = Math.ceil(chartData.length * 0.2);
        const leftZoneData = chartData.slice(0, sampleSize);

        // Calculate Metal Padding Requirement
        const metalMax = Math.max(...chartData.map(d => d.priceMetal || 0));
        const metalLeftMax = Math.max(...leftZoneData.map(d => d.priceMetal || 0));
        const metalNeedsPadding = metalLeftMax > (metalMax * 0.85); // If left data is > 85% of peak height

        // Calculate USD Padding Requirement
        const usdMax = Math.max(...chartData.map(d => d.PriceUSD || 0));
        const usdLeftMax = Math.max(...leftZoneData.map(d => d.PriceUSD || 0));
        const usdNeedsPadding = usdLeftMax > (usdMax * 0.85);

        return { metalNeedsPadding, usdNeedsPadding };
    }, [chartData]);


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
                        activeAxis={activeAxis}
                        isMobile={isMobile}
                        metalNeedsPadding={metalNeedsPadding}
                        usdNeedsPadding={usdNeedsPadding}
                    />
                    <Tooltip
                        position={{ x: isMobile ? 65 : 100, y: 0 }}
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

                    {/* Metal Price Line */}
                    <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="priceMetal"
                        stroke={metalColors[referenceMetal]}
                        name={`Price in ${referenceMetal} (${metalAxisConfig.label})`}
                        dot={false}
                        strokeWidth={2}
                    />

                    {/* USD Price Line */}
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
            <ChartHeader
                isLogScale={isLogScale}
                setIsLogScale={setIsLogScale}
                viewMode={viewMode}
                setViewMode={setViewMode}
                activeAxis={activeAxis}
                setActiveAxis={setActiveAxis}
                isMobile={isMobile}
            />

            <div className="flex-grow-1 min-h-0 w-100 p-2 position-relative">
                {renderContent()}
            </div>
        </div>
    );
};

export default Chart;
