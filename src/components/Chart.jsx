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
import { useMemo, useState, useEffect } from 'react'; // Added useEffect
import ChartHeader from './subcomponents1/ChartHeader';
import { calculateTrendlines } from '../utils/analysis';

import YAxis from './subcomponents1/YAxis';
import XAxis from './subcomponents1/XAxis';
import ToolTip from './subcomponents/ToolTip';

const Chart = () => {
    const { data, selectedTicker, timeRange, isLogScale, setIsLogScale, referenceMetal, metalColors } = useStore();
    const [trendlineType, setTrendlineType] = useState('none');
    const [showRainbow, setShowRainbow] = useState(false);
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

        // Prepare data for chart
        const metalKey = `Price${referenceMetal}`;
        let processedData = filteredData.map((item) => {
            const date = new Date(item.Date);
            const formattedDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
            let priceMetal = item[metalKey];
            let priceUSD = item.PriceUSD;

            // Handle Log Scale Zeroes/Negatives: replace with null so Recharts ignores them
            if (isLogScale) {
                priceMetal = priceMetal <= 0 ? null : priceMetal;
                priceUSD = priceUSD <= 0 ? null : priceUSD;
            }

            return {
                Date: formattedDate,
                priceMetal: priceMetal,
                PriceUSD: priceUSD,
            };
        });

        // Calculate Trendlines if enabled
        if (trendlineType !== 'none' && processedData.length > 1) {
            // Filter out nulls for trendline calculation to avoid issues
            const calculableMetalData = processedData.filter(d => d.priceMetal !== null);
            const calculableUsdData = processedData.filter(d => d.PriceUSD !== null);

            const metalTrendData = calculateTrendlines(calculableMetalData, trendlineType, 'priceMetal');
            const usdTrendData = calculateTrendlines(calculableUsdData, trendlineType, 'PriceUSD');

            // Map trendline data back to the original processedData structure
            // This assumes trendline data is ordered by date and aligns with processedData
            // A more robust solution might involve mapping by date.
            return processedData.map((d, i) => {
                const trendMetalEntry = metalTrendData.find(t => t.Date === d.Date);
                const trendUsdEntry = usdTrendData.find(t => t.Date === d.Date);

                let trendMetal = trendMetalEntry?.trend;
                let trendMetalTop10 = trendMetalEntry?.top10;
                let trendMetalTop20 = trendMetalEntry?.top20;
                let trendMetalBottom20 = trendMetalEntry?.bottom20;
                let trendMetalBottom10 = trendMetalEntry?.bottom10;

                let trendUSD = trendUsdEntry?.trend;
                let trendUSDTop10 = trendUsdEntry?.top10;
                let trendUSDTop20 = trendUsdEntry?.top20;
                let trendUSDBottom20 = trendUsdEntry?.bottom20;
                let trendUSDBottom10 = trendUsdEntry?.bottom10;

                // Apply log scale nulling to trendlines as well
                if (isLogScale) {
                    trendMetal = trendMetal <= 0 ? null : trendMetal;
                    trendMetalTop10 = trendMetalTop10 <= 0 ? null : trendMetalTop10;
                    trendMetalTop20 = trendMetalTop20 <= 0 ? null : trendMetalTop20;
                    trendMetalBottom20 = trendMetalBottom20 <= 0 ? null : trendMetalBottom20;
                    trendMetalBottom10 = trendMetalBottom10 <= 0 ? null : trendMetalBottom10;

                    trendUSD = trendUSD <= 0 ? null : trendUSD;
                    trendUSDTop10 = trendUSDTop10 <= 0 ? null : trendUSDTop10;
                    trendUSDTop20 = trendUSDTop20 <= 0 ? null : trendUSDTop20;
                    trendUSDBottom20 = trendUSDBottom20 <= 0 ? null : trendUSDBottom20;
                    trendUSDBottom10 = trendUSDBottom10 <= 0 ? null : trendUSDBottom10;
                }

                return {
                    ...d,
                    trendMetal,
                    trendMetalTop10,
                    trendMetalTop20,
                    trendMetalBottom20,
                    trendMetalBottom10,
                    trendUSD,
                    trendUSDTop10,
                    trendUSDTop20,
                    trendUSDBottom20,
                    trendUSDBottom10,
                };
            });
        }

        return processedData;
    }, [data, selectedTicker, timeRange, isLogScale, referenceMetal, trendlineType]);

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
                    />
                    <Tooltip
                        position={{ x: 80, y: 0 }}
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
                    {(!isMobile || activeAxis === 'metal') && (
                        <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="priceMetal"
                            stroke={metalColors[referenceMetal]}
                            name={`Price in ${referenceMetal} (${metalAxisConfig.label})`}
                            dot={false}
                            strokeWidth={2}
                        />
                    )}

                    {/* USD Price Line */}
                    {(!isMobile || activeAxis === 'usd') && (
                        <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="PriceUSD"
                            stroke="#10B981"
                            name="Price in USD ($)"
                            dot={false}
                            strokeWidth={2}
                        />
                    )}

                    {/* Trendlines - Metal */}
                    {trendlineType !== 'none' && (!isMobile || activeAxis === 'metal') && (
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
                    {trendlineType !== 'none' && (!isMobile || activeAxis === 'usd') && (
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
                    {trendlineType !== 'none' && showRainbow && (!isMobile || activeAxis === 'metal') && (
                        <>
                            <Line yAxisId="left" type="monotone" dataKey="trendMetalTop10" stroke="#EF4444" dot={false} strokeWidth={1} name={`${referenceMetal} Top 10%`} />
                            <Line yAxisId="left" type="monotone" dataKey="trendMetalTop20" stroke={metalColors[referenceMetal]} dot={false} strokeWidth={1} name={`${referenceMetal} Top 20%`} />
                            <Line yAxisId="left" type="monotone" dataKey="trendMetalBottom20" stroke="#3B82F6" dot={false} strokeWidth={1} name={`${referenceMetal} Bottom 20%`} />
                            <Line yAxisId="left" type="monotone" dataKey="trendMetalBottom10" stroke="#8B5CF6" dot={false} strokeWidth={1} name={`${referenceMetal} Bottom 10%`} />
                        </>
                    )}

                    {/* Rainbow Bands - USD */}
                    {trendlineType !== 'none' && showRainbow && (!isMobile || activeAxis === 'usd') && (
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
