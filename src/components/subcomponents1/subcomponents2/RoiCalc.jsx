import useData from '../../../store/useData';
import useAppState from '../../../store/useState';
import useSelection from '../../../store/useSelection';
import { useMemo } from 'react';

// ── Pure helper — no component deps ─────────────────────────────────────────
const computeGrowth = (startDate, endDate, valStart, valEnd) => {
    if (valStart == null || valEnd == null || valStart === 0) return null;

    const totalGrowth = ((valEnd - valStart) / valStart) * 100;
    const timeDiff = new Date(endDate) - new Date(startDate);
    const days = timeDiff / (1000 * 60 * 60 * 24);
    const years = days / 365.25;

    let annualizedGrowth = 0;
    if (years > 0 && valStart > 0 && valEnd > 0) {
        annualizedGrowth = (Math.pow(valEnd / valStart, 1 / years) - 1) * 100;
    }
    return { totalGrowth, annualizedGrowth, years };
};

const formatShortDate = (dateStr) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

// ── Component ─────────────────────────────────────────────────────────────────
const RoiCalc = () => {
    const { data } = useData();
    const { selectedTicker, timeRange, referenceMetal } = useAppState();
    const { dragSelection, clearDragSelection } = useSelection();

    // A selection is valid when both endpoints have different dates
    const hasSelection =
        dragSelection?.start?.date &&
        dragSelection?.end?.date &&
        dragSelection.start.date !== dragSelection.end.date;

    const allStats = useMemo(() => {
        if (!selectedTicker) return null;

        // ── Custom drag-selection range ────────────────────────────────────
        if (hasSelection) {
            const { start, end } = dragSelection;
            // Normalise chronological order
            const [s, e] = start.date < end.date ? [start, end] : [end, start];

            const usdStats   = computeGrowth(s.date, e.date, s.dollarValue, e.dollarValue);
            const metalStats = computeGrowth(s.date, e.date, s.metalValue,  e.metalValue);

            return {
                metal: metalStats,
                usd: usdStats,
                isCustomRange: true,
                startDate: s.date,
                endDate: e.date,
            };
        }

        // ── Default: first → last of current timeframe ─────────────────────
        if (!data) return null;

        let timeFrameData = [];
        if (Array.isArray(data)) {
            timeFrameData = data;
        } else {
            timeFrameData = data[timeRange.toLowerCase()] || data[timeRange] || [];
        }
        if (timeFrameData.length === 0) return null;

        const startItem = timeFrameData[0];
        const endItem   = timeFrameData[timeFrameData.length - 1];
        if (!startItem || !endItem) return null;

        const startUsd = startItem[selectedTicker];
        const endUsd   = endItem[selectedTicker];
        const usdStats = computeGrowth(startItem.Date, endItem.Date, startUsd, endUsd);

        const startRef = startItem[referenceMetal];
        const endRef   = endItem[referenceMetal];
        let metalStats = null;
        if (startRef && endRef && startUsd && endUsd) {
            let startRatio, endRatio;
            if (referenceMetal === 'Inflation Adjusted $') {
                startRatio = startUsd * startRef;
                endRatio   = endUsd   * endRef;
            } else {
                startRatio = startUsd / startRef;
                endRatio   = endUsd   / endRef;
            }
            metalStats = computeGrowth(startItem.Date, endItem.Date, startRatio, endRatio);
        }

        return { metal: metalStats, usd: usdStats, isCustomRange: false };

    }, [data, selectedTicker, timeRange, referenceMetal, hasSelection, dragSelection]);

    if (!allStats) return null;

    const renderStats = (stats, label) => {
        if (!stats) return null;
        return (
            <div className="d-flex flex-column align-items-end mx-2">
                <span className="small text-secondary fw-bold" style={{ fontSize: '0.75rem' }}>{label}</span>
                <span className={`fw-bold ${stats.totalGrowth >= 0 ? 'text-success' : 'text-danger'}`} style={{ fontSize: '0.9rem' }}>
                    {stats.totalGrowth > 0 ? '+' : ''}{stats.totalGrowth.toFixed(2)}%
                </span>
                <span className={`small ${stats.annualizedGrowth >= 0 ? 'text-success' : 'text-danger'}`} style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                    {stats.annualizedGrowth > 0 ? '+' : ''}{stats.annualizedGrowth.toFixed(2)}% / yr
                </span>
            </div>
        );
    };

    return (
        <div className="d-flex align-items-center border-start border-secondary ps-2 ms-2">
            {/* Custom range indicator */}
            {allStats.isCustomRange && (
                <div className="d-flex flex-column align-items-start me-2">
                    <div className="d-flex align-items-center gap-1">
                        <span style={{
                            fontSize: '0.65rem',
                            color: '#60A5FA',
                            background: 'rgba(59,130,246,0.15)',
                            border: '1px solid rgba(96,165,250,0.4)',
                            borderRadius: 4,
                            padding: '1px 5px',
                            fontWeight: 600,
                            letterSpacing: '0.03em',
                            whiteSpace: 'nowrap',
                        }}>
                            SELECTED
                        </span>
                        <button
                            onClick={clearDragSelection}
                            title="Clear selection"
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#9CA3AF',
                                cursor: 'pointer',
                                padding: '0 2px',
                                lineHeight: 1,
                                fontSize: '0.8rem',
                            }}
                        >×</button>
                    </div>
                    <span style={{ fontSize: '0.65rem', color: '#9CA3AF', whiteSpace: 'nowrap' }}>
                        {formatShortDate(allStats.startDate)} — {formatShortDate(allStats.endDate)}
                    </span>
                </div>
            )}

            {renderStats(allStats.metal, `${referenceMetal}`)}
            {renderStats(allStats.usd, 'USD')}
        </div>
    );
};

export default RoiCalc;
