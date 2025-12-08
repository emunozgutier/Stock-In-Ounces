import { useState, useMemo } from 'react';
import { seededRandom } from '../utils/mockData';

const GoldDataModal = ({ isOpen, onClose }) => {
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const dailyData = useMemo(() => {
        const data = [];
        const startDate = new Date(selectedYear, 0, 1);

        // Generate a random walk for the selected year for GOLD
        let seed = 0;
        const ticker = 'GOLD';
        for (let i = 0; i < ticker.length; i++) {
            seed += ticker.charCodeAt(i);
        }
        // Add year to seed to make each year different but consistent
        seed += selectedYear;

        let currentPrice = 2000; // Start price for the year

        // Loop through all days of the selected year
        let dayCount = 0;
        for (let d = new Date(startDate); d.getFullYear() === selectedYear; d.setDate(d.getDate() + 1)) {
            const r = seededRandom(seed + dayCount * 1337);
            const change = (r - 0.5) * (2000 * 0.02); // 2% volatility
            currentPrice += change;

            data.push({
                date: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
                price: currentPrice
            });
            dayCount++;
        }
        return data;
    }, [selectedYear]);

    if (!isOpen) return null;

    // Generate a list of years for the dropdown (e.g., last 10 years)
    const currentYear = new Date().getFullYear();
    const availableYears = Array.from({ length: 11 }, (_, i) => currentYear - 10 + i).reverse();

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="modal-title-group">
                        <h2>Historical Gold Data (Ticker: GOLD)</h2>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                            className="year-select"
                        >
                            {availableYears.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Price (USD)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dailyData.map((data, index) => (
                                <tr key={index}>
                                    <td>{data.date}</td>
                                    <td>${data.price.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default GoldDataModal;
