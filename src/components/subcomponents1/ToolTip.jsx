import React, { useEffect } from 'react';
import useSelection from '../../store/useSelection';

// 3-column row: label (flex) | symbol (fixed) | number (fixed right-aligned)
const Row = ({ label, labelColor, symbol, symbolHref, value, small, topBorder }) => (
    <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 22px 92px',
        columnGap: '6px',
        alignItems: 'baseline',
        marginBottom: topBorder ? 0 : 4,
        marginTop: topBorder ? 8 : 0,
        paddingTop: topBorder ? 8 : 0,
        borderTop: topBorder ? '1px solid #374151' : undefined,
        fontSize: small ? '0.8em' : undefined,
    }}>
        <span style={{ color: labelColor }}>{label}</span>
        <span style={{ textAlign: 'right', paddingRight: 4 }}>
            {symbolHref
                ? <a href={symbolHref} target="_blank" rel="noopener noreferrer"
                     style={{ color: '#64B5F6', textDecoration: 'none', fontFamily: 'monospace' }}>{symbol}</a>
                : <span style={{ color: '#adb5bd', fontFamily: 'monospace' }}>{symbol}</span>
            }
        </span>
        <span style={{ textAlign: 'right', fontFamily: 'monospace', color: '#f8f9fa' }}>{value}</span>
    </div>
);

const ToolTip = ({ active, payload, label, referenceMetal, metalColors, formatUSD, metalScale }) => {
    const { setHoverPoint } = useSelection();

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

    if (!active || !payload || !payload.length) return null;

    const metalItem = payload.find(p => p.dataKey === 'priceMetal');
    const usdItem   = payload.find(p => p.dataKey === 'PriceUSD');

    const priceMetal = metalItem?.value ?? 0;
    const priceUSD   = usdItem?.value   ?? 0;

    // Parse date
    const parseDate = (str) => {
        if (!str || typeof str !== 'string') return new Date();
        const parts = str.split('-');
        if (parts.length !== 3) return new Date(str);
        const [year, month, day] = parts.map(Number);
        return new Date(year, month - 1, day);
    };
    const formattedDate = parseDate(label).toLocaleDateString(undefined, {
        weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
    });

    // Determine display unit from the axis scale passed in by Chart.jsx
    const isGoldbacks  = metalScale === 1000 && ['Gold', 'Platinum'].includes(referenceMetal) && priceMetal > 0;
    const isInflation  = referenceMetal === 'Inflation Adjusted $';
    const gbPrefix     = referenceMetal === 'Gold' ? '₲' : 'PB';
    const gbHref       = referenceMetal === 'Gold' ? 'https://goldback.com' : null;

    // Format values — no unit suffix after the number
    const metalDisplay = isInflation
        ? { symbol: '$',      symbolHref: null,   value: priceMetal.toFixed(2) }
        : isGoldbacks
            ? { symbol: gbPrefix, symbolHref: gbHref, value: (priceMetal * 1000).toPrecision(4) }
            : { symbol: '',       symbolHref: null,   value: `${Number(priceMetal).toPrecision(4)} oz` };

    const metalColor = metalColors[referenceMetal] ?? '#adb5bd';

    // USD row: strip leading $ from formatUSD so the symbol sits in its own column
    const usdFormatted = formatUSD(priceUSD);
    const usdSymbol    = usdFormatted.startsWith('$') ? '$' : '';
    const usdValue     = usdFormatted.startsWith('$') ? usdFormatted.slice(1) : usdFormatted;

    // Footer: gold spot price
    const showFooter  = priceUSD > 0 && priceMetal > 0;
    const footerLabel = isInflation ? 'Inflation Multiplier:' : `1 oz ${referenceMetal}:`;
    const footerRaw   = isInflation
        ? (priceMetal / priceUSD).toFixed(4)
        : formatUSD(priceUSD / priceMetal);
    const footerSymbol = footerRaw.startsWith('$') ? '$' : '';
    const footerValue  = footerRaw.startsWith('$') ? footerRaw.slice(1) : footerRaw;

    return (
        <div className="custom-tooltip" style={{
            backgroundColor: '#212529',
            border: '1px solid #495057',
            borderRadius: 6,
            padding: '10px 14px',
            width: 'max-content',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
        }}>
            {/* Date header */}
            <p style={{ color: '#FCD34D', fontWeight: 700, marginBottom: 8,
                        borderBottom: '1px solid #374151', paddingBottom: 6 }}>
                {formattedDate}
            </p>

            {/* Metal price row */}
            <Row
                label={isInflation ? 'Adjusted Price:' : `Price in ${referenceMetal}:`}
                labelColor={metalColor}
                symbol={metalDisplay.symbol}
                symbolHref={metalDisplay.symbolHref}
                value={metalDisplay.value}
            />

            {/* USD row */}
            <Row
                label="Nominal Price:"
                labelColor="#10B981"
                symbol={usdSymbol}
                value={usdValue}
            />

            {/* Footer: spot price */}
            {showFooter && (
                <Row
                    label={footerLabel}
                    labelColor="#FCD34D"
                    symbol={footerSymbol}
                    value={footerValue}
                    small
                    topBorder
                />
            )}
        </div>
    );
};

export default ToolTip;
