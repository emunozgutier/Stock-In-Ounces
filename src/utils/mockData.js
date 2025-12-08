export const TIME_RANGES = ['1d', '3d', '1w', '1m', '3m', '1y', '3y', '5y', '10y'];

// Simple hash function to seed random numbers
export const seededRandom = (seed) => {
    let x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
};

export const generateSeries = (range, ticker) => {
    const data = [];
    let points = 0;
    let interval = 0; // in minutes

    // Use ticker string to generate a consistent "random" start price
    let seed = 0;
    for (let i = 0; i < ticker.length; i++) {
        seed += ticker.charCodeAt(i);
    }

    let startPrice = 50 + (seededRandom(seed) * 450); // Price between 50 and 500
    if (ticker === 'GOLD') startPrice = 2000; // Start gold around 2000

    switch (range) {
        case '1d': points = 78; interval = 5; break; // 6.5 hours * 12 (5 min)
        case '3d': points = 78 * 3; interval = 5; break;
        case '1w': points = 7 * 24; interval = 60; break; // hourly
        case '1m': points = 30; interval = 24 * 60; break; // daily
        case '3m': points = 90; interval = 24 * 60; break; // daily
        case '1y': points = 250; interval = 24 * 60; break; // daily
        case '3y': points = 250 * 3; interval = 24 * 60; break; // daily
        case '5y': points = 52 * 5; interval = 24 * 60 * 7; break; // weekly (approx 260 points)
        case '10y': points = 52 * 10; interval = 24 * 60 * 7; break; // weekly (approx 520 points)
        default: points = 100; interval = 60;
    }

    let currentPrice = startPrice;
    const now = new Date();

    for (let i = 0; i < points; i++) {
        const date = new Date(now.getTime() - (points - 1 - i) * interval * 60 * 1000);

        // Use seed + i to generate consistent volatility for this point
        const r = seededRandom(seed + i * 1337);
        const change = (r - 0.5) * (startPrice * 0.02); // 2% volatility
        currentPrice += change;

        // Format date based on range
        let dateStr = '';
        if (['1d', '3d'].includes(range)) {
            dateStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (['1w', '1m', '3m'].includes(range)) {
            dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        } else {
            dateStr = date.toLocaleDateString([], { year: '2-digit', month: 'short' });
        }

        data.push({
            date: dateStr,
            rawDate: date, // Keep raw date for merging
            price: parseFloat(currentPrice.toFixed(2)),
        });
    }
    return data;
};

export const generateData = (range, ticker) => {
    const stockSeries = generateSeries(range, ticker);
    const goldSeries = generateSeries(range, 'GOLD');

    return stockSeries.map((item, index) => {
        const goldPrice = goldSeries[index] ? goldSeries[index].price : 2000;
        const priceInGold = item.price / goldPrice;

        return {
            date: item.date,
            price: item.price,
            goldPrice: goldPrice,
            priceInGold: parseFloat(priceInGold.toFixed(4)),
        };
    });
};
