import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// The chart data-point currently under the cursor
export interface HoverPoint {
    date: string;
    metalValue: number | null;
    dollarValue: number | null;
}

// One endpoint of a drag selection
export interface SelectionPoint {
    date: string;
    metalValue: number | null;
    dollarValue: number | null;
}

export interface DragSelection {
    start: SelectionPoint;
    end: SelectionPoint;
}

interface SelectionState {
    // Cursor hover point (null when cursor is off the chart)
    hoverPoint: HoverPoint | null;

    // Active drag selection (null when no range is selected)
    dragSelection: DragSelection | null;

    // Internal: whether the user is currently dragging
    isDragging: boolean;

    // Setters
    setHoverPoint: (point: HoverPoint | null) => void;
    startDrag: (point: SelectionPoint) => void;
    updateDrag: (point: SelectionPoint) => void;
    endDrag: (point: SelectionPoint) => void;
    clearDragSelection: () => void;
    clearAll: () => void;
}

const useSelection = create<SelectionState>()(
    devtools(
        (set, get) => ({
            hoverPoint: null,
            dragSelection: null,
            isDragging: false,

            setHoverPoint: (point) =>
                set({ hoverPoint: point }, false, 'setHoverPoint'),

            startDrag: (point) =>
                set(
                    {
                        isDragging: true,
                        dragSelection: { start: point, end: point },
                    },
                    false,
                    'startDrag'
                ),

            updateDrag: (point) => {
                if (!get().isDragging) return;
                set(
                    (state) => ({
                        dragSelection: state.dragSelection
                            ? { ...state.dragSelection, end: point }
                            : { start: point, end: point },
                    }),
                    false,
                    'updateDrag'
                );
            },

            endDrag: (point) =>
                set(
                    (state) => ({
                        isDragging: false,
                        dragSelection: state.dragSelection
                            ? { ...state.dragSelection, end: point }
                            : null,
                    }),
                    false,
                    'endDrag'
                ),

            clearDragSelection: () =>
                set({ dragSelection: null, isDragging: false }, false, 'clearDragSelection'),

            clearAll: () =>
                set(
                    { hoverPoint: null, dragSelection: null, isDragging: false },
                    false,
                    'clearAll'
                ),
        }),
        { name: 'SelectionStore' }
    )
);

export default useSelection;
