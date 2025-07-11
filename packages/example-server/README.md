# LiteMCP Example Server

This is an example Cloudflare Workers deployment using the LiteMCP library. It demonstrates a simple MCP server that provides a Bitcoin price tool.

## Features

- **BTC Price Tool**: Get real-time Bitcoin price data from CoinGecko API
- **Caching**: Uses Cloudflare KV for API response caching (5-minute TTL)
- **Worker Optimized**: Built specifically for Cloudflare Workers
- **Configurable Output**: Choose what market data to include

## Quick Start

### Prerequisites

1. **Cloudflare account**: Sign up at [cloudflare.com](https://cloudflare.com)
2. **Wrangler CLI**: Install globally
   ```bash
   npm install -g wrangler
   ```
3. **Authentication**: Login to Cloudflare
   ```bash
   wrangler login
   ```

### Development Setup

1. **Install dependencies:**
   ```bash
   cd ../../  # Go to monorepo root
   pnpm install
   ```

2. **Build the LiteMCP library:**
   ```bash
   pnpm build:lib
   ```

3. **Run locally:**
   ```bash
   pnpm dev  # This runs the example server locally
   ```

### Deployment

1. **Set up KV namespace (required for caching):**
   ```bash
   cd packages/example-server
   npx wrangler kv:namespace create "CACHE" --env production
   npx wrangler kv:namespace create "CACHE" --env preview
   ```

2. **Update wrangler.toml with your KV namespace IDs:**
   ```toml
   [[kv_namespaces]]
   binding = "CACHE"
   id = "d7761d7ad9b7494287403999c6755501" # production
   preview_id = "f8256e7c6e8a400b9239c5f88bdbfd9b" # preview

   [env.preview]
   [[env.preview.kv_namespaces]]
   binding = "CACHE"
   id = "f8256e7c6e8a400b9239c5f88bdbfd9b"
   ```

3. **Deploy to Cloudflare Workers:**
   ```bash
   pnpm deploy
   ```

4. **Your worker is now live!** The deployment will show your worker URL, e.g.:
   ```
   https://litemcp-example-server.your-subdomain.workers.dev
   ```

## Available Tools

### get_btc_price

Get current Bitcoin price and market data.

**Parameters:**
- `include_change` (boolean, default: true): Include 24h price change
- `include_volume` (boolean, default: false): Include 24h trading volume  
- `include_market_cap` (boolean, default: false): Include market capitalization

**Example Usage:**
```json
{
  "method": "tools/call",
  "params": {
    "name": "get_btc_price",
    "arguments": {
      "include_change": true,
      "include_volume": true,
      "include_market_cap": true
    }
  }
}
```

## Testing

You can test the server by sending HTTP requests:

```bash
# Get available tools
curl https://your-worker.your-subdomain.workers.dev/tools/list

# Call the BTC price tool
curl -X POST https://your-worker.your-subdomain.workers.dev \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "get_btc_price",
      "arguments": {
        "include_change": true,
        "include_volume": true
      }
    }
  }'
```

## Environment Variables

Set these in your `wrangler.toml` or Cloudflare dashboard:

- `MCP_SERVER_NAME`: Name of your MCP server (default: "LiteMCP BTC Price Server")
- `MCP_SERVER_VERSION`: Version of your server (default: "1.0.0")

## Architecture

This example demonstrates:
- How to create MCP tools with LiteMCP
- Cloudflare Workers integration
- API caching with KV storage
- Error handling and data validation
- JSON-RPC 2.0 protocol implementation