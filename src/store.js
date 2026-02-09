import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(
    persist(
        (set) => ({
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
        }),
        {
            name: 'stock-storage', // unique name
            partialize: (state) => ({ selectedTicker: state.selectedTicker, timeRange: state.timeRange }), // only persist these
        }
    )
);

export default useStore;
