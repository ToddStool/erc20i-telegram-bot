import BigNumber from 'bignumber.js'

export function scientificToDecimal(value) {
  const num = new BigNumber(value)
  BigNumber.config({ EXPONENTIAL_AT: 100 })

  return num.toString()
}

export function correctNumber(number, decCount = 2) {
  const num = scientificToDecimal(number)

  const int = num.split('.')[0]
  const decimals = num.split('.')[1]

  if (!decimals) {
    return num
  }

  const firstDigitIndex = decimals.split('').findIndex((digit) => digit !== '0') || 0

  if (!firstDigitIndex && firstDigitIndex !== 0) {
    return num
  }

  return int + '.' + decimals.slice(0, firstDigitIndex + decCount)
}

export function initCorrectNumber(number = false, dec = 2) {
  const value = correctNumber(number, dec)

  const numArray = value.toString().split('.')
  let num = ''
  let integer = numArray[0]
  let decimals = numArray?.[1]

  const correctInteger = integer
    .toString()
    .replace(/\D/g, '')
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',')

  num += correctInteger

  if (decimals) {
    num += `.${decimals}`
  }

  return num
}

export function formatNumberWithComma(x) {
  return initCorrectNumber(x, 4)
}