from autotrade import Strategy
import numpy as np
import pandas as pd

class OpenRangeBreakout(Strategy):
    def __init__(self):
        Strategy.__init__(self, None, None, None)

    def set_bounds(self,target,stoploss, timeperiod):
        self.target_price = target
        self.sl_price = stoploss
        self.timeperiod = timeperiod
        
    def entry_logic(self, df=None, k={}):
        #logic for finding out the day's entry with high time interval
# =============================================================================
#         diff = np.diff(df['t']) > 10000
#         diff = np.append(diff, False)
#         day_opens = df.loc[diff]
#         day_opens = df.loc[day_opens.index + 1]
# =============================================================================
        #finding whether up or down (buy or sell)
        #difference with next row
        day_opens = df.loc[df['t'] % 86400 == 13800] #finding the day entry at 09:20 AM
        df_diffs = df.diff(periods = -1)
        day_opens_diff = df_diffs.loc[day_opens.index]
        
        #array of only positive or negative breakouts and not both breakouts
        entry = day_opens.loc[(day_opens_diff['h'] < 0) ^ (day_opens_diff['l'] > 0)]
        entry['up'] = entry['h'] < 0
        entry['down'] = entry['l'] > 0
        entry['price'] = 0
        for index,x in entry.iterrows():
            entry.loc[index, 'price'] = x['h'] if x['up'] else x['l']
        return entry[['price','t','up','down']]
        
    def target_logic(self, df=None, k={}):
        entry = k['entry']
#         target = [(row['price'] + (row['price']/self.target_div_factor)) if (row['up']) else 
#                   (row['price'] - (row['price']/self.target_div_factor)) for index,row in entry.iterrows()]
        target = [(row['price'] + self.target_price) if (row['up']) else row['price'] - self.target_price for index, row in entry.iterrows()]
        target = pd.Series(target, entry.index)
        return target
    
    def stoploss_logic(self, df=None, k={}):
        entry = k['entry']
#         stop_loss = [df.loc[index, 'l'] if (row['up']) else df.loc[index, 'h'] for index,row in entry.iterrows()]
#         stop_loss = [(row['price'] - 2*(row['price']/self.target_div_factor)) if (row['up']) else 
#                      (row['price'] + 2*(row['price']/self.target_div_factor)) for index,row in entry.iterrows()]
        stop_loss = [(row['price']-self.sl_price) if row['up'] else row['price']+self.sl_price for index, row in entry.iterrows()]
        stop_loss = pd.Series(stop_loss, entry.index)
        return stop_loss

    
    def exit_logic(self, df=None, k={}):
        entry = k['entry']
        exit_time = np.array(entry['t']) + self.timeperiod
        return pd.Series(exit_time, entry.index)
