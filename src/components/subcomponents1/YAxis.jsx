import React from 'react';
import { YAxis as RechartsYAxis } from 'recharts';

const YAxis = ({ referenceMetal, metalColors, metalAxisConfig, isLogScale, formatMetalAxisTick, formatUSD, activeAxis, isMobile, metalNeedsPadding, usdNeedsPadding }) => {
    return (
        <>
            <>
                <RechartsYAxis
                    yAxisId="left"
                    orientation="left"
                    hide={isMobile && activeAxis !== 'metal'}
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
                    domain={([min, max]) => {
                        if (isLogScale || !metalNeedsPadding) return [min, max];
                        const range = max - min;
                        const buffer = range * 0.15; // 15% buffer
                        return [min, max + buffer];
                    }}
                    mirror={isMobile} // Mirror on mobile to put ticks inside chart? Or keep standard. Let's start with width reduction.
                />
                <RechartsYAxis
                    yAxisId="right"
                    orientation={isMobile ? 'left' : 'right'}
                    hide={isMobile && activeAxis !== 'usd'}
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
                    domain={([min, max]) => {
                        if (isLogScale || !usdNeedsPadding) return [min, max];
                        const range = max - min;
                        const buffer = range * 0.15; // 15% buffer only if needed
                        return [min, max + buffer];
                    }}
                />
            </>
        </>
    );
};

export default YAxis;
