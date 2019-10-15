from subprocess import Popen, PIPE
from threading  import Thread

class WebSocketPipe:
    def __init__(self, args, receiver, sender):
        self.args = args
        self.process = Popen(self.args, stdin=PIPE, stdout=PIPE)
        
    def read(self):
        if(self.process.poll() == None):
            out = self.process.stdout
            line = out.readline()
            out.flush()
            return line
        else:
            return ''

    def write(self, data):
        inp = self.process.stdin
        inp.write(data.encode('utf-8'))
        inp.flush()