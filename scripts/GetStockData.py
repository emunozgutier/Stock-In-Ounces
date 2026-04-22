
import yfinance as yf
import json
import os
import time
import pandas as pd
import io
import urllib.request as request
from TimeFrame import get_timeframe_dates

# S&P 500 Tickers (Snapshot)
SP500_TICKERS = [
    'MMM', 'AOS', 'ABT', 'ABBV', 'ACN', 'ADBE', 'AMD', 'AES', 'AFL', 'A', 'APD', 'ABNB', 'AKAM', 'ALB', 'ARE', 'ALGN', 'ALLE', 'LNT', 'ALL', 'GOOGL', 'GOOG', 'MO', 'AMZN', 'AMCR', 'AEE', 'AEP', 'AXP', 'AIG', 'AMT', 'AWK', 'AMP', 'AME', 'AMGN', 'APH', 'ADI', 'AON', 'APA', 'APO', 'AAPL', 'AMAT', 'APP', 'APTV', 'ACGL', 'ADM', 'ARES', 'ANET', 'AJG', 'AIZ', 'T', 'ATO', 'ADSK', 'ADP', 'AZO', 'AVB', 'AVY', 'AXON', 'BKR', 'BALL', 'BAC', 'BAX', 'BDX', 'BRK-B', 'BBY', 'TECH', 'BIIB', 'BLK', 'BX', 'XYZ', 'BK', 'BA', 'BKNG', 'BSX', 'BMY', 'AVGO', 'BR', 'BRO', 'BF-B', 'BLDR', 'BG', 'BXP', 'CHRW', 'CDNS', 'CPT', 'CPB', 'COF', 'CAH', 'CCL', 'CARR', 'CVNA', 'CAT', 'CBOE', 'CBRE', 'CDW', 'COR', 'CNC', 'CNP', 'CF', 'CRL', 'SCHW', 'CHTR', 'CVX', 'CMG', 'CB', 'CHD', 'CIEN', 'CI', 'CINF', 'CTAS', 'CSCO', 'C', 'CFG', 'CLX', 'CME', 'CMS', 'KO', 'CTSH', 'COIN', 'CL', 'CMCSA', 'FIX', 'CAG', 'COP', 'ED', 'STZ', 'CEG', 'COO', 'CPRT', 'GLW', 'CPAY', 'CTVA', 'CSGP', 'COST', 'CTRA', 'CRH', 'CRWD', 'CCI', 'CSX', 'CMI', 'CVS', 'DHR', 'DRI', 'DDOG', 'DVA', 'DECK', 'DE', 'DELL', 'DAL', 'DVN', 'DXCM', 'FANG', 'DLR', 'DG', 'DLTR', 'D', 'DPZ', 'DASH', 'DOV', 'DOW', 'DHI', 'DTE', 'DUK', 'DD', 'ETN', 'EBAY', 'ECL', 'EIX', 'EW', 'EA', 'ELV', 'EME', 'EMR', 'ETR', 'EOG', 'EPAM', 'EQT', 'EFX', 'EQIX', 'EQR', 'ERIE', 'ESS', 'EL', 'EG', 'EVRG', 'ES', 'EXC', 'EXE', 'EXPE', 'EXPD', 'EXR', 'XOM', 'FFIV', 'FDS', 'FICO', 'FAST', 'FRT', 'FDX', 'FIS', 'FITB', 'FSLR', 'FE', 'FISV', 'F', 'FTNT', 'FTV', 'FOXA', 'FOX', 'BEN', 'FCX', 'GRMN', 'IT', 'GE', 'GEHC', 'GEV', 'GEN', 'GNRC', 'GD', 'GIS', 'GM', 'GPC', 'GILD', 'GPN', 'GL', 'GDDY', 'GS', 'HAL', 'HIG', 'HAS', 'HCA', 'DOC', 'HSIC', 'HSY', 'HPE', 'HLT', 'HOLX', 'HD', 'HON', 'HRL', 'HST', 'HWM', 'HPQ', 'HUBB', 'HUM', 'HBAN', 'HII', 'IBM', 'IEX', 'IDXX', 'ITW', 'INCY', 'IR', 'PODD', 'INTC', 'IBKR', 'ICE', 'IFF', 'IP', 'INTU', 'ISRG', 'IVZ', 'INVH', 'IQV', 'IRM', 'JBHT', 'JBL', 'JKHY', 'J', 'JNJ', 'JCI', 'JPM', 'KVUE', 'KDP', 'KEY', 'KEYS', 'KMB', 'KIM', 'KMI', 'KKR', 'KLAC', 'KHC', 'KR', 'LHX', 'LH', 'LRCX', 'LW', 'LVS', 'LDOS', 'LEN', 'LII', 'LLY', 'LIN', 'LYV', 'LMT', 'L', 'LOW', 'LULU', 'LYB', 'MTB', 'MPC', 'MAR', 'MRSH', 'MLM', 'MAS', 'MA', 'MTCH', 'MKC', 'MCD', 'MCK', 'MDT', 'MRK', 'META', 'MET', 'MTD', 'MGM', 'MCHP', 'MU', 'MSFT', 'MAA', 'MRNA', 'MOH', 'TAP', 'MDLZ', 'MPWR', 'MNST', 'MCO', 'MS', 'MOS', 'MSI', 'MSCI', 'NDAQ', 'NTAP', 'NFLX', 'NEM', 'NWSA', 'NWS', 'NEE', 'NKE', 'NI', 'NDSN', 'NSC', 'NTRS', 'NOC', 'NCLH', 'NRG', 'NUE', 'NVDA', 'NVR', 'NXPI', 'ORLY', 'OXY', 'ODFL', 'OMC', 'ON', 'OKE', 'ORCL', 'OTIS', 'PCAR', 'PKG', 'PLTR', 'PANW', 'PSKY', 'PH', 'PAYX', 'PAYC', 'PYPL', 'PNR', 'PEP', 'PFE', 'PCG', 'PM', 'PSX', 'PNW', 'PNC', 'POOL', 'PPG', 'PPL', 'PFG', 'PG', 'PGR', 'PLD', 'PRU', 'PEG', 'PTC', 'PSA', 'PHM', 'PWR', 'QCOM', 'DGX', 'Q', 'RL', 'RJF', 'RTX', 'O', 'REG', 'REGN', 'RF', 'RSG', 'RMD', 'RVTY', 'HOOD', 'ROK', 'ROL', 'ROP', 'ROST', 'RCL', 'SPGI', 'CRM', 'SNDK', 'SBAC', 'SLB', 'STX', 'SRE', 'NOW', 'SHW', 'SPG', 'SWKS', 'SJM', 'SW', 'SNA', 'SOLV', 'SO', 'LUV', 'SWK', 'SBUX', 'STT', 'STLD', 'STE', 'SYK', 'SMCI', 'SYF', 'SNPS', 'SYY', 'TMUS', 'TROW', 'TTWO', 'TPR', 'TRGP', 'TGT', 'TEL', 'TDY', 'TER', 'TSLA', 'TXN', 'TPL', 'TXT', 'TMO', 'TJX', 'TKO', 'TTD', 'TSCO', 'TT', 'TDG', 'TRV', 'TRMB', 'TFC', 'TYL', 'TSN', 'USB', 'UBER', 'UDR', 'ULTA', 'UNP', 'UAL', 'UPS', 'URI', 'UNH', 'UHS', 'VLO', 'VTR', 'VLTO', 'VRSN', 'VRSK', 'VZ', 'VRTX', 'VTRS', 'VICI', 'V', 'VST', 'VMC', 'WRB', 'GWW', 'WAB', 'WMT', 'DIS', 'WBD', 'WM', 'WAT', 'WEC', 'WFC', 'WELL', 'WST', 'WDC', 'WY', 'WSM', 'WMB', 'WTW', 'WDAY', 'WYNN', 'XEL', 'XYL', 'YUM', 'ZBRA', 'ZBH', 'ZTS'
]

# Define Tickers
ASSETS = {
    # Metals (Futures)
    "Metals": {
        "Gold": "GC=F",
        "Silver": "SI=F",
        "Platinum": "PL=F",
        "Inflation Adjusted $": "CPI" # Special key for inflation
    },
    # Indices/ETFs
    "Indices": {
        # S&P 500 now individual tickers
    },
    # ETFs
    "ETFs": {
        "VTI": "VTI",
        "VOO": "VOO",
        "SPY": "SPY"
    },
    # Crypto (Top 10 by Market Cap - Simplified list)
    "Crypto": {
        "Bitcoin": "BTC-USD",
        "Ethereum": "ETH-USD",
        "Tether": "USDT-USD",
        "BNB": "BNB-USD",
        "Solana": "SOL-USD",
        "XRP": "XRP-USD",
        "USDC": "USDC-USD",
        "Cardano": "ADA-USD",
        "Avalanche": "AVAX-USD",
        "Dogecoin": "DOGE-USD"
    }
}

def get_cpi_multipliers():
    """
    Fetch CPI data from FRED and return a map of {YYYY-MM: multiplier}.
    Multiplier = Latest_CPI / Historical_CPI.
    """
    url = "https://fred.stlouisfed.org/graph/fredgraph.csv?id=CPIAUCSL"
    print(f"Fetching CPI data from {url}...")
    try:
        # Use urllib for more robust fetching in restricted environments
        with request.urlopen(url) as response:
            csv_data = response.read().decode('utf-8')
            df = pd.read_csv(io.StringIO(csv_data))
            
        # Drop rows with NaN CPI values
        df = df.dropna(subset=['CPIAUCSL'])
        
        if df.empty:
            print("Warning: CPI data is empty.")
            return {}

        latest_cpi = df['CPIAUCSL'].iloc[-1]
        
        # Create a complete range of months from start to latest available month
        df['observation_date'] = pd.to_datetime(df['observation_date'])
        df = df.set_index('observation_date').resample('MS').ffill()
        
        multipliers = {}
        for idx, row in df.iterrows():
            month_key = idx.strftime('%Y-%m')
            cpi_val = row['CPIAUCSL']
            if not pd.isna(cpi_val) and cpi_val > 0:
                multipliers[month_key] = round(latest_cpi / cpi_val, 4)
                
        print(f"Loaded {len(multipliers)} CPI data points. Latest CPI: {latest_cpi}")
        return multipliers
    except Exception as e:
        print(f"Error fetching CPI data: {e}")
        return {}

def get_historical_gold():
    """
    Fetch monthly historical gold prices from a public github dataset to use as fallback
    for dates before Yahoo Finance data (2000). Returns a map of {YYYY-MM: price}.
    """
    url = "https://raw.githubusercontent.com/datasets/gold-prices/main/data/monthly.csv"
    print(f"Fetching historical gold data from {url}...")
    try:
        with request.urlopen(url) as response:
            csv_data = response.read().decode('utf-8')
            df = pd.read_csv(io.StringIO(csv_data))
            
        df = df.dropna()
        gold_map = {}
        for idx, row in df.iterrows():
            gold_map[row['Date']] = float(row['Price'])
            
        print(f"Loaded {len(gold_map)} historical gold prices.")
        return gold_map
    except Exception as e:
        print(f"Error fetching historical gold data: {e}")
        return {}

def main():
    print("Generating TimeFrame dates...")
    timeframe_dates = get_timeframe_dates()
    
    # Fetch inflation data
    cpi_multipliers = get_cpi_multipliers()
    
    # Fetch historical gold backfill
    historical_gold = get_historical_gold()
    
    final_data = {}
    
    # Collect all valid trading dates we need data for
    # To optimize, we can find the min date across all timeframes and fetch from there
    all_dates = set()
    for dates in timeframe_dates.values():
        all_dates.update(dates)
    
    sorted_dates = sorted(list(all_dates))
    if not sorted_dates:
        print("No dates to fetch.")
        return

    start_date = sorted_dates[0]
    print(f"Fetching data starting from {start_date}...")

    # Build full list of tickers to fetch
    tickers_map = {} # label -> symbol
    all_symbols = []

    # Add Metals
    for name, symbol in ASSETS["Metals"].items():
        tickers_map[name] = symbol
        if symbol != "CPI":
            all_symbols.append(symbol)

    # Add Crypto
    for name, symbol in ASSETS["Crypto"].items():
        tickers_map[name] = symbol
        all_symbols.append(symbol)
        
    # Add ETFs
    for name, symbol in ASSETS["ETFs"].items():
        tickers_map[name] = symbol
        all_symbols.append(symbol)

    # Add S&P 500 Tickers
    for symbol in SP500_TICKERS:
        tickers_map[symbol] = symbol
        all_symbols.append(symbol)

    print(f"Total assets to fetch: {len(all_symbols)}")

    all_keys = list(tickers_map.keys())
    all_keys.sort()
    
    # Get absolute path to project root (parent of script folder)
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    public_dir = os.path.join(project_root, "public")
    
    # Ensure public folder exists
    os.makedirs(public_dir, exist_ok=True)
    
    # --- Check Existing Data ---
    existing_data = {}
    output_path = os.path.join(public_dir, "Data.json")
    if os.path.exists(output_path):
        try:
            with open(output_path, "r") as f:
                existing_data = json.load(f)
            print("Loaded existing Data.json")
        except Exception as e:
            print(f"Could not load existing data: {e}")

    existing_lookup = {} # date -> { symbol_label: val }
    existing_cols_set = set()
    
    if existing_data:
        for tf, tf_data in existing_data.items():
            cols = tf_data.get("columns", [])
            if cols:
                for c in cols[1:]:
                    existing_cols_set.add(c)
            
            for row in tf_data.get("rows", []):
                date_str = row[0]
                if date_str not in existing_lookup:
                    existing_lookup[date_str] = {}
                for c_idx in range(1, len(cols)):
                    ticker_label = cols[c_idx]
                    if c_idx < len(row):
                        val = row[c_idx]
                        if val is not None:
                            existing_lookup[date_str][ticker_label] = val

    new_tickers_added = False
    for k in all_keys:
        if k not in existing_cols_set:
            new_tickers_added = True
            break
            
    dates_to_fetch = []
    if new_tickers_added:
        print("New tickers detected or existing data incomplete. Fetching from beginning...")
        dates_to_fetch = sorted_dates
    else:
        for d in sorted_dates:
            if d not in existing_lookup:
                dates_to_fetch.append(d)

    # Fetch in chunks to avoid URL length issues or timeouts
    CHUNK_SIZE = 100
    all_data_frames = []

    if dates_to_fetch:
        fetch_start_date = dates_to_fetch[0]
        print(f"Need to fetch new data starting from {fetch_start_date}...")
        for i in range(0, len(all_symbols), CHUNK_SIZE):
            chunk = all_symbols[i:i+CHUNK_SIZE]
            print(f"Downloading chunk {i//CHUNK_SIZE + 1}/{(len(all_symbols)-1)//CHUNK_SIZE + 1} ({len(chunk)} tickers)...")
            
            try:
                df = yf.download(chunk, start=fetch_start_date, progress=False, threads=True, group_by='ticker')
                all_data_frames.append(df)
                
            except Exception as e:
                print(f"Error fetching chunk: {e}")
    else:
        print("No new dates to fetch. Using fully cached data.")

    print("\nProcessing data into timeframes...")

    for tf_label, dates in timeframe_dates.items():
        print(f"Processing {tf_label}...")
        
        columns = ["Date"] + all_keys
        tf_rows = []
        
        for date_str in dates:
            row_values = [date_str]
            
            # Efficiently fetch values for all keys
            for key in all_keys:
                symbol = tickers_map[key]
                val = None
                
                # Special Case: Inflation Adjusted $
                if key == "Inflation Adjusted $":
                    month_key = date_str[:7]
                    val = cpi_multipliers.get(month_key)
                    # If not found for exact month, try using the latest available in the map
                    if val is None and cpi_multipliers:
                        latest_month = sorted(cpi_multipliers.keys())[-1]
                        val = cpi_multipliers[latest_month]
                # 1. Check existing data FIRST
                elif date_str in existing_lookup and key in existing_lookup[date_str]:
                    val = existing_lookup[date_str][key]
                else:
                    found = False
                    for df in all_data_frames:
                        if isinstance(df.columns, pd.MultiIndex):
                            if symbol in df.columns.levels[0]:
                                try:
                                    if date_str in df.index:
                                        raw_val = df.loc[date_str][(symbol, "Close")]
                                        if not pd.isna(raw_val):
                                            val = round(float(raw_val), 4)
                                            found = True
                                except KeyError:
                                    pass
                        elif isinstance(df.columns, pd.Index):
                             pass # Single ticker logic omitted

                        if found: break
                        
                    # If not found from Yahoo, and ticker is Gold, check fallback data
                    if not found and key == "Gold":
                        month_key = date_str[:7]
                        hist_val = historical_gold.get(month_key)
                        if hist_val is not None:
                            val = hist_val
                
                row_values.append(val)

            tf_rows.append(row_values)
            
        final_data[tf_label] = {
            "columns": columns,
            "rows": tf_rows
        }

    # 1. Save Full Data (Data.json)
    output_path = os.path.join(public_dir, "Data.json")
    with open(output_path, "w") as f:
        json.dump(final_data, f, indent=None, separators=(',', ':')) # Minified
    print(f"\nSuccessfully saved full stock data to {output_path}")

    # 2. Save Fast Data (FastData.json)
    # Goal: Gold + SPY (Default Stock) + Inflation Adjusted $ + Max (Default Timeframe)
    # Columnar format for consistency
    
    fast_data = {}
    
    if "Max" in final_data:
        src = final_data["Max"]
        src_cols = src["columns"]
        src_rows = src["rows"]
        
        # Indices
        try:
            date_idx = src_cols.index("Date")
            gold_idx = src_cols.index("Gold")
            spy_idx = src_cols.index("SPY")
            inflation_idx = src_cols.index("Inflation Adjusted $") if "Inflation Adjusted $" in src_cols else -1
            
            fast_cols = ["Date", "Gold", "SPY"]
            if inflation_idx != -1:
                fast_cols.append("Inflation Adjusted $")

            fast_rows = []
            
            for row in src_rows:
                row_data = [
                    row[date_idx],
                    row[gold_idx],
                    row[spy_idx]
                ]
                if inflation_idx != -1:
                    row_data.append(row[inflation_idx])
                fast_rows.append(row_data)
                
            fast_data["Max"] = {
                "columns": fast_cols,
                "rows": fast_rows
            }
        except ValueError:
            print("Warning: Could not find Gold or SPY in columns for FastData.")
            
    fast_output_path = os.path.join(public_dir, "FastData.json")
    with open(fast_output_path, "w") as f:
        json.dump(fast_data, f, indent=None, separators=(',', ':')) # Minified
    print(f"Successfully saved fast data to {fast_output_path}")
    
    # 3. Save Tickers List (tickers.json)
    tickers_list = []
    
    # Sorted list of all tickers
    sorted_tickers = sorted(list(tickers_map.keys()))
    for ticker in sorted_tickers:
        tickers_list.append({
            "symbol": ticker,
            "name": ticker 
        })
        
    tickers_output_path = os.path.join(public_dir, "tickers.json")
    with open(tickers_output_path, "w") as f:
        json.dump(tickers_list, f, indent=None, separators=(',', ':'))
    print(f"Successfully saved tickers list to {tickers_output_path}")

if __name__ == "__main__":
    main()
