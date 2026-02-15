import { useState } from 'react';
import useStore from '../../store';
import RoiCalc from './subcomponents2/RoiCalc';
import ChartSettings from './subcomponents2/ChartSettings';
import SearchStock from '../SearchStock';
import MetalSelector from './MetalSelector';
import { Settings } from 'lucide-react';

const ChartHeader = ({ isLogScale, setIsLogScale, viewMode, setViewMode, activeAxis, setActiveAxis, isMobile }) => {
    const { selectedTicker, referenceMetal, deviceType } = useStore();
    const [showSettings, setShowSettings] = useState(false);

    const isPhoneHorizontal = deviceType === 'Phone Horizontal';

    return (
        <div
            className={`d-flex align-items-center justify-content-between border-bottom border-secondary ${isPhoneHorizontal ? 'p-1 gap-1 flex-row' : 'p-2 flex-column flex-xl-row gap-2'}`}
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
        >
            <div className={`d-flex align-items-center justify-content-center justify-content-sm-start w-100 w-xl-auto ${isPhoneHorizontal ? 'mb-0' : 'mb-2 mb-xl-0'}`}>
                <h2 className={`text-warning mb-0 me-2 ${isPhoneHorizontal ? 'h6' : 'h6'}`}>{selectedTicker} / {referenceMetal}</h2>
                {deviceType === 'Monitor' && <RoiCalc />}
            </div>

            <div className={`d-flex align-items-center gap-2 w-100 w-xl-auto justify-content-center justify-content-xl-end ${isPhoneHorizontal ? 'flex-row' : 'flex-column flex-md-row'}`}>
                <div className={`d-flex align-items-center gap-2 w-100 w-md-auto justify-content-center ${isPhoneHorizontal ? 'w-auto' : ''}`}>
                    <div style={{ width: isPhoneHorizontal ? '150px' : '300px', minWidth: isPhoneHorizontal ? '150px' : '300px' }}>
                        <SearchStock />
                    </div>
                    <MetalSelector />
                </div>

                <div className="d-flex align-items-center gap-2">
                    {/* Swap Axis Button - Mobile Only */}
                    {isMobile && (
                        <button
                            className="btn btn-sm btn-outline-info d-flex align-items-center gap-1"
                            onClick={() => setActiveAxis(activeAxis === 'metal' ? 'usd' : 'metal')}
                            title="Swap Axis"
                        >
                            {activeAxis === 'metal' ? 'Show USD' : `Show ${referenceMetal}`}
                        </button>
                    )}

                    <div className="position-relative">
                        <button
                            className={`btn btn-sm ${showSettings ? 'btn-warning' : 'btn-outline-secondary'} d-flex align-items-center gap-1`}
                            onClick={() => setShowSettings(!showSettings)}
                            title="Chart Settings"
                        >
                            <Settings size={18} />
                        </button>

                        {showSettings && (
                            <div
                                className="position-absolute end-0 mt-2 p-3 bg-dark border border-secondary rounded shadow-lg"
                                style={{ zIndex: 1000, width: 'max-content', minWidth: '200px' }}
                            >
                                <ChartSettings
                                    isLogScale={isLogScale}
                                    setIsLogScale={setIsLogScale}
                                    viewMode={viewMode}
                                    setViewMode={setViewMode}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChartHeader;
