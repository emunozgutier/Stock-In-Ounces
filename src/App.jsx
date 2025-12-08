import { useState, useMemo, useEffect } from 'react';
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

import { getDailyStockData } from './utils/alphaVantageData';
import CustomTooltip from './components/CustomTooltip';
import GoldDataModal from './components/GoldDataModal';

function App() {
  const [selectedRange, setSelectedRange] = useState('1m');
  const [ticker, setTicker] = useState('AAPL');
  const [searchInput, setSearchInput] = useState('');
  const [currency, setCurrency] = useState('USD'); // 'USD' or 'GOLD'
  const [showAdmin, setShowAdmin] = useState(false);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setData([]);

      try {
        // Fetch Stock and Gold Proxy (GLD)
        const [stockData, goldData] = await Promise.all([
          getDailyStockData(ticker),
          getDailyStockData('GLD')
        ]);

        // Merge Logic
        const mergedData = stockData.map(stockItem => {
          // Find matching gold date
          // Alpha Vantage dates are YYYY-MM-DD strings in our object
          const goldItem = goldData.find(g => g.date === stockItem.date);
          const goldPrice = goldItem ? goldItem.price : (goldData[goldData.length - 1]?.price || 200); // Fallback

          // GLD is ~1/10th of an ounce of gold (roughly). 
          // Real Spot Gold is XAU or GC=F ~2000+. GLD is ~200.
          // To estimate "Price in Ounces", we can multiply GLD * 10 (approx) or use it relative.
          // Let's assume GLD price * 10 for approximation of 1 Oz Gold Price.
          const estimatedGoldOzPrice = goldPrice * 10;

          return {
            date: stockItem.date,
            rawDate: stockItem.rawDate,
            price: stockItem.price,
            goldPrice: estimatedGoldOzPrice,
            priceInGold: parseFloat((stockItem.price / estimatedGoldOzPrice).toFixed(4))
          };
        });

        // Filter by range (Basic client-side filtering since API returns full/compact)
        // AV 'compact' returns 100 points.
        // We'll just use what we get for now.
        setData(mergedData);

      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [ticker]); // Re-fetch only on ticker change due to strict API limits
  // NOTE: range changes removed from dependency to save API calls, 
  // or we can just filter client side if we implement that logic. Use ticker only for now.

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
          {loading && <div className="loading-overlay">Loading...</div>}
          {error && <div className="error-overlay" style={{ color: 'red', padding: 20, textAlign: 'center' }}>
            <h3>Error</h3>
            <p>{error}</p>
            {error.includes("API Limit") && <small>Wait a minute or try again tomorrow.</small>}
          </div>}
          {!loading && !error && (
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
          )}
        </div>

      </div>

      <GoldDataModal isOpen={showAdmin} onClose={() => setShowAdmin(false)} />
    </div>
  );
}

export default App;
