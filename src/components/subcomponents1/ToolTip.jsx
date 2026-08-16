import React, { useEffect } from 'react';
import useSelection from '../../store/useSelection';
import useData from '../../store/useData';

const ToolTip = ({ active, payload, label, referenceMetal, metalColors, formatMetalTooltip, formatUSD }) => {
    const { setHoverPoint } = useSelection();
    const { goldUnit } = useData();

    useEffect(() => {
        if (active && payload && payload.length) {
            const metalItem = payload.find(p => p.dataKey === 'priceMetal');
            const usdItem   = payload.find(p => p.dataKey === 'PriceUSD');
            setHoverPoint({
                date:        label ?? null,
                metalValue:  metalItem?.value ?? null,
                dollarValue: usdItem?.value   ?? null,
            });
        } else {
            setHoverPoint(null);
        }
    }, [active, payload, label]); // eslint-disable-line react-hooks/exhaustive-deps

    if (active && payload && payload.length) {
        // payload order varies, find by name/dataKey
        const metalItem = payload.find(p => p.dataKey === 'priceMetal');
        const usdItem = payload.find(p => p.dataKey === 'PriceUSD');

        const priceMetal = metalItem ? metalItem.value : 0;
        const priceUSD = usdItem ? usdItem.value : 0;

        const parseDate = (str) => {
            if (!str || typeof str !== 'string') return new Date();
            const parts = str.split('-');
            if (parts.length !== 3) return new Date(str);
            const [year, month, day] = parts.map(Number);
            return new Date(year, month - 1, day);
        };

        const dateObj = parseDate(label);
        const formattedDate = dateObj.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

        const showGoldbacks = ['Gold', 'Platinum'].includes(referenceMetal) && priceMetal > 0;
        const gbPrefix = referenceMetal === 'Gold' ? '₲' : 'PB';
        const gbValue = (priceMetal * 1000).toPrecision(4);
        const ozValue = `${Number(priceMetal).toPrecision(4)} oz`;

        return (
            <div className="custom-tooltip bg-dark p-2 border border-secondary rounded shadow-sm" style={{ backgroundColor: '#212529', minWidth: '220px' }}>
                <p className="label text-warning mb-2 fw-bold border-bottom border-secondary pb-1">
                    {formattedDate}
                </p>

                {/* Primary metal row — matches the Y-axis unit */}
                <div className="d-flex justify-content-between mb-1">
                    <span style={{ color: metalColors[referenceMetal] }}>
                        {referenceMetal === 'Inflation Adjusted $' ? 'Adjusted Price:'
                            : goldUnit === 'goldbacks' && showGoldbacks ? `Price (${referenceMetal}backs):`
                            : `Price in ${referenceMetal}:`}
                    </span>
                    <span className="fw-mono text-light">
                        {goldUnit === 'goldbacks' && showGoldbacks ? (
                            <>
                                <a href="https://goldback.com" target="_blank" rel="noopener noreferrer" className="text-info text-decoration-none me-1">{gbPrefix}</a>
                                {gbValue}
                            </>
                        ) : formatMetalTooltip(priceMetal)}
                    </span>
                </div>

                {/* Secondary metal row — the other unit */}
                {showGoldbacks && goldUnit === 'oz' && (
                    <div className="d-flex justify-content-between mb-1">
                        <span style={{ color: metalColors[referenceMetal] }}>
                            Price in {referenceMetal}backs:
                        </span>
                        <span className="fw-mono text-light">
                            <a href="https://goldback.com" target="_blank" rel="noopener noreferrer" className="text-info text-decoration-none me-1">{gbPrefix}</a>
                            {gbValue}
                        </span>
                    </div>
                )}
                {showGoldbacks && goldUnit === 'goldbacks' && (
                    <div className="d-flex justify-content-between mb-1">
                        <span style={{ color: metalColors[referenceMetal] }}>
                            Price in {referenceMetal} (oz):
                        </span>
                        <span className="fw-mono text-light">{ozValue}</span>
                    </div>
                )}

                <div className="d-flex justify-content-between mb-1">
                    <span style={{ color: '#10B981' }}>Nominal Price (USD):</span>
                    <span className="fw-mono text-light">{formatUSD(priceUSD)}</span>
                </div>
                {priceUSD > 0 && priceMetal > 0 && (
                    <div className="d-flex justify-content-between mt-2 pt-2 border-top border-secondary">
                        <span className="text-warning small fst-italic">
                            {referenceMetal === 'Inflation Adjusted $' ? 'Inflation Multiplier:' : `1 Oz ${referenceMetal}:`}
                        </span>
                        <span className="fw-mono text-light small">
                            {referenceMetal === 'Inflation Adjusted $'
                                ? (priceMetal / priceUSD).toFixed(4)
                                : formatUSD(priceUSD / priceMetal)
                            }
                        </span>
                    </div>
                )}
            </div>
        );
    }

    return null;
};

export default ToolTip;
