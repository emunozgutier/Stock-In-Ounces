import { useEffect, useState } from 'react';
import Papa from 'papaparse';
import useStore from './store';
import SearchStock from './components/SearchStock';
import Chart from './components/Chart';
import './App.css';

function App() {
  const { setData, setTickers } = useStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Load Tickers Metadata
        const tickersResponse = await fetch('/tickers.json');
        const tickersData = await tickersResponse.json();
        setTickers(tickersData);

        // Load CSV Data
        const response = await fetch('/data.csv');
        const reader = response.body.getReader();
        const result = await reader.read();
        const decoder = new TextDecoder('utf-8');
        const csv = decoder.decode(result.value);

        Papa.parse(csv, {
          header: true,
          dynamicTyping: true,
          complete: (results) => {
            // Filter out empty rows if any
            const VALID_DATA = results.data.filter(row => row.Date && row.Ticker);
            setData(VALID_DATA);
            setLoading(false);
          },
          error: (err) => {
            console.error("Error parsing CSV:", err);
            setLoading(false);
          }
        });

      } catch (error) {
        console.error("Error loading data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [setData, setTickers]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center py-10 px-4">
      <header className="mb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-yellow-200 mb-2">
          Stock in Ounces
        </h1>
        <p className="text-slate-400 text-lg">
          Track the value of your assets in real money: <span className="text-gold-400 font-semibold">Gold</span>.
        </p>
      </header>

      <main className="w-full max-w-5xl space-y-8">
        {loading ? (
          <div className="text-center text-xl text-gold-400 animate-pulse">Loading financial data...</div>
        ) : (
          <>
            <SearchStock />
            <Chart />
          </>
        )}
      </main>

      <footer className="mt-20 text-slate-500 text-sm">
        <p>Data provided by Yahoo Finance. This is for educational purposes only.</p>
      </footer>
    </div>
  );
}

export default App;
