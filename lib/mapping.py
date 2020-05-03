urls = {
    'start_process': 'http://localhost/auto/start_process',
    'send_feed': 'http://localhost/auto/send_feed',
    'order_bo': 'http://localhost/order/bo',
    'order_co': 'http://localhost/order/co',
    'order_regular': 'http://localhost/order/regular',
    'stocks': 'http://localhost/stocks/active',
    'stream_history': 'http://localhost/auto/stream_historical',
    'get_history': 'http://localhost/auto/get_historical',
    'get_history_kite': 'https://api.kite.trade/instruments/historical/{}/{}?from={}&to={}',
    'instruments_csv': 'instruments.csv'
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
