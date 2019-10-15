from queue import Empty
from pipe import pipe
import json

queue = pipe(['C:\\Program Files\\nodejs\\node.exe',
              'D:\\programs\\nseTools\\zerodha\\zerodha_ticks.js'])

while True:
    try:
        data = queue.get_nowait()
    except Empty:
        continue
    else:
        print(json.loads(data.decode('utf-8')))
