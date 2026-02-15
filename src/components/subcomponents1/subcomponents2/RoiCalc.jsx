import useStore from '../../../store';
import { useMemo } from 'react';

const RoiCalc = () => {
    const { data, selectedTicker, timeRange, referenceMetal } = useStore();

    // Helper to calculate growth between two values over a time period
    const computeGrowth = (startItem, endItem, valStart, valEnd) => {
        if (valStart == null || valEnd == null || valStart === 0) return null;

        const totalGrowth = ((valEnd - valStart) / valStart) * 100;
        const timeDiff = new Date(endItem.Date) - new Date(startItem.Date);
        const days = timeDiff / (1000 * 60 * 60 * 24);
        const years = days / 365.25;

        let annualizedGrowth = 0;
        if (years > 0 && valStart > 0 && valEnd > 0) {
            annualizedGrowth = (Math.pow(valEnd / valStart, 1 / years) - 1) * 100;
        }
        return { totalGrowth, annualizedGrowth, years };
    };

    const allStats = useMemo(() => {
        if (!data || !selectedTicker) return null;

        // 1. Get correct timeframe data
        // Data is now { "1y": [...], "5y": [...] }
        let timeFrameData = [];
        if (Array.isArray(data)) {
            timeFrameData = data;
        } else {
            timeFrameData = data[timeRange.toLowerCase()] || data[timeRange] || [];
        }

        if (timeFrameData.length === 0) return null;

        // 2. Select start/end items (data is already sorted)
        const slicedData = timeFrameData;
        const startItem = slicedData[0];
        const endItem = slicedData[slicedData.length - 1];

        if (!startItem || !endItem) return null;

        // 3. Compute USD Growth
        // PriceUSD is now just the ticker value in the object (e.g. item["VOO"])
        const startUsd = startItem[selectedTicker];
        const endUsd = endItem[selectedTicker];
        const usdStats = computeGrowth(startItem, endItem, startUsd, endUsd);

        // 4. Compute Metal Growth (Ratio)
        // PriceMetal = PriceUSD / PriceReferenceMetal
        const startRef = startItem[referenceMetal];
        const endRef = endItem[referenceMetal];

        let metalStats = null;
        if (startRef && endRef && startUsd && endUsd) {
            const startRatio = startUsd / startRef;
            const endRatio = endUsd / endRef;
            metalStats = computeGrowth(startItem, endItem, startRatio, endRatio);
        }

        return { metal: metalStats, usd: usdStats };

    }, [data, selectedTicker, timeRange, referenceMetal]);

    if (!allStats) return null;

    const renderStats = (stats, label, colorClass) => {
        if (!stats) return null;
        return (
            <div className="d-flex flex-column align-items-end mx-2">
                <span className="small text-secondary fw-bold" style={{ fontSize: '0.75rem' }}>{label}</span>
                <span className={`fw-bold ${stats.totalGrowth >= 0 ? 'text-success' : 'text-danger'}`} style={{ fontSize: '0.9rem' }}>
                    {stats.totalGrowth > 0 ? '+' : ''}{stats.totalGrowth.toFixed(2)}%
                </span>
                <span className={`small ${stats.annualizedGrowth >= 0 ? 'text-success' : 'text-danger'}`} style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                    {stats.annualizedGrowth > 0 ? '+' : ''}{stats.annualizedGrowth.toFixed(2)}% / yr
                </span>
            </div>
        );
    };

    return (
        <div className="d-flex border-start border-secondary ps-2 ms-2">
            {renderStats(allStats.metal, `${referenceMetal}`, 'text-light')}
            {renderStats(allStats.usd, 'USD', 'text-success')}
        </div>
    );
};

export default RoiCalc;
