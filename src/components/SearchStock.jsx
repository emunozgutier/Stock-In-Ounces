import { useState, useMemo } from 'react';
import useStore from '../store';
import { Search } from 'lucide-react';

const SearchStock = () => {
    const { tickers, setSelectedTicker } = useStore();
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const filteredTickers = useMemo(() => {
        if (!query) return [];
        const lowerQuery = query.toLowerCase();
        return tickers.filter(
            (t) =>
                t.symbol.toLowerCase().includes(lowerQuery) ||
                t.name.toLowerCase().includes(lowerQuery)
        ).slice(0, 10); // Limit to 10 results
    }, [tickers, query]);

    const handleSelect = (symbol) => {
        setSelectedTicker(symbol);
        setQuery('');
        setIsOpen(false);
    };

    return (
        <div className="position-relative w-100 mx-auto" style={{ maxWidth: '500px' }}>
            <div className="input-group">
                <span className="input-group-text bg-dark border-secondary text-secondary">
                    <Search size={20} />
                </span>
                <input
                    type="text"
                    className="form-control bg-dark border-secondary text-light placeholder-white focus-ring focus-ring-warning"
                    placeholder="Search for stock"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    onBlur={() => setTimeout(() => setIsOpen(false), 200)}
                    style={{ boxShadow: 'none' }}
                />
            </div>

            {isOpen && filteredTickers.length > 0 && (
                <ul className="list-group position-absolute w-100 mt-1 shadow-lg start-0 overflow-auto border border-secondary" style={{ maxHeight: '240px', zIndex: 1000 }}>
                    {filteredTickers.map((ticker) => (
                        <li
                            key={ticker.symbol}
                            className="list-group-item list-group-item-action bg-dark text-light border-secondary d-flex justify-content-between align-items-center cursor-pointer"
                            onClick={() => handleSelect(ticker.symbol)}
                            style={{ cursor: 'pointer' }}
                        >
                            <span className="fw-bold text-warning text-truncate me-2">{ticker.symbol}</span>
                            <span className="text-secondary small text-truncate">{ticker.name}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default SearchStock;
