import { create } from 'zustand';

interface AppState {
    // Settings
    selectedTicker: string;
    searchTerm: string;
    timeRange: string;
    isLogScale: boolean;
    referenceMetal: string;
    lastTimeVisited: string | null;

    // UI state — menus & popups
    isMenuOpen: boolean;
    isSearchOpen: boolean;
    isWelcomeModalOpen: boolean;

    // Setters — settings
    setSelectedTicker: (ticker: string) => void;
    setSearchTerm: (term: string) => void;
    setTimeRange: (range: string) => void;
    setIsLogScale: (isLog: boolean) => void;
    setReferenceMetal: (metal: string) => void;
    setLastTimeVisited: (time: string | null) => void;

    // Setters — UI state
    setIsMenuOpen: (open: boolean) => void;
    setIsSearchOpen: (open: boolean) => void;
    setIsWelcomeModalOpen: (open: boolean) => void;
}

const useState = create<AppState>((set, get) => ({
    // Settings
    selectedTicker: 'S&P 500 Index',
    searchTerm: '',
    timeRange: 'Max',
    isLogScale: true,
    referenceMetal: 'Gold',
    lastTimeVisited: null,

    // UI state — menus & popups
    isMenuOpen: false,
    isSearchOpen: false,
    isWelcomeModalOpen: false,

    // Setters — settings
    setSelectedTicker: (ticker) => set({ selectedTicker: ticker }),
    setSearchTerm: (term) => set({ searchTerm: term }),
    setTimeRange: (range) => set({ timeRange: range }),
    setIsLogScale: (isLog) => set({ isLogScale: isLog }),
    setReferenceMetal: (metal) => {
        const restrictedMetals = ['Platinum', 'Silver'];
        const restrictedRanges = ['20Y', '30Y', 'Max'];
        if (restrictedMetals.includes(metal) && restrictedRanges.includes(get().timeRange)) {
            set({ referenceMetal: metal, timeRange: '10Y' });
        } else {
            set({ referenceMetal: metal });
        }
    },
    setLastTimeVisited: (time) => set({ lastTimeVisited: time }),

    // Setters — UI state
    setIsMenuOpen: (open) => set({ isMenuOpen: open }),
    setIsSearchOpen: (open) => set({ isSearchOpen: open }),
    setIsWelcomeModalOpen: (open) => set({ isWelcomeModalOpen: open }),
}));

export default useState;
