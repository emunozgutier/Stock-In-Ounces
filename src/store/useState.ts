import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

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

    // UI state — chart
    viewMode: 'units' | 'relative' | 'absolute';
    activeAxis: 'metal' | 'usd';

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

    // Setters — chart UI
    setViewMode: (mode: 'units' | 'relative' | 'absolute') => void;
    setActiveAxis: (axis: 'metal' | 'usd') => void;
}

const useState = create<AppState>()(
    devtools(
        (set, get) => ({
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

            // UI state — chart
            viewMode: 'units',
            activeAxis: 'metal',

            // Setters — settings
            setSelectedTicker: (ticker) => set({ selectedTicker: ticker }, false, 'setSelectedTicker'),
            setSearchTerm: (term) => set({ searchTerm: term }, false, 'setSearchTerm'),
            setTimeRange: (range) => set({ timeRange: range }, false, 'setTimeRange'),
            setIsLogScale: (isLog) => set({ isLogScale: isLog }, false, 'setIsLogScale'),
            setReferenceMetal: (metal) => {
                const restrictedMetals = ['Platinum', 'Silver'];
                const restrictedRanges = ['20Y', '30Y', 'Max'];
                if (restrictedMetals.includes(metal) && restrictedRanges.includes(get().timeRange)) {
                    set({ referenceMetal: metal, timeRange: '10Y' }, false, 'setReferenceMetal');
                } else {
                    set({ referenceMetal: metal }, false, 'setReferenceMetal');
                }
            },
            setLastTimeVisited: (time) => set({ lastTimeVisited: time }, false, 'setLastTimeVisited'),

            // Setters — UI state
            setIsMenuOpen: (open) => set({ isMenuOpen: open }, false, 'setIsMenuOpen'),
            setIsSearchOpen: (open) => set({ isSearchOpen: open }, false, 'setIsSearchOpen'),
            setIsWelcomeModalOpen: (open) => set({ isWelcomeModalOpen: open }, false, 'setIsWelcomeModalOpen'),

            // Setters — chart UI
            setViewMode: (mode) => set({ viewMode: mode }, false, 'setViewMode'),
            setActiveAxis: (axis) => set({ activeAxis: axis }, false, 'setActiveAxis'),
        }),
        { name: 'AppState' }
    )
);

export default useState;
