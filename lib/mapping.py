urls = {
    'start_process': 'http://localhost:3000/auto/start_process',
    'send_feed': 'http://localhost:3000/auto/send_feed',
    'order_bo': 'http://localhost:3000/order/bo',
    'order_co': 'http://localhost:3000/order/co',
    'order_regular': 'http://localhost:3000/order/regular',
    'stocks': 'http://localhost:3000/stocks/active',
    'stream_history': 'http://localhost:3000/auto/stream_historical',
    'get_history': 'http://localhost:3000/auto/get_historical',
    'get_history_kite': 'https://api.kite.trade/instruments/historical/{}/{}?from={}&to={}',
    'instruments_csv': 'D:\\programs\\nseTools\\zerodha\\instruments.csv'
}

operands = {
    'time': 'Time',
    'candle': 'Candle',
    'price': 'Price',
    'value': 'Value',
    'data': 'Data',
    'macd': 'MovingAverageConvergenceDivergence',
    'sma': 'SimpleMovingAverage',
    'ema': 'ExponentialMovingAverage',
    'bband': 'BollingerBands',
    'stochrsi': 'StochasticRelativeStrengthIndex',
    'max': 'Max',
    'min': 'Min',
    'percent': 'Percent',
    'dayshigh': 'DaysHigh',
    'dayslow': 'DaysLow'
}

traders = {
    'zerodha': 'ZerodhaTrader',
    'simulated': 'SimulatedTrader'
}
