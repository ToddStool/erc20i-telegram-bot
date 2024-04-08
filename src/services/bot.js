import { Telegraf } from 'telegraf'
import config from '../config.js'

const bot = new Telegraf(config.TELEGRAM_BOT_TOKEN)

bot.launch()

export default bot