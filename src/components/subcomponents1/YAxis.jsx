import { YAxis as RechartsYAxis } from 'recharts';

const YAxis = ({ yAxisId, orientation, hide, stroke, width, label, tickFormatter, scale, domain, mirror }) => {
    return (
        <RechartsYAxis
            yAxisId={yAxisId}
            orientation={orientation}
            hide={hide}
            stroke={stroke}
            width={width}
            label={label}
            tickFormatter={tickFormatter}
            scale={scale}
            domain={domain}
            mirror={mirror}
        />
    );
};

export default YAxis;
