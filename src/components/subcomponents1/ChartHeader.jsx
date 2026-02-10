import useStore from '../../store';
import TimeScale from './subcomponents2/TimeScale';

const ChartHeader = ({ trendlineType, setTrendlineType, showRainbow, setShowRainbow, isLogScale, setIsLogScale }) => {
    const { selectedTicker, referenceMetal } = useStore();

    return (
        <div className="p-2 d-flex flex-column flex-md-row justify-content-between align-items-center border-bottom border-secondary gap-2 gap-md-0" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
            <h2 className="h6 text-warning mb-0 w-100 w-md-auto text-center text-md-start">{selectedTicker} / {referenceMetal}</h2>
            <div className="d-flex flex-wrap justify-content-center align-items-center gap-2 gap-md-3">
                {/* Trendline Controls */}
                <div className="d-flex align-items-center gap-2">
                    <label className="text-secondary small mb-0 me-1 d-none d-sm-block">Trend:</label>
                    <select
                        className="form-select form-select-sm bg-dark text-light border-secondary"
                        style={{ width: 'auto', paddingRight: '2rem' }}
                        value={trendlineType}
                        onChange={(e) => setTrendlineType(e.target.value)}
                    >
                        <option value="none">None</option>
                        <option value="linear">Lin</option>
                        <option value="log">Log</option>
                    </select>

                    {trendlineType !== 'none' && (
                        <div className="form-check form-switch mb-0 ms-2">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                role="switch"
                                id="rainbowSwitch"
                                checked={showRainbow}
                                onChange={(e) => setShowRainbow(e.target.checked)}
                                style={{ cursor: 'pointer' }}
                            />
                            <label className="form-check-label text-secondary small d-none d-md-block" htmlFor="rainbowSwitch" style={{ cursor: 'pointer' }}>
                                Rainbow
                            </label>
                        </div>
                    )}
                </div>

                <div className="form-check form-switch mb-0 ms-2">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        id="logScaleSwitch"
                        checked={isLogScale}
                        onChange={(e) => setIsLogScale(e.target.checked)}
                        style={{ cursor: 'pointer' }}
                    />
                    <label className="form-check-label text-secondary small d-none d-md-block" htmlFor="logScaleSwitch" style={{ cursor: 'pointer' }}>
                        Log Scale
                    </label>
                </div>
                <TimeScale />
            </div>
        </div>
    );
};

export default ChartHeader;
