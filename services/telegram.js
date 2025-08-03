const TelegramBot = require('node-telegram-bot-api');
const { TG_BOT_TOKEN, TG_CHAT_ID } = require('../config');

const bot = new TelegramBot(TG_BOT_TOKEN);

function escapeMarkdownV2(text) {
  return text
    .replace(/([_*\[\]()~`>#+\-=|{}.!])/g, '\\$1'); // 全部加上反斜杠
}

async function sendTelegramMessage(message) {
  try {
    await bot.sendMessage(TG_CHAT_ID, message, { parse_mode: 'MarkdownV2' });
  } catch (err) {
    console.error('Telegram Send Error:', err.message);
  }
}

module.exports = { sendTelegramMessage, escapeMarkdownV2 };
