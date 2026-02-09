import { create } from 'zustand';

const useStore = create((set) => ({
    selectedTicker: 'SPY', // Default ticker
    searchTerm: '',
    data: [],        // Full CSV data
    tickers: [],     // Ticker metadata

    setSelectedTicker: (ticker) => set({ selectedTicker: ticker }),
    setSearchTerm: (term) => set({ searchTerm: term }),
    setData: (data) => set({ data }),
    setTickers: (tickers) => set({ tickers }),
}));

export default useStore;
