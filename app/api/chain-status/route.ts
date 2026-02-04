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

interface GateIOCurrency {
  currency: string;
  delisted: boolean;
  withdraw_disabled: boolean;
  withdraw_delayed: boolean;
  deposit_disabled: boolean;
  trade_disabled: boolean;
  chain?: string;
}

interface ExchangeStatus {
  exchange: string;
  deposit: string;
  withdraw: string;
  available: boolean;
}

// 符号映射表（处理Gate.io的特殊命名）
const SYMBOL_MAP: Record<string, string> = {
  'MATIC': 'MATIC',
  'BASE': 'ETH', // Base使用ETH
  'ZK': 'ZK',
  'LINEA': 'ETH', // Linea使用ETH
  'SCROLL': 'ETH', // Scroll使用ETH
};

async function fetchGateIOStatus(symbol: string, retries = 3): Promise<ExchangeStatus> {
  const actualSymbol = SYMBOL_MAP[symbol] || symbol;
  
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch('https://api.gateio.ws/api/v4/spot/currencies', {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (compatible; ChainInfo/1.0)',
        },
        next: { revalidate: 300 }, // Cache for 5 minutes
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      if (!response.ok) {
        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
          continue;
        }
        throw new Error(`Gate.io API error: ${response.status}`);
      }

      const data: GateIOCurrency[] = await response.json();
      const currency = data.find(c => c.currency.toUpperCase() === actualSymbol.toUpperCase());

      if (!currency) {
        return {
          exchange: 'Gate.io',
          deposit: '不支持',
          withdraw: '不支持',
          available: false,
        };
      }

      // 检查是否被下架
      if (currency.delisted || currency.trade_disabled) {
        return {
          exchange: 'Gate.io',
          deposit: '❌ 已下架',
          withdraw: '❌ 已下架',
          available: false,
        };
      }

      const depositStatus = currency.deposit_disabled ? '❌ 关闭' : '✅ 开放';
      const withdrawStatus = currency.withdraw_disabled || currency.withdraw_delayed 
        ? '❌ 关闭' 
        : '✅ 开放';

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
      console.error(`Gate.io API error for ${symbol}:`, error);
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

export async function GET() {
  try {
    // 并发获取所有链的状态，限制并发数量避免API限流
    const batchSize = 10;
    const results = [];
    
    for (let i = 0; i < CHAINS.length; i += batchSize) {
      const batch = CHAINS.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(async (chain) => {
          const gateStatus = await fetchGateIOStatus(chain.symbol);
          
          return {
            ...chain,
            exchanges: {
              'Gate.io': gateStatus,
              'Binance': { 
                exchange: 'Binance', 
                deposit: '即将支持', 
                withdraw: '即将支持', 
                available: false 
              },
              'OKX': { 
                exchange: 'OKX', 
                deposit: '即将支持', 
                withdraw: '即将支持', 
                available: false 
              },
              'Bybit': { 
                exchange: 'Bybit', 
                deposit: '即将支持', 
                withdraw: '即将支持', 
                available: false 
              },
              'Bitget': { 
                exchange: 'Bitget', 
                deposit: '即将支持', 
                withdraw: '即将支持', 
                available: false 
              },
              'MEXC': { 
                exchange: 'MEXC', 
                deposit: '即将支持', 
                withdraw: '即将支持', 
                available: false 
              },
            },
          };
        })
      );
      results.push(...batchResults);
      
      // 避免API限流，批次间加延迟
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
