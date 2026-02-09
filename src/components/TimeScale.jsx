import useStore from '../store';

const TimeScale = () => {
    const { timeRange, setTimeRange } = useStore();
    const ranges = ['1Y', '5Y', '10Y', 'Max'];

    return (
        <div className="btn-group btn-group-sm" role="group" aria-label="Time scale selection">
            {ranges.map(range => (
                <button
                    key={range}
                    type="button"
                    className={`btn btn-outline-warning ${timeRange === range ? 'active' : ''}`}
                    onClick={() => setTimeRange(range)}
                >
                    {range}
                </button>
            ))}
        </div>
    );
};

export default TimeScale;
