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
        const tickersResponse = await fetch('./tickers.json');
        const tickersData = await tickersResponse.json();
        setTickers(tickersData);

        // Load CSV Data
        const response = await fetch('./data.csv');
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
    <div className="bg-dark text-light min-vh-100 d-flex flex-column py-5">
      <div className="container">
        <header className="text-center mb-5">
          <h1 className="display-4 fw-bold mb-2">
            <span className="bg-gradient-gold-text">Stock in Ounces</span>
          </h1>
          <p className="lead text-secondary">
            Track the value of your assets in real money: <span className="text-warning fw-semibold">Gold</span>.
          </p>
        </header>

        <main>
          <div className="row justify-content-center">
            <div className="col-lg-10">
              {loading ? (
                <div className="d-flex justify-content-center">
                  <div className="spinner-border text-warning" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <>
                  <SearchStock />
                  <Chart />
                </>
              )}
            </div>
          </div>
        </main>

        <footer className="mt-5 text-center text-secondary small">
          <p>Data provided by Yahoo Finance. This is for educational purposes only.</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
