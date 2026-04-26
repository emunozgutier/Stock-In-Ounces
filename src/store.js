import { create } from 'zustand';

const useStore = create(
    (set) => ({
        selectedTicker: 'S&P 500 Index', // Default ticker updated to ^GSPC
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
    })
);

export default useStore;
