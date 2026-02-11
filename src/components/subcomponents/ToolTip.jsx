import React from 'react';

const ToolTip = ({ active, payload, label, referenceMetal, metalColors, formatMetalTooltip, formatUSD }) => {
    if (active && payload && payload.length) {
        // payload order varies, find by name/dataKey
        const metalItem = payload.find(p => p.dataKey === 'priceMetal');
        const usdItem = payload.find(p => p.dataKey === 'PriceUSD');

        const priceMetal = metalItem ? metalItem.value : 0;
        const priceUSD = usdItem ? usdItem.value : 0;

        // Calculate Metal Price (USD per Oz)
        // Asset Price (USD) = Asset Price (Metal Oz) * Metal Price (USD/Oz)
        // So: Metal Price (USD/Oz) = Asset Price (USD) / Asset Price (Metal Oz)
        let metalPriceUSD = 0;
        if (priceMetal > 0) {
            metalPriceUSD = priceUSD / priceMetal;
        }

        return (
            <div className="custom-tooltip bg-dark p-2 border border-secondary rounded shadow-sm" style={{ backgroundColor: '#212529', minWidth: '200px' }}>
                <p className="label text-light mb-2 fw-bold border-bottom border-secondary pb-1">
                    {new Date(label).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                </p>
                <div className="d-flex justify-content-between mb-1">
                    <span style={{ color: metalColors[referenceMetal] }}>Price in {referenceMetal}:</span>
                    <span className="fw-mono text-light">{formatMetalTooltip(priceMetal)}</span>
                </div>
                <div className="d-flex justify-content-between mb-1">
                    <span style={{ color: '#10B981' }}>Price in USD:</span>
                    <span className="fw-mono text-light">{formatUSD(priceUSD)}</span>
                </div>
                {metalPriceUSD > 0 && (
                    <div className="d-flex justify-content-between mt-2 pt-2 border-top border-secondary">
                        <span className="text-warning small fst-italic">1 Oz {referenceMetal}:</span>
                        <span className="fw-mono text-light small">{formatUSD(metalPriceUSD)}</span>
                    </div>
                )}
            </div>
        );
    }

    return null;
};

export default ToolTip;
