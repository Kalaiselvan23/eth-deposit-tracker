const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");
async function sendTelegramNotification(message) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  const telegramUrl = `https://api.telegram.org/bot${token}/sendMessage`;
  try {
    await axios.post(telegramUrl, {
      chat_id: chatId,
      text: message,
    });
    console.log("Telegram notification sent successfully");
  } catch (error) {
    console.error("Error sending Telegram notification:", error);
  }
}
module.exports = { sendTelegramNotification };
