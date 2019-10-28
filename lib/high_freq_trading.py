from observer import Observer, Subject

BUY = "BUY"
SELL = "SELL"

class HighFrequencyTrading(Observer):
    '''
        High Frequency Trading is the class to trade in a high frequency with entering and exiting the
        trade at the minimum difference to attain profit. Trading executed with minimum profit over
        a high range will turn into overall high profit
    '''
    def __init__(self, tokens=[], stocks=[], config={}):
        quantity = config.get('quantity') or 1
        cancelRange = config.get('cancelRange') or 0.10
        self.type = SELL

    def update(self, dataFeed: Subject):
        #TODO in future give also the market depth of the stock
        pass

    def removed(self):
        #TODO perform actions for canceling all actions
        pass

class RangeTrade:
    def __init__(self, direction, enter, exitPrice, cancel):
        self.dir = direction
        self.enter = enter
        self.exit = exitPrice
        self.cancel = cancel
        
    def on_out(self, args):



#TODO enter the trade in the overall direction of trend
#TODO exit the trade at the next 0.05 diff
#TODO initially there is no need to find out the direction of trending, in future use some indicators
#TODO parallel reading of market depth and price from stock
