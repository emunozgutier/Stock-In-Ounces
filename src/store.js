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
            metals: [
                { name: 'Gold', symbol: 'Au', color: '#F59E0B' },
                { name: 'Silver', symbol: 'Ag', color: '#9CA3AF' },
                { name: 'Platinum', symbol: 'Pt', color: '#E5E7EB' },
                { name: 'Palladium', symbol: 'Pd', color: '#F472B6' },
                { name: 'Rhodium', symbol: 'Rh', color: '#818CF8' },
            ],
            metalColors: {
                'Gold': '#F59E0B',
                'Silver': '#9CA3AF',
                'Platinum': '#E5E7EB',
                'Palladium': '#F472B6',
                'Rhodium': '#818CF8'
            },

            setSelectedTicker: (ticker) => set({ selectedTicker: ticker }),
            setSearchTerm: (term) => set({ searchTerm: term }),
            setTimeRange: (range) => set({ timeRange: range }),
            setData: (data) => set({ data }),
            setTickers: (tickers) => set({ tickers }),
            setIsLogScale: (isLog) => set({ isLogScale: isLog }),
            setReferenceMetal: (metal) => set({ referenceMetal: metal }),

            deviceType: 'Monitor', // 'Monitor', 'Phone Vertical', 'Phone Horizontal'
            setDeviceType: (type) => set({ deviceType: type }),
        }),
        {
            name: 'stock-storage', // unique name
            partialize: (state) => ({ selectedTicker: state.selectedTicker, timeRange: state.timeRange, isLogScale: state.isLogScale, referenceMetal: state.referenceMetal }), // only persist these
        }
    )
);

export default useStore;
