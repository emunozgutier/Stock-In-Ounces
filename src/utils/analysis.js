
/**
 * Calculates trendline and percentile bands for a given dataset.
 * 
 * @param {Array} data - Array of objects containing { Date, PriceGold, PriceUSD, etc }.
 * @param {String} type - 'linear' or 'log'.
 * @param {String} dataKey - Key to use for Y values (e.g., 'PriceGold' or 'PriceUSD').
 * @returns {Array} - Array of objects with trendline values added.
 */
export const calculateTrendlines = (data, type, dataKey = 'PriceGold') => {
    if (!data || data.length < 2) return data;

    const n = data.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

    // We use timestamps for X to handle date logic easily
    // To avoid large numbers, we can normalize X by subtracting the first timestamp
    const firstDate = new Date(data[0].Date).getTime();

    const points = data.map(d => {
        const x = new Date(d.Date).getTime() - firstDate;
        let y = d[dataKey];

        // Ensure y is valid for log scale
        if (type === 'log' && y <= 0) y = 0.0000001;

        return { x, y, original: d };
    });

    // Linear Regression Calculation
    // For Log regression, we regress on ln(y) vs x
    points.forEach(p => {
        const valY = type === 'log' ? Math.log(p.y) : p.y;
        sumX += p.x;
        sumY += valY;
        sumXY += p.x * valY;
        sumX2 += p.x * p.x;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Calculate Residuals to find percentiles for bands
    const residuals = points.map(p => {
        const valY = type === 'log' ? Math.log(p.y) : p.y;
        const predY = slope * p.x + intercept;
        return valY - predY;
    }).sort((a, b) => a - b);

    // Percentile Indices
    const p10Idx = Math.floor(n * 0.10);
    const p20Idx = Math.floor(n * 0.20);
    const p80Idx = Math.floor(n * 0.80);
    const p90Idx = Math.floor(n * 0.90);

    const r10 = residuals[p10Idx];
    const r20 = residuals[p20Idx];
    const r80 = residuals[p80Idx];
    const r90 = residuals[p90Idx];

    // Generate trendline data
    return points.map(p => {
        const predBase = slope * p.x + intercept; // This is ln(y) for log, y for linear

        // Helper to transform back if log
        const transform = (val) => type === 'log' ? Math.exp(val) : val;

        return {
            ...p.original,
            trendline: transform(predBase),
            trendTop10: transform(predBase + r90), // Top 10% (90th percentile of residuals)
            trendTop20: transform(predBase + r80),
            trendBottom20: transform(predBase + r20),
            trendBottom10: transform(predBase + r10), // Bottom 10% (10th percentile of residuals)
        };
    });
};
