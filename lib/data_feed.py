from observer import Subject,Observer
import json
from datetime import datetime
from pathlib import Path

class DataFeed(Subject):
    def __init__(self, save=False, filepath="."):
        Subject.__init__(self)
        if(save):
            self.saver = DataSaver(filepath)
            self.attach(self.saver)

    def notify(self, data):
        self.data = data
        Subject.notify(self)

class DataSaver(Observer):
    def __init__(self, filepath):
        self.filepath = filepath
        fileName = datetime.today().strftime("%d_%m_%Y")
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
    def update(self, data):
        with open(self.fileName, "a+") as f: #TODO need to clarify the different file open types
            for stock in data.data:
                output = []
                for key in stock:
                    output.append(stock[key])
                f.write(', '.join(["{}".format(x) for x in output]))
                f.write('\n')
