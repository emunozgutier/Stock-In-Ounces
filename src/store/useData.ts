import { create } from 'zustand';

interface DataState {
    data: Record<string, any[]> | any[];
    tickers: any[];
    setData: (data: Record<string, any[]> | any[]) => void;
    setTickers: (tickers: any[]) => void;
}

const useData = create<DataState>((set) => ({
    data: [],
    tickers: [],
    setData: (data) => set({ data }),
    setTickers: (tickers) => set({ tickers }),
}));

export default useData;
