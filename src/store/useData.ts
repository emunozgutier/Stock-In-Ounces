import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// ── Inflate helper (verbatim from DataContext) ───────────────────────────────
function inflate(data: unknown): unknown {
    if (!data) return {};
    if (Array.isArray(data)) return data;

    const d = data as Record<string, unknown>;

    if (d.columns && d.rows) {
        const { columns, rows } = d as { columns: string[]; rows: unknown[][] };
        return rows.map((row) => {
            const obj: Record<string, unknown> = {};
            columns.forEach((col, i) => { obj[col] = row[i]; });
            return obj;
        });
    }

    // Dictionary of timeframes  { "1y": { columns, rows }, ... }
    const inflated: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(d)) {
        const v = val as Record<string, unknown>;
        if (v && v.columns && v.rows) {
            const { columns, rows } = v as { columns: string[]; rows: unknown[][] };
            inflated[key] = rows.map((row) => {
                const obj: Record<string, unknown> = {};
                columns.forEach((col, i) => { obj[col] = row[i]; });
                return obj;
            });
        } else {
            inflated[key] = val;
        }
    }
    return inflated;
}

// ── Types ────────────────────────────────────────────────────────────────────
interface Ticker {
    symbol: string;
    name: string;
    [key: string]: unknown;
}

interface DataState {
    data: Record<string, unknown> | unknown[];
    tickers: Ticker[];
    isLoading: boolean;
    goldUnit: 'oz' | 'goldbacks';
    fetchData: () => Promise<void>;
    setGoldUnit: (unit: 'oz' | 'goldbacks') => void;
}

// ── Store ────────────────────────────────────────────────────────────────────
const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/emunozgutier/Stock-In-Ounces/main/public';

const useData = create<DataState>()(
    devtools(
        (set) => ({
            data: [],
            tickers: [],
            isLoading: true,
            goldUnit: 'oz',

            setGoldUnit: (unit) => set({ goldUnit: unit }, false, 'setGoldUnit'),

            fetchData: async () => {
                try {
                    set({ isLoading: true }, false, 'fetchData/start');

                    // 1. Load tickers metadata
                    const tickersRes = await fetch(`${GITHUB_RAW_BASE}/tickers.json`);
                    const tickersData: Ticker[] = await tickersRes.json();
                    set({ tickers: tickersData }, false, 'fetchData/tickers');

                    // 2. Fast data — render immediately
                    try {
                        const fastRes = await fetch(`${GITHUB_RAW_BASE}/FastData.json`);
                        if (fastRes.ok) {
                            const fastData = await fastRes.json();
                            set({ data: inflate(fastData) as DataState['data'], isLoading: false }, false, 'fetchData/fast');
                        }
                    } catch (e) {
                        console.warn('FastData load failed, waiting for full data', e);
                    }

                    // 3. Full data — upgrade in background
                    const fullRes = await fetch(`${GITHUB_RAW_BASE}/Data.json`);
                    const fullData = await fullRes.json();
                    set({ data: inflate(fullData) as DataState['data'], isLoading: false }, false, 'fetchData/full');

                } catch (error) {
                    console.error('Error loading data:', error);
                    set({ isLoading: false }, false, 'fetchData/error');
                }
            },
        }),
        { name: 'DataStore' }
    )
);

export default useData;
