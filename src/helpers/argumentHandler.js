const isNumber = arg => {
  const argInNumber = Number(arg);
  return (!Number.isNaN(argInNumber));
}

module.exports = { isNumber }