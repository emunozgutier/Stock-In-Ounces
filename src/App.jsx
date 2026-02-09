import { useEffect, useState } from 'react';
import Papa from 'papaparse';
import { Github } from 'lucide-react';
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
        const tickersResponse = await fetch('./tickers.json');
        const tickersData = await tickersResponse.json();
        setTickers(tickersData);

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
            // Sort by Date ascending
            VALID_DATA.sort((a, b) => new Date(a.Date) - new Date(b.Date));
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
    <div className="bg-dark text-light h-100 d-flex flex-column">
      <div className="container-fluid h-100 d-flex flex-column p-0">
        <header className="p-3 text-center flex-shrink-0">
          <h1 className="display-6 fw-bold mb-0">
            <span className="bg-gradient-gold-text">Stock in Ounces</span>
          </h1>
          <p className="small text-secondary mb-2">
            Track value in <span className="text-warning fw-semibold">Gold</span>
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
              <div className="mb-2">
                <SearchStock />
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
