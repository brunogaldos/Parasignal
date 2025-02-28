const { Telegraf } = require("telegraf");
const axios = require("axios");
require("dotenv").config();
const LocalSession = require("telegraf-session-local");

const token = process.env.BOT;

const bot = new Telegraf(token);

// Enable session middleware
bot.use(new LocalSession({ database: "session_db.json" }).middleware());

bot.start((ctx) => {
  ctx.reply(
    `Welcome ${ctx.from.first_name}! Use the command /setuptrade <your email> to setup the wallet for the Crypto Agent.`
  );
});

bot.command("setuptrade", async (ctx) => {
  const args = ctx.message.text.split(" ");

  if (args.length !== 2) {
    return ctx.reply(
      "❌ Please provide an email: `/setuptrade your@email.com`"
    );
  }

  const email = args[1]; // Extract email from command
  ctx.session.email = email; // Store email in session

  try {
    const response = await axios.post(
      "http://localhost:3000/examples/wallets/pregen/create",
      { email }
    );

    let walletAddress = response.data.address;

    if (response.data) {
      ctx.reply(
        `🎉 New wallet created for ${email}!!\n🔗 Address: ${walletAddress}\nUse to send tokens to wallet /sendPol <wallet address recipient> <pol amount>
 `
      );
    } else {
      ctx.reply("Something went wrong while creating the wallet.");
    }
  } catch (error) {
    console.error("Error creating wallet:", error);
    ctx.reply("Failed to create wallet. Please try again later.");
  }
});

// Command to send POL
bot.command("sendPol", async (ctx) => {
  try {
    // Ensure user has set an email
    const email = ctx.session.email;

    if (!email) {
      ctx.reply("❌ Please set your email first using: /setEmail <your-email>");
      return;
    }

    // Extract wallet address & amount
    const parts = ctx.message.text.split(" ");
    if (parts.length !== 3) {
      ctx.reply("❌ Usage: /sendPol <wallet_address> <amount>");
      return;
    }
    const recipientAddress = parts[1];
    const amountInPOL = parts[2];

    // Validate amount (must be a valid number)
    if (isNaN(amountInPOL) || Number(amountInPOL) <= 0) {
      ctx.reply("❌ Invalid amount. Please enter a positive number.");
      return;
    }

    // Prepare JSON request body
    const requestData = {
      email,
      recipientAddress,
      amountInPOL,
    };

    // Call API
    const response = await axios.post(
      "http://localhost:3000/examples/para/pregen",
      requestData,
      { headers: { "Content-Type": "application/json" } }
    );

    // Send response back to user
    ctx.reply(`✅ Transaction Sent! Hash: ${response.data.transactionHash}`);
  } catch (error) {
    console.error("Error sending POL:", error);
    ctx.reply("❌ Transaction failed. Check logs for details.");
  }
});

bot
  .launch()
  .then(() => console.log("Bot started successfully"))
  .catch((err) => console.error("Bot launch error:", err));
