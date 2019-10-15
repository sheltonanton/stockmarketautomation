from observer import Observer,Subject
from autotrade import Collector

class OpenRangeBreakout(Observer):
    '''
        Open Range breakout is the class to spit out the breakout on different timeframes registered for now, and in future will be tracking all timeframes until it is running
        TODO track it in all timeframe
        TODO uses collector to collect the price and track
        TODO should have a pipe to receive stream of data from websocket or any other means through iteration or looping
    '''
    def __init__(self, dataFeed:Subject, tokens):
        dataFeed.attach(self)
        self.collector = Collector(tokens)
        self.tokens = tokens

    def start(self): #starting the breakout trading
        pass

    def update(self, dataFeed: Subject):  # passing the data is done through this data pipe
        data = dataFeed.data
        self.collector.collect_price(data)

