const API_KEY = "3B9SF9GS84W9TJ52";

export const getDailyStockData = async (symbol) => {
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${API_KEY}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        // Check for API limit or error messages
        if (data["Note"] || data["Information"]) {
            throw new Error("API Limit Reached: " + (data["Note"] || data["Information"]));
        }
        if (data["Error Message"]) {
            throw new Error("Invalid Ticker or API Error");
        }

        const timeSeries = data["Time Series (Daily)"];
        if (!timeSeries) {
            throw new Error("No data found");
        }

        // Convert to array format for Recharts
        // Object keys are dates 'YYYY-MM-DD'
        return Object.entries(timeSeries).map(([date, values]) => ({
            date: date,
            rawDate: new Date(date),
            price: parseFloat(values["4. close"])
        })).sort((a, b) => a.rawDate - b.rawDate); // Sort ascending for chart

    } catch (error) {
        console.error("Error fetching stock data:", error);
        throw error; // Re-throw to handle in App.jsx
    }
};
