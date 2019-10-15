import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

import sys
sys.path.append("D:\\programs\\nseTools\\zerodha\\lib")
from autotrade import History
from orbreakout import OpenRangeBreakout
# =============================================================================
# from pipe import pipe
# =============================================================================
from progress_bar import progress_bar

symbols = ['YESBANK','HEXAWARE','HDFCLIFE','DLF','MOIL','DHFL','EQUITAS']
#getting the history of yesbank
instruments = pd.read_csv("D:\\programs\\nseTools\\zerodha\\instruments.csv")
for symbol in symbols:
    history = History(url="https://kitecharts-aws.zerodha.com/api/chart/{}/{}?from={}&to={}", instruments=instruments)
    stock = history.get_instrument("5minute", "2019-01-01", "2019-09-27", "NSE", "EQ", symbol=symbol)
    print()
    print(stock.head())
    orb = OpenRangeBreakout()
    #target 0.5 - 2.5
    #stoplo 0.5 - 2.5
    #itterr 0.05
    range_steps = 0.05
    ts = ss = 0.5
    te = se = 2.55
    tp = 24000
    
    target = np.arange(ts,te,range_steps)
    stoplo = np.arange(ss,se,range_steps)
    
    # =================================================================================================
    # queue = pipe(["C:\\Program Files\\nodejs\\node.exe","D:\\programs\\nseTools\\zerodha\\pipe.js"])
    # =================================================================================================
          
    chart = []
    count = 0
    for x in target:
        for y in stoplo:
            count = count + 1
            x = round(x,2)
            y = round(y,2)
            progress_bar(100, (count/((te - ts)/range_steps)**2)*100, " {},{}".format(format(x,'.2f'),format(y,'.2f')))
            orb.set_bounds(x,y,tp)
            (output, result) = orb.run(df=stock)
            li = []
            li.append(x)
            li.append(y)
            li.append(sum(result['traded_amount']))
            chart.append(li)
    
    sd = pd.DataFrame(chart, columns=['target','sl','profit'])
    max_chart = max(sd['profit'])
    min_chart = min(sd['profit'])
    steps = (max_chart - min_chart) /5
    #dots should be for 0, 0.2, 0.4, 0.6, 0.8
    #every price should be greater than 0

    for index,row in sd.iterrows():
        profit = row['profit']
        if(profit < 0):
            continue
        num = int((profit - min_chart)/steps) * 0.2
        color = "{}".format(num)
        plt.scatter(row['target'],row['sl'],color=color)
    plt.savefig("charts//{}.png".format(symbol))
    
    #running a time toop on 09:15AM
    #checking for internet connection, on error try to reconnect after some tries
    #on 9:15 AM, run the loop
    #on 9:20 AM, try to capture the direction of the trend by comparing the candles from 9:15 to 9:20, then place the order with best target and stoploss
    #place the order simultaneously
    #bo takes care of the remaining thing
    