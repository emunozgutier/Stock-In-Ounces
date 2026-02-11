import React from 'react';
import TimeScale from './TimeScale';

const ChartSettings = ({ trendlineType, setTrendlineType, showRainbow, setShowRainbow, isLogScale, setIsLogScale, viewMode, setViewMode }) => {
    return (
        <div className="d-flex flex-column gap-3">
            {/* View Mode */}
            <div className="d-flex align-items-center justify-content-between gap-2">
                <label className="text-secondary small mb-0">View:</label>
                <select
                    className="form-select form-select-sm bg-dark text-light border-secondary"
                    style={{ width: 'auto' }}
                    value={viewMode}
                    onChange={(e) => setViewMode(e.target.value)}
                >
                    <option value="units">Units</option>
                    <option value="relative">Rel %</option>
                    <option value="absolute">Abs %</option>
                </select>
            </div>

            {/* Trendline Controls */}
            <div className="d-flex flex-column gap-2">
                <div className="d-flex align-items-center justify-content-between gap-2">
                    <label className="text-secondary small mb-0">Trend:</label>
                    <select
                        className="form-select form-select-sm bg-dark text-light border-secondary"
                        style={{ width: 'auto' }}
                        value={trendlineType}
                        onChange={(e) => setTrendlineType(e.target.value)}
                    >
                        <option value="none">None</option>
                        <option value="linear">Lin</option>
                        <option value="log">Log</option>
                    </select>
                </div>

                {trendlineType !== 'none' && (
                    <div className="form-check form-switch mb-0 d-flex justify-content-between align-items-center">
                        <label className="form-check-label text-secondary small" htmlFor="rainbowSwitch" style={{ cursor: 'pointer' }}>
                            Rainbow
                        </label>
                        <input
                            className="form-check-input ms-2"
                            type="checkbox"
                            role="switch"
                            id="rainbowSwitch"
                            checked={showRainbow}
                            onChange={(e) => setShowRainbow(e.target.checked)}
                            style={{ cursor: 'pointer' }}
                        />
                    </div>
                )}
            </div>

            {/* Log Scale */}
            <div className="form-check form-switch mb-0 d-flex justify-content-between align-items-center">
                <label className="form-check-label text-secondary small" htmlFor="logScaleSwitch" style={{ cursor: 'pointer' }}>
                    Log Scale
                </label>
                <input
                    className="form-check-input ms-2"
                    type="checkbox"
                    role="switch"
                    id="logScaleSwitch"
                    checked={isLogScale}
                    onChange={(e) => setIsLogScale(e.target.checked)}
                    style={{ cursor: 'pointer' }}
                />
            </div>

            {/* Time Scale */}
            <div className="d-flex flex-column gap-1">
                <label className="text-secondary small mb-0">Time Range:</label>
                <TimeScale />
            </div>
        </div>
    );
};

export default ChartSettings;
