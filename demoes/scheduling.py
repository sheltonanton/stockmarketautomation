import schedule
import time
from threading import Thread

def func():
    print("Executed")

schedule.every().day.at("06:55").do(func)

while True:
    schedule.run_pending()
    time.sleep(1)
