const CustomTooltip = ({ active, payload, label, currency }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="custom-tooltip">
                <p className="tooltip-date">{label}</p>
                <div className="tooltip-row">
                    <span className="tooltip-label">Stock (USD):</span>
                    <span className="tooltip-value">${data.price.toFixed(2)}</span>
                </div>
                <div className="tooltip-row">
                    <span className="tooltip-label">Gold (USD):</span>
                    <span className="tooltip-value">${data.goldPrice.toFixed(2)}</span>
                </div>
                <div className="tooltip-row highlight">
                    <span className="tooltip-label">Stock (Gold):</span>
                    <span className="tooltip-value">{data.priceInGold.toFixed(4)} oz</span>
                </div>
            </div>
        );
    }
    return null;
};

export default CustomTooltip;
