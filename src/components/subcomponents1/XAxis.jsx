import React from 'react';
import { XAxis as RechartsXAxis } from 'recharts';

const XAxis = ({ timeRange }) => {
    return (
        <RechartsXAxis
            dataKey="Date"
            stroke="#9CA3AF"
            tickFormatter={(str) => {
                const date = new Date(str);
                if (timeRange === '1Y') {
                    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                }
                return date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
            }}
            minTickGap={30}
        />
    );
};

export default XAxis;
