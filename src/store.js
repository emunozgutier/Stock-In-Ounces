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
            isLogScale: false, // Logarithmic scale toggle

            setSelectedTicker: (ticker) => set({ selectedTicker: ticker }),
            setSearchTerm: (term) => set({ searchTerm: term }),
            setTimeRange: (range) => set({ timeRange: range }),
            setData: (data) => set({ data }),
            setTickers: (tickers) => set({ tickers }),
            setIsLogScale: (isLog) => set({ isLogScale: isLog }),
        }),
        {
            name: 'stock-storage', // unique name
            partialize: (state) => ({ selectedTicker: state.selectedTicker, timeRange: state.timeRange, isLogScale: state.isLogScale }), // only persist these
        }
    )
);

export default useStore;
