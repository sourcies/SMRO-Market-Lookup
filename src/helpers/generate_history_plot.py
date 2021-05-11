import matplotlib.pyplot as plt
from matplotlib.ticker import FuncFormatter
import pandas as pd
import datetime
import sys

df = pd.read_csv('dump/h_data.csv').values
dates = [datetime.date.fromisoformat(x).strftime(('%b%d')) for x in df[:, 0]]
prices = df[:,1]

def human_format(num, pos):
    magnitude = 0
    while abs(num) >= 1000:
        magnitude += 1
        num /= 1000.0
    # add more suffixes if you need them
    return '%.2f%s' % (num, ['', 'K', 'M', 'G', 'T', 'P'][magnitude])

formatter = FuncFormatter(human_format)

fig, ax = plt.subplots()
ax.yaxis.set_major_formatter(formatter)

plt.title('{} ~ {}'.format(df[0,0], df[-1,0]))
plt.xticks(ticks=range(len(dates)), labels=dates, rotation=45, ha='right')
plt.ylabel('Price')
plt.xlabel('Timeline')

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
plt.savefig('dump/h_plot.png')
# plt.show()
