import { NextResponse } from 'next/server';

// 链数据定义
export interface ChainInfo {
  name: string;
  symbol: string;
  category: string;
  explorer: string;
}

const CHAINS: ChainInfo[] = [
  { name: 'Bitcoin', symbol: 'BTC', category: 'UTXO', explorer: 'https://blockchair.com/bitcoin' },
  { name: 'Ethereum', symbol: 'ETH', category: 'EVM', explorer: 'https://etherscan.io' },
  { name: 'BNB Smart Chain', symbol: 'BNB', category: 'EVM', explorer: 'https://bscscan.com' },
  { name: 'Polygon', symbol: 'MATIC', category: 'EVM L2', explorer: 'https://polygonscan.com' },
  { name: 'Arbitrum', symbol: 'ARB', category: 'EVM L2', explorer: 'https://arbiscan.io' },
  { name: 'Optimism', symbol: 'OP', category: 'EVM L2', explorer: 'https://optimistic.etherscan.io' },
  { name: 'Avalanche', symbol: 'AVAX', category: 'EVM', explorer: 'https://snowtrace.io' },
  { name: 'Solana', symbol: 'SOL', category: 'Non-EVM', explorer: 'https://solscan.io' },
  { name: 'Tron', symbol: 'TRX', category: 'Non-EVM', explorer: 'https://tronscan.org' },
  { name: 'Litecoin', symbol: 'LTC', category: 'UTXO', explorer: 'https://blockchair.com/litecoin' },
  { name: 'Dogecoin', symbol: 'DOGE', category: 'UTXO', explorer: 'https://blockchair.com/dogecoin' },
  { name: 'Ripple', symbol: 'XRP', category: 'Non-EVM', explorer: 'https://xrpscan.com' },
  { name: 'Cardano', symbol: 'ADA', category: 'Non-EVM', explorer: 'https://cardanoscan.io' },
  { name: 'Base', symbol: 'BASE', category: 'EVM L2', explorer: 'https://basescan.org' },
  { name: 'zkSync', symbol: 'ZK', category: 'EVM L2', explorer: 'https://explorer.zksync.io' },
];

interface GateIOCurrency {
  currency: string;
  delisted: boolean;
  withdraw_disabled: boolean;
  withdraw_delayed: boolean;
  deposit_disabled: boolean;
  trade_disabled: boolean;
}

interface ExchangeStatus {
  exchange: string;
  deposit: string;
  withdraw: string;
  available: boolean;
}

async function fetchGateIOStatus(symbol: string): Promise<ExchangeStatus> {
  try {
    const response = await fetch('https://api.gateio.ws/api/v4/spot/currencies', {
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      throw new Error(`Gate.io API error: ${response.status}`);
    }

    const data: GateIOCurrency[] = await response.json();
    const currency = data.find(c => c.currency.toUpperCase() === symbol.toUpperCase());

    if (!currency) {
      return {
        exchange: 'Gate.io',
        deposit: 'Not Supported',
        withdraw: 'Not Supported',
        available: false,
      };
    }

    const depositStatus = currency.deposit_disabled ? '❌ Disabled' : '✅ Open';
    const withdrawStatus = currency.withdraw_disabled || currency.withdraw_delayed 
      ? '❌ Disabled' 
      : '✅ Open';

    return {
      exchange: 'Gate.io',
      deposit: depositStatus,
      withdraw: withdrawStatus,
      available: !currency.delisted && !currency.trade_disabled,
    };
  } catch (error) {
    console.error('Gate.io API error:', error);
    return {
      exchange: 'Gate.io',
      deposit: '⚠️ Error',
      withdraw: '⚠️ Error',
      available: false,
    };
  }
}

export async function GET() {
  try {
    // 并发获取所有链的状态
    const results = await Promise.all(
      CHAINS.map(async (chain) => {
        const gateStatus = await fetchGateIOStatus(chain.symbol);
        
        return {
          ...chain,
          exchanges: {
            'Gate.io': gateStatus,
            'Binance': { exchange: 'Binance', deposit: 'Coming Soon', withdraw: 'Coming Soon', available: false },
            'OKX': { exchange: 'OKX', deposit: 'Coming Soon', withdraw: 'Coming Soon', available: false },
            'Bybit': { exchange: 'Bybit', deposit: 'Coming Soon', withdraw: 'Coming Soon', available: false },
            'Bitget': { exchange: 'Bitget', deposit: 'Coming Soon', withdraw: 'Coming Soon', available: false },
            'MEXC': { exchange: 'MEXC', deposit: 'Coming Soon', withdraw: 'Coming Soon', available: false },
          },
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch chain status' },
      { status: 500 }
    );
  }
}
