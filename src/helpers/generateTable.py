import matplotlib.pyplot as plt
from matplotlib.ticker import FuncFormatter
import pandas as pd
from collections import Counter
import datetime
import sys

df = pd.read_csv('data.csv').values
dates = [datetime.date.fromisoformat(x).strftime(('%b%d')) for x in df[:, 0]]
prices = df[:,1]

plt.title('{} ~ {}'.format(df[0,0], df[-1,0]))
plt.xticks(ticks=range(len(dates)), labels=dates, rotation=45, ha='right')
plt.ticklabel_format(axis='y', style='plain')
plt.ylabel('Price')

# Plot the mean line
x1, y1 = [0, len(dates)], [prices.mean(), prices.mean()]
plt.plot(x1, y1, color='red')

# Plot the median
median = int(sys.argv[1].replace(',', ''))
x2, y2 = [0, len(dates)], [median, median]
plt.plot(x2, y2, color='green')

# Plot the prices
plt.plot(range(len(dates)), prices)

plt.legend(['Mean (avg)', 'Median'])
plt.subplots_adjust(left=0.15, right=0.96, top=0.91, bottom=0.15)
plt.grid()
plt.savefig('plot.png')
# plt.show()
