import { useEffect, useState } from 'react';
import Papa from 'papaparse';
import { Github } from 'lucide-react';
import useStore from './store';
import SearchStock from './components/SearchStock';
import MetalSelector from './components/MetalSelector';
import Chart from './components/Chart';
import './App.css';

function App() {
  const { setData, setTickers, referenceMetal } = useStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Load Tickers Metadata
        const tickersResponse = await fetch('./tickers.json');
        const tickersData = await tickersResponse.json();
        setTickers(tickersData);

        // Load Metals Data
        const metalsResponse = await fetch('./metals.json');
        const metalsData = await metalsResponse.json();

        // Load CSV Data
        const response = await fetch('./data.csv');
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let csv = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          csv += decoder.decode(value, { stream: true });
        }
        csv += decoder.decode(); // End of stream

        Papa.parse(csv, {
          header: true,
          dynamicTyping: true,
          complete: (results) => {
            // Filter out empty rows if any
            const VALID_DATA = results.data.filter(row => row.Date && row.Ticker);

            // Enrich with Metal Prices
            // Create a sorted list of metal dates to help find the closest previous date if needed
            let lastSilver = null;
            let lastPlatinum = null;
            let lastPalladium = null;

            const ENRICHED_DATA = VALID_DATA.map(row => {
              const dateStr = row.Date;
              const metalPrices = metalsData[dateStr];

              if (metalPrices) {
                if (metalPrices.Silver) lastSilver = metalPrices.Silver;
                if (metalPrices.Platinum) lastPlatinum = metalPrices.Platinum;
                if (metalPrices.Palladium) lastPalladium = metalPrices.Palladium;
              }

              return {
                ...row,
                PriceSilver: lastSilver ? row.PriceUSD / lastSilver : null,
                PricePlatinum: lastPlatinum ? row.PriceUSD / lastPlatinum : null,
                PricePalladium: lastPalladium ? row.PriceUSD / lastPalladium : null,
              };
            });

            // Sort by Date ascending
            ENRICHED_DATA.sort((a, b) => new Date(a.Date) - new Date(b.Date));
            setData(ENRICHED_DATA);
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
    <div className="bg-dark text-light h-100 d-flex flex-column">
      <div className="container-fluid h-100 d-flex flex-column p-0">
        <header className="p-2 p-md-3 text-center flex-shrink-0">
          <h1 className="display-6 fw-bold mb-0">
            <span className="bg-gradient-gold-text">Stock in Ounces</span>
          </h1>
          <p className="small text-secondary mb-2">
            Track value in <span className="text-warning fw-semibold">{referenceMetal}</span>
          </p>
          <a
            href="https://github.com/emunozgutier/Stock-In-Ounces"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-sm btn-outline-secondary py-0 px-2 small"
            style={{ fontSize: '0.75rem' }}
          >
            <Github size={16} className="me-1" /> See it on GitHub
          </a>
        </header>

        <main className="flex-grow-1 d-flex flex-column overflow-hidden px-2 pb-2">
          {loading ? (
            <div className="d-flex justify-content-center align-items-center h-100">
              <div className="spinner-border text-warning" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="d-flex flex-column h-100">
              <div className="mb-2 d-flex flex-column align-items-center gap-2">
                <div className="w-100" style={{ maxWidth: '500px' }}>
                  <SearchStock />
                </div>
                <MetalSelector />
              </div>
              <div className="flex-grow-1 min-h-0">
                <Chart />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
