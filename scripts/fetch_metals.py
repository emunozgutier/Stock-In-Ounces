import yfinance as yf
import json
import os
from datetime import datetime

# Define tickers for precious metals
# Gold is already in the CSV, but we could fetch it too if needed.
# For now, we focus on the missing ones.
METALS = {
    "Silver": "SI=F",
    "Platinum": "PL=F",
    "Palladium": "PA=F",
    # Rhodium is not available on Yahoo Finance as a standard ticker like the others.
    # We will omit it for now or use a placeholder if needed.
}

def fetch_data():
    data = {}
    
    # Range: 2000-01-01 to Present
    start_date = "2000-01-01"
    end_date = datetime.now().strftime("%Y-%m-%d")

    print(f"Fetching data from {start_date} to {end_date}...")

    # Fetch data for each metal
    for metal_name, ticker_symbol in METALS.items():
        print(f"Fetching {metal_name} ({ticker_symbol})...")
        try:
            ticker = yf.Ticker(ticker_symbol)
            history = ticker.history(start=start_date, end=end_date)
            
            if history.empty:
                print(f"Warning: No data found for {metal_name}")
                continue

            # Process history
            for date, row in history.iterrows():
                date_str = date.strftime("%Y-%m-%d")
                
                if date_str not in data:
                    data[date_str] = {}
                
                # Use 'Close' price
                data[date_str][metal_name] = round(row['Close'], 4)
                
        except Exception as e:
            print(f"Error fetching {metal_name}: {e}")

    # Sort data by date
    sorted_data = dict(sorted(data.items()))
    
    # Save to JSON
    output_path = os.path.join("public", "metals.json")
    os.makedirs("public", exist_ok=True)
    
    with open(output_path, "w") as f:
        json.dump(sorted_data, f, indent=2)
    
    print(f"Successfully saved metal data to {output_path}")
    print(f"Total dates: {len(sorted_data)}")

if __name__ == "__main__":
    fetch_data()
