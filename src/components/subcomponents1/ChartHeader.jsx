import useStore from '../../store';
import RoiCalc from './subcomponents2/RoiCalc';
import ChartSettings from './subcomponents2/ChartSettings';

const ChartHeader = ({ trendlineType, setTrendlineType, showRainbow, setShowRainbow, isLogScale, setIsLogScale }) => {
    const { selectedTicker, referenceMetal } = useStore();

    return (
        <div className="p-2 d-flex flex-column flex-sm-row justify-content-between align-items-center border-bottom border-secondary gap-2 gap-sm-0" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
            <div className="d-flex align-items-center justify-content-center justify-content-sm-start">
                <h2 className="h6 text-warning mb-0">{selectedTicker} / {referenceMetal}</h2>
                <RoiCalc />
            </div>
            <ChartSettings
                trendlineType={trendlineType}
                setTrendlineType={setTrendlineType}
                showRainbow={showRainbow}
                setShowRainbow={setShowRainbow}
                isLogScale={isLogScale}
                setIsLogScale={setIsLogScale}
            />
        </div>
    );
};


export default ChartHeader;
