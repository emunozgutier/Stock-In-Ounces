import React from 'react';
import { YAxis as RechartsYAxis } from 'recharts';

const YAxis = ({ referenceMetal, metalColors, metalAxisConfig, isLogScale, formatMetalAxisTick, formatUSD, activeAxis, isMobile }) => {
    return (
        <>
            {(!isMobile || activeAxis === 'metal') && (
                <RechartsYAxis
                    yAxisId="left"
                    stroke={metalColors[referenceMetal]}
                    width={isMobile ? 50 : 80} // Reduce width on mobile
                    label={isMobile ? null : {
                        value: `Price (${metalAxisConfig.unit} ${referenceMetal})`,
                        angle: -90,
                        position: 'insideLeft',
                        fill: metalColors[referenceMetal],
                        style: { textAnchor: 'middle' }
                    }}
                    tickFormatter={formatMetalAxisTick}
                    scale={isLogScale ? 'log' : 'linear'}
                    domain={['auto', 'auto']}
                    mirror={isMobile} // Mirror on mobile to put ticks inside chart? Or keep standard. Let's start with width reduction.
                />
            )}
            {(!isMobile || activeAxis === 'usd') && (
                <RechartsYAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#10B981"
                    width={isMobile ? 50 : 80}
                    label={isMobile ? null : {
                        value: 'Price (USD)',
                        angle: 90,
                        position: 'insideRight',
                        fill: '#10B981',
                        style: { textAnchor: 'middle' },
                        dx: 15 // Offset to prevent overlap with ticks
                    }}
                    tickFormatter={formatUSD}
                    scale={isLogScale ? 'log' : 'linear'}
                    domain={['auto', 'auto']}
                />
            )}
        </>
    );
};

export default YAxis;
