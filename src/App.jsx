import React, { useEffect } from 'react';
import { Github } from 'lucide-react';
import useData from './store/useData';
import useAppState from './store/useState';
import useWindow from './store/useWindow';
import Chart from './components/Chart';

function App() {
  const { data, isLoading, fetchData } = useData();
  const { referenceMetal } = useAppState();
  const { setDeviceType } = useWindow();

  // Kick off data fetch once on mount
  useEffect(() => { fetchData(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Compute last update date from data
  const lastUpdate = React.useMemo(() => {
    if (!data) return null;
    let records = [];
    if (Array.isArray(data)) {
      records = data;
    } else if (data['1y']) {
      records = data['1y'];
    }
    if (records.length > 0 && records[records.length - 1].Date) {
      return records[records.length - 1].Date;
    }
    return null;
  }, [data]);

  // Device detection — sets deviceType in useWindow store
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      let type = 'Monitor';
      if (width < 1024) {
        type = height > width ? 'Phone Vertical' : 'Phone Horizontal';
      }
      setDeviceType(type);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setDeviceType]);

  return (
    <div className="bg-dark text-light h-100 d-flex flex-column">
      <div className="container-fluid h-100 d-flex flex-column p-0">
        <header className="p-2 flex-shrink-0 d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2">
          <div className="text-center text-sm-start">
            <h1 className="h4 fw-bold mb-0 d-inline-block me-2">
              <span className="bg-gradient-gold-text">
                {referenceMetal === 'Inflation Adjusted $' ? 'Real Stock Value' : 'Stock in Ounces'}
              </span>
            </h1>
            <p className="small text-secondary mb-0 d-inline-block">
              {referenceMetal === 'Inflation Adjusted $'
                ? 'adjusted for inflation'
                : <span>of <span className="text-warning fw-semibold">{referenceMetal}</span></span>
              }
            </p>
          </div>
          <div className="d-flex justify-content-center align-items-center">
            <a
              href="https://goldback.com"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline-warning btn-sm small fw-semibold"
              title="Learn about Goldbacks directly from the source"
              style={{ padding: '0.25rem 0.75rem', fontSize: '0.875em', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
            >
              What is a GoldBack?
            </a>
          </div>

          <div className="d-flex align-items-center gap-3">
            {lastUpdate && (
              <span className="small text-secondary" style={{ fontSize: '0.75rem' }}>
                Last Update: {lastUpdate}
              </span>
            )}
            <a
              href="https://github.com/emunozgutier/Stock-In-Ounces"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-sm btn-outline-secondary py-0 px-2 small"
              style={{ fontSize: '0.75rem' }}
            >
              <Github size={16} className="me-1" /> GitHub
            </a>
          </div>
        </header>

        <main className="flex-grow-1 d-flex flex-column overflow-hidden px-2 pb-2">
          {isLoading ? (
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
