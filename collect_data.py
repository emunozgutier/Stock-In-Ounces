import yfinance as yf
import pandas as pd
import json
import os
import requests
import io
import datetime

def get_sp500_tickers():
    """Scrapes the list of S&P 500 tickers from Wikipedia."""
    url = "https://en.wikipedia.org/wiki/List_of_S%26P_500_companies"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        tables = pd.read_html(io.StringIO(response.text))
        df = tables[0]
        tickers = df['Symbol'].tolist()
        tickers = [ticker.replace('.', '-') for ticker in tickers]
        return tickers
    except Exception as e:
        print(f"Error fetching S&P 500 tickers: {e}")
        return []

def get_vanguard_etfs():
    """Returns a list of popular Vanguard ETFs."""
    return ['VOO', 'VTI', 'BND', 'VUG', 'VTV', 'VXUS', 'VIG', 'VNQ', 'VGT', 'VWO']

def get_crypto_tickers():
    """Returns a list of top 10 cryptocurrencies."""
    return ['BTC-USD', 'ETH-USD', 'XRP-USD', 'BNB-USD', 'SOL-USD', 'ADA-USD', 'DOGE-USD', 'TRX-USD', 'DOT-USD', 'LINK-USD']

def fetch_data(tickers):
    """Fetches weekly data for the given tickers."""
    if not tickers:
        print("No tickers to fetch.")
        return None

    print(f"Fetching weekly data for {len(tickers)} tickers...")
    
    # Download weekly data
    data = yf.download(tickers, period="max", interval="1wk", group_by='ticker', threads=True)
    
    # Download today's data to ensure we have the very latest price
    print("Fetching today's data...")
    data_today = yf.download(tickers, period="1d", interval="1d", group_by='ticker', threads=True)
    
    return data, data_today

def process_and_save_csv(weekly_data, daily_data, tickers, sp500_tickers, etf_tickers, crypto_tickers, output_file):
    """Processes the data, calculates price in Gold, and saves to CSV."""
    
    gold_ticker = 'GC=F'
    
    # Helper to extract Close prices
    def extract_close(df):
        if isinstance(df.columns, pd.MultiIndex):
            # df.columns levels: Ticker, PriceType
            # We want a DataFrame where columns are Tickers and values are Close prices
            try:
                # xs is cleaner but sometimes tricky with MultiIndex structure variations from yfinance
                # Let's try to select 'Close' from level 1
                close_prices = df.xs('Close', level=1, axis=1)
                return close_prices
            except Exception:
                # Fallback if structure is different
                return df.xs('Close', level=1, axis=1) # Retry or handle differently
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
    
    # Unpivot (melt) to create a long-format CSV: Date, Ticker, PriceUSD, PriceGold, Type
    # Reset index to make Date a column
    price_in_gold_reset = price_in_gold.reset_index().melt(id_vars='Date', var_name='Ticker', value_name='PriceGold')
    prices_usd_reset = combined_close.reset_index().melt(id_vars='Date', var_name='Ticker', value_name='PriceUSD')
    
    # Merge USD and Gold prices
    final_df = pd.merge(price_in_gold_reset, prices_usd_reset, on=['Date', 'Ticker'])
    
    # Add Type column
    def get_type(ticker):
        if ticker == gold_ticker: return 'Gold'
        if ticker in sp500_tickers: return 'SP500'
        if ticker in etf_tickers: return 'ETF'
        if ticker in crypto_tickers: return 'Crypto'
        return 'Other'

    final_df['Type'] = final_df['Ticker'].apply(get_type)
    
    # Drop rows with NaN PriceGold (e.g. where Gold price was NaN or asset price was NaN)
    final_df = final_df.dropna(subset=['PriceGold'])
    
    # Sort by Date and Ticker
    final_df = final_df.sort_values(by=['Date', 'Ticker'])
    
    # Save to CSV
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    final_df.to_csv(output_file, index=False)
    print(f"Data saved to {output_file}")

def main():
    print("Starting data collection...")
    
    sp500 = get_sp500_tickers()
    etfs = get_vanguard_etfs()
    cryptos = get_crypto_tickers()
    gold = ['GC=F']
    
    all_tickers = sp500 + etfs + cryptos + gold
    # Remove duplicates if any
    all_tickers = list(set(all_tickers))
    
    # Fetch data
    weekly_data, daily_data = fetch_data(all_tickers)
    
    # Output file
    output_file = os.path.join("public", "data.csv")
    
    process_and_save_csv(weekly_data, daily_data, all_tickers, sp500, etfs, cryptos, output_file)
    
    print("Done!")

if __name__ == "__main__":
    main()
