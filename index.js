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
  RG_RUC_PANCAKE_SWAP
} = require('./config');


const provider = new ethers.providers.WebSocketProvider(BSC_RPC_WSS);

const RGContract = new ethers.Contract(RG_CONTRACT_ADDRESS, RG_ABI, provider);
const RUCContract = new ethers.Contract(RUC_CONTRACT_ADDRESS, RUC_ABI, provider);
const RGGame = new ethers.Contract(RG_GAME_CONTRACT_ADDRESS, RGGame_ABI, provider);
const RG_RUC_PANCAKE = new ethers.Contract(RG_RUC_PANCAKE_SWAP, PancakeSwap_ABI, provider);

const token0 = RUC_CONTRACT_ADDRESS;
const token1 = RG_CONTRACT_ADDRESS;

function formatAmount(value, decimals = 18) {
  return ethers.utils.formatUnits(value, decimals);
}

function now() {
  return new Date().toISOString().replace('T', ' ').slice(0, 19);
}

// 监听RG Transfer事件
// RGContract.on('Transfer', async (from, to, amount, event) => {
//   const amountStr = formatAmount(amount);
//   const txHash = event.transactionHash;
//
//   if (parseFloat(amountStr) * 0.7 >= 5000) {
//     const direction = from === RG_CONTRACT_ADDRESS ? '铸造RG' : (to === RG_CONTRACT_ADDRESS ? '销毁RG' : '转账RG');
//     const message = `———${direction}——— [${now()}]\nToken: RG\nFrom: ${from}\nTo: ${to}\n数量: ${amountStr} RG\n交易哈希: ${txHash}`;
//     console.log(message);
//     await sendTelegramMessage(message);
//   }
// });

// 监听RUC Transfer事件
// RUCContract.on('Transfer', async (from, to, amount, event) => {
//   const amountStr = formatAmount(amount);
//   const txHash = event.transactionHash;
//
//   if (parseFloat(amountStr) * 0.7 >= 5000) {
//     const direction = from === RUC_CONTRACT_ADDRESS ? '铸造RUC' : (to === RUC_CONTRACT_ADDRESS ? '销毁RUC' : '转账RUC');
//     const message = `———${direction}——— [${now()}]\nToken: RUC\nFrom: ${from}\nTo: ${to}\n数量: ${amountStr} RUC\n交易哈希: ${txHash}`;
//     console.log(message);
//     await sendTelegramMessage(message);
//   }
// });

RGGame.on("PairedTokenMinted", async (user, token, amountIn, pairedTokenAddress, amountOut, signContext, signature, event) => {
  const txHash = event.transactionHash;
  const amountInStr = Number(formatAmount(amountIn));
  const amountOutStr = formatAmount(amountOut);
  if (token === RG_CONTRACT_ADDRESS && amountInStr > 1000) {
    const txUrl = `https://bscscan.com/tx/${txHash}`;
    const message = `
    ⚠️⚠️⚠️大额RUC铸造警告⚠️⚠️⚠️\n
    [${now()}]\n
    Token: RUC\n
    用户：${user}\n
    铸造数量: ${amountOutStr} RUC\n
    消耗RG数量: ${amountInStr} RG\n
    交易哈希:\n
    ${txUrl}`;
    await sendTelegramMessage(escapeMarkdownV2(message));
  }
})

RGGame.on("WithdrawRequest", async (user, token, amount, timestamp, event) => {
  const txHash = event.transactionHash;
  const amountInStr = Number(formatAmount(amount));
  if (token === RUC_CONTRACT_ADDRESS && amountInStr >= 500000000) {
    const txUrl = `https://bscscan.com/tx/${txHash}`;
    const message = `
    ⚠️⚠️⚠️大额提现警告⚠️⚠️⚠️\n
    [${now()}]\n
    Token: RUC\n
    用户：${user}\n
    提现数量: ${amountInStr} RUC\n
    交易哈希:\n
    ${txUrl}`;
    await sendTelegramMessage(escapeMarkdownV2(message));
  }
})

RGGame.on("Deposit", async (user, token, amount, timestamp, event) => {
  const txHash = event.transactionHash;
  const amountInStr = Number(formatAmount(amount));
  if (token === RG_CONTRACT_ADDRESS && amountInStr >= 10) {
    const txUrl = `https://bscscan.com/tx/${txHash}`;
    const message = `
    ⚠️⚠️⚠️RG大额买入⚠️⚠️⚠️\n
    [${now()}]\n
    Token: RG\n
    用户：${user}\n
    买入数量: ${amountInStr} USDT\n
    交易哈希:\n
    ${txUrl}`;
    await sendTelegramMessage(escapeMarkdownV2(message));
  }
})


RG_RUC_PANCAKE.on('Swap', async (sender, amount0In, amount1In, amount0Out, amount1Out, to, event) => {
  const txHash = event.transactionHash;

  // 格式化数量
  const amount0InFmt = parseFloat(ethers.utils.formatUnits(amount0In, 18));
  const amount1InFmt = parseFloat(ethers.utils.formatUnits(amount1In, 18));
  const amount0OutFmt = parseFloat(ethers.utils.formatUnits(amount0Out, 18));
  const amount1OutFmt = parseFloat(ethers.utils.formatUnits(amount1Out, 18));

  // 判断 token0 / token1 是谁
  const token0Symbol = token0.toLowerCase() === RG_CONTRACT_ADDRESS.toLowerCase() ? 'RG' : 'RUC';
  const token1Symbol = token1.toLowerCase() === RG_CONTRACT_ADDRESS.toLowerCase() ? 'RG' : 'RUC';

  let actionStr = '';
  let sellToken = '';
  let sellAmount = 0;
  let buyToken = '';
  let buyAmount = 0;

  // 判断买入 or 卖出
  if (amount0In.gt(0)) {
    // 卖出 token0，买入 token1
    sellToken = token0Symbol;
    sellAmount = amount0InFmt;
    buyToken = token1Symbol;
    buyAmount = amount1OutFmt;
  } else if (amount1In.gt(0)) {
    // 卖出 token1，买入 token0
    sellToken = token1Symbol;
    sellAmount = amount1InFmt;
    buyToken = token0Symbol;
    buyAmount = amount0OutFmt;
  }

  // 构造推送内容
  actionStr = sellToken === 'RG' ? 'RG卖出' : 'RG买入';

  if( sellToken === "RUC" && sellAmount < 500000000 ){
    return;
  }

  if( sellToken === "RG" && sellAmount < 1000 ){
    return;
  }

  const txUrl = `https://bscscan.com/tx/${txHash}`;
  const message = `
      ⚠️⚠️⚠️ ${actionStr} 预警 ⚠️⚠️⚠️
      [${now()}]
      卖出: ${sellAmount} ${sellToken}
      买入: ${buyAmount} ${buyToken}
      用户地址: ${sender}
      交易哈希:
      ${txUrl}
  `;

  await sendTelegramMessage(escapeMarkdownV2(message.trim()));
});


// 监听RUC PoolDeflated事件
RUCContract.on('PoolDeflated', async (amount, timestamp, event) => {
  const amountStr = formatAmount(amount);
  const txHash = event.transactionHash;

  const message = `———池子销毁——— [${now()}]\nToken: RUC\n销毁数量: ${amountStr} RUC\n区块时间: ${new Date(timestamp.toNumber() * 1000).toLocaleString()}\n交易哈希: ${txHash}`;
  console.log(message);
  await sendTelegramMessage(message);
});

console.log('监听中...');
