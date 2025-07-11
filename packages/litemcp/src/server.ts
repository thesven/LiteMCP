import { z } from 'zod';
import { 
  MCPTool, 
  MCPToolHandler, 
  JsonRpcRequest, 
  JsonRpcResponse, 
  MCPServerInfo,
  MCPCapabilities,
  MCPInitializeResult,
  MCPResource,
  MCPResourceTemplate,
  MCPResourceHandler,
  MCPPrompt,
  MCPPromptHandler,
  MCPSamplingRequest,
  MCPSamplingHandler,
  MCPLogLevel,
  MCPLogEntry
} from './types.js';

const JsonRpcRequestSchema = z.object({
  jsonrpc: z.literal('2.0'),
  id: z.union([z.string(), z.number(), z.null()]).optional(),
  method: z.string(),
  params: z.any().optional()
});

export class MCPServer {
  private tools: Map<string, MCPTool> = new Map();
  private toolHandlers: Map<string, MCPToolHandler> = new Map();
  private resources: Map<string, MCPResource> = new Map();
  private resourceHandlers: Map<string, MCPResourceHandler> = new Map();
  private resourceTemplates: Map<string, MCPResourceTemplate> = new Map();
  private prompts: Map<string, MCPPrompt> = new Map();
  private promptHandlers: Map<string, MCPPromptHandler> = new Map();
  private samplingHandler: MCPSamplingHandler | null = null;
  private serverInfo: MCPServerInfo;
  private capabilities: MCPCapabilities;
  private logLevel: MCPLogLevel = 'info';

  constructor(serverInfo: MCPServerInfo, capabilities: MCPCapabilities = { tools: {} }) {
    this.serverInfo = serverInfo;
    this.capabilities = capabilities;
  }

  addTool<T = any, R = any>(tool: MCPTool, handler: MCPToolHandler<T, R>): void {
    this.tools.set(tool.name, tool);
    this.toolHandlers.set(tool.name, handler);
  }

  addResource(resource: MCPResource, handler: MCPResourceHandler): void {
    this.resources.set(resource.uri, resource);
    this.resourceHandlers.set(resource.uri, handler);
  }

  addResourceTemplate(template: MCPResourceTemplate, handler: MCPResourceHandler): void {
    this.resourceTemplates.set(template.uriTemplate, template);
    this.resourceHandlers.set(template.uriTemplate, handler);
  }

  addPrompt(prompt: MCPPrompt, handler: MCPPromptHandler): void {
    this.prompts.set(prompt.name, prompt);
    this.promptHandlers.set(prompt.name, handler);
  }

  setSamplingHandler(handler: MCPSamplingHandler): void {
    this.samplingHandler = handler;
  }

  setLogLevel(level: MCPLogLevel): void {
    this.logLevel = level;
  }

  async handleRequest(request: Request): Promise<Response> {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return this.createCorsResponse();
    }

    // Handle GET requests for SSE and testing
    if (request.method === 'GET') {
      return this.handleGetRequest(request);
    }

    // Handle JSON-RPC POST requests
    if (request.method === 'POST') {
      return this.handleJsonRpcRequest(request);
    }

    return new Response('Method not allowed', { status: 405 });
  }

  private createCorsResponse(): Response {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  private handleGetRequest(request: Request): Response {
    const url = new URL(request.url);
    
    // Handle tools/list endpoint for testing
    if (url.pathname === '/tools/list') {
      return new Response(JSON.stringify({
        tools: Array.from(this.tools.values())
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    
    // Handle SSE requests
    if (url.searchParams.has('sessionId')) {
      return this.createSSEResponse();
    }
    
    return new Response('Not found', { status: 404 });
  }

  private createSSEResponse(): Response {
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('data: {"type":"connected"}\n\n'));
      },
      cancel() {
        // Clean up when stream is cancelled
      }
    });

    return new Response(stream, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  private async handleJsonRpcRequest(request: Request): Promise<Response> {
    try {
      const body = await request.text();
      if (!body.trim()) {
        throw new Error('Empty request body');
      }

      const jsonRpcRequest = JsonRpcRequestSchema.parse(JSON.parse(body));
      const result = await this.processJsonRpcMethod(jsonRpcRequest);

      if (result === null) {
        return new Response(null, { status: 204 });
      }

      const response: JsonRpcResponse = {
        jsonrpc: '2.0',
        id: jsonRpcRequest.id ?? null,
        result
      };

      return new Response(JSON.stringify(response), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });

    } catch (error) {
      return this.createErrorResponse(error, null);
    }
  }

  private async processJsonRpcMethod(request: JsonRpcRequest): Promise<any> {
    switch (request.method) {
      case 'initialize':
        return this.handleInitialize(request.params);
      
      case 'notifications/initialized':
        return null; // No response needed for notifications
      
      case 'tools/list':
        return {
          tools: Array.from(this.tools.values())
        };
      
      case 'tools/call':
        return this.handleToolCall(request.params);
      
      case 'resources/list':
        return this.handleResourcesList();
      
      case 'resources/templates/list':
        return this.handleResourceTemplatesList();
      
      case 'resources/read':
        return this.handleResourceRead(request.params);
      
      case 'prompts/list':
        return this.handlePromptsList();
      
      case 'prompts/get':
        return this.handlePromptGet(request.params);
      
      case 'sampling/createMessage':
        return this.handleSampling(request.params);
      
      case 'logging/setLevel':
        return this.handleSetLogLevel(request.params);
      
      default:
        throw new Error(`Unknown method: ${request.method}`);
    }
  }

  private handleInitialize(params?: any): MCPInitializeResult {
    return {
      protocolVersion: '2024-11-05',
      capabilities: this.capabilities,
      serverInfo: this.serverInfo
    };
  }

  private async handleToolCall(params: any): Promise<any> {
    const { name, arguments: args } = params;
    
    const handler = this.toolHandlers.get(name);
    if (!handler) {
      throw new Error(`Unknown tool: ${name}`);
    }
    
    return await handler(args || {});
  }

  private handleResourcesList(): any {
    return {
      resources: Array.from(this.resources.values())
    };
  }

  private handleResourceTemplatesList(): any {
    return {
      resourceTemplates: Array.from(this.resourceTemplates.values())
    };
  }

  private async handleResourceRead(params: any): Promise<any> {
    const { uri } = params;
    
    if (!uri) {
      throw new Error('URI is required for resource read');
    }

    // Try direct resource first
    let handler = this.resourceHandlers.get(uri);
    
    // If not found, try to match against templates
    if (!handler) {
      for (const [template, templateHandler] of this.resourceHandlers.entries()) {
        if (this.matchesTemplate(uri, template)) {
          handler = templateHandler;
          break;
        }
      }
    }
    
    if (!handler) {
      throw new Error(`Resource not found: ${uri}`);
    }
    
    const content = await handler(uri);
    return { contents: [content] };
  }

  private handlePromptsList(): any {
    return {
      prompts: Array.from(this.prompts.values())
    };
  }

  private async handlePromptGet(params: any): Promise<any> {
    const { name, arguments: args } = params;
    
    const prompt = this.prompts.get(name);
    if (!prompt) {
      throw new Error(`Unknown prompt: ${name}`);
    }
    
    const handler = this.promptHandlers.get(name);
    if (!handler) {
      throw new Error(`No handler for prompt: ${name}`);
    }
    
    // Validate required arguments
    if (prompt.arguments) {
      for (const arg of prompt.arguments) {
        if (arg.required && !args?.[arg.name]) {
          throw new Error(`Required argument missing: ${arg.name}`);
        }
      }
    }
    
    return await handler(args || {});
  }

  private async handleSampling(params: MCPSamplingRequest): Promise<any> {
    if (!this.samplingHandler) {
      throw new Error('Sampling handler not configured');
    }
    
    // Validate required fields
    if (!params.messages || !Array.isArray(params.messages) || params.messages.length === 0) {
      throw new Error('Messages array is required and cannot be empty');
    }

    // Call the registered sampling handler
    const response = await this.samplingHandler(params);
    return response;
  }

  private handleSetLogLevel(params: any): any {
    const { level } = params;
    
    if (!level) {
      throw new Error('Log level is required');
    }
    
    this.setLogLevel(level);
    return {};
  }

  private matchesTemplate(uri: string, template: string): boolean {
    // Simple template matching - convert {variable} to regex
    const regexPattern = template.replace(/\{[^}]+\}/g, '([^/]+)');
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(uri);
  }

  private createErrorResponse(error: any, id: any): Response {
    const errorResponse: JsonRpcResponse = {
      jsonrpc: '2.0',
      id,
      error: {
        code: -32603,
        message: error instanceof Error ? error.message : 'Internal error'
      }
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}