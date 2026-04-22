import useStore from '../../../store';

const TimeScale = () => {
    const { timeRange, setTimeRange, referenceMetal } = useStore();
    const ranges = ['1Y', '5Y', '10Y', '20Y', '30Y', 'Max'];
    const isRestrictedMetal = referenceMetal === 'Platinum' || referenceMetal === 'Silver';
    const restrictedRanges = ['20Y', '30Y', 'Max'];

    return (
        <div className="btn-group btn-group-sm" role="group" aria-label="Time scale selection">
            {ranges.map(range => {
                const isDisabled = isRestrictedMetal && restrictedRanges.includes(range);
                return (
                    <button
                        key={range}
                        type="button"
                        className={`btn btn-outline-warning ${timeRange === range ? 'active' : ''}`}
                        onClick={() => setTimeRange(range)}
                        disabled={isDisabled}
                    >
                        {range}
                    </button>
                );
            })}
        </div>
    );
};

export default TimeScale;
