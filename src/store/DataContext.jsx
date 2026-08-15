import { createContext, useContext, useState, useEffect } from 'react';

const DataContext = createContext(null);

// Helper to inflate compact columnar data
function inflate(data) {
    if (!data) return {};
    if (Array.isArray(data)) return data;
    if (data.columns && data.rows) {
        const { columns, rows } = data;
        return rows.map(row => {
            const obj = {};
            columns.forEach((col, index) => { obj[col] = row[index]; });
            return obj;
        });
    }
    // Dictionary of timeframes { "1y": { columns, rows }, ... }
    const inflated = {};
    for (const [key, val] of Object.entries(data)) {
        if (val && val.columns && val.rows) {
            const { columns, rows } = val;
            inflated[key] = rows.map(row => {
                const obj = {};
                columns.forEach((col, index) => { obj[col] = row[index]; });
                return obj;
            });
        } else {
            inflated[key] = val;
        }
    }
    return inflated;
}

export function DataProvider({ children, onLoadingChange }) {
    const [data, setData] = useState([]);
    const [tickers, setTickers] = useState([]);

    useEffect(() => {
        const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/emunozgutier/Stock-In-Ounces/main/public';

        const fetchData = async () => {
            try {
                onLoadingChange?.(true);

                // 1. Load Tickers Metadata
                const tickersResponse = await fetch(`${GITHUB_RAW_BASE}/tickers.json`);
                const tickersData = await tickersResponse.json();
                setTickers(tickersData);

                // 2. Load Fast Data (Instant Render)
                try {
                    const fastResponse = await fetch(`${GITHUB_RAW_BASE}/FastData.json`);
                    if (fastResponse.ok) {
                        const fastData = await fastResponse.json();
                        setData(inflate(fastData));
                        onLoadingChange?.(false); // Enable interaction immediately
                    }
                } catch (e) {
                    console.warn('FastData load failed, waiting for full data', e);
                }

                // 3. Load Full Data (Lazy)
                const response = await fetch(`${GITHUB_RAW_BASE}/Data.json`);
                const fullData = await response.json();
                setData(inflate(fullData));
                onLoadingChange?.(false);

            } catch (error) {
                console.error('Error loading data:', error);
                onLoadingChange?.(false);
            }
        };

        fetchData();
    }, []);

    return (
        <DataContext.Provider value={{ data, tickers }}>
            {children}
        </DataContext.Provider>
    );
}

export function useDataContext() {
    const ctx = useContext(DataContext);
    if (!ctx) throw new Error('useDataContext must be used inside <DataProvider>');
    return ctx;
}
