module.exports = {
  BSC_RPC_WSS: 'wss://virulent-thrumming-hexagon.bsc.quiknode.pro/caefd126bca27e54cda798bd992d60ec4871cfd4/', // 换成稳定的 wss 节点
  RG_CONTRACT_ADDRESS: '0x6DFd6cBd57E849bB64509020d0E343b2210e08E4',
  RUC_CONTRACT_ADDRESS: '0x22aF04b2F457852eD5678Fb1a5AC9F4D8004E3bf',
  RG_GAME_CONTRACT_ADDRESS: '0xf6727647231e008B2aF4bD1C1EAB0038E09Ed998',
  RG_RUC_PANCAKE_SWAP: "0x8314217C52ee4ed4fd20A0d12C73f39FaA037104",
  RG_USDT_PANCAKE_SWAP: "0x4f4B429D9cC7F0333e7FC7b441B21eE6183ce2a7",
  TG_BOT_TOKEN: '', // Bot token
  TG_CHAT_ID: '', // 会话ID
  // === 事件监控门槛 ===
  THRESHOLDS: {
    // MINT_RG: 10000,         // 铸造RG消耗阈值
    // WITHDRAW_RUC: 100000000, // 提现RUC数量阈值
    // SWAP_RUC_SELL: 100000000, // Swap2 卖出RUC数量阈值
    // SWAP_RG_BUY_USDT: 5000,    // Swap1 使用USDT买入RG数量阈值
    // SWAP_RG_SELL_USDT: 10000,   // Swap1 卖出RG获得USDT数量阈值
    MINT_RG: 1,         // 铸造RG消耗阈值
    WITHDRAW_RUC: 1, // 提现RUC数量阈值
    SWAP_RUC_SELL: 1, // Swap2 卖出RUC数量阈值
    SWAP_RG_BUY_USDT: 1,    // Swap1 使用USDT买入RG数量阈值
    SWAP_RG_SELL_USDT: 1   // Swap1 卖出RG获得USDT数量阈值
  }
};
