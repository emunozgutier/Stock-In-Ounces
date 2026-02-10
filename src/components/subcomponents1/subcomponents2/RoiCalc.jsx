import useStore from '../../../store';
import { useMemo } from 'react';

const RoiCalc = () => {
    const { data, selectedTicker, timeRange, referenceMetal } = useStore();

    const calculateStats = (data, priceKey) => {
        if (data.length === 0) return null;

        const startItem = data[0];
        const endItem = data[data.length - 1];

        if (!startItem || !endItem) return null;

        const startPrice = startItem[priceKey];
        const endPrice = endItem[priceKey];

        if (!startPrice || !endPrice) return null;

        const totalGrowth = ((endPrice - startPrice) / startPrice) * 100;

        const timeDiff = new Date(endItem.Date) - new Date(startItem.Date);
        const days = timeDiff / (1000 * 60 * 60 * 24);
        const years = days / 365.25;

        let annualizedGrowth = 0;
        if (years > 0) {
            annualizedGrowth = (Math.pow(endPrice / startPrice, 1 / years) - 1) * 100;
        }

        return { totalGrowth, annualizedGrowth, years };
    };

    const allStats = useMemo(() => {
        if (!data || !selectedTicker) return null;

        // Filter by Ticker
        let filteredData = data.filter((item) => item.Ticker === selectedTicker);

        if (filteredData.length === 0) return null;

        // Sort by Date
        filteredData.sort((a, b) => new Date(a.Date) - new Date(b.Date));

        let startIndex = 0;
        const lastDate = new Date(filteredData[filteredData.length - 1].Date);

        // Filter by Time Range
        if (timeRange !== 'Max') {
            let startDate = new Date(lastDate);
            switch (timeRange) {
                case '1Y': startDate.setFullYear(lastDate.getFullYear() - 1); break;
                case '5Y': startDate.setFullYear(lastDate.getFullYear() - 5); break;
                case '10Y': startDate.setFullYear(lastDate.getFullYear() - 10); break;
                default: startDate = new Date(0);
            }

            // Find first index >= startDate
            startIndex = filteredData.findIndex(item => new Date(item.Date) >= startDate);
            if (startIndex === -1) {
                // If all data is before start date (shouldn't happen with logic above but safety check)
                return null;
            }
        }

        const slicedData = filteredData.slice(startIndex);

        return {
            metal: calculateStats(slicedData, `Price${referenceMetal}`),
            usd: calculateStats(slicedData, 'PriceUSD')
        };

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
