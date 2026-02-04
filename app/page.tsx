'use client';

import { useEffect, useState } from 'react';

interface ExchangeStatus {
  exchange: string;
  deposit: string;
  withdraw: string;
  available: boolean;
}

interface ChainData {
  name: string;
  symbol: string;
  category: string;
  explorer: string;
  exchanges: Record<string, ExchangeStatus>;
}

interface ApiResponse {
  success: boolean;
  data: ChainData[];
  timestamp: string;
}

export default function Home() {
  const [data, setData] = useState<ChainData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/chain-status');
      const result: ApiResponse = await response.json();
      
      if (result.success) {
        setData(result.data);
        setLastUpdate(new Date(result.timestamp).toLocaleString());
      } else {
        setError('Failed to fetch data');
      }
    } catch (err) {
      setError('Network error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const exchanges = ['Gate.io', 'Binance', 'OKX', 'Bybit', 'Bitget', 'MEXC'];

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
            🔗 Chain Info Dashboard
          </h1>
          <p className="text-gray-400 text-lg">
            交易所充提状态实时监控 - MVP版本
          </p>
          {lastUpdate && (
            <p className="text-gray-500 text-sm mt-2">
              Last updated: {lastUpdate}
            </p>
          )}
        </div>

        {/* Refresh Button */}
        <div className="mb-6 flex justify-center">
          <button
            onClick={fetchData}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            {loading ? '🔄 Loading...' : '🔄 Refresh Data'}
          </button>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-400 text-center">
            ⚠️ {error}
          </div>
        )}

        {/* Loading State */}
        {loading && data.length === 0 && (
          <div className="text-center text-gray-400 py-20">
            <div className="animate-spin text-6xl mb-4">⚙️</div>
            <p>Loading chain data...</p>
          </div>
        )}

        {/* Data Grid */}
        {!loading && data.length > 0 && (
          <div className="space-y-6">
            {data.map((chain) => (
              <div
                key={chain.symbol}
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-gray-700 hover:border-gray-600 transition-all duration-200"
              >
                {/* Chain Header */}
                <div className="mb-4 pb-4 border-b border-gray-700">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">
                        {chain.name} ({chain.symbol})
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-purple-600/30 text-purple-300 rounded-full text-sm font-medium">
                          {chain.category}
                        </span>
                        <a
                          href={chain.explorer}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 bg-blue-600/30 text-blue-300 rounded-full text-sm font-medium hover:bg-blue-600/50 transition-colors"
                        >
                          🔍 Explorer
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Exchange Status Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {exchanges.map((exchangeName) => {
                    const status = chain.exchanges[exchangeName];
                    return (
                      <div
                        key={exchangeName}
                        className="bg-gray-700/30 rounded-lg p-4 border border-gray-600"
                      >
                        <h3 className="font-semibold text-white mb-3 text-lg">
                          {exchangeName}
                        </h3>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400 text-sm">Deposit:</span>
                            <span className="font-medium text-sm">{status.deposit}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400 text-sm">Withdraw:</span>
                            <span className="font-medium text-sm">{status.withdraw}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>MVP Version - Gate.io API Integrated</p>
          <p className="mt-2">Other exchanges coming soon (需要 cookies 或 API keys)</p>
        </div>
      </div>
    </main>
  );
}
