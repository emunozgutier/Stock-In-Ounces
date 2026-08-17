import {
    Line,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ComposedChart,
    ReferenceArea,
} from 'recharts';
import useData from '../store/useData';
import useChart from '../store/useChart';
import useAppState from '../store/useState';
import useStyle from '../store/useStyle';
import useWindow from '../store/useWindow';
import useSelection from '../store/useSelection';
import { useMemo, useEffect, useCallback, useRef } from 'react';
import ChartHeader from './subcomponents1/ChartHeader';

import YAxis from './subcomponents1/YAxis';
import XAxis from './subcomponents1/XAxis';
import ToolTip from "./subcomponents1/ToolTip";

const Chart = () => {
    const { data } = useData();
    const { goldUnit, setDisplayZeros } = useChart();
    const { selectedTicker, timeRange, isLogScale, setIsLogScale, referenceMetal, viewMode, setViewMode, activeAxis, setActiveAxis } = useAppState();
    const { metalColors } = useStyle();
    const { deviceType } = useWindow();
    const { startDrag, updateDrag, endDrag, dragSelection, clearDragSelection } = useSelection();

    // Derive isMobile from the shared deviceType (already kept in sync by App.jsx)
    const isMobile = deviceType !== 'Monitor';

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

        // Capture base inflation multiplier to base the chart at the left-most value
        let baseMultiplier = null;
        if (referenceMetal === 'Inflation Adjusted $') {
            for (let item of timeFrameData) {
                if (item[referenceMetal] != null && item[referenceMetal] !== 0 && item[selectedTicker] != null) {
                    baseMultiplier = item[referenceMetal];
                    break;
                }
            }
        }

        // Prepare data for chart
        let processedData = timeFrameData.map((item) => {
            let priceUSD = item[selectedTicker];
            let priceReference = item[referenceMetal];

            // Calculate Price in Metal Terms: Stock Price (USD) / Metal Price (USD)
            let priceMetal = null;
            if (priceUSD != null && priceReference != null && priceReference !== 0) {
                if (referenceMetal === 'Inflation Adjusted $') {
                    // Re-base the CPI multiplier so the leftmost point matches nominal exactly
                    if (baseMultiplier) {
                        priceMetal = (priceUSD / baseMultiplier) * priceReference;
                    } else {
                        priceMetal = priceUSD * priceReference;
                    }
                } else {
                    priceMetal = priceUSD / priceReference;
                }
            }

            // Handle Log Scale Zeroes/Negatives: replace with null so Recharts ignores them
            if (isLogScale) {
                priceMetal = (priceMetal != null && priceMetal <= 0) ? null : priceMetal;
                priceUSD = (priceUSD != null && priceUSD <= 0) ? null : priceUSD;
            }

            return {
                Date: item.Date,
                priceMetal: priceMetal,
                PriceUSD: priceUSD,
            };
        });

        // Filter out entries where both prices are null (optional, cleans up chart)
        processedData = processedData.filter(d => d.priceMetal !== null || d.PriceUSD !== null);

        return processedData;
    }, [data, selectedTicker, timeRange, isLogScale, referenceMetal]);

    // ── Zero-count heuristic ───────────────────────────────────────────────────
    // Count "non-significant" zeros in a number — the zeros that only indicate
    // scale/magnitude rather than carrying information:
    //
    //   v < 1  → Math.ceil(-log10(v))   (leading zeros including "0." prefix)
    //              0.6     → 1   (just the "0." prefix)
    //              0.17304 → 1   (ceil(0.762) = 1)
    //              0.017304→ 2   (ceil(1.762) = 2)
    //   v >= 1 → trailing zeros in floor(v)
    //              1.7304  → 0
    //              600     → 2   (600 % 10 = 0 → 1, 60 % 10 = 0 → 2)
    //              5000    → 3
    //
    // Computed over NICE Y-AXIS TICK VALUES (1–9 per decade between min and max)
    // so the result reflects what the user actually sees on the chart — not the
    // raw per-row data which can skew the comparison for wide-range datasets.
    const displayZeros = useMemo(() => {
        const isGoldPlatinum = ['Gold', 'Platinum'].includes(referenceMetal);
        if (!isGoldPlatinum || chartData.length === 0) {
            return { goldbacksZeros: 0, ozZeros: 0 };
        }

        const countZeros = (v) => {
            if (!v || v <= 0) return 0;
            if (v < 1) {
                // ceil correctly handles exact powers of 10:
                //   0.1 → ceil(1) = 1   (floor+1 would give 2 — wrong)
                return Math.ceil(-Math.log10(v));
            } else {
                // Count trailing zeros in the integer part
                let count = 0;
                let n = Math.floor(v);
                while (n > 0 && n % 10 === 0) { count++; n = Math.floor(n / 10); }
                return count;
            }
        };

        // Compute the domain of priceMetal values in the current chartData
        const values = chartData.map(d => d.priceMetal).filter(v => v != null && v > 0);
        if (values.length === 0) return { goldbacksZeros: 0, ozZeros: 0 };
        const minVal = Math.min(...values);
        const maxVal = Math.max(...values);

        // Generate nice Y-axis tick candidates: digits 1–9 at each decade in [minVal, maxVal]
        // e.g. domain [0.3, 5] → [0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1, 2, 3, 4, 5]
        const minPow = Math.floor(Math.log10(minVal));
        const maxPow = Math.ceil(Math.log10(maxVal));
        let ticks = [];
        for (let p = minPow; p <= maxPow; p++) {
            const scale = Math.pow(10, p);
            for (let n = 1; n <= 9; n++) {
                const tick = n * scale;
                if (tick >= minVal * 0.9999 && tick <= maxVal * 1.0001) {
                    ticks.push(tick);
                }
            }
        }

        // Fallback for very narrow ranges where no nice ticks fall inside
        if (ticks.length === 0) {
            const step = (maxVal - minVal) / 4;
            ticks = [0, 1, 2, 3, 4].map(i => minVal + i * step);
        }

        let oZeros = 0;
        let gbZeros = 0;
        for (const tick of ticks) {
            oZeros  += countZeros(tick);
            gbZeros += countZeros(tick * 1000);
        }
        return { goldbacksZeros: gbZeros, ozZeros: oZeros };
    }, [chartData, referenceMetal]);


    // Sync computed zeros to the store so any external component can read them
    useEffect(() => {
        setDisplayZeros(displayZeros.goldbacksZeros, displayZeros.ozZeros);
    }, [displayZeros, setDisplayZeros]);
    // ──────────────────────────────────────────────────────────────────────────

    // Determine the scale for the Y-Axis based on the maximum value in the dataset
    const metalAxisConfig = useMemo(() => {
        if (chartData.length === 0) return { scale: 1, unit: 'Ounces', label: 'oz', legendSuffix: 'oz', tickPrefix: '' };

        if (referenceMetal === 'Inflation Adjusted $') {
            return { scale: 1, unit: 'Dollars', label: '$ (Adj)', legendSuffix: '$', tickPrefix: '' };
        }

        // Resolve effective unit:
        //   'auto'      → goldbacks ONLY if strictly fewer zeros than oz
        //                 (tie → oz wins, since oz is the natural base unit)
        //   'oz'        → always plain oz
        //   'goldbacks' → always goldbacks
        const effectiveGoldbacks =
            goldUnit === 'goldbacks' ||
            (goldUnit === 'auto' && displayZeros.goldbacksZeros < displayZeros.ozZeros);

        if (effectiveGoldbacks) {
            if (referenceMetal === 'Gold')     return { scale: 1000, unit: 'Goldbacks',     label: 'Goldbacks',     legendSuffix: 'Goldback (1/1000 oz)',     tickPrefix: '₲ ' };
            if (referenceMetal === 'Platinum') return { scale: 1000, unit: 'Platinumbacks', label: 'Platinumbacks', legendSuffix: 'Platinumback (1/1000 oz)', tickPrefix: '' };
        }

        return { scale: 1, unit: 'Ounces', label: 'oz', legendSuffix: 'oz', tickPrefix: '' };
    }, [chartData, referenceMetal, goldUnit, displayZeros]);

    const formatMetalAxisTick = (value) => {
        if (viewMode !== 'units') return `${value.toFixed(0)}%`;
        if (value === 0) return "0";
        if (referenceMetal === 'Inflation Adjusted $') return `$${value.toFixed(0)}`;

        const tickValue = (value * metalAxisConfig.scale).toPrecision(4);
        return metalAxisConfig.tickPrefix ? `${metalAxisConfig.tickPrefix}${tickValue}` : tickValue;
    };

    const formatMetalTooltip = (value) => {
        if (viewMode !== 'units') return `${value.toFixed(2)}%`;
        if (value === 0 || value === null) return referenceMetal === 'Inflation Adjusted $' ? "$0" : "0 oz";

        if (referenceMetal === 'Inflation Adjusted $') {
            return `$${value.toFixed(2)} (Adj)`;
        }

        // Format using the active axis unit so tooltip always matches the Y-axis
        const scaled = value * metalAxisConfig.scale;
        const prefix = metalAxisConfig.tickPrefix || '';
        const suffix = metalAxisConfig.unit === 'Goldbacks'     ? ' Goldback'
            : metalAxisConfig.unit === 'Platinumbacks' ? ' Platinumback'
            : ' oz';
        return `${prefix}${Number(scaled).toPrecision(4)}${suffix}`;
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


    const inflationSyncDomain = useMemo(() => {
        if (referenceMetal !== 'Inflation Adjusted $' || chartData.length === 0) return null;
        let pmin = Infinity;
        let pmax = -Infinity;
        for (let d of chartData) {
            if (d.priceMetal != null) {
                if (d.priceMetal < pmin) pmin = d.priceMetal;
                if (d.priceMetal > pmax) pmax = d.priceMetal;
            }
            if (d.PriceUSD != null) {
                if (d.PriceUSD < pmin) pmin = d.PriceUSD;
                if (d.PriceUSD > pmax) pmax = d.PriceUSD;
            }
        }
        if (pmin === Infinity) return null;
        return [pmin, pmax];
    }, [chartData, referenceMetal]);

    // ── Log-scale domain synchronisation (first-point anchor) ─────────────────
    // Strategy: find how many decades each series extends *below* and *above*
    // its first data point, then take the max for each direction.
    // Both axes end up with the same (belowDec, aboveDec) budget, so
    // firstMetal and firstUsd land at the same vertical fraction on the chart.
    const logSyncDomains = useMemo(() => {
        if (!isLogScale || chartData.length === 0) return null;
        if (referenceMetal === 'Inflation Adjusted $') return null; // already unified

        const mVals = chartData.map(d => d.priceMetal).filter(v => v != null && v > 0);
        const uVals = chartData.map(d => d.PriceUSD).filter(v => v != null && v > 0);
        if (mVals.length === 0 || uVals.length === 0) return null;

        // First valid value in the time series (leftmost chart point)
        const firstMetal = chartData.find(d => d.priceMetal > 0)?.priceMetal;
        const firstUsd   = chartData.find(d => d.PriceUSD   > 0)?.PriceUSD;
        if (!firstMetal || !firstUsd) return null;

        const mMin = Math.min(...mVals), mMax = Math.max(...mVals);
        const uMin = Math.min(...uVals), uMax = Math.max(...uVals);

        // Decades from first point down to the series minimum (how far data dips below start)
        const mBelow = Math.max(0, Math.log10(firstMetal / mMin));
        const uBelow = Math.max(0, Math.log10(firstUsd   / uMin));

        // Decades from first point up to the series maximum (how far data climbs above start)
        const mAbove = Math.max(0, Math.log10(mMax / firstMetal));
        const uAbove = Math.max(0, Math.log10(uMax / firstUsd));

        // Both axes must accommodate the widest excursion in each direction
        const belowDec = Math.max(mBelow, uBelow);
        const aboveDec = Math.max(mAbove, uAbove);

        // Domain for each axis: first point sits at the same fraction belowDec/(belowDec+aboveDec)
        return {
            metal: [firstMetal / Math.pow(10, belowDec), firstMetal * Math.pow(10, aboveDec)],
            usd:   [firstUsd   / Math.pow(10, belowDec), firstUsd   * Math.pow(10, aboveDec)],
        };
    }, [isLogScale, chartData, referenceMetal]);
    // ──────────────────────────────────────────────────────────────────────────

    // ── Selection helpers (drag only — hover is handled inside ToolTip) ────────
    // chartRef lets us correlate pixel position → nearest data point for drag
    const chartRef = useRef(null);

    const handleDragMouseDown = useCallback(() => {
        const current = useSelection.getState().hoverPoint;
        if (current) startDrag(current);
    }, [startDrag]);

    const handleDragMouseMove = useCallback(() => {
        const current = useSelection.getState().hoverPoint;
        if (current) updateDrag(current);
    }, [updateDrag]);

    const handleDragMouseUp = useCallback(() => {
        const state = useSelection.getState();
        const current = state.hoverPoint;
        // Single click (start === end date) → discard the selection
        if (state.dragSelection?.start?.date === current?.date) {
            clearDragSelection();
        } else {
            endDrag(current ?? { date: null, metalValue: null, dollarValue: null });
        }
    }, [endDrag, clearDragSelection]);

    // Cancel drag if the mouse leaves the chart area mid-drag
    const handleDragMouseLeave = useCallback(() => {
        if (useSelection.getState().isDragging) {
            const current = useSelection.getState().hoverPoint;
            endDrag(current ?? { date: null, metalValue: null, dollarValue: null });
        }
    }, [endDrag]);
    // ─────────────────────────────────────────────────────────────────────────

    const renderContent = () => {
        if (!selectedTicker) {
            return <div className="d-flex justify-content-center align-items-center h-100 text-secondary">Select a stock to view its price in {referenceMetal}.</div>;
        }

        const isDataEmpty = !data || (Array.isArray(data) ? data.length === 0 : Object.keys(data).length === 0);

        if (chartData.length === 0) {
            if (isDataEmpty) return <div className="d-flex justify-content-center align-items-center h-100 text-secondary">Loading data...</div>;
            return <div className="d-flex justify-content-center align-items-center h-100 text-secondary">No data available for {selectedTicker} in this range.</div>;
        }
        return (
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                    data={chartData}
                    margin={{ left: 25, right: 30 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis timeRange={timeRange} />
                    <YAxis
                        yAxisId="left"
                        orientation="left"
                        hide={isMobile && activeAxis !== 'metal'}
                        stroke={metalColors[referenceMetal]}
                        width={isMobile ? 50 : 80}
                        label={isMobile ? null : {
                            value: referenceMetal === 'Inflation Adjusted $' ? 'Price (Adjusted $)' : `Price (${metalAxisConfig.label})`,
                            angle: -90,
                            position: 'insideLeft',
                            fill: metalColors[referenceMetal],
                            style: { textAnchor: 'middle' },
                            dx: -15
                        }}
                        tickFormatter={formatMetalAxisTick}
                        scale={isLogScale ? 'log' : 'linear'}
                        domain={([min, max]) => {
                            if (referenceMetal === 'Inflation Adjusted $' && inflationSyncDomain) {
                                const mergedMin = inflationSyncDomain[0];
                                const mergedMax = inflationSyncDomain[1];
                                if (isLogScale) return [mergedMin, mergedMax];
                                const range = mergedMax - mergedMin;
                                const buffer = range * 0.15;
                                return [mergedMin, mergedMax + buffer];
                            }
                            if (isLogScale) return logSyncDomains ? logSyncDomains.metal : [min, max];
                            if (!metalNeedsPadding) return [min, max];
                            const range = max - min;
                            const buffer = range * 0.15;
                            return [min, max + buffer];
                        }}
                    />
                    <YAxis
                        yAxisId="right"
                        orientation={isMobile ? 'left' : 'right'}
                        hide={isMobile && activeAxis !== 'usd'}
                        stroke="#10B981"
                        width={isMobile ? 50 : 80}
                        label={isMobile ? null : {
                            value: 'Price (Nominal USD)',
                            angle: 90,
                            position: 'insideRight',
                            fill: '#10B981',
                            style: { textAnchor: 'middle' },
                            dx: 15
                        }}
                        tickFormatter={formatUSD}
                        scale={isLogScale ? 'log' : 'linear'}
                        domain={([min, max]) => {
                            if (referenceMetal === 'Inflation Adjusted $' && inflationSyncDomain) {
                                const mergedMin = inflationSyncDomain[0];
                                const mergedMax = inflationSyncDomain[1];
                                if (isLogScale) return [mergedMin, mergedMax];
                                const range = mergedMax - mergedMin;
                                const buffer = range * 0.15;
                                return [mergedMin, mergedMax + buffer];
                            }
                            if (isLogScale) return logSyncDomains ? logSyncDomains.usd : [min, max];
                            if (!usdNeedsPadding) return [min, max];
                            const range = max - min;
                            const buffer = range * 0.15;
                            return [min, max + buffer];
                        }}
                    />
                    {deviceType !== 'Phone Horizontal' && (
                        <Tooltip
                            position={{ x: isMobile ? 65 : 100, y: 0 }}
                            content={(props) => (
                                <ToolTip
                                    {...props}
                                    referenceMetal={referenceMetal}
                                    metalColors={metalColors}
                                    formatMetalTooltip={formatMetalTooltip}
                                    formatUSD={formatUSD}
                                    metalScale={metalAxisConfig.scale}
                                />
                            )}
                        />
                    )}
                    <Legend wrapperStyle={{ color: '#adb5bd' }} />

                    {/* Metal Price Line */}
                    <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="priceMetal"
                        stroke={metalColors[referenceMetal]}
                        name={referenceMetal === 'Inflation Adjusted $' ? 'Adjusted Price ($)' : `Price in ${referenceMetal} (${metalAxisConfig.legendSuffix})`}
                        dot={false}
                        strokeWidth={2}
                    />

                    {/* USD Price Line */}
                    <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="PriceUSD"
                        stroke="#10B981"
                        name={referenceMetal === 'Inflation Adjusted $' ? 'Nominal Price ($)' : "Price in USD ($)"}
                        dot={false}
                        strokeWidth={2}
                    />

                    {/* Drag-selection highlight */}
                    {selectionOverlay}
                </ComposedChart>
            </ResponsiveContainer>
        );
    };


    // Build the ReferenceArea overlay once so renderContent() can embed it
    const selectionOverlay = (() => {
        if (!dragSelection?.start?.date || !dragSelection?.end?.date) return null;
        if (dragSelection.start.date === dragSelection.end.date) return null;
        const [x1, x2] = [dragSelection.start.date, dragSelection.end.date].sort();
        return (
            <ReferenceArea
                yAxisId="left"
                x1={x1}
                x2={x2}
                fill="#3B82F6"
                fillOpacity={0.15}
                stroke="#60A5FA"
                strokeOpacity={0.5}
                strokeWidth={1}
                ifOverflow="visible"
            />
        );
    })();

    return (
        <div className="d-flex flex-column h-100 w-100 bg-dark border border-secondary rounded overflow-hidden shadow-lg">
            <ChartHeader />

            <div
                className="flex-grow-1 min-h-0 w-100 p-2 position-relative"
                style={{ cursor: 'crosshair' }}
                onMouseDown={handleDragMouseDown}
                onMouseMove={handleDragMouseMove}
                onMouseUp={handleDragMouseUp}
                onMouseLeave={handleDragMouseLeave}
            >
                {renderContent()}
            </div>
        </div>
    );
};

export default Chart;
