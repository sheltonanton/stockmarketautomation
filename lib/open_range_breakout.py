import schedule
from collections import defaultdict
from datetime import datetime, timedelta
from observer import Observer, Subject
from autotrade import Candles

class OpenRangeBreakout(Observer):
    '''
        Open Range breakout is the class to spit out the breakout on different timeframes registered for now, and in future will be tracking all timeframes until it is running
        TODO track it in all timeframe
        TODO uses collector to collect the price and track
        TODO should have a pipe to receive stream of data from websocket or any other means through iteration or looping
    '''
    def __init__(self, tokens):
        self.tokens = tokens
        self.timeframe = [1,2,5,10,15]
        self.calendar = defaultdict(list)
        self.phases = []
        tf = "%H:%I"

        time = datetime.strptime("09:30",tf)
        for t in self.timeframe:
            #start every timeframe at 9:13
            #call record at time 9:15
            #record for the subsequent time
            #end the process
            phase = Phase()
            self.phases.append(phase)
            start_time = (time - timedelta(minutes=2)).strftime(tf)
            breakout_time = (time + timedelta(minutes=t)).strftime(tf)
            end_time = (time + timedelta(minutes=2*t)).strftime(tf)
            time = time.strftime(tf)
            
            self.calendar[start_time].append(phase.start)
            self.calendar[time].append(phase.record)
            self.calendar[breakout_time].append(phase.breakout)
            self.calendar[end_time].append(phase.end)

        for time in self.calendar:
            for callback in self.calendar[time]:
                 schedule.every().day.at(time).do(callback)

    def update(self, dataFeed: Subject):  # passing the data is done through this data pipe
        data = dataFeed.data
        for phase in self.phases:
            phase.update(data)

class Phase:
    def start(self):
        self.candles = Candles()
        self.phase = "start"

    def record(self):
        self.phase = "record"

    def breakout(self):
        self.phase = "breakout"

    def end(self):
        self.phase = "end"

    def update(self, data):
        if(self.phase == "record"):
            pass
        if(self.phase == "breakout"):
            pass
        if(self.phase == "end"):
            pass
