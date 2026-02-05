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

type ViewMode = 'chain' | 'coin';

export default function Home() {
  const [data, setData] = useState<ChainData[]>([]);
  const [filteredData, setFilteredData] = useState<ChainData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [viewMode, setViewMode] = useState<ViewMode>('chain');
  const [coinSearch, setCoinSearch] = useState('');

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
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // 链视图筛选
  useEffect(() => {
    if (viewMode !== 'chain') return;
    
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
  }, [searchTerm, categoryFilter, data, viewMode]);

  const exchanges = ['Gate.io', 'Binance', 'OKX', 'Bybit', 'Bitget', 'MEXC'];
  const categories = ['All', ...Array.from(new Set(data.map(c => c.category)))];

  const getStatusColor = (status: string) => {
    if (status.includes('✅') || status.includes('开放')) return 'text-green-400';
    if (status.includes('❌') || status.includes('关闭')) return 'text-red-400';
    if (status.includes('⚠️')) return 'text-yellow-400';
    return 'text-gray-400';
  };

  const getStatusBg = (status: string) => {
    if (status.includes('✅') || status.includes('开放')) return 'bg-green-500/10';
    if (status.includes('❌') || status.includes('关闭')) return 'bg-red-500/10';
    if (status.includes('⚠️')) return 'bg-yellow-500/10';
    return 'bg-gray-500/10';
  };

  const getStatusText = (status: string) => {
    return status.replace(/[✅❌⚠️]/g, '').trim();
  };

  // 币种搜索：找到所有包含该币种的链和交易所状态
  const getCoinSearchResults = () => {
    if (!coinSearch.trim()) return [];
    
    const results: Array<{
      chain: string;
      symbol: string;
      category: string;
      explorer: string;
      exchanges: Record<string, ExchangeStatus>;
    }> = [];

    // 搜索所有链中包含该币种的
    data.forEach(chain => {
      if (chain.symbol.toLowerCase().includes(coinSearch.toLowerCase()) ||
          chain.name.toLowerCase().includes(coinSearch.toLowerCase())) {
        results.push({
          chain: chain.name,
          symbol: chain.symbol,
          category: chain.category,
          explorer: chain.explorer,
          exchanges: chain.exchanges
        });
      }
    });

    return results;
  };

  const coinResults = viewMode === 'coin' ? getCoinSearchResults() : [];

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-3 md:p-6">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-4 md:mb-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="text-3xl md:text-4xl">🔗</div>
            <h1 className="text-2xl md:text-4xl font-bold text-white">
              Chain Info Dashboard
            </h1>
          </div>
          <p className="text-gray-400 text-sm md:text-base mb-1">
            实时监控主流交易所充提状态
          </p>
          {lastUpdate && (
            <p className="text-gray-500 text-xs">
              最后更新: {lastUpdate}
            </p>
          )}
        </div>

        {/* View Mode Toggle */}
        <div className="mb-4 flex justify-center gap-2">
          <button
            onClick={() => setViewMode('chain')}
            className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
              viewMode === 'chain'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-slate-800/50 text-gray-400 hover:bg-slate-700 hover:text-white'
            }`}
          >
            🔗 链视图
          </button>
          <button
            onClick={() => setViewMode('coin')}
            className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
              viewMode === 'coin'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-slate-800/50 text-gray-400 hover:bg-slate-700 hover:text-white'
            }`}
          >
            💰 币种查询
          </button>
        </div>

        {/* Controls */}
        {viewMode === 'chain' ? (
          <div className="mb-4 space-y-3">
            <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
              <input
                type="text"
                placeholder="🔍 搜索链名称或符号..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-3 py-2 text-sm bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={fetchData}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white rounded-lg font-medium transition-all text-sm whitespace-nowrap"
              >
                {loading ? '加载中...' : '🔄 刷新'}
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    categoryFilter === cat
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-800/50 text-gray-400 hover:bg-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mb-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="💰 输入币种符号，如 USDT、ETH、BTC..."
                value={coinSearch}
                onChange={(e) => setCoinSearch(e.target.value)}
                className="flex-1 px-4 py-3 text-sm bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={fetchData}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white rounded-lg font-medium transition-all text-sm whitespace-nowrap"
              >
                {loading ? '加载中...' : '🔄 刷新'}
              </button>
            </div>
            <p className="text-gray-400 text-xs mt-2">
              💡 输入币种符号查询该币在各交易所的充提状态
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && data.length === 0 && (
          <div className="text-center text-gray-400 py-20">
            <p className="text-sm">正在加载链数据...</p>
          </div>
        )}

        {/* 链视图 - 紧凑表格 */}
        {viewMode === 'chain' && !loading && filteredData.length > 0 && (
          <div className="overflow-x-auto">
            <div className="bg-slate-800/40 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-700/50">
                  <tr>
                    <th className="sticky left-0 z-10 bg-slate-700/90 px-3 py-2 text-left text-white font-semibold">链</th>
                    <th className="px-3 py-2 text-left text-white font-semibold whitespace-nowrap">符号</th>
                    <th className="px-3 py-2 text-left text-white font-semibold">类别</th>
                    {exchanges.map(ex => (
                      <th key={ex} className="px-2 py-2 text-center text-white font-semibold text-xs whitespace-nowrap border-l border-slate-600/50">
                        {ex}
                      </th>
                    ))}
                    <th className="px-2 py-2 text-center text-white font-semibold text-xs border-l border-slate-600/50">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/30">
                  {filteredData.map((chain, idx) => (
                    <tr key={chain.symbol} className={`hover:bg-slate-700/20 transition-colors ${idx % 2 === 0 ? 'bg-slate-800/20' : ''}`}>
                      <td className="sticky left-0 z-10 bg-slate-800/90 px-3 py-2 font-medium text-white whitespace-nowrap">
                        {chain.name}
                      </td>
                      <td className="px-3 py-2 text-gray-300 font-mono text-xs">{chain.symbol}</td>
                      <td className="px-3 py-2">
                        <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs border border-purple-500/30">
                          {chain.category}
                        </span>
                      </td>
                      {exchanges.map(exchangeName => {
                        const status = chain.exchanges[exchangeName];
                        const isAvailable = status.deposit.includes('✅') || status.withdraw.includes('✅');
                        return (
                          <td key={exchangeName} className="px-2 py-2 border-l border-slate-700/30">
                            <div className="space-y-1">
                              <div className={`px-1.5 py-0.5 rounded text-[10px] text-center ${getStatusBg(status.deposit)}`}>
                                <span className={getStatusColor(status.deposit)}>
                                  充: {getStatusText(status.deposit)}
                                </span>
                              </div>
                              <div className={`px-1.5 py-0.5 rounded text-[10px] text-center ${getStatusBg(status.withdraw)}`}>
                                <span className={getStatusColor(status.withdraw)}>
                                  提: {getStatusText(status.withdraw)}
                                </span>
                              </div>
                            </div>
                          </td>
                        );
                      })}
                      <td className="px-2 py-2 text-center border-l border-slate-700/30">
                        <a
                          href={chain.explorer}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block px-2 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded text-xs transition-colors"
                        >
                          浏览器
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3 text-center text-gray-400 text-xs">
              显示 <span className="text-white font-semibold">{filteredData.length}</span> / <span className="text-white font-semibold">{data.length}</span> 条链信息
            </div>
          </div>
        )}

        {/* 币种查询视图 */}
        {viewMode === 'coin' && !loading && coinSearch && (
          <div>
            {coinResults.length === 0 ? (
              <div className="text-center text-gray-400 py-20">
                <div className="text-4xl mb-3">🔍</div>
                <p className="text-sm">未找到匹配的币种</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <h2 className="text-xl text-white font-semibold">
                    找到 <span className="text-blue-400">{coinResults.length}</span> 个相关链
                  </h2>
                </div>

                <div className="overflow-x-auto">
                  <div className="bg-slate-800/40 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-700/50">
                        <tr>
                          <th className="sticky left-0 z-10 bg-slate-700/90 px-3 py-2 text-left text-white font-semibold">链</th>
                          <th className="px-3 py-2 text-left text-white font-semibold whitespace-nowrap">符号</th>
                          <th className="px-3 py-2 text-left text-white font-semibold">类别</th>
                          {exchanges.map(ex => (
                            <th key={ex} className="px-2 py-2 text-center text-white font-semibold text-xs whitespace-nowrap border-l border-slate-600/50">
                              {ex}
                            </th>
                          ))}
                          <th className="px-2 py-2 text-center text-white font-semibold text-xs border-l border-slate-600/50">操作</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700/30">
                        {coinResults.map((result, idx) => (
                          <tr key={result.symbol} className={`hover:bg-slate-700/20 transition-colors ${idx % 2 === 0 ? 'bg-slate-800/20' : ''}`}>
                            <td className="sticky left-0 z-10 bg-slate-800/90 px-3 py-2 font-medium text-white whitespace-nowrap">
                              {result.chain}
                            </td>
                            <td className="px-3 py-2 text-gray-300 font-mono text-xs">{result.symbol}</td>
                            <td className="px-3 py-2">
                              <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs border border-purple-500/30">
                                {result.category}
                              </span>
                            </td>
                            {exchanges.map(exchangeName => {
                              const status = result.exchanges[exchangeName];
                              return (
                                <td key={exchangeName} className="px-2 py-2 border-l border-slate-700/30">
                                  <div className="space-y-1">
                                    <div className={`px-1.5 py-0.5 rounded text-[10px] text-center ${getStatusBg(status.deposit)}`}>
                                      <span className={getStatusColor(status.deposit)}>
                                        充: {getStatusText(status.deposit)}
                                      </span>
                                    </div>
                                    <div className={`px-1.5 py-0.5 rounded text-[10px] text-center ${getStatusBg(status.withdraw)}`}>
                                      <span className={getStatusColor(status.withdraw)}>
                                        提: {getStatusText(status.withdraw)}
                                      </span>
                                    </div>
                                  </div>
                                </td>
                              );
                            })}
                            <td className="px-2 py-2 text-center border-l border-slate-700/30">
                              <a
                                href={result.explorer}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block px-2 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded text-xs transition-colors"
                              >
                                浏览器
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty State for Coin Search */}
        {viewMode === 'coin' && !loading && !coinSearch && (
          <div className="text-center text-gray-400 py-20">
            <div className="text-5xl mb-4">💰</div>
            <p className="text-lg mb-2">输入币种符号开始查询</p>
            <p className="text-sm text-gray-500">例如: USDT、ETH、BTC</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-xs space-y-1">
          <div className="flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <p>Gate.io 实时数据已接入 | 其他交易所即将支持</p>
          </div>
          <p className="text-gray-600">数据每5分钟自动刷新</p>
        </div>
      </div>
    </main>
  );
}
