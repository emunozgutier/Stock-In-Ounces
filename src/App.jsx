import { useEffect, useState } from 'react';

import { Github } from 'lucide-react';
import useStore from './store';
import Chart from './components/Chart';
import './App.css';

function App() {
  const { setData, setTickers, referenceMetal } = useStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 1. Load Tickers Metadata
        const tickersResponse = await fetch('./tickers.json');
        const tickersData = await tickersResponse.json();
        setTickers(tickersData);

        // 2. Load Fast Data (Instant Render)
        try {
          const fastResponse = await fetch('./FastData.json');
          if (fastResponse.ok) {
            const fastData = await fastResponse.json();
            setData(fastData);
            setLoading(false); // Enable interaction immediately
          }
        } catch (e) {
          console.warn("FastData load failed, waiting for full data", e);
        }

        // 3. Load Full Data (Lazy)
        const response = await fetch('./Data.json');
        const fullData = await response.json();
        setData(fullData);
        setLoading(false);

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
        <header className="p-2 flex-shrink-0 d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2">
          <div className="text-center text-sm-start">
            <h1 className="h4 fw-bold mb-0 d-inline-block me-2">
              <span className="bg-gradient-gold-text">Stock in Ounces</span>
            </h1>
            <p className="small text-secondary mb-0 d-inline-block">
              in <span className="text-warning fw-semibold">{referenceMetal}</span>
            </p>
          </div>
          <a
            href="https://github.com/emunozgutier/Stock-In-Ounces"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-sm btn-outline-secondary py-0 px-2 small"
            style={{ fontSize: '0.75rem' }}
          >
            <Github size={16} className="me-1" /> GitHub
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
