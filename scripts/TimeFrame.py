import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta
import numpy as np

def get_trading_days():
    """
    Fetches S&P 500 history to get a list of valid NYSE trading days.
    """
    # ^GSPC = S&P 500
    sp500 = yf.Ticker("^GSPC")
    # Fetch max history to cover up to 50+ years
    history = sp500.history(period="max")
    return history.index

def get_timeframe_dates():
    """
    Generates dictionary of timeframes with ~100 equidistant points each.
    """
    trading_days = get_trading_days()
    # Ensure timezone awareness compatibility (remove timezone for comparison if needed, or keep it consistent)
    # yfinance usually returns timezone-aware timestamps. We'll convert to naive or compatible.
    if trading_days.tz is not None:
        trading_days = trading_days.tz_localize(None)
    
    now = datetime.now()
    timeframes = {
        "50y": 365 * 50,
        "20y": 365 * 20,
        "10y": 365 * 10,
        "5y": 365 * 5,
        "2y": 365 * 2,
        "1y": 365,
        "6m": 30 * 6,
        "3m": 30 * 3
    }
    
    result = {}
    
    for label, days_back in timeframes.items():
        start_date = now - timedelta(days=days_back)
        
        # Filter valid trading days within this range
        mask = (trading_days >= start_date) & (trading_days <= now)
        valid_days = trading_days[mask]
        
        if valid_days.empty:
            print(f"Warning: No valid trading days found for {label}")
            result[label] = []
            continue

        total_days = len(valid_days)
        
        # Target ~100 points
        target_points = 100
        
        if total_days <= target_points:
            # If we have fewer than 100 days (e.g. 3m might be ~60-63 trading days), take all
            selected_dates = valid_days
        else:
            # Pick equidistant points
            indices = np.linspace(0, total_days - 1, target_points, dtype=int)
            selected_dates = valid_days[indices]
            
        # Convert to string format 'YYYY-MM-DD'
        result[label] = [date.strftime("%Y-%m-%d") for date in selected_dates]
        print(f"{label}: Selected {len(result[label])} dates from {total_days} valid trading days.")
        
    return result

if __name__ == "__main__":
    # Test the function
    try:
        dates = get_timeframe_dates()
        for tf, d_list in dates.items():
            print(f"Timeframe {tf}: {len(d_list)} points, Start: {d_list[0]}, End: {d_list[-1]}")
    except Exception as e:
        print(f"Error in main: {e}")
