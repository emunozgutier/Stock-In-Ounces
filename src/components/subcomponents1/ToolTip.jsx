import React from 'react';

const ToolTip = ({ active, payload, label, referenceMetal, metalColors, formatMetalTooltip, formatUSD }) => {
    if (active && payload && payload.length) {
        // payload order varies, find by name/dataKey
        const metalItem = payload.find(p => p.dataKey === 'priceMetal');
        const usdItem = payload.find(p => p.dataKey === 'PriceUSD');

        const priceMetal = metalItem ? metalItem.value : 0;
        const priceUSD = usdItem ? usdItem.value : 0;



        return (
            <div className="custom-tooltip bg-dark p-2 border border-secondary rounded shadow-sm" style={{ backgroundColor: '#212529', minWidth: '200px' }}>
                <p className="label text-light mb-2 fw-bold border-bottom border-secondary pb-1">
                    {new Date(label).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                </p>
                <div className="d-flex justify-content-between mb-1">
                    <span style={{ color: metalColors[referenceMetal] }}>
                        {referenceMetal === 'Inflation Adjusted $' ? 'Adjusted Price:' : `Price in ${referenceMetal}:`}
                    </span>
                    <span className="fw-mono text-light">
                        {formatMetalTooltip(priceMetal)}
                    </span>
                </div>
                {['Gold', 'Platinum'].includes(referenceMetal) && priceMetal > 0 && (
                    <div className="d-flex justify-content-between mb-1">
                        <span style={{ color: metalColors[referenceMetal] }}>
                            Price in {referenceMetal}backs:
                        </span>
                        <span className="fw-mono text-light">
                            <a href="https://goldback.com" target="_blank" rel="noopener noreferrer" className="text-info text-decoration-none me-1">{referenceMetal === 'Gold' ? '₲' : 'PB'}</a>
                            {(priceMetal * 1000).toPrecision(4)}
                        </span>
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
