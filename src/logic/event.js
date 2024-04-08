import fs from 'fs'
import { convertSvgToPng } from '../helpers/image.js'
import web3 from '../services/web3.js'
import Contract from '../services/contract.js'
import { formatNumberWithComma } from '../utils/number.js'
import { decimalsOff } from '../utils/token.js'
import { shortAddress } from '../utils/address.js'
import tokenContractAbi from '../../abis/token.json' assert { type: 'json' }
import { notifyInTelegram } from '../helpers/telegram.js'
import config from '../config.js'

let lastBlockNumber = null

export async function fetchTransferEvents() {
  try {
    const currentBlockNumber = await web3.eth.getBlockNumber()

    if (!lastBlockNumber || lastBlockNumber === currentBlockNumber) {
      return lastBlockNumber = currentBlockNumber
    }

    const contract = new Contract(config.CONTRACT_ADDRESS, tokenContractAbi)

    const events = await contract.getPastEvents('Transfer', {
      fromBlock: lastBlockNumber,
      toBlock: currentBlockNumber,
    })

    lastBlockNumber = currentBlockNumber

    for (let event of events) {
      try {
        await onTransferEvent(event)
      } catch (e) {
        console.log(e)
      }
    }
  } catch (e) {
    console.log(e)
  }
}

export async function onTransferEvent(event) {
  const contract = new Contract(config.CONTRACT_ADDRESS, tokenContractAbi)
  const transaction = await web3.eth.getTransaction(event.transactionHash)
  const values = event.returnValues

  const address = values.to

  if (transaction.from !== address) {
    return
  }

  const currentSpores = await contract.call('sporesDegree', [address])

  if (!Number(currentSpores.seed)) {
    return
  }

  let [
    sporesSvg,
    sporesMeta,
    holdersAmount,
    totalSporesAmount,
    totalMushroomAmount,
  ] = await Promise.all([
    contract.call('getSvg', [currentSpores]),
    contract.call('getMeta', [currentSpores]),
    contract.call('holdersCount'),
    contract.call('sporesTotalCount'),
    contract.call('mushroomsTotalCount'),
  ])

  sporesMeta = JSON.parse(sporesMeta)

  const totalInscriptionAmount = Number(totalSporesAmount) + Number(totalMushroomAmount)
  const spentAmount = decimalsOff(transaction.value, 18)
  const currentSporesSeed = currentSpores.seed
  const buyAmount = decimalsOff(values.value, 9)
  const txHash = event.transactionHash

  const imageName = 'inscription.png'
  await fs.writeFileSync('inscription.svg', sporesSvg)
  await convertSvgToPng('inscription.svg', imageName)

  const messageText = generateMessageText({
    totalInscriptionAmount,
    spentAmount,
    currentSporesSeed,
    buyAmount,
    address,
    sporesMeta,
    holdersAmount,
    txHash,
  })

  await notifyInTelegram(messageText, imageName)
}

function generateMessageText({
  totalInscriptionAmount,
  spentAmount,
  currentSporesSeed,
  buyAmount,
  address,
  sporesMeta,
  holdersAmount,
  txHash,
}) {
  const gotAmount = formatNumberWithComma(buyAmount)

  const textAsArray = [
    `*${config.TOKEN_NAME} Buy! 🍄🍄🍄🍄🍄🍄🍄🍄🍄🍄*\n\n`,

    `🍄 *Got*: _${gotAmount} ${config.TOKEN_NAME}_\n`,

    Number(spentAmount)
      ? `🔷 *Spent*: _${formatNumberWithComma(spentAmount)} ETH_\n`
      : '',

    `🧙‍♂️ *Buyer*: [${shortAddress(address)}](${config.EXPLORER_URL}/address/${address})\n`,

    `🌠 *Current Seed*: _${formatNumberWithComma(currentSporesSeed)} (Level ${sporesMeta.level})_\n`,

    `👥 *Holders*: _${formatNumberWithComma(holdersAmount)}_\n`,

    `🧩 *Inscriptions*: _${formatNumberWithComma(totalInscriptionAmount)}_\n\n`,

    [
      `[TX](${config.EXPLORER_URL}/tx/${txHash})`,
      `[Buy](https://app.uniswap.org/swap?inputCurrency=eth&outputCurrency=${config.CONTRACT_ADDRESS}&chain=${config.CHAIN_NAME})`,
      `[Chart](https://www.dextools.io/app/en/base/pair-explorer/${config.PAIR_ADDRESS})`,
      `[Explore](${config.WEBSITE_URL})`,
    ].join(' | ')
  ]

  return textAsArray.join('')
}
