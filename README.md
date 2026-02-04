# 🔗 Chain Info Dashboard

链信息监控工具 - MVP 版本

## 🎯 功能特性

### ✅ 已实现
- **链数据展示**：15+ 主流区块链信息（BTC, ETH, BNB, SOL, ARB, OP等）
- **链分类**：EVM、UTXO、L2、Non-EVM 分类展示
- **浏览器地址**：每条链的主网浏览器直链
- **Gate.io 集成**：实时获取充提状态（使用公开 API）
- **响应式设计**：移动端和桌面端完美适配
- **实时刷新**：一键刷新最新数据

### 🔜 待实现
- **Binance**：需要 API key 或 cookies
- **OKX**：需要 API key 或 cookies  
- **Bybit**：需要 API key 或 cookies
- **Bitget**：需要 API key 或 cookies
- **MEXC**：需要 API key 或 cookies

## 🚀 在线访问

**Production URL**: https://chain-info-eight.vercel.app

## 🛠️ 技术栈

- **框架**: Next.js 14 (App Router)
- **样式**: Tailwind CSS v3.4.1
- **语言**: TypeScript
- **部署**: Vercel
- **API**: Gate.io Public API

## 📊 支持的链

| 链 | 符号 | 分类 | 浏览器 |
|---|---|---|---|
| Bitcoin | BTC | UTXO | [Blockchair](https://blockchair.com/bitcoin) |
| Ethereum | ETH | EVM | [Etherscan](https://etherscan.io) |
| BNB Smart Chain | BNB | EVM | [BscScan](https://bscscan.com) |
| Polygon | MATIC | EVM L2 | [PolygonScan](https://polygonscan.com) |
| Arbitrum | ARB | EVM L2 | [Arbiscan](https://arbiscan.io) |
| Optimism | OP | EVM L2 | [Optimistic Etherscan](https://optimistic.etherscan.io) |
| Avalanche | AVAX | EVM | [SnowTrace](https://snowtrace.io) |
| Solana | SOL | Non-EVM | [Solscan](https://solscan.io) |
| Tron | TRX | Non-EVM | [Tronscan](https://tronscan.org) |
| Base | BASE | EVM L2 | [BaseScan](https://basescan.org) |
| zkSync | ZK | EVM L2 | [zkSync Explorer](https://explorer.zksync.io) |
| ...更多 | | | |

## 🔧 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start
```

## 📡 API 接口

### GET /api/chain-status

返回所有链的充提状态数据。

**响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "name": "Bitcoin",
      "symbol": "BTC",
      "category": "UTXO",
      "explorer": "https://blockchair.com/bitcoin",
      "exchanges": {
        "Gate.io": {
          "exchange": "Gate.io",
          "deposit": "✅ Open",
          "withdraw": "✅ Open",
          "available": true
        },
        ...
      }
    },
    ...
  ],
  "timestamp": "2026-02-04T17:45:00.000Z"
}
```

## 📝 调研结果

### Gate.io ✅
- **状态**: 已接入
- **API**: 公开 REST API
- **端点**: `https://api.gateio.ws/api/v4/spot/currencies`
- **认证**: 无需认证（公开数据）
- **限流**: 5分钟缓存

### Binance 🔒
- **API**: 需要 API Key
- **公开端点**: 有限，充提状态需要认证
- **可行性**: 需要用户提供 API Key 或使用 cookies

### OKX 🔒
- **API**: 需要 API Key
- **可行性**: 需要用户提供 API Key 或 cookies

### Bybit 🔒
- **API**: 需要 API Key  
- **可行性**: 需要用户提供 API Key 或 cookies

### Bitget & MEXC 🔒
- **API**: 需要 API Key
- **可行性**: 需要用户提供 API Key 或 cookies

## 🔐 隐私说明

- **无需登录**: 本工具不需要用户登录或提供个人信息
- **公开数据**: 仅使用交易所公开 API 数据
- **无数据存储**: 不存储用户数据或 API 密钥
- **实时请求**: 每次刷新都直接请求最新数据

## 📄 License

MIT License

---

Built with ❤️ using Next.js 14 + Tailwind CSS v3
