class Subject:
    def __init__(self):
        self.observers = []

    def attach(self, observer):
        ''' Attach an observer to the subject '''
        self.observers.append(observer)
    
    def detach(self, observer):
        '''Detach an observer from the subject '''
        self.observers.remove(observer)
        observer.removed()

    def notify(self):
        ''' Notify all the observers in the subject '''
        for observer in self.observers:
            observer.update(self)

class Observer:
    def update(self, subject):
        ''' Receive an update from the subject '''
        pass

    def removed(self):
        '''Called prior to removing it from the listener '''
        pass
