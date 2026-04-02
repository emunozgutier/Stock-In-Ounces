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
            referenceMetal: 'Gold', // Default reference metal
            lastTimeVisited: null, // Timestamp tracker for onboarding
            metals: [
                { name: 'Gold', symbol: 'Au', color: '#F59E0B' },
                { name: 'Silver', symbol: 'Ag', color: '#9CA3AF' },
                { name: 'Platinum', symbol: 'Pt', color: '#E5E7EB' },
                { name: 'Inflation Adjusted $', symbol: '$', color: '#6366F1' },
            ],
            metalColors: {
                'Gold': '#F59E0B',
                'Silver': '#9CA3AF',
                'Platinum': '#E5E7EB',
                'Inflation Adjusted $': '#6366F1'
            },

            setSelectedTicker: (ticker) => set({ selectedTicker: ticker }),
            setSearchTerm: (term) => set({ searchTerm: term }),
            setTimeRange: (range) => set({ timeRange: range }),
            setData: (data) => set({ data }),
            setTickers: (tickers) => set({ tickers }),
            setIsLogScale: (isLog) => set({ isLogScale: isLog }),
            setReferenceMetal: (metal) => set({ referenceMetal: metal }),
            setLastTimeVisited: (time) => set({ lastTimeVisited: time }),

            deviceType: 'Monitor', // 'Monitor', 'Phone Vertical', 'Phone Horizontal'
            setDeviceType: (type) => set({ deviceType: type }),
        }),
        {
            name: 'stock-storage', // unique name
            partialize: (state) => ({ selectedTicker: state.selectedTicker, timeRange: state.timeRange, isLogScale: state.isLogScale, referenceMetal: state.referenceMetal, lastTimeVisited: state.lastTimeVisited }), // only persist these
        }
    )
);

export default useStore;
