import matplotlib.pyplot as plt
from matplotlib.ticker import FuncFormatter
import pandas as pd
from collections import Counter

df = pd.read_csv('dump/ws_data.csv').values
prices = df[:, 0]

c = Counter(prices)

unique_prices, frequency = [], []
for key in c:
  unique_prices.append(key)
  frequency.append(c[key])
 
plt.barh(unique_prices, frequency)
plt.title('Number of vendors for each price')
plt.xlabel('Number of vendors')
plt.ylabel('Price')
plt.subplots_adjust(left=0.22, right=0.96, top=0.91, bottom=0.12)

plt.savefig('dump/ws_plot.png')
# plt.show()
