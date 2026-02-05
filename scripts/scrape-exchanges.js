/**
 * 交易所支持链爬取脚本
 * 从交易所公开页面获取支持的链列表（无需API Key）
 */

const https = require('https');

// 简单的HTTP GET请求
function fetchHTML(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

// Binance: 从币种列表页获取
async function scrapeBinance() {
  console.log('\n=== Binance ===');
  try {
    // Binance有公开的币种信息API（无需认证）
    const url = 'https://www.binance.com/bapi/asset/v2/public/asset-service/product/get-products';
    
    const response = await new Promise((resolve, reject) => {
      https.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Accept': 'application/json',
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      }).on('error', reject);
    });

    if (response.data) {
      const chains = new Set();
      response.data.forEach(coin => {
        if (coin.networkList) {
          coin.networkList.forEach(network => {
            chains.add(network.network);
          });
        }
      });
      console.log(`找到 ${chains.size} 个链:`);
      console.log(Array.from(chains).slice(0, 20).join(', '), '...');
      return Array.from(chains);
    }
  } catch (error) {
    console.error('Binance 抓取失败:', error.message);
  }
  return [];
}

// OKX: 从资产列表获取
async function scrapeOKX() {
  console.log('\n=== OKX ===');
  try {
    // OKX有公开的币种配置API
    const url = 'https://www.okx.com/api/v5/public/currencies';
    
    const response = await new Promise((resolve, reject) => {
      https.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Accept': 'application/json',
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      }).on('error', reject);
    });

    if (response.data) {
      const chains = new Set();
      response.data.forEach(coin => {
        if (coin.chain) {
          chains.add(coin.chain);
        }
      });
      console.log(`找到 ${chains.size} 个链:`);
      console.log(Array.from(chains).slice(0, 20).join(', '), '...');
      return Array.from(chains);
    }
  } catch (error) {
    console.error('OKX 抓取失败:', error.message);
  }
  return [];
}

// Bybit: 从公开API获取
async function scrapeBybit() {
  console.log('\n=== Bybit ===');
  try {
    // Bybit有公开的币种信息端点
    const url = 'https://api.bybit.com/v5/public/spot-coin-info';
    
    const response = await new Promise((resolve, reject) => {
      https.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Accept': 'application/json',
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      }).on('error', reject);
    });

    if (response.result && response.result.rows) {
      const chains = new Set();
      response.result.rows.forEach(coin => {
        if (coin.chains) {
          coin.chains.forEach(chain => {
            chains.add(chain.chain);
          });
        }
      });
      console.log(`找到 ${chains.size} 个链:`);
      console.log(Array.from(chains).slice(0, 20).join(', '), '...');
      return Array.from(chains);
    }
  } catch (error) {
    console.error('Bybit 抓取失败:', error.message);
  }
  return [];
}

// Bitget: 检查是否有公开API
async function scrapeBitget() {
  console.log('\n=== Bitget ===');
  try {
    // Bitget的公开币种信息
    const url = 'https://api.bitget.com/api/spot/v1/public/currencies';
    
    const response = await new Promise((resolve, reject) => {
      https.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Accept': 'application/json',
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      }).on('error', reject);
    });

    if (response.data) {
      const chains = new Set();
      response.data.forEach(coin => {
        if (coin.chains) {
          coin.chains.forEach(chain => {
            chains.add(chain);
          });
        }
      });
      console.log(`找到 ${chains.size} 个链:`);
      console.log(Array.from(chains).slice(0, 20).join(', '), '...');
      return Array.from(chains);
    }
  } catch (error) {
    console.error('Bitget 抓取失败:', error.message);
  }
  return [];
}

// MEXC: 公开市场数据
async function scrapeMEXC() {
  console.log('\n=== MEXC ===');
  try {
    // MEXC的公开币种信息
    const url = 'https://www.mexc.com/open/api/v2/market/coin/list';
    
    const response = await new Promise((resolve, reject) => {
      https.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Accept': 'application/json',
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      }).on('error', reject);
    });

    if (response.data) {
      const chains = new Set();
      response.data.forEach(coin => {
        if (coin.network_list) {
          coin.network_list.forEach(network => {
            chains.add(network.network);
          });
        }
      });
      console.log(`找到 ${chains.size} 个链:`);
      console.log(Array.from(chains).slice(0, 20).join(', '), '...');
      return Array.from(chains);
    }
  } catch (error) {
    console.error('MEXC 抓取失败:', error.message);
  }
  return [];
}

// 主函数
async function main() {
  console.log('🔍 开始调研各交易所公开API...\n');
  console.log('目标：找到无需API Key即可获取支持链列表的方法\n');
  console.log('='.repeat(60));

  const results = {
    binance: await scrapeBinance(),
    okx: await scrapeOKX(),
    bybit: await scrapeBybit(),
    bitget: await scrapeBitget(),
    mexc: await scrapeMEXC(),
  };

  console.log('\n' + '='.repeat(60));
  console.log('\n📊 总结:\n');
  
  Object.entries(results).forEach(([exchange, chains]) => {
    console.log(`${exchange.toUpperCase()}: ${chains.length > 0 ? `✅ 成功 (${chains.length} 个链)` : '❌ 失败'}`);
  });

  console.log('\n💡 建议：');
  console.log('1. Binance/OKX/Bybit 都有公开API可以使用');
  console.log('2. 可以定期抓取并缓存结果');
  console.log('3. 添加到后端API路由中，与Gate.io一起提供完整数据');
}

main().catch(console.error);
