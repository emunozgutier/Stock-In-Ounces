import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(
    persist(
        (set) => ({
            selectedTicker: 'SPY', // Default ticker updated to SPY
            searchTerm: '',
            timeRange: 'Max', // Default time range
            data: [],        // Full CSV data
            tickers: [],     // Ticker metadata
            isLogScale: true, // Logarithmic scale toggle default true
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
            setReferenceMetal: (metal) => set((state) => {
                const isRestrictedMetal = metal === 'Platinum' || metal === 'Silver';
                const restrictedRanges = ['20Y', '30Y', 'Max'];
                if (isRestrictedMetal && restrictedRanges.includes(state.timeRange)) {
                    return { referenceMetal: metal, timeRange: '10Y' };
                }
                return { referenceMetal: metal };
            }),
            setLastTimeVisited: (time) => set({ lastTimeVisited: time }),

            deviceType: 'Monitor', // 'Monitor', 'Phone Vertical', 'Phone Horizontal'
            setDeviceType: (type) => set({ deviceType: type }),
        }),
        {
            name: 'stock-storage-v2', // unique name bumped version to reset user state to defaults
            partialize: (state) => ({ selectedTicker: state.selectedTicker, timeRange: state.timeRange, isLogScale: state.isLogScale, referenceMetal: state.referenceMetal, lastTimeVisited: state.lastTimeVisited }), // only persist these
        }
    )
);

export default useStore;
