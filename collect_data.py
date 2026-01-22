import yfinance as yf
import pandas as pd
import json
import os

import requests
import io

def get_sp500_tickers():
    """Scrapes the list of S&P 500 tickers from Wikipedia."""
    url = "https://en.wikipedia.org/wiki/List_of_S%26P_500_companies"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        # Use io.StringIO to pass the HTML content to read_html
        tables = pd.read_html(io.StringIO(response.text))
        
        # The first table usually contains the tickers
        df = tables[0]
        tickers = df['Symbol'].tolist()
        # Clean tickers (e.g., BRK.B -> BRK-B for yfinance)
        tickers = [ticker.replace('.', '-') for ticker in tickers]
        return tickers
    except Exception as e:
        print(f"Error fetching S&P 500 tickers: {e}")
        return []

def fetch_data(tickers):
    """Fetches weekly data for the last 10 years for given tickers."""
    if not tickers:
        print("No tickers to fetch.")
        return None

    print(f"Fetching data for {len(tickers)} tickers...")
    
    # Download data
    # period="10y", interval="1wk"
    # group_by='ticker' makes it easier to process individual stocks
    data = yf.download(tickers, period="10y", interval="1wk", group_by='ticker', threads=True)
    
    return data

def process_and_save(data, filepath):
    """Processes the DataFrame and saves it to JSON."""
    if data is None or data.empty:
        print("No data to save.")
        return

    output_data = {}
    
    # Iterate through tickers
    # The columns is a MultiIndex if multiple tickers. 
    # If standard batch download, level 0 is Ticker, level 1 is Price Type (Open, Close, etc.)
    
    # Check if data has MultiIndex columns (multiple tickers)
    if isinstance(data.columns, pd.MultiIndex):
        tickers = data.columns.levels[0]
        for ticker in tickers:
            try:
                # Extract Close prices
                ticker_data = data[ticker]['Close'].dropna()
                
                # Convert timestamps to string and values to float
                # We retain only date part of index for key
                formatted_data = {
                    str(date.date()): round(price, 2) 
                    for date, price in ticker_data.items()
                }
                
                if formatted_data:
                    output_data[ticker] = formatted_data
            except KeyError:
                print(f"Could not process data for {ticker}")
            except Exception as e:
                print(f"Error processing {ticker}: {e}")
    else:
        # Single ticker case (unlikely for S&P 500 but good to handle)
        print("Single ticker processing not explicitly specialized but follows similar logic.")
        # Implementation skipped for brevity as we expect 500 tickers
        pass

    # Ensure directory exists
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    
    with open(filepath, 'w') as f:
        json.dump(output_data, f, indent=2) # indent for readability, remove for size
        
    print(f"Data saved to {filepath}")

def main():
    print("Starting data collection...")
    
    tickers = get_sp500_tickers()
    if not tickers:
        print("Failed to get tickers. Exiting.")
        return

    # Add GLD ETF for Gold Price
    tickers.append('GLD')

    # For testing, you might want to slice tickers[:10] to run fast
    # tickers = tickers[:20] 
    
    data = fetch_data(tickers)
    
    # Save to public folder so React can fetch it
    output_file = os.path.join("public", "sp500_data.json")
    process_and_save(data, output_file)
    
    print("Done!")

if __name__ == "__main__":
    main()
