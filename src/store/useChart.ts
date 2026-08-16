import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// ── Types ────────────────────────────────────────────────────────────────────
interface ChartState {
    // Unit display preference
    // 'auto' = pick whichever unit has fewer leading zeros across tick values
    // 'oz' | 'goldbacks' = manual override
    goldUnit: 'auto' | 'oz' | 'goldbacks';
    setGoldUnit: (unit: 'auto' | 'oz' | 'goldbacks') => void;

    // Total leading-zero count across all chart tick values for each representation.
    // Computed in Chart.jsx and synced here so any component can read them.
    goldbacksZeros: number;
    ozZeros: number;
    setDisplayZeros: (goldbacksZeros: number, ozZeros: number) => void;
}

// ── Store ────────────────────────────────────────────────────────────────────
const useChart = create<ChartState>()(
    devtools(
        (set) => ({
            goldUnit: 'auto',
            goldbacksZeros: 0,
            ozZeros: 0,

            setGoldUnit: (unit) => set({ goldUnit: unit }, false, 'setGoldUnit'),
            setDisplayZeros: (goldbacksZeros, ozZeros) =>
                set({ goldbacksZeros, ozZeros }, false, 'setDisplayZeros'),
        }),
        { name: 'ChartStore' }
    )
);

export default useChart;
