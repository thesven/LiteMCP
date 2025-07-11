# LiteMCP

> A lightweight, complete Model Context Protocol (MCP) implementation

[![NPM Version](https://img.shields.io/npm/v/litemcp)](https://www.npmjs.com/package/litemcp)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

This monorepo contains **LiteMCP**, a complete implementation of the [Model Context Protocol (MCP)](https://modelcontextprotocol.io/introduction) designed for modern JavaScript runtimes, especially Cloudflare Workers.

## 🚀 Features

### ✅ **Complete MCP Protocol Support**
- **Tools** - Execute actions and retrieve data
- **Resources** - Expose data and content with URI-based access
- **Prompts** - Reusable prompt templates with dynamic arguments
- **Sampling** - LLM completion requests for agentic behaviors
- **Logging** - Configurable log levels and structured logging

### 🛠 **Built for Production**
- **Cloudflare Workers** - Edge deployment with global distribution
- **TypeScript** - Full type safety and excellent developer experience
- **JSON-RPC 2.0** - Standards-compliant protocol implementation
- **CORS Support** - Ready for web client integration
- **SSE Streaming** - Real-time connection support

## 📋 Current Tools

### Bitcoin Price Data
- **Tool**: `get_btc_price`
- **Source**: CoinGecko API (reliable, high rate limits)
- **Features**: Real-time price, 24h change, volume, market cap
- **Caching**: 5-minute KV cache for optimized performance

## 📦 Packages

This monorepo contains two main packages:

### [`packages/litemcp`](./packages/litemcp/) - The Core Library
The main LiteMCP library that can be installed via npm and used in any JavaScript runtime.

### [`packages/example-server`](./packages/example-server/) - Example Implementation
A complete example MCP server showcasing all library features, deployable to Cloudflare Workers.

## 🏗 Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   MCP Client    │────│  LiteMCP        │────│   External      │
│  (Claude, etc.) │    │  Server         │    │   APIs/Data     │
│                 │    │                 │    │                 │
│ • Calls tools   │    │ • Protocol      │    │ • CoinGecko     │
│ • Reads resources│   │   Handling      │    │ • Other APIs    │
│ • Uses prompts  │    │ • Edge Ready    │    │ • Your Data     │
│ • Provides LLM  │    │ • Type Safe     │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Option 1: Use the Library in Your Project

```bash
npm install litemcp
```

```typescript
import { MCPServer, createTool } from 'litemcp';

const server = new MCPServer({
  name: 'my-server',
  version: '1.0.0'
});

// Add your tools, resources, prompts...
// See packages/litemcp/README.md for full documentation
```

### Option 2: Deploy the Example Server

```bash
git clone https://github.com/your-org/sven_mpc
cd sven_mpc
pnpm install
```

#### Local Development
```bash
# Build the library
pnpm build:lib

# Start local development server
pnpm dev
```

#### Deploy to Cloudflare Workers

1. **Install Wrangler CLI:**
   ```bash
   npm install -g wrangler
   ```

2. **Login to Cloudflare:**
   ```bash
   wrangler login
   ```

3. **Set up KV namespace (optional for caching):**
   ```bash
   # Create production KV namespace
   wrangler kv:namespace create "CACHE"
   
   # Create preview KV namespace
   wrangler kv:namespace create "CACHE" --preview
   ```

4. **Update wrangler.toml with your KV namespace IDs:**
   ```toml
   [[kv_namespaces]]
   binding = "CACHE"
   id = "your-production-kv-id"
   preview_id = "your-preview-kv-id"
   ```

5. **Deploy:**
   ```bash
   # Deploy to production
   pnpm deploy
   
   # Or deploy to a custom subdomain
   wrangler deploy --name your-custom-name
   ```

#### Environment Variables

Set these in your Cloudflare dashboard or `wrangler.toml`:

```bash
# Optional: Custom server name and version
MCP_SERVER_NAME="My BTC Price Server"
MCP_SERVER_VERSION="1.0.0"
```

### Configure Claude Desktop

Once deployed, add your MCP server to Claude Desktop:

1. **Open Claude Desktop settings** and locate the MCP servers configuration
2. **Add your deployed worker URL:**

```json
{
  "mcpServers": {
    "litemcp-btc-server": {
      "url": "https://your-worker-name.your-subdomain.workers.dev/"
    }
  }
}
```

3. **Restart Claude Desktop** to load the new server
4. **Test the connection** by asking Claude about Bitcoin prices

Example prompts to try:
- "What's the current Bitcoin price?"
- "Get Bitcoin price with volume data"
- "Show me BTC price change over 24 hours"

## 📊 Example Usage

### Tools
```typescript
// Get Bitcoin price data
const priceData = await tools.call('get_btc_price', {
  include_change: true,    // Include 24h price change
  include_volume: true,    // Include 24h trading volume
  include_market_cap: true // Include market capitalization
});
```

### Resources
```typescript
// Access configuration data
const config = await server.readResource("file:///config.json");

// Dynamic log access
const logs = await server.readResource("logs://2024-01-15/error");
```

### Prompts
```typescript
// Code review prompt
const review = await server.executePrompt("code-review", {
  language: "typescript",
  code: "function example() { return 'hello'; }"
});
```

### Sampling
```typescript
// Request LLM analysis
const analysis = await server.requestSampling({
  messages: [{ 
    role: "user", 
    content: { type: "text", text: "Analyze this data..." }
  }],
  temperature: 0.3,
  maxTokens: 500
});
```

## 🏭 Development

### Project Structure
```
packages/
├── litemcp/                # Core MCP library
│   ├── src/
│   │   ├── server.ts       # Core MCP server
│   │   ├── types.ts        # TypeScript definitions
│   │   ├── tool.ts         # Tool utilities
│   │   ├── resource.ts     # Resource utilities
│   │   ├── prompt.ts       # Prompt utilities
│   │   ├── sampling.ts     # Sampling utilities
│   │   └── __tests__/      # Comprehensive test suite
│   └── package.json
└── example-server/         # Example implementation
    ├── src/
    │   └── index.ts        # Cloudflare Worker with BTC tool
    ├── wrangler.toml       # Worker configuration
    └── package.json
```

### Testing

The LiteMCP library includes comprehensive unit tests with 80%+ coverage:

```bash
# Run tests
pnpm --filter litemcp test

# Run tests with coverage
pnpm --filter litemcp test:coverage

# Watch mode for development
pnpm --filter litemcp test:watch
```

### Build Process

```bash
# Build everything
pnpm build

# Build only the library
pnpm build:lib

# Build only the example server
pnpm build:example

# Type checking
pnpm type-check
```

### Adding New Tools
```typescript
import { createTool } from 'litemcp';

const myTool = createTool({
  name: "my-tool",
  description: "Does something useful",
  inputSchema: {
    type: "object",
    properties: {
      input: { type: "string" }
    },
    required: ["input"]
  }
}, async (args) => {
  // Tool implementation
  return {
    content: [{
      type: 'text',
      text: `Result: ${args.input}`
    }]
  };
});

server.addTool(myTool.tool, myTool.handler);
```

### Adding Resources
```typescript
import { createTextResource } from 'litemcp';

const { resource, handler } = createTextResource(
  'data://config',
  'Configuration Data',
  JSON.stringify({ api: 'example.com' }),
  { mimeType: 'application/json' }
);

server.addResource(resource, handler);
```

### Adding Prompts
```typescript
import { createSimplePrompt } from 'litemcp';

const { prompt, handler } = createSimplePrompt(
  'analyze-code',
  'Analyze code for issues',
  'Please analyze this {{language}} code: {{code}}',
  {
    arguments: [
      { name: 'language', required: true },
      { name: 'code', required: true }
    ]
  }
);

server.addPrompt(prompt, handler);
```

## 🔧 Configuration

### Environment Variables
```bash
# No environment variables required for basic operation
# Add your API keys here if needed for external services
```

### Capabilities
The server supports all MCP capabilities:
```typescript
{
  tools: { listChanged: true },
  resources: { subscribe: true, listChanged: true },
  prompts: { listChanged: true },
  sampling: {},
  logging: {}
}
```

## 📈 Monitoring

### Logs
- Built-in structured logging
- Configurable log levels
- Request/response tracking

### Performance
- Edge deployment via Cloudflare Workers
- Sub-100ms response times globally
- Automatic scaling

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**
3. **Add your tool/resource/prompt**
4. **Test with Claude Desktop**
5. **Submit a pull request**

### Adding New Data Sources
1. Create a new tool using the `createTool` helper function
2. Implement proper error handling and validation
3. Add appropriate caching if needed
4. Test with the example server
5. Update documentation

## 📄 License

MIT License - see LICENSE file for details

## 🔗 Links

- [Model Context Protocol](https://modelcontextprotocol.io/)
- [MCP Specification](https://modelcontextprotocol.io/specification)
- [Cloudflare Workers](https://workers.cloudflare.com/)
- [Claude Desktop](https://claude.ai/desktop)

## 🆘 Support

- **Issues**: Use GitHub Issues for bugs and feature requests
- **Documentation**: See `/packages/litemcp/README.md` for library docs
- **Examples**: Check the example server in `/packages/example-server/` for implementation patterns

---

**Built with ❤️ for the MCP ecosystem**