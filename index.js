const {ethers} = require("ethers");
const RG_ABI = require('./contracts/RG.json');
const RUC_ABI = require('./contracts/RUC.json');
const RGGame_ABI = require('./contracts/RGGame.json');
const PancakeSwap_ABI = require('./contracts/PancakeSwap.json');
const {sendTelegramMessage, escapeMarkdownV2} = require('./services/telegram');
const {
  BSC_RPC_WSS,
  RG_CONTRACT_ADDRESS,
  RUC_CONTRACT_ADDRESS,
  RG_GAME_CONTRACT_ADDRESS,
  RG_RUC_PANCAKE_SWAP,
  RG_USDT_PANCAKE_SWAP,
  THRESHOLDS
} = require('./config');

const provider = new ethers.providers.WebSocketProvider(BSC_RPC_WSS);

const RGContract = new ethers.Contract(RG_CONTRACT_ADDRESS, RG_ABI, provider);
const RUCContract = new ethers.Contract(RUC_CONTRACT_ADDRESS, RUC_ABI, provider);
const RGGame = new ethers.Contract(RG_GAME_CONTRACT_ADDRESS, RGGame_ABI, provider);
const RG_RUC_PANCAKE = new ethers.Contract(RG_RUC_PANCAKE_SWAP, PancakeSwap_ABI, provider);
const RG_USDT_PANCAKE = new ethers.Contract(RG_USDT_PANCAKE_SWAP, PancakeSwap_ABI, provider);

const getHashURL = (hash) => `https://bscscan.com/tx/${hash}`;

function formatAmount(value, decimals = 18) {
  return parseFloat(ethers.utils.formatUnits(value, decimals)).toFixed(2);
}

function now() {
  return new Date().toISOString().replace('T', ' ').slice(0, 19);
}

// 监听铸造事件
RGGame.on("PairedTokenMinted", async (user, token, amountIn, pairedTokenAddress, amountOut, signContext, signature, event) => {
  const txHash = event.transactionHash;
  const amountInStr = formatAmount(amountIn);
  const amountOutStr = formatAmount(amountOut);
  if (token === RG_CONTRACT_ADDRESS && amountInStr >= THRESHOLDS.MINT_RG) {
    const message = `
———✅铸造RUC✅———
[${now()}]
✅Token: RUC
✅铸造地址: ${user}
✅铸造消耗RG：${amountInStr} RG
✅获得RUC: ${amountOutStr} RUC
✅交易哈希：${getHashURL(txHash)} `
    await sendTelegramMessage(escapeMarkdownV2(message));
  }
});

// 监听提现事件
RGGame.on("WithdrawRequest", async (user, token, amount, timestamp, event) => {
  const txHash = event.transactionHash;
  const amountInStr = formatAmount(amount);
  if (token === RUC_CONTRACT_ADDRESS && amountInStr >= THRESHOLDS.WITHDRAW_RUC) {
    const message = `
———✅提现RUC✅———
[${now()}]
✅Token: RUC
✅提现地址: ${user}
✅提现数量：${amountInStr} USDT
✅交易哈希：${getHashURL(txHash)} `
    await sendTelegramMessage(escapeMarkdownV2(message));
  }
});

// 监听 RUC-RG Swap2
RG_RUC_PANCAKE.on('Swap', async (sender, amount0In, amount1In, amount0Out, amount1Out, to, event) => {
  const txHash = event.transactionHash;

  const amount0InFmt = formatAmount(amount0In);   // 卖出RUC数量
  const amount1OutFmt = formatAmount(amount1Out); // 获得RG数量

  if (amount0InFmt >= THRESHOLDS.SWAP_RUC_SELL){
    const message = `
———✅卖出RUC—SWAP2✅———
[${now()}]
✅Token: RUC
✅卖出地址: ${sender}
✅卖出：${amount0InFmt} RUC
✅获得: ${amount1OutFmt} RG
✅当前价格: ${(amount0InFmt / amount1OutFmt).toFixed(4)} RG
✅日内涨幅: --
✅交易哈希：${getHashURL(txHash)} `
    await sendTelegramMessage(escapeMarkdownV2(message.trim()));
  }
});

// 监听 USDT-RG Swap1
RG_USDT_PANCAKE.on('Swap', async (sender, amount0In, amount1In, amount0Out, amount1Out, to, event) => {
  const txHash = event.transactionHash;

  const amount0InFmt = formatAmount(amount0In);    // 买入RG的USDT数量
  const amount1OutFmt = formatAmount(amount1Out);  // 获得RG数量
  const amount1InFmt = formatAmount(amount1In);    // 卖出RG数量
  const amount0OutFmt = formatAmount(amount0Out);  // 获得USDT数量

  if (amount0InFmt >= THRESHOLDS.SWAP_RG_BUY_USDT){
    const message = `
———✅买入RG—SWAP1✅———
[${now()}]
✅Token: RG
✅购买地址: ${sender}
✅买入：${amount0InFmt} USDT
✅购得: ${amount1OutFmt} RG
✅当前价格: ${(amount0InFmt / amount1OutFmt).toFixed(4)} USDT
✅日内涨幅: --
✅交易哈希：${getHashURL(txHash)}`
    await sendTelegramMessage(escapeMarkdownV2(message.trim()));
  }

  if (amount0OutFmt >= THRESHOLDS.SWAP_RG_SELL_USDT){
    const message = `
———✅卖出RG—SWAP1✅———
[${now()}]
✅Token: RG
✅卖出地址: ${sender}
✅卖出：${amount1InFmt} RG
✅获得: ${amount0OutFmt} USDT
✅当前价格: ${(amount0OutFmt / amount1InFmt).toFixed(4)} USDT
✅日内涨幅: --
✅交易哈希：${getHashURL(txHash)}`
    await sendTelegramMessage(escapeMarkdownV2(message.trim()));
  }
});

console.log('监听中...');
