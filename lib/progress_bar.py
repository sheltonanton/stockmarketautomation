import sys

def progress_bar(length, progress, string):
    yes = '-' * int((progress * length) /100)
    no  = ' ' * int(length - (progress * length)/100)
    
    sys.stdout.write('\r\r%s%s |%d%%| %s' % (yes, no, progress, string))
    sys.stdout.flush()
