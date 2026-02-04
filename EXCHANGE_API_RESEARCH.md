# 交易所 API 调研报告

## 概述

本文档记录了 6 家主流交易所的充提状态 API 接入可行性调研。

---

## 1. Gate.io ✅ 已接入

### API 信息
- **基础 URL**: `https://api.gateio.ws/api/v4`
- **认证方式**: 无需认证（公开数据）
- **充提状态端点**: `GET /spot/currencies`

### 响应示例
```json
{
  "currency": "BTC",
  "delisted": false,
  "withdraw_disabled": false,
  "withdraw_delayed": false,
  "deposit_disabled": false,
  "trade_disabled": false
}
```

### 限流
- **限制**: 900 次/秒（公开端点）
- **建议**: 使用 5 分钟缓存

### 状态
✅ **已集成** - 工作正常

---

## 2. Binance 🔒 需要认证

### API 信息
- **基础 URL**: `https://api.binance.com/api/v3`
- **公开端点**: 有限
- **充提状态端点**: `GET /capital/config/getall` (需要签名)

### 认证要求
- **API Key**: 必需
- **Secret Key**: 必需（用于签名）
- **权限**: 读取权限

### 公开替代方案
- **系统状态**: `GET /sapi/v1/system/status` (有限信息)
- **不包含**: 具体币种充提状态

### 可行性
🔒 **需要用户提供 API Key** 或使用 Web Scraping (不推荐)

### 建议方案
1. 允许用户输入 API Key（仅读权限）
2. 使用 Puppeteer 爬取充提公告（维护成本高）
3. 暂时标记为 "Coming Soon"

---

## 3. OKX 🔒 需要认证

### API 信息
- **基础 URL**: `https://www.okx.com/api/v5`
- **充提状态端点**: `GET /asset/currencies` (需要 API Key)

### 认证要求
- **API Key**: 必需
- **Secret Key**: 必需
- **Passphrase**: 必需
- **权限**: 读取权限

### 可行性
🔒 **需要用户提供 API Key**

---

## 4. Bybit 🔒 需要认证

### API 信息
- **基础 URL**: `https://api.bybit.com/v5`
- **充提状态端点**: `GET /asset/coin/query-info` (需要认证)

### 认证要求
- **API Key**: 必需
- **Secret Key**: 必需（用于签名）

### 可行性
🔒 **需要用户提供 API Key**

---

## 5. Bitget 🔒 需要认证

### API 信息
- **基础 URL**: `https://api.bitget.com/api/v2`
- **充提状态端点**: 需要认证

### 认证要求
- **API Key**: 必需
- **Secret Key**: 必需
- **Passphrase**: 必需

### 可行性
🔒 **需要用户提供 API Key**

---

## 6. MEXC 🔒 需要认证

### API 信息
- **基础 URL**: `https://api.mexc.com/api/v3`
- **充提状态端点**: 需要认证

### 认证要求
- **API Key**: 必需
- **Secret Key**: 必需

### 可行性
🔒 **需要用户提供 API Key**

---

## 总结

| 交易所 | 公开 API | 需要认证 | 当前状态 | 优先级 |
|--------|---------|---------|---------|--------|
| Gate.io | ✅ | ❌ | ✅ 已接入 | - |
| Binance | 部分 | ✅ | 🔜 待接入 | 高 |
| OKX | ❌ | ✅ | 🔜 待接入 | 中 |
| Bybit | ❌ | ✅ | 🔜 待接入 | 中 |
| Bitget | ❌ | ✅ | 🔜 待接入 | 低 |
| MEXC | ❌ | ✅ | 🔜 待接入 | 低 |

---

## 下一步计划

### MVP 阶段 ✅ (当前)
- [x] Gate.io 公开 API 接入
- [x] 基础 UI 展示
- [x] 部署到 Vercel

### V2 阶段 (计划中)
- [ ] 添加 API Key 配置功能
- [ ] Binance API 接入（用户提供 Key）
- [ ] 本地存储 API Key（浏览器端加密）

### V3 阶段 (长期)
- [ ] OKX/Bybit/Bitget/MEXC 接入
- [ ] 历史数据记录
- [ ] 充提状态变化通知

---

## 技术建议

### 方案 A：用户提供 API Key (推荐)
**优点**:
- 数据实时准确
- 无需服务器端存储敏感信息
- 用户完全控制权限

**缺点**:
- 需要用户手动配置
- 对小白用户不友好

### 方案 B：Web Scraping
**优点**:
- 无需用户配置
- 开箱即用

**缺点**:
- 维护成本高（页面结构变化）
- 可能违反 ToS
- 容易被反爬

### 方案 C：混合方案
- Gate.io: 公开 API（无需配置）
- 其他交易所: 可选配置 API Key
- 未配置时显示 "Coming Soon"

**推荐使用方案 C**

---

Last updated: 2026-02-04
