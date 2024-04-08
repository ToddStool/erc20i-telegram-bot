import bot from '../services/bot.js'
import config from '../config.js'

export async function notifyInTelegram(text, imageName) {
  return bot.telegram.sendPhoto(
    config.TELEGRAM_CHAT_ID,
    { source: imageName },
    {
      caption: text,
      parse_mode: 'Markdown',
    },
  )
}