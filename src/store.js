import { create } from 'zustand';

const useStore = create((set) => ({
    selectedTicker: 'VOO', // Default ticker updated to VOO
    searchTerm: '',
    timeRange: '1Y', // Default time range
    data: [],        // Full CSV data
    tickers: [],     // Ticker metadata

    setSelectedTicker: (ticker) => set({ selectedTicker: ticker }),
    setSearchTerm: (term) => set({ searchTerm: term }),
    setTimeRange: (range) => set({ timeRange: range }),
    setData: (data) => set({ data }),
    setTickers: (tickers) => set({ tickers }),
}));

export default useStore;
