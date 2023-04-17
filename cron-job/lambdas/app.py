import random

def handler(event, context):
    # generate random number
    number = random.randint(1, 100)
    # print number
    print(number)
    # return number
    return number

     