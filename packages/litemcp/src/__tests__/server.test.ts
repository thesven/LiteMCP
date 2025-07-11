import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MCPServer } from '../server.js';
import { MCPServerInfo, MCPCapabilities } from '../types.js';

describe('MCPServer', () => {
  let server: MCPServer;
  let serverInfo: MCPServerInfo;
  let capabilities: MCPCapabilities;

  beforeEach(() => {
    serverInfo = {
      name: 'test-server',
      version: '1.0.0',
    };

    capabilities = {
      tools: {},
      resources: {},
      prompts: {},
      sampling: {},
    };

    server = new MCPServer(serverInfo, capabilities);
  });

  describe('constructor', () => {
    it('should create server with default capabilities', () => {
      const simpleServer = new MCPServer(serverInfo);
      expect(simpleServer).toBeInstanceOf(MCPServer);
    });

    it('should create server with provided capabilities', () => {
      expect(server).toBeInstanceOf(MCPServer);
    });
  });

  describe('addTool', () => {
    it('should add a tool and handler', () => {
      const tool = {
        name: 'test-tool',
        description: 'Test tool',
        inputSchema: {
          type: 'object' as const,
          properties: {},
          required: [],
        },
      };

      const handler = vi.fn().mockResolvedValue({ result: 'test' });

      expect(() => server.addTool(tool, handler)).not.toThrow();
    });
  });

  describe('addResource', () => {
    it('should add a resource and handler', () => {
      const resource = {
        uri: 'test://resource',
        name: 'Test Resource',
        description: 'A test resource',
        mimeType: 'text/plain',
      };

      const handler = vi.fn().mockResolvedValue({
        uri: 'test://resource',
        mimeType: 'text/plain',
        text: 'test content',
      });

      expect(() => server.addResource(resource, handler)).not.toThrow();
    });
  });

  describe('addResourceTemplate', () => {
    it('should add a resource template and handler', () => {
      const template = {
        uriTemplate: 'test://{id}',
        name: 'Test Template',
        description: 'A test template',
        mimeType: 'application/json',
      };

      const handler = vi.fn().mockResolvedValue({
        uri: 'test://123',
        mimeType: 'application/json',
        text: '{"id": "123"}',
      });

      expect(() => server.addResourceTemplate(template, handler)).not.toThrow();
    });
  });

  describe('addPrompt', () => {
    it('should add a prompt and handler', () => {
      const prompt = {
        name: 'test-prompt',
        description: 'Test prompt',
      };

      const handler = vi.fn().mockResolvedValue({
        description: 'Test result',
        messages: [],
      });

      expect(() => server.addPrompt(prompt, handler)).not.toThrow();
    });
  });

  describe('setSamplingHandler', () => {
    it('should set a sampling handler', () => {
      const handler = vi.fn().mockResolvedValue({
        model: 'test-model',
        content: [{ type: 'text', text: 'test' }],
      });

      expect(() => server.setSamplingHandler(handler)).not.toThrow();
    });
  });

  describe('setLogLevel', () => {
    it('should set log level', () => {
      expect(() => server.setLogLevel('debug')).not.toThrow();
      expect(() => server.setLogLevel('info')).not.toThrow();
      expect(() => server.setLogLevel('warn')).not.toThrow();
      expect(() => server.setLogLevel('error')).not.toThrow();
    });
  });

  describe('handleRequest', () => {
    it('should handle CORS preflight request', async () => {
      const request = new Request('http://localhost', { method: 'OPTIONS' });
      const response = await server.handleRequest(request);

      expect(response.status).toBe(204);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
      expect(response.headers.get('Access-Control-Allow-Methods')).toBe('GET, POST, OPTIONS');
    });

    it('should handle GET request for tools list', async () => {
      const tool = {
        name: 'test-tool',
        description: 'Test tool',
        inputSchema: { type: 'object' as const, properties: {} },
      };
      server.addTool(tool, vi.fn());

      const request = new Request('http://localhost/tools/list', { method: 'GET' });
      const response = await server.handleRequest(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.tools).toHaveLength(1);
      expect(data.tools[0].name).toBe('test-tool');
    });

    it('should handle GET request with sessionId for SSE', async () => {
      const request = new Request('http://localhost?sessionId=123', { method: 'GET' });
      const response = await server.handleRequest(request);

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('text/event-stream');
    });

    it('should return 404 for unknown GET paths', async () => {
      const request = new Request('http://localhost/unknown', { method: 'GET' });
      const response = await server.handleRequest(request);

      expect(response.status).toBe(404);
    });

    it('should handle valid JSON-RPC initialize request', async () => {
      const request = new Request('http://localhost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'initialize',
          params: {},
        }),
      });

      const response = await server.handleRequest(request);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.jsonrpc).toBe('2.0');
      expect(data.id).toBe(1);
      expect(data.result.protocolVersion).toBe('2024-11-05');
      expect(data.result.serverInfo).toEqual(serverInfo);
      expect(data.result.capabilities).toEqual(capabilities);
    });

    it('should handle tools/list request', async () => {
      const tool = {
        name: 'test-tool',
        description: 'Test tool',
        inputSchema: { type: 'object' as const, properties: {} },
      };
      server.addTool(tool, vi.fn());

      const request = new Request('http://localhost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'tools/list',
        }),
      });

      const response = await server.handleRequest(request);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.result.tools).toHaveLength(1);
      expect(data.result.tools[0].name).toBe('test-tool');
    });

    it('should handle tools/call request', async () => {
      const tool = {
        name: 'test-tool',
        description: 'Test tool',
        inputSchema: { type: 'object' as const, properties: {} },
      };
      const handler = vi.fn().mockResolvedValue({ result: 'success' });
      server.addTool(tool, handler);

      const request = new Request('http://localhost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'tools/call',
          params: {
            name: 'test-tool',
            arguments: { input: 'test' },
          },
        }),
      });

      const response = await server.handleRequest(request);
      expect(response.status).toBe(200);
      expect(handler).toHaveBeenCalledWith({ input: 'test' });
    });

    it('should handle empty request body', async () => {
      const request = new Request('http://localhost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '',
      });

      const response = await server.handleRequest(request);
      expect(response.status).toBe(500);
    });

    it('should handle invalid JSON', async () => {
      const request = new Request('http://localhost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json',
      });

      const response = await server.handleRequest(request);
      expect(response.status).toBe(500);
    });

    it('should handle unknown method', async () => {
      const request = new Request('http://localhost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'unknown/method',
        }),
      });

      const response = await server.handleRequest(request);
      expect(response.status).toBe(500);
    });

    it('should return 405 for unsupported methods', async () => {
      const request = new Request('http://localhost', { method: 'DELETE' });
      const response = await server.handleRequest(request);

      expect(response.status).toBe(405);
    });
  });

  describe('notifications/initialized', () => {
    it('should handle notifications/initialized with null response', async () => {
      const request = new Request('http://localhost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'notifications/initialized',
        }),
      });

      const response = await server.handleRequest(request);
      expect(response.status).toBe(204);
    });
  });

  describe('resource operations', () => {
    it('should handle resources/list request', async () => {
      const resource = {
        uri: 'test://resource',
        name: 'Test Resource',
        description: 'A test resource',
        mimeType: 'text/plain',
      };
      server.addResource(resource, vi.fn());

      const request = new Request('http://localhost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'resources/list',
        }),
      });

      const response = await server.handleRequest(request);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.result.resources).toHaveLength(1);
      expect(data.result.resources[0].uri).toBe('test://resource');
    });

    it('should handle resources/templates/list request', async () => {
      const template = {
        uriTemplate: 'test://{id}',
        name: 'Test Template',
        description: 'A test template',
        mimeType: 'application/json',
      };
      server.addResourceTemplate(template, vi.fn());

      const request = new Request('http://localhost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'resources/templates/list',
        }),
      });

      const response = await server.handleRequest(request);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.result.resourceTemplates).toHaveLength(1);
      expect(data.result.resourceTemplates[0].uriTemplate).toBe('test://{id}');
    });

    it('should handle resources/read request', async () => {
      const resource = {
        uri: 'test://resource',
        name: 'Test Resource',
        description: 'A test resource',
        mimeType: 'text/plain',
      };
      const handler = vi.fn().mockResolvedValue({
        uri: 'test://resource',
        mimeType: 'text/plain',
        text: 'test content',
      });
      server.addResource(resource, handler);

      const request = new Request('http://localhost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'resources/read',
          params: { uri: 'test://resource' },
        }),
      });

      const response = await server.handleRequest(request);
      expect(response.status).toBe(200);
      expect(handler).toHaveBeenCalledWith('test://resource');
    });

    it('should handle resources/read with template matching', async () => {
      const template = {
        uriTemplate: 'test://{id}',
        name: 'Test Template',
        description: 'A test template',
        mimeType: 'application/json',
      };
      const handler = vi.fn().mockResolvedValue({
        uri: 'test://123',
        mimeType: 'application/json',
        text: '{"id": "123"}',
      });
      server.addResourceTemplate(template, handler);

      const request = new Request('http://localhost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'resources/read',
          params: { uri: 'test://123' },
        }),
      });

      const response = await server.handleRequest(request);
      expect(response.status).toBe(200);
      expect(handler).toHaveBeenCalledWith('test://123');
    });

    it('should return error for missing URI in resources/read', async () => {
      const request = new Request('http://localhost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'resources/read',
          params: {},
        }),
      });

      const response = await server.handleRequest(request);
      expect(response.status).toBe(500);
    });

    it('should return error for unknown resource', async () => {
      const request = new Request('http://localhost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'resources/read',
          params: { uri: 'unknown://resource' },
        }),
      });

      const response = await server.handleRequest(request);
      expect(response.status).toBe(500);
    });
  });
});
