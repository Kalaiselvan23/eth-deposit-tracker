const client = require("prom-client");
const depositCounter = new client.Counter({
  name: "total_deposits",
  help: "Total number of deposits made",
});

const depositAmountGauge = new client.Gauge({
  name: "total_deposit_amount",
  help: "Total amount of ETH deposited",
});

const blockCounter = new client.Counter({
  name: "block_counter",
  help: "Total number of blocks mined",
});

module.exports = { depositAmountGauge, depositCounter, blockCounter, client };
