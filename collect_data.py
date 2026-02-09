import yfinance as yf
import pandas as pd
import json
import os
import requests
import io
import datetime

def get_sp500_tickers_and_names():
    """Scrapes the list of S&P 500 tickers and names from Wikipedia."""
    url = "https://en.wikipedia.org/wiki/List_of_S%26P_500_companies"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        tables = pd.read_html(io.StringIO(response.text))
        df = tables[0]
        # df columns: Symbol, Security, ...
        tickers_metadata = []
        for index, row in df.iterrows():
            symbol = row['Symbol'].replace('.', '-')
            name = row['Security']
            tickers_metadata.append({"symbol": symbol, "name": name, "type": "SP500"})
            
        return tickers_metadata
    except Exception as e:
        print(f"Error fetching S&P 500 tickers: {e}")
        return []

def get_vanguard_etfs_metadata():
    """Returns a list of popular Vanguard ETFs with names."""
    return [
        {"symbol": "VOO", "name": "Vanguard S&P 500 ETF", "type": "ETF"},
        {"symbol": "VTI", "name": "Vanguard Total Stock Market ETF", "type": "ETF"},
        {"symbol": "BND", "name": "Vanguard Total Bond Market ETF", "type": "ETF"},
        {"symbol": "VUG", "name": "Vanguard Growth ETF", "type": "ETF"},
        {"symbol": "VTV", "name": "Vanguard Value ETF", "type": "ETF"},
        {"symbol": "VXUS", "name": "Vanguard Total International Stock ETF", "type": "ETF"},
        {"symbol": "VIG", "name": "Vanguard Dividend Appreciation ETF", "type": "ETF"},
        {"symbol": "VNQ", "name": "Vanguard Real Estate ETF", "type": "ETF"},
        {"symbol": "VGT", "name": "Vanguard Information Technology ETF", "type": "ETF"},
        {"symbol": "VWO", "name": "Vanguard FTSE Emerging Markets ETF", "type": "ETF"}
    ]

def get_crypto_tickers_metadata():
    """Returns a list of top 10 cryptocurrencies with names."""
    return [
        {"symbol": "BTC-USD", "name": "Bitcoin", "type": "Crypto"},
        {"symbol": "ETH-USD", "name": "Ethereum", "type": "Crypto"},
        {"symbol": "XRP-USD", "name": "XRP", "type": "Crypto"},
        {"symbol": "BNB-USD", "name": "Binance Coin", "type": "Crypto"},
        {"symbol": "SOL-USD", "name": "Solana", "type": "Crypto"},
        {"symbol": "ADA-USD", "name": "Cardano", "type": "Crypto"},
        {"symbol": "DOGE-USD", "name": "Dogecoin", "type": "Crypto"},
        {"symbol": "TRX-USD", "name": "TRON", "type": "Crypto"},
        {"symbol": "DOT-USD", "name": "Polkadot", "type": "Crypto"},
        {"symbol": "LINK-USD", "name": "Chainlink", "type": "Crypto"}
    ]

def get_gold_metadata():
    return [{"symbol": "GC=F", "name": "Gold", "type": "Gold"}]

def fetch_data(tickers):
    """Fetches weekly data for the given tickers."""
    if not tickers:
        print("No tickers to fetch.")
        return None, None

    print(f"Fetching weekly data for {len(tickers)} tickers...")
    
    # Download weekly data
    data = yf.download(tickers, period="max", interval="1wk", group_by='ticker', threads=True)
    
    # Download today's data to ensure we have the very latest price
    print("Fetching today's data...")
    data_today = yf.download(tickers, period="1d", interval="1d", group_by='ticker', threads=True)
    
    return data, data_today

def process_and_save_csv(weekly_data, daily_data, tickers_metadata, output_file):
    """Processes the data, calculates price in Gold, and saves to CSV."""
    
    gold_ticker = 'GC=F'
    
    # Helper to extract Close prices
    def extract_close(df):
        if isinstance(df.columns, pd.MultiIndex):
            # df.columns levels: Ticker, PriceType
            try:
                close_prices = df.xs('Close', level=1, axis=1)
                return close_prices
            except Exception:
                return df.xs('Close', level=1, axis=1)
        else:
            return df['Close'] if 'Close' in df else df

    weekly_close = extract_close(weekly_data)
    daily_close = extract_close(daily_data)
    
    # Combine weekly and daily data
    # We want to append the daily row if it's newer than the last weekly row
    combined_close = weekly_close.copy()
    
    if not daily_close.empty:
        last_weekly_date = weekly_close.index[-1].date()
        last_daily_date = daily_close.index[-1].date()
        
        if last_daily_date > last_weekly_date:
            combined_close = pd.concat([weekly_close, daily_close])
            
    # Ensure Gold price is available
    if gold_ticker not in combined_close.columns:
        print("Gold price not found!")
        return

    gold_price = combined_close[gold_ticker]
    
    # Calculate Price in Ounces of Gold
    # Formula: Asset Price / Gold Price
    price_in_gold = combined_close.div(gold_price, axis=0)
    
    # Unpivot (melt) to create a long-format CSV: Date, Ticker, PriceGold, PriceUSD
    price_in_gold_reset = price_in_gold.reset_index().melt(id_vars='Date', var_name='Ticker', value_name='PriceGold')
    prices_usd_reset = combined_close.reset_index().melt(id_vars='Date', var_name='Ticker', value_name='PriceUSD')
    
    # Merge USD and Gold prices
    final_df = pd.merge(price_in_gold_reset, prices_usd_reset, on=['Date', 'Ticker'])
    
    # Data cleaning
    final_df = final_df.dropna(subset=['PriceGold'])
    final_df = final_df.sort_values(by=['Date', 'Ticker'])
    
    # Save to CSV
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    final_df.to_csv(output_file, index=False)
    print(f"Data saved to {output_file}")


def save_tickers_metadata(tickers_metadata, output_file):
    with open(output_file, 'w') as f:
        json.dump(tickers_metadata, f, indent=2)
    print(f"Ticker metadata saved to {output_file}")
    
def main():
    print("Starting data collection...")
    
    sp500_meta = get_sp500_tickers_and_names()
    etf_meta = get_vanguard_etfs_metadata()
    crypto_meta = get_crypto_tickers_metadata()
    gold_meta = get_gold_metadata()
    
    all_metadata = sp500_meta + etf_meta + crypto_meta + gold_meta
    all_tickers = [m['symbol'] for m in all_metadata]
    
    # Remove duplicates
    all_tickers = list(set(all_tickers))
    
    # Fetch data
    weekly_data, daily_data = fetch_data(all_tickers)
    
    # Output files
    data_file = os.path.join("public", "data.csv")
    tickers_file = os.path.join("public", "tickers.json")
    
    process_and_save_csv(weekly_data, daily_data, all_metadata, data_file)
    save_tickers_metadata(all_metadata, tickers_file)
    
    print("Done!")

if __name__ == "__main__":
    main()
