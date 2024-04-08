import Web3 from 'web3'
import config from '../config.js'

const web3 = new Web3(new Web3.providers.HttpProvider(config.PROVIDER_URL))

export default web3