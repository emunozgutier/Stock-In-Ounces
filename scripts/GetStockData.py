
import yfinance as yf
import json
import os
import time
import pandas as pd
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
        "Platinum": "PL=F"
    },
    # Indices/ETFs
    "Indices": {
        # S&P 500 now individual tickers
    },
    # Vanguard ETF
    "VanguardETF": {
        "VTI": "VTI",
        "VOO": "VOO"
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

def main():
    print("Generating TimeFrame dates...")
    timeframe_dates = get_timeframe_dates()
    
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
        all_symbols.append(symbol)

    # Add Crypto
    for name, symbol in ASSETS["Crypto"].items():
        tickers_map[name] = symbol
        all_symbols.append(symbol)
        
    # Add Vanguard
    for name, symbol in ASSETS["VanguardETF"].items():
        tickers_map[name] = symbol
        all_symbols.append(symbol)

    # Add S&P 500 Tickers
    for symbol in SP500_TICKERS:
        tickers_map[symbol] = symbol
        all_symbols.append(symbol)

    print(f"Total assets to fetch: {len(all_symbols)}")

    # Fetch in chunks to avoid URL length issues or timeouts
    CHUNK_SIZE = 100
    all_data_frames = []

    for i in range(0, len(all_symbols), CHUNK_SIZE):
        chunk = all_symbols[i:i+CHUNK_SIZE]
        print(f"Downloading chunk {i//CHUNK_SIZE + 1}/{(len(all_symbols)-1)//CHUNK_SIZE + 1} ({len(chunk)} tickers)...")
        
        try:
            df = yf.download(chunk, start=start_date, progress=False, threads=True, group_by='ticker')
            all_data_frames.append(df)
            
        except Exception as e:
            print(f"Error fetching chunk: {e}")

    print("\nProcessing data into timeframes...")
    
    # Get absolute path to project root (parent of script folder)
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    public_dir = os.path.join(project_root, "public")
    
    # Ensure public folder exists
    os.makedirs(public_dir, exist_ok=True)

    for tf_label, dates in timeframe_dates.items():
        print(f"Processing {tf_label}...")
        
        # Columnar Format
        # Columns: Date, Metal1, Metal2, ..., Ticker1, Ticker2, ...
        # We need a stable order of columns.
        
        # 1. Build Column List
        # Standardize: Date + Sorted Keys of everything else
        all_keys = list(tickers_map.keys())
        all_keys.sort()
        
        columns = ["Date"] + all_keys
        
        tf_rows = []
        
        for date_str in dates:
            row_values = [date_str]
            
            # Efficiently fetch values for all keys
            for key in all_keys:
                symbol = tickers_map[key]
                val = None
                found = False
                
                # Check dataframes
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
                         pass # Single ticker logic omitted as we use group_by='ticker'

                    if found: break
                
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
    # Goal: Gold + VOO (Default Stock) + 1Y (Default Timeframe)
    # Columnar format for consistency
    
    fast_data = {}
    
    if "1y" in final_data:
        src = final_data["1y"]
        src_cols = src["columns"]
        src_rows = src["rows"]
        
        # Indices
        try:
            date_idx = src_cols.index("Date")
            gold_idx = src_cols.index("Gold")
            voo_idx = src_cols.index("VOO")
            
            fast_cols = ["Date", "Gold", "VOO"]
            fast_rows = []
            
            for row in src_rows:
                fast_rows.append([
                    row[date_idx],
                    row[gold_idx],
                    row[voo_idx]
                ])
                
            fast_data["1y"] = {
                "columns": fast_cols,
                "rows": fast_rows
            }
        except ValueError:
            print("Warning: Could not find Gold or VOO in columns for FastData.")
            
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
