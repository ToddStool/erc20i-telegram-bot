import BigNumber from 'bignumber.js'

BigNumber.config({ DECIMAL_PLACES: 4 })

export function decimalsOff(value, decimalCount = 9) {
  const num = new BigNumber(value)
  const decimals = Math.pow(10, decimalCount)

  return num.dividedBy(decimals).toString()
}