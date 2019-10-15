from observer import Subject

class DataFeed(Subject):
    def notify(self, data):
        self.data = data
        Subject.notify(self)

