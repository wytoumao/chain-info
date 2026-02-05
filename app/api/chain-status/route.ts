import { NextResponse } from 'next/server';

// 链数据定义
export interface ChainInfo {
  name: string;
  symbol: string;
  category: string;
  explorer: string;
}

const CHAINS: ChainInfo[] = [
  // UTXO链
  { name: 'Bitcoin', symbol: 'BTC', category: 'UTXO', explorer: 'https://blockchair.com/bitcoin' },
  { name: 'Litecoin', symbol: 'LTC', category: 'UTXO', explorer: 'https://blockchair.com/litecoin' },
  { name: 'Dogecoin', symbol: 'DOGE', category: 'UTXO', explorer: 'https://blockchair.com/dogecoin' },
  { name: 'Bitcoin Cash', symbol: 'BCH', category: 'UTXO', explorer: 'https://blockchair.com/bitcoin-cash' },
  
  // EVM主链
  { name: 'Ethereum', symbol: 'ETH', category: 'EVM', explorer: 'https://etherscan.io' },
  { name: 'BNB Smart Chain', symbol: 'BNB', category: 'EVM', explorer: 'https://bscscan.com' },
  { name: 'Avalanche', symbol: 'AVAX', category: 'EVM', explorer: 'https://snowtrace.io' },
  { name: 'Fantom', symbol: 'FTM', category: 'EVM', explorer: 'https://ftmscan.com' },
  { name: 'Cronos', symbol: 'CRO', category: 'EVM', explorer: 'https://cronoscan.com' },
  
  // EVM L2
  { name: 'Polygon', symbol: 'MATIC', category: 'EVM L2', explorer: 'https://polygonscan.com' },
  { name: 'Arbitrum', symbol: 'ARB', category: 'EVM L2', explorer: 'https://arbiscan.io' },
  { name: 'Optimism', symbol: 'OP', category: 'EVM L2', explorer: 'https://optimistic.etherscan.io' },
  { name: 'Base', symbol: 'BASE', category: 'EVM L2', explorer: 'https://basescan.org' },
  { name: 'zkSync Era', symbol: 'ZK', category: 'EVM L2', explorer: 'https://explorer.zksync.io' },
  { name: 'Linea', symbol: 'LINEA', category: 'EVM L2', explorer: 'https://lineascan.build' },
  { name: 'Scroll', symbol: 'SCROLL', category: 'EVM L2', explorer: 'https://scrollscan.com' },
  
  // Non-EVM
  { name: 'Solana', symbol: 'SOL', category: 'Non-EVM', explorer: 'https://solscan.io' },
  { name: 'Tron', symbol: 'TRX', category: 'Non-EVM', explorer: 'https://tronscan.org' },
  { name: 'Ripple', symbol: 'XRP', category: 'Non-EVM', explorer: 'https://xrpscan.com' },
  { name: 'Cardano', symbol: 'ADA', category: 'Non-EVM', explorer: 'https://cardanoscan.io' },
  { name: 'Polkadot', symbol: 'DOT', category: 'Non-EVM', explorer: 'https://polkadot.subscan.io' },
  { name: 'Cosmos', symbol: 'ATOM', category: 'Non-EVM', explorer: 'https://www.mintscan.io/cosmos' },
  { name: 'Sui', symbol: 'SUI', category: 'Non-EVM', explorer: 'https://suiscan.xyz' },
  { name: 'Aptos', symbol: 'APT', category: 'Non-EVM', explorer: 'https://aptoscan.com' },
  { name: 'TON', symbol: 'TON', category: 'Non-EVM', explorer: 'https://tonscan.org' },
  { name: 'Near', symbol: 'NEAR', category: 'Non-EVM', explorer: 'https://nearblocks.io' },
  { name: 'Algorand', symbol: 'ALGO', category: 'Non-EVM', explorer: 'https://algoexplorer.io' },
  { name: 'Stellar', symbol: 'XLM', category: 'Non-EVM', explorer: 'https://stellarchain.io' },
  { name: 'EOS', symbol: 'EOS', category: 'Non-EVM', explorer: 'https://bloks.io' },
  { name: 'Tezos', symbol: 'XTZ', category: 'Non-EVM', explorer: 'https://tzstats.com' },
];

interface ExchangeStatus {
  exchange: string;
  deposit: string;
  withdraw: string;
  available: boolean;
}

// 符号映射表
const SYMBOL_MAP: Record<string, string> = {
  'MATIC': 'MATIC',
  'BASE': 'ETH',
  'ZK': 'ZK',
  'LINEA': 'ETH',
  'SCROLL': 'ETH',
};

// Gate.io
interface GateIOCurrency {
  currency: string;
  delisted: boolean;
  withdraw_disabled: boolean;
  withdraw_delayed: boolean;
  deposit_disabled: boolean;
  trade_disabled: boolean;
}

async function fetchGateIOStatus(symbol: string, retries = 3): Promise<ExchangeStatus> {
  const actualSymbol = SYMBOL_MAP[symbol] || symbol;
  
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch('https://api.gateio.ws/api/v4/spot/currencies', {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0',
        },
        next: { revalidate: 300 },
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
          continue;
        }
        throw new Error(`Gate.io API error: ${response.status}`);
      }

      const data: GateIOCurrency[] = await response.json();
      const currency = data.find(c => c.currency.toUpperCase() === actualSymbol.toUpperCase());

      if (!currency || currency.delisted || currency.trade_disabled) {
        return {
          exchange: 'Gate.io',
          deposit: '不支持',
          withdraw: '不支持',
          available: false,
        };
      }

      const depositStatus = currency.deposit_disabled ? '❌ 关闭' : '✅ 开放';
      const withdrawStatus = currency.withdraw_disabled || currency.withdraw_delayed ? '❌ 关闭' : '✅ 开放';

      return {
        exchange: 'Gate.io',
        deposit: depositStatus,
        withdraw: withdrawStatus,
        available: !currency.deposit_disabled || !currency.withdraw_disabled,
      };
    } catch (error) {
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        continue;
      }
      console.error(`Gate.io error for ${symbol}:`, error);
      return {
        exchange: 'Gate.io',
        deposit: '⚠️ 错误',
        withdraw: '⚠️ 错误',
        available: false,
      };
    }
  }

  return {
    exchange: 'Gate.io',
    deposit: '⚠️ 超时',
    withdraw: '⚠️ 超时',
    available: false,
  };
}

// Binance - 使用公开API
interface BinanceNetwork {
  network: string;
  coin: string;
  withdrawEnable: boolean;
  depositEnable: boolean;
}

async function fetchBinanceStatus(symbol: string): Promise<ExchangeStatus> {
  try {
    const actualSymbol = SYMBOL_MAP[symbol] || symbol;
    
    // Binance公开的币种信息（无需认证）
    const response = await fetch(
      'https://www.binance.com/bapi/asset/v2/public/asset-service/product/get-products',
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0',
        },
        next: { revalidate: 600 }, // 10分钟缓存
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    
    if (!data.data) {
      throw new Error('Invalid response format');
    }

    // 查找币种
    const coin = data.data.find((c: {coin: string}) => 
      c.coin.toUpperCase() === actualSymbol.toUpperCase()
    );

    if (!coin || !coin.networkList || coin.networkList.length === 0) {
      return {
        exchange: 'Binance',
        deposit: '不支持',
        withdraw: '不支持',
        available: false,
      };
    }

    // 检查所有网络，只要有一个开放就算开放
    const hasDepositOpen = coin.networkList.some((n: {depositEnable: boolean}) => n.depositEnable);
    const hasWithdrawOpen = coin.networkList.some((n: {withdrawEnable: boolean}) => n.withdrawEnable);

    return {
      exchange: 'Binance',
      deposit: hasDepositOpen ? '✅ 开放' : '❌ 关闭',
      withdraw: hasWithdrawOpen ? '✅ 开放' : '❌ 关闭',
      available: hasDepositOpen || hasWithdrawOpen,
    };
  } catch (error) {
    console.error(`Binance error for ${symbol}:`, error);
    return {
      exchange: 'Binance',
      deposit: '⚠️ 错误',
      withdraw: '⚠️ 错误',
      available: false,
    };
  }
}

// OKX - 使用公开API
async function fetchOKXStatus(symbol: string): Promise<ExchangeStatus> {
  try {
    const actualSymbol = SYMBOL_MAP[symbol] || symbol;
    
    const response = await fetch('https://www.okx.com/api/v5/asset/currencies', {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0',
      },
      next: { revalidate: 600 },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();

    if (!data.data) {
      throw new Error('Invalid response format');
    }

    // 查找币种的所有链
    const chains = data.data.filter((c: {ccy: string; canDep: boolean; canWd: boolean}) => 
      c.ccy.toUpperCase() === actualSymbol.toUpperCase()
    );

    if (chains.length === 0) {
      return {
        exchange: 'OKX',
        deposit: '不支持',
        withdraw: '不支持',
        available: false,
      };
    }

    // 检查是否有任何链开放
    const hasDepositOpen = chains.some((c: {canDep: boolean}) => c.canDep);
    const hasWithdrawOpen = chains.some((c: {canWd: boolean}) => c.canWd);

    return {
      exchange: 'OKX',
      deposit: hasDepositOpen ? '✅ 开放' : '❌ 关闭',
      withdraw: hasWithdrawOpen ? '✅ 开放' : '❌ 关闭',
      available: hasDepositOpen || hasWithdrawOpen,
    };
  } catch (error) {
    console.error(`OKX error for ${symbol}:`, error);
    return {
      exchange: 'OKX',
      deposit: '⚠️ 错误',
      withdraw: '⚠️ 错误',
      available: false,
    };
  }
}

// Bybit - 使用公开API
async function fetchBybitStatus(symbol: string): Promise<ExchangeStatus> {
  try {
    const actualSymbol = SYMBOL_MAP[symbol] || symbol;
    
    const response = await fetch(
      `https://api.bybit.com/v5/asset/coin/query-info?coin=${actualSymbol}`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0',
        },
        next: { revalidate: 600 },
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();

    if (!data.result || !data.result.rows || data.result.rows.length === 0) {
      return {
        exchange: 'Bybit',
        deposit: '不支持',
        withdraw: '不支持',
        available: false,
      };
    }

    const coin = data.result.rows[0];
    
    if (!coin.chains || coin.chains.length === 0) {
      return {
        exchange: 'Bybit',
        deposit: '不支持',
        withdraw: '不支持',
        available: false,
      };
    }

    // 检查所有链
    const hasDepositOpen = coin.chains.some((c: {chainDeposit: string}) => c.chainDeposit === '1');
    const hasWithdrawOpen = coin.chains.some((c: {chainWithdraw: string}) => c.chainWithdraw === '1');

    return {
      exchange: 'Bybit',
      deposit: hasDepositOpen ? '✅ 开放' : '❌ 关闭',
      withdraw: hasWithdrawOpen ? '✅ 开放' : '❌ 关闭',
      available: hasDepositOpen || hasWithdrawOpen,
    };
  } catch (error) {
    console.error(`Bybit error for ${symbol}:`, error);
    return {
      exchange: 'Bybit',
      deposit: '⚠️ 错误',
      withdraw: '⚠️ 错误',
      available: false,
    };
  }
}

// Bitget - 使用公开API
async function fetchBitgetStatus(symbol: string): Promise<ExchangeStatus> {
  try {
    const actualSymbol = SYMBOL_MAP[symbol] || symbol;
    
    const response = await fetch('https://api.bitget.com/api/v2/spot/public/coins', {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0',
      },
      next: { revalidate: 600 },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();

    if (!data.data) {
      throw new Error('Invalid response format');
    }

    const coin = data.data.find((c: {coin: string; chains?: unknown[]}) => 
      c.coin.toUpperCase() === actualSymbol.toUpperCase()
    );

    if (!coin || !coin.chains || coin.chains.length === 0) {
      return {
        exchange: 'Bitget',
        deposit: '不支持',
        withdraw: '不支持',
        available: false,
      };
    }

    // 检查所有链
    const hasDepositOpen = coin.chains.some((c: {rechargeable: string | boolean}) => c.rechargeable === 'true' || c.rechargeable === true);
    const hasWithdrawOpen = coin.chains.some((c: {withdrawable: string | boolean}) => c.withdrawable === 'true' || c.withdrawable === true);

    return {
      exchange: 'Bitget',
      deposit: hasDepositOpen ? '✅ 开放' : '❌ 关闭',
      withdraw: hasWithdrawOpen ? '✅ 开放' : '❌ 关闭',
      available: hasDepositOpen || hasWithdrawOpen,
    };
  } catch (error) {
    console.error(`Bitget error for ${symbol}:`, error);
    return {
      exchange: 'Bitget',
      deposit: '⚠️ 错误',
      withdraw: '⚠️ 错误',
      available: false,
    };
  }
}

// MEXC - 使用公开API
async function fetchMEXCStatus(symbol: string): Promise<ExchangeStatus> {
  try {
    const actualSymbol = SYMBOL_MAP[symbol] || symbol;
    
    const response = await fetch('https://api.mexc.com/api/v3/capital/config/getall', {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0',
      },
      next: { revalidate: 600 },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error('Invalid response format');
    }

    const coin = data.find((c: {coin: string; networkList?: unknown[]}) => 
      c.coin.toUpperCase() === actualSymbol.toUpperCase()
    );

    if (!coin || !coin.networkList || coin.networkList.length === 0) {
      return {
        exchange: 'MEXC',
        deposit: '不支持',
        withdraw: '不支持',
        available: false,
      };
    }

    // 检查所有网络
    const hasDepositOpen = coin.networkList.some((n: {depositEnable: boolean}) => n.depositEnable);
    const hasWithdrawOpen = coin.networkList.some((n: {withdrawEnable: boolean}) => n.withdrawEnable);

    return {
      exchange: 'MEXC',
      deposit: hasDepositOpen ? '✅ 开放' : '❌ 关闭',
      withdraw: hasWithdrawOpen ? '✅ 开放' : '❌ 关闭',
      available: hasDepositOpen || hasWithdrawOpen,
    };
  } catch (error) {
    console.error(`MEXC error for ${symbol}:`, error);
    return {
      exchange: 'MEXC',
      deposit: '⚠️ 错误',
      withdraw: '⚠️ 错误',
      available: false,
    };
  }
}

export async function GET() {
  try {
    const batchSize = 5; // 减少并发数避免被限流
    const results = [];
    
    for (let i = 0; i < CHAINS.length; i += batchSize) {
      const batch = CHAINS.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(async (chain) => {
          // 并行获取所有交易所状态
          const [gateStatus, binanceStatus, okxStatus, bybitStatus, bitgetStatus, mexcStatus] = 
            await Promise.all([
              fetchGateIOStatus(chain.symbol),
              fetchBinanceStatus(chain.symbol),
              fetchOKXStatus(chain.symbol),
              fetchBybitStatus(chain.symbol),
              fetchBitgetStatus(chain.symbol),
              fetchMEXCStatus(chain.symbol),
            ]);
          
          return {
            ...chain,
            exchanges: {
              'Gate.io': gateStatus,
              'Binance': binanceStatus,
              'OKX': okxStatus,
              'Bybit': bybitStatus,
              'Bitget': bitgetStatus,
              'MEXC': mexcStatus,
            },
          };
        })
      );
      results.push(...batchResults);
      
      // 批次间延迟
      if (i + batchSize < CHAINS.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    return NextResponse.json({
      success: true,
      data: results,
      timestamp: new Date().toISOString(),
      count: results.length,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '获取链状态失败',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
