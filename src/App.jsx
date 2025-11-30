import { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Search, Coins, DollarSign } from 'lucide-react';
import './App.css';

const TIME_RANGES = ['1d', '3d', '1w', '1m', '3m', '1y', '3y', '5y', '10y'];

// Simple hash function to seed random numbers
const seededRandom = (seed) => {
  let x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
};

const generateSeries = (range, ticker) => {
  const data = [];
  let points = 0;
  let interval = 0; // in minutes

  // Use ticker string to generate a consistent "random" start price
  let seed = 0;
  for (let i = 0; i < ticker.length; i++) {
    seed += ticker.charCodeAt(i);
  }

  let startPrice = 50 + (seededRandom(seed) * 450); // Price between 50 and 500
  if (ticker === 'GOLD') startPrice = 2000; // Start gold around 2000

  switch (range) {
    case '1d': points = 78; interval = 5; break; // 6.5 hours * 12 (5 min)
    case '3d': points = 78 * 3; interval = 5; break;
    case '1w': points = 7 * 24; interval = 60; break; // hourly
    case '1m': points = 30; interval = 24 * 60; break; // daily
    case '3m': points = 90; interval = 24 * 60; break; // daily
    case '1y': points = 250; interval = 24 * 60; break; // daily
    case '3y': points = 250 * 3; interval = 24 * 60; break; // daily
    case '5y': points = 52 * 5; interval = 24 * 60 * 7; break; // weekly (approx 260 points)
    case '10y': points = 52 * 10; interval = 24 * 60 * 7; break; // weekly (approx 520 points)
    default: points = 100; interval = 60;
  }

  let currentPrice = startPrice;
  const now = new Date();

  for (let i = 0; i < points; i++) {
    const date = new Date(now.getTime() - (points - 1 - i) * interval * 60 * 1000);

    // Use seed + i to generate consistent volatility for this point
    const r = seededRandom(seed + i * 1337);
    const change = (r - 0.5) * (startPrice * 0.02); // 2% volatility
    currentPrice += change;

    // Format date based on range
    let dateStr = '';
    if (['1d', '3d'].includes(range)) {
      dateStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (['1w', '1m', '3m'].includes(range)) {
      dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } else {
      dateStr = date.toLocaleDateString([], { year: '2-digit', month: 'short' });
    }

    data.push({
      date: dateStr,
      rawDate: date, // Keep raw date for merging
      price: parseFloat(currentPrice.toFixed(2)),
    });
  }
  return data;
};

const generateData = (range, ticker) => {
  const stockSeries = generateSeries(range, ticker);
  const goldSeries = generateSeries(range, 'GOLD');

  return stockSeries.map((item, index) => {
    const goldPrice = goldSeries[index] ? goldSeries[index].price : 2000;
    const priceInGold = item.price / goldPrice;

    return {
      date: item.date,
      price: item.price,
      goldPrice: goldPrice,
      priceInGold: parseFloat(priceInGold.toFixed(4)),
    };
  });
};

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

function App() {
  const [selectedRange, setSelectedRange] = useState('1m');
  const [ticker, setTicker] = useState('AAPL');
  const [searchInput, setSearchInput] = useState('');
  const [currency, setCurrency] = useState('USD'); // 'USD' or 'GOLD'
  const [showAdmin, setShowAdmin] = useState(false);

  const data = useMemo(() => generateData(selectedRange, ticker), [selectedRange, ticker]);

  const currentData = data[data.length - 1] || {};
  const startData = data[0] || {};

  const currentPrice = currency === 'USD' ? currentData.price : currentData.priceInGold;
  const startPrice = currency === 'USD' ? startData.price : startData.priceInGold;

  const priceChange = currentPrice - startPrice;
  const percentChange = startPrice !== 0 ? (priceChange / startPrice) * 100 : 0;
  const isPositive = priceChange >= 0;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setTicker(searchInput.toUpperCase());
      setSearchInput('');
    }
  };

  return (
    <div className="app-container">
      <div className="chart-card">
        <div className="header">
          <div className="ticker-info">
            <div className="ticker-header">
              <h2 className="ticker-symbol">{ticker}</h2>
              <form onSubmit={handleSearch} className="search-form">
                <div className="search-wrapper">
                  <Search className="search-icon" size={16} />
                  <input
                    type="text"
                    placeholder="Search ticker..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="search-input"
                  />
                </div>
              </form>
            </div>
            <div className="price-info">
              <h1 className="price">
                {currency === 'USD' ? '$' : 'oz '}{currentPrice?.toFixed(currency === 'USD' ? 2 : 4)}
              </h1>
              <span className={`change ${isPositive ? 'positive' : 'negative'}`}>
                {isPositive ? '+' : ''}{priceChange?.toFixed(currency === 'USD' ? 2 : 4)} ({percentChange?.toFixed(2)}%)
              </span>
            </div>
          </div>

          <div className="controls-right">
            <div className="currency-toggle">
              <button
                className={`toggle-btn ${currency === 'USD' ? 'active' : ''}`}
                onClick={() => setCurrency('USD')}
                title="Show in USD"
              >
                <DollarSign size={18} />
                <span>USD</span>
              </button>
              <button
                className={`toggle-btn ${currency === 'GOLD' ? 'active' : ''}`}
                onClick={() => setCurrency('GOLD')}
                title="Show in Gold Ounces"
              >
                <Coins size={18} />
                <span>Gold</span>
              </button>
            </div>

            <div className="time-selector">
              {TIME_RANGES.map((range) => (
                <button
                  key={range}
                  className={`range-btn ${selectedRange === range ? 'active' : ''}`}
                  onClick={() => setSelectedRange(range)}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#888', fontSize: 12 }}
                minTickGap={30}
              />
              <YAxis
                domain={['auto', 'auto']}
                hide={true}
              />
              <Tooltip content={<CustomTooltip currency={currency} />} />
              <Area
                type="monotone"
                dataKey={currency === 'USD' ? "price" : "priceInGold"}
                stroke={isPositive ? "#10b981" : "#ef4444"}
                fillOpacity={1}
                fill="url(#colorPrice)"
                strokeWidth={2}
                animationDuration={500}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="footer">
          <button className="admin-btn" onClick={() => setShowAdmin(true)}>
            Admin
          </button>
        </div>
      </div>

      <GoldDataModal isOpen={showAdmin} onClose={() => setShowAdmin(false)} />
    </div>
  );
}

export default App;
