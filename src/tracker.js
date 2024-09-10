require("dotenv").config();
const { ethers } = require("ethers");
const { contractAbi } = require("./abi/contractAbi");
const Deposit = require("./models/deposit.model");
const mongoose = require("mongoose");
const { sendTelegramNotification } = require("./utils/NotifyTelegram");
const express = require("express");
const {
  blockCounter,
  depositCounter,
  depositAmountGauge,
  client,
} = require("./metrics/deposit.metric");
const app = express();

client.collectDefaultMetrics({
  timeout: 5000,
});

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

const provider = new ethers.providers.InfuraProvider(
  "mainnet",
  process.env.INFURA_API_KEY
);

const contractAddress = process.env.CONTRACT_ADDRESS;
const contract = new ethers.Contract(contractAddress, contractAbi, provider);

function convertHexToDate(hexTimestamp) {
  const decimalTimestamp = parseInt(hexTimestamp, 16);

  let date;
  if (decimalTimestamp.toString().length === 13) {
    date = new Date(decimalTimestamp);
  } else if (decimalTimestamp.toString().length === 10) {
    date = new Date(decimalTimestamp * 1000);
  } else {
    console.error("Invalid timestamp length, cannot convert to Date.");
    date = new Date();
  }

  return date;
}

contract.on(
  "DepositEvent",
  async (depositor, amount, fee, blockTimestamp, pubkey, event) => {
    console.log(`New deposit detected`);

    const depositData = {
      blockNumber: event.blockNumber,
      blockTimestamp: convertHexToDate(blockTimestamp), 
      fee: ethers.utils.formatEther(fee),
      hash: event.transactionHash,
      pubkey: pubkey,
      depositor: depositor,
      amount: ethers.utils.formatEther(amount),
    };

    try {
      const newDeposit = new Deposit(depositData);
      await newDeposit.save();
      console.log("Deposit details saved to database:", depositData);

      depositCounter.inc();
      depositAmountGauge.inc(parseFloat(depositData.amount));

      const message =
        `🚨 *New Deposit Detected* 🚨\n\n` +
        `💼 *Block Number:* ${depositData.blockNumber}\n` +
        `💰 *Sender:* ${depositData.depositor}\n` +
        `🔑 *Pubkey:* ${depositData.pubkey}\n` +
        `💵 *Amount:* ${depositData.amount} ETH\n` +
        `🛡 *Fee:* ${depositData.fee} ETH\n` +
        `🔗 *Transaction Hash:* [${depositData.hash}](https://etherscan.io/tx/${depositData.hash})`;

      await sendTelegramNotification(message);
    } catch (error) {
      console.error("Error saving deposit to database:", error);
    }
  }
);

provider.on("block", async (blockNumber) => {
  console.log(`New block mined: ${blockNumber}`);

  blockCounter.inc();

  try {
    const block = await provider.getBlockWithTransactions(blockNumber);

    block.transactions.forEach(async (tx) => {
      if (tx.to === contractAddress || tx.from === contractAddress) {
        console.log(`Transaction involving the contract detected:`);

        const transactionData = {
          hash: tx.hash,
          from: tx.from,
          to: tx.to,
          value: ethers.utils.formatEther(tx.value),
          blockNumber: blockNumber,
        };

        console.log(transactionData);

        const message =
          `🚨 *Contract Transaction Detected* 🚨\n\n` +
          `🔗 *Transaction Hash:* [${transactionData.hash}](https://etherscan.io/tx/${transactionData.hash})\n` +
          `📤 *From:* ${transactionData.from}\n` +
          `📥 *To:* ${transactionData.to}\n` +
          `💵 *Value:* ${transactionData.value} ETH\n` +
          `💼 *Block Number:* ${transactionData.blockNumber}`;

        await sendTelegramNotification(message);
      }
    });
  } catch (error) {
    console.error("Error fetching block transactions:", error);
  }
});

connectDB();

app.get("/metrics", async (req, res) => {
  try {
    res.set("Content-Type", client.register.contentType);
    res.send(await client.register.metrics());
  } catch (err) {
    res.status(500).end(err);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
