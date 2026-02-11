import React from 'react';
import { YAxis as RechartsYAxis } from 'recharts';

const YAxis = ({ referenceMetal, metalColors, metalAxisConfig, isLogScale, formatMetalAxisTick, formatUSD }) => {
    return (
        <>
            <RechartsYAxis
                yAxisId="left"
                stroke={metalColors[referenceMetal]}
                width={80} // Increased width to prevent overlap
                label={{
                    value: `Price (${metalAxisConfig.unit} ${referenceMetal})`,
                    angle: -90,
                    position: 'insideLeft',
                    fill: metalColors[referenceMetal],
                    style: { textAnchor: 'middle' }
                }}
                tickFormatter={formatMetalAxisTick}
                scale={isLogScale ? 'log' : 'linear'}
                domain={['auto', 'auto']}
            />
            <RechartsYAxis
                yAxisId="right"
                orientation="right"
                stroke="#10B981"
                width={80} // Increased width for right axis too
                label={{
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
        </>
    );
};

export default YAxis;
