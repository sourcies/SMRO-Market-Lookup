const counterToEmoji = counter => {
  if (counter === 1) return '1️⃣';
  if (counter === 2) return '2️⃣';
  if (counter === 3) return '3️⃣';
  if (counter === 4) return '4️⃣';
  if (counter === 5) return '5️⃣';
  if (counter === 6) return '6️⃣';
  if (counter === 7) return '7️⃣';
  if (counter === 8) return '8️⃣';
  if (counter === 9) return '9️⃣';
  if (counter === 10) return '🔟';
  return undefined;
};

const emojiToCounter = emoji => {
  if (emoji === '1️⃣') return 1;
  if (emoji === '2️⃣') return 2;
  if (emoji === '3️⃣') return 3;
  if (emoji === '4️⃣') return 4;
  if (emoji === '5️⃣') return 5;
  if (emoji === '6️⃣') return 6;
  if (emoji === '7️⃣') return 7;
  if (emoji === '8️⃣') return 8;
  if (emoji === '9️⃣') return 9;
  if (emoji === '🔟') return 10;
  return undefined;
};

module.exports = { counterToEmoji, emojiToCounter }