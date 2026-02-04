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
  const [filteredData, setFilteredData] = useState<ChainData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/chain-status');
      const result: ApiResponse = await response.json();
      
      if (result.success) {
        setData(result.data);
        setFilteredData(result.data);
        setLastUpdate(new Date(result.timestamp).toLocaleString('zh-CN', {
          timeZone: 'Asia/Shanghai',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }));
      } else {
        setError('获取数据失败，请稍后重试');
      }
    } catch (err) {
      setError('网络错误，请检查连接');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // 自动刷新：每5分钟
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // 搜索和筛选
  useEffect(() => {
    let filtered = data;
    
    if (searchTerm) {
      filtered = filtered.filter(chain =>
        chain.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chain.symbol.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (categoryFilter !== 'All') {
      filtered = filtered.filter(chain => chain.category === categoryFilter);
    }
    
    setFilteredData(filtered);
  }, [searchTerm, categoryFilter, data]);

  const exchanges = ['Gate.io', 'Binance', 'OKX', 'Bybit', 'Bitget', 'MEXC'];
  const categories = ['All', ...Array.from(new Set(data.map(c => c.category)))];

  const getStatusIcon = (status: string) => {
    if (status.includes('✅') || status.includes('Open')) {
      return <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>;
    } else if (status.includes('❌') || status.includes('Disabled')) {
      return <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-2"></span>;
    } else if (status.includes('⚠️') || status.includes('Error')) {
      return <span className="inline-block w-2 h-2 rounded-full bg-yellow-500 mr-2"></span>;
    } else {
      return <span className="inline-block w-2 h-2 rounded-full bg-gray-500 mr-2"></span>;
    }
  };

  const getStatusText = (status: string) => {
    return status.replace(/[✅❌⚠️]/g, '').trim();
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-3 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-10 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="text-4xl md:text-5xl">🔗</div>
            <h1 className="text-3xl md:text-5xl font-bold text-white">
              Chain Info Dashboard
            </h1>
          </div>
          <p className="text-gray-400 text-base md:text-lg mb-2">
            实时监控主流交易所充提状态
          </p>
          {lastUpdate && (
            <p className="text-gray-500 text-xs md:text-sm">
              最后更新: {lastUpdate}
            </p>
          )}
        </div>

        {/* Controls */}
        <div className="mb-6 space-y-4">
          {/* Search and Refresh */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <input
              type="text"
              placeholder="🔍 搜索链名称或符号..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={fetchData}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 whitespace-nowrap"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  加载中...
                </span>
              ) : (
                '🔄 刷新数据'
              )}
            </button>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  categoryFilter === cat
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-slate-800/50 text-gray-400 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 flex items-center gap-3 backdrop-blur-sm">
            <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Loading State */}
        {loading && data.length === 0 && (
          <div className="text-center text-gray-400 py-20">
            <div className="flex justify-center mb-6">
              <svg className="animate-spin h-16 w-16 text-blue-500" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <p className="text-lg">正在加载链数据...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredData.length === 0 && data.length > 0 && (
          <div className="text-center text-gray-400 py-20">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-lg">未找到匹配的链</p>
          </div>
        )}

        {/* Data Grid */}
        {!loading && filteredData.length > 0 && (
          <div className="space-y-4 md:space-y-6">
            {filteredData.map((chain) => (
              <div
                key={chain.symbol}
                className="bg-slate-800/40 backdrop-blur-sm rounded-xl p-4 md:p-6 shadow-2xl border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 hover:shadow-blue-500/10"
              >
                {/* Chain Header */}
                <div className="mb-4 pb-4 border-b border-slate-700/50">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex-1">
                      <h2 className="text-xl md:text-2xl font-bold text-white mb-2 flex items-center gap-2">
                        <span>{chain.name}</span>
                        <span className="text-gray-400 font-mono text-base md:text-lg">({chain.symbol})</span>
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-gradient-to-r from-purple-600/30 to-purple-500/30 text-purple-300 rounded-full text-xs md:text-sm font-medium border border-purple-500/30">
                          {chain.category}
                        </span>
                        <a
                          href={chain.explorer}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 bg-gradient-to-r from-blue-600/30 to-blue-500/30 text-blue-300 rounded-full text-xs md:text-sm font-medium border border-blue-500/30 hover:from-blue-600/50 hover:to-blue-500/50 transition-all duration-200 flex items-center gap-1"
                        >
                          🔍 浏览器
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Exchange Status Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                  {exchanges.map((exchangeName) => {
                    const status = chain.exchanges[exchangeName];
                    const isAvailable = status.deposit.includes('✅') || status.withdraw.includes('✅');
                    const isComingSoon = status.deposit.includes('Coming Soon');
                    
                    return (
                      <div
                        key={exchangeName}
                        className={`rounded-lg p-4 border transition-all duration-200 ${
                          isAvailable
                            ? 'bg-slate-700/30 border-slate-600/50 hover:border-slate-500/50'
                            : isComingSoon
                            ? 'bg-slate-800/20 border-slate-700/30'
                            : 'bg-red-900/10 border-red-800/30'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold text-white text-sm md:text-base">
                            {exchangeName}
                          </h3>
                          {isAvailable && (
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                          )}
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400 text-xs md:text-sm">充值:</span>
                            <span className="font-medium text-xs md:text-sm flex items-center text-gray-300">
                              {getStatusIcon(status.deposit)}
                              {getStatusText(status.deposit)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400 text-xs md:text-sm">提现:</span>
                            <span className="font-medium text-xs md:text-sm flex items-center text-gray-300">
                              {getStatusIcon(status.withdraw)}
                              {getStatusText(status.withdraw)}
                            </span>
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

        {/* Stats Footer */}
        {!loading && filteredData.length > 0 && (
          <div className="mt-8 p-4 bg-slate-800/30 rounded-lg border border-slate-700/50 text-center">
            <p className="text-gray-400 text-sm">
              显示 <span className="text-white font-semibold">{filteredData.length}</span> / <span className="text-white font-semibold">{data.length}</span> 条链信息
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-xs md:text-sm space-y-2">
          <div className="flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <p>MVP版本 - Gate.io 实时数据已接入</p>
          </div>
          <p>其他交易所即将接入（需要 API Keys 或 Cookies）</p>
          <p className="text-gray-600 text-xs mt-4">数据每5分钟自动刷新</p>
        </div>
      </div>
    </main>
  );
}
