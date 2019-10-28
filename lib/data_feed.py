import json
import time
from pathlib import Path
from datetime import datetime,timedelta
from threading import Thread

from observer import Subject, Observer

no_save = None

class DataFeed(Subject):
    def __init__(self, save=False, filepath="."):
        Subject.__init__(self)
        self.filepath = filepath
        self.last_time = 0
        self.simulations = []
        if(save):
            self.saver = DataSaver(filepath)
            self.attach(self.saver, simulation=False)

    def notify(self, data):
        self.data = data
        for i in range(len(self.observers)):
            try:
                if(self.simulations[i] == bool(data.get('sm'))):
                    self.observers[i].update(self)
            except:
                print("Exception in the observer {}", self.observers[i])

    def attach(self, observer, simulation=False):
        self.simulations.append(simulation)
        Subject.attach(self, observer)
        print('Attached; ',self.observers)

    def detach(self, index, observer=None):
        if(observer):
            Subject.detach(self, observer)
            for i in range(len(self.observers)):
                if(observer == self.observers[i]):
                    self.simulations.pop(i)
            return
        self.simulations.pop(index)
        self.observers.pop(index)
        print('Detached; ',(self.observers))

    def simulate(self, start_time=None, end_time=None, real_time=None):
        thread = Thread(target=self.start_simulation, args=(start_time, end_time, real_time))
        thread.start()

    def start_simulation(self, start_time=None, end_time=None, real_time=False):
        global no_save
        no_save = True
        date_format = '%m-%d-%Y'
        self.start_time = datetime.strptime(start_time, date_format)
        self.end_time = (end_time, datetime.strptime(end_time, date_format))[end_time is not None]
        cur_date = self.start_time
        datestring = cur_date.strftime(date_format)
        endstring = self.end_time.strftime(date_format)
        prev = None
        #for now starting from start_date 9:15AM to end_date H:MM
        with open("{}\\{}.csv".format(self.filepath, datestring)) as f:
            headers = next(f).strip().split(', ')
            while(True):
                try:
                    row = next(f).strip().split(', ')
                    data = {'sm': True}
                    for x in range(len(row)):
                        data[headers[x]] = row[x]
                    if(real_time):
                        now = int(data['t'])
                        if prev:
                            time.sleep(now - prev)
                        prev = now
                    self.notify(data)
                    #need to combine even next day for combining the flow
                except StopIteration:
                    datestring = cur_date.strftime(date_format)
                    if(datestring == endstring or self.end_time is None):
                        break
                    else:
                        cur_date = cur_date + timedelta(days=1)
                        f = open("{}\\{}.csv".format(self.filepath, cur_date.strftime(date_format)))
                        next(f)

class DataSaver(Observer):
    def __init__(self, filepath):
        self.filepath = filepath
        fileName = datetime.today().strftime("%m-%d-%Y")
        self.fileName = "{}\\{}.csv".format(self.filepath, fileName)
        mypath = None
        try:
            mypath = Path(self.fileName)
            if(mypath.stat().st_size == 0):
                mypath = "new"
        except:
            mypath = "new"
            if(mypath == "new"):  # True if empty
                columns = ['mode', 'token', 'isTradeable', 'volume', 'lastQuantity', 'totalBuyQuantity', 'totalSellQuantity',
                        'lastPrice', 'averagePrice', 'openPrice', 'highPrice', 'lowPrice', 'closePrice', 'change', 'absoluteChange', 't']
                with open(self.fileName, "a+") as f:
                    f.write(', '.join(columns))
                    f.write('\n')

    def get_time(self):
        return datetime.now().time()

    def update(self, data):
        if(not no_save):
            stock = data.data
            if(not (self.get_time() >= datetime.strptime("09:00","%H:%M").time() and self.get_time() <= datetime.strptime("15:30","%H:%M").time())):
                return
            with open(self.fileName, "a+") as f: #TODO need to clarify the different file open types
                output = []
                for key in stock:
                    output.append(stock[key])
                f.write(', '.join(["{}".format(x) for x in output]))
                f.write('\n')
