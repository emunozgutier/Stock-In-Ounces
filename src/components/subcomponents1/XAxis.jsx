import React from 'react';
import { XAxis as RechartsXAxis } from 'recharts';

const XAxis = ({ timeRange }) => {
    return (
        <RechartsXAxis
            dataKey="Date"
            stroke="#9CA3AF"
            tickFormatter={(str) => {
                if (!str || typeof str !== 'string') return '';
                const parts = str.split('-');
                if (parts.length !== 3) return str;
                const [year, month, day] = parts.map(Number);
                const date = new Date(year, month - 1, day);
                if (timeRange === '1Y') {
                    const month = date.toLocaleDateString(undefined, { month: 'short' });
                    const yearShort = date.getFullYear().toString().slice(-2);
                    return `${month} '${yearShort}`;
                }
                return date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
            }}
            minTickGap={30}
        />
    );
};

export default XAxis;
