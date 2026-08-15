import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface DataState {
    data: Record<string, any[]> | any[];
    tickers: any[];
    setData: (data: Record<string, any[]> | any[]) => void;
    setTickers: (tickers: any[]) => void;
}

const useData = create<DataState>()(
    devtools(
        (set) => ({
            data: [],
            tickers: [],
            setData: (data) => set({ data }, false, 'setData'),
            setTickers: (tickers) => set({ tickers }, false, 'setTickers'),
        }),
        { name: 'DataStore' }
    )
);

export default useData;
