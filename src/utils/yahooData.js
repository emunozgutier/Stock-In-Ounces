import yahooFinance from 'yahoo-finance2';

// Helper to calculate start date from range string
const getStartDate = (range) => {
    const now = new Date();
    const date = new Date(now);

    switch (range) {
        case '1d': date.setHours(now.getHours() - 24); break; // fallback, usually 1d means intraday which yahoo handles differently
        case '3d': date.setDate(now.getDate() - 3); break;
        case '1w': date.setDate(now.getDate() - 7); break;
        case '1m': date.setMonth(now.getMonth() - 1); break;
        case '3m': date.setMonth(now.getMonth() - 3); break;
        case '1y': date.setFullYear(now.getFullYear() - 1); break;
        case '3y': date.setFullYear(now.getFullYear() - 3); break;
        case '5y': date.setFullYear(now.getFullYear() - 5); break;
        case '10y': date.setFullYear(now.getFullYear() - 10); break;
        default: date.setMonth(now.getMonth() - 1);
    }
    return date;
};

// Map app ranges to Yahoo intervals
const getInterval = (range) => {
    switch (range) {
        case '1d': return '5m'; // Intraday
        case '3d': return '15m';
        case '1w': return '30m'; // or 1h
        case '1m': return '1d';
        case '3m': return '1d';
        case '1y': return '1d';
        case '3y': return '1wk';
        case '5y': return '1wk';
        case '10y': return '1mo';
        default: return '1d';
    }
};

export const searchSymbol = async (query) => {
    try {
        const results = await yahooFinance.search(query);
        // yahoo-finance2 search returns object with quotes
        return results.quotes ? results.quotes.filter(q => q.isYahooFinance !== false) : [];
    } catch (error) {
        console.error("Error searching symbol:", error);
        return [];
    }
};

export const getQuote = async (ticker) => {
    try {
        const quote = await yahooFinance.quote(ticker);
        return quote;
    } catch (error) {
        console.error(`Error fetching quote for ${ticker}:`, error);
        return null;
    }
};

export const getHistoricalData = async (ticker, range) => {
    try {
        const period1 = getStartDate(range);
        const interval = getInterval(range);

        // Yahoo Finance 2 'historical' method usage
        const queryOptions = {
            period1: period1.toISOString().split('T')[0], // YYYY-MM-DD
            interval: interval,
            // period2 defaults to now
        };

        const result = await yahooFinance.historical(ticker, queryOptions);

        // Map to simple structure { date, price }
        return result.map(item => ({
            date: item.date.toISOString(), // Keep strict ISO for consistent parsing
            rawDate: item.date,
            price: item.close // Use close price
        }));
    } catch (error) {
        console.error(`Error fetching historical data for ${ticker}:`, error);
        return [];
    }
};
