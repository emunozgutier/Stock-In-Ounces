```javascript
import { useState } from 'react';
import useStore from '../../store';
import RoiCalc from './subcomponents2/RoiCalc';
import ChartSettings from './subcomponents2/ChartSettings';
import SearchStock from '../SearchStock';
import MetalSelector from './MetalSelector';
import { Settings } from 'lucide-react';

const ChartHeader = ({ trendlineType, setTrendlineType, showRainbow, setShowRainbow, isLogScale, setIsLogScale, viewMode, setViewMode }) => {
    const { selectedTicker, referenceMetal } = useStore();
    const [showSettings, setShowSettings] = useState(false);

    return (
        <div className="p-2 d-flex flex-column flex-xl-row justify-content-between align-items-center border-bottom border-secondary gap-2" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
            <div className="d-flex align-items-center justify-content-center justify-content-sm-start w-100 w-xl-auto mb-2 mb-xl-0">
                <h2 className="h6 text-warning mb-0 me-2">{selectedTicker} / {referenceMetal}</h2>
                <RoiCalc />
            </div>

            <div className="d-flex flex-column flex-md-row align-items-center gap-2 w-100 w-xl-auto justify-content-center justify-content-xl-end">
                <div className="d-flex align-items-center gap-2 w-100 w-md-auto justify-content-center">
                    <div style={{ width: '300px', minWidth: '300px' }}>
                        <SearchStock />
                    </div>
                    <MetalSelector />
                </div>
                
                <div className="position-relative">
                    <button 
                        className={`btn btn - sm ${ showSettings ? 'btn-warning' : 'btn-outline-secondary' } d - flex align - items - center gap - 1`}
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
                                trendlineType={trendlineType}
                                setTrendlineType={setTrendlineType}
                                showRainbow={showRainbow}
                                setShowRainbow={setShowRainbow}
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
    );
};


export default ChartHeader;
