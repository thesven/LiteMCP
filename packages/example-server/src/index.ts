import { MCPServer, createTool } from 'litemcp';

// Define the environment interface for Cloudflare Workers
interface Env {
  MCP_SERVER_NAME?: string;
  MCP_SERVER_VERSION?: string;
  CACHE?: any; // KV namespace
}

// BTC Price API response interface
interface CoinGeckoResponse {
  bitcoin: {
    usd: number;
    usd_24h_change: number;
    usd_24h_vol: number;
    usd_market_cap: number;
    last_updated_at: number;
  };
}

// Cache duration in seconds (5 minutes)
const CACHE_DURATION = 300;

// Create the BTC price tool
const { tool: btcPriceTool, handler: btcPriceHandler } = createTool(
  {
    name: 'get_btc_price',
    description: 'Get current Bitcoin price in USD with market data from CoinGecko API',
    inputSchema: {
      type: 'object',
      properties: {
        include_change: {
          type: 'boolean',
          description: 'Include 24h price change data',
          default: true
        },
        include_volume: {
          type: 'boolean', 
          description: 'Include 24h trading volume data',
          default: false
        },
        include_market_cap: {
          type: 'boolean',
          description: 'Include market capitalization data', 
          default: false
        }
      },
      required: []
    }
  },
  async (args: { 
    include_change?: boolean; 
    include_volume?: boolean; 
    include_market_cap?: boolean; 
  }) => {
    const cacheKey = 'btc_price_data';
    
    // Try to get cached data first (if KV is available)
    let cachedData: string | null = null;
    try {
      if ((globalThis as any).CACHE) {
        cachedData = await (globalThis as any).CACHE.get(cacheKey);
      }
    } catch (error) {
      console.warn('KV cache not available, fetching fresh data');
    }

    let btcData: CoinGeckoResponse;

    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        const cacheAge = Date.now() - parsed.timestamp;
        
        if (cacheAge < CACHE_DURATION * 1000) {
          btcData = parsed.data;
        } else {
          throw new Error('Cache expired');
        }
      } catch {
        // Cache invalid, fetch fresh data
        btcData = await fetchBTCPrice();
      }
    } else {
      btcData = await fetchBTCPrice();
      
      // Cache the result (if KV is available)
      try {
        if ((globalThis as any).CACHE) {
          await (globalThis as any).CACHE.put(cacheKey, JSON.stringify({
            data: btcData,
            timestamp: Date.now()
          }), {
            expirationTtl: CACHE_DURATION
          });
        }
      } catch (error) {
        console.warn('Failed to cache data:', error);
      }
    }

    // Format the response based on requested options
    const bitcoin = btcData.bitcoin;
    const price = bitcoin.usd;
    const lastUpdated = new Date(bitcoin.last_updated_at * 1000).toISOString();
    
    let result: any = {
      price: price,
      currency: 'USD',
      last_updated: lastUpdated,
      source: 'CoinGecko'
    };

    // Add 24h change data if requested
    if (args.include_change !== false) {
      result.change_24h = bitcoin.usd_24h_change;
      result.change_24h_percent = `${bitcoin.usd_24h_change.toFixed(2)}%`;
    }

    if (args.include_volume) {
      result.volume_24h = bitcoin.usd_24h_vol;
    }

    if (args.include_market_cap) {
      result.market_cap = bitcoin.usd_market_cap;
    }

    let responseText = `Bitcoin Price: $${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    
    if (args.include_change !== false) {
      const changeIcon = bitcoin.usd_24h_change >= 0 ? '📈' : '📉';
      responseText += `\n${changeIcon} 24h Change: ${bitcoin.usd_24h_change.toFixed(2)}%`;
    }
    
    if (args.include_volume) {
      responseText += `\n📊 24h Volume: $${bitcoin.usd_24h_vol.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    }
    
    if (args.include_market_cap) {
      responseText += `\n💰 Market Cap: $${bitcoin.usd_market_cap.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    }
    
    responseText += `\nLast Updated: ${new Date(lastUpdated).toLocaleString()}`;
    responseText += '\nSource: CoinGecko API';

    return {
      content: [
        {
          type: 'text',
          text: responseText
        }
      ],
      isError: false,
      data: result
    };
  }
);

// Fetch BTC price from CoinGecko API
async function fetchBTCPrice(): Promise<CoinGeckoResponse> {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true&include_last_updated_at=true'
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as CoinGeckoResponse;
    
    if (!data.bitcoin) {
      throw new Error('Invalid response format from CoinGecko API');
    }
    
    return data;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to fetch Bitcoin price from CoinGecko: ${errorMessage}`);
  }
}

// Cloudflare Workers export
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Set global CACHE for use in tool handlers
    if (env.CACHE) {
      (globalThis as any).CACHE = env.CACHE;
    }

    // Create MCP server with Bitcoin tool
    const server = new MCPServer(
      {
        name: env.MCP_SERVER_NAME || 'LiteMCP BTC Price Server',
        version: env.MCP_SERVER_VERSION || '1.0.0'
      },
      {
        tools: {},
        resources: {},
        prompts: {},
        sampling: {}
      }
    );

    // Add the Bitcoin price tool
    server.addTool(btcPriceTool, btcPriceHandler);

    // Handle the request
    return await server.handleRequest(request);
  }
} as any; // Worker handler