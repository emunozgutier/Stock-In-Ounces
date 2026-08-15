import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface Metal {
    name: string;
    symbol: string;
    color: string;
}

interface StyleState {
    metals: Metal[];
    metalColors: Record<string, string>;
}

const useStyle = create<StyleState>()(
    devtools(
        () => ({
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
                'Inflation Adjusted $': '#6366F1',
            },
        }),
        { name: 'StyleStore' }
    )
);

export default useStyle;
