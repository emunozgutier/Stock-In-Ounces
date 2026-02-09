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
        <div className="relative w-full max-w-md mx-auto mb-8">
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-slate-700 rounded-md leading-5 bg-slate-800 text-gray-100 placeholder-gray-400 focus:outline-none focus:bg-slate-700 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 sm:text-sm transition duration-150 ease-in-out"
                    placeholder="Search by Ticker or Name..."
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    onBlur={() => setTimeout(() => setIsOpen(false), 200)} // Delay to allow click
                />
            </div>

            {isOpen && filteredTickers.length > 0 && (
                <ul className="absolute z-10 mt-1 w-full bg-slate-800 shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm border border-slate-700">
                    {filteredTickers.map((ticker) => (
                        <li
                            key={ticker.symbol}
                            className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-slate-700 text-gray-100 group"
                            onClick={() => handleSelect(ticker.symbol)}
                        >
                            <div className="flex items-center justify-between">
                                <span className="font-medium truncate text-gold-400">{ticker.symbol}</span>
                                <span className="text-gray-400 text-xs truncate ml-2">{ticker.name}</span>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default SearchStock;
