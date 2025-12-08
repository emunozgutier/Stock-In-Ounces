import { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Search } from 'lucide-react';
import './App.css';

import { generateData } from './utils/mockData';
import CustomTooltip from './components/CustomTooltip';
import GoldDataModal from './components/GoldDataModal';

function App() {
  const [selectedRange, setSelectedRange] = useState('1m');
  const [ticker, setTicker] = useState('AAPL');
  const [searchInput, setSearchInput] = useState('');
  const [currency, setCurrency] = useState('USD'); // 'USD' or 'GOLD'
  const [showAdmin, setShowAdmin] = useState(false);

  // const [data, setData] = useState([]); // Removed async state
  // const [loading, setLoading] = useState(false);
  // const [error, setError] = useState(null);

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

          <div className="controls">
            <div className="currency-toggle">
              <button
                className={currency === 'USD' ? 'active' : ''}
                onClick={() => setCurrency('USD')}
              >
                USD
              </button>
              <button
                className={currency === 'GOLD' ? 'active' : ''}
                onClick={() => setCurrency('GOLD')}
              >
                Gold oz
              </button>
            </div>
            <div className="time-range">
              {['1d', '3d', '1w', '1m', '3m', '1y', '3y', '5y', '10y'].map((range) => (
                <button
                  key={range}
                  className={selectedRange === range ? 'active' : ''}
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
                  <stop offset="5%" stopColor="#2962ff" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2962ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#666', fontSize: 12 }}
                tickFormatter={(str) => {
                  const date = new Date(str);
                  if (selectedRange === '1d') return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
                }}
              />
              <YAxis
                domain={['auto', 'auto']}
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#666', fontSize: 12 }}
                tickFormatter={(val) => currency === 'USD' ? `$${val.toFixed(2)}` : `${val.toFixed(2)} oz`}
              />
              <Tooltip content={<CustomTooltip currency={currency} />} />
              <Area
                type="monotone"
                dataKey={currency === 'USD' ? 'price' : 'priceInGold'}
                stroke="#2962ff"
                strokeWidth={2}
                fill="url(#colorPrice)"
                activeDot={{ r: 6, fill: '#2962ff', stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

      </div>

      <GoldDataModal isOpen={showAdmin} onClose={() => setShowAdmin(false)} />
    </div>
  );
}

export default App;
