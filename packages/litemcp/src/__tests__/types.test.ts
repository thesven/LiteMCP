import { describe, it, expect } from 'vitest';

// Import types to ensure they're properly exported
import type {
  MCPTool,
  MCPToolHandler,
  MCPServerInfo,
  MCPCapabilities,
  JsonRpcRequest,
  JsonRpcResponse as _JsonRpcResponse,
  MCPInitializeResult as _MCPInitializeResult,
  MCPResource,
  MCPResourceTemplate as _MCPResourceTemplate,
  MCPResourceContent as _MCPResourceContent,
  MCPResourceHandler,
  MCPPrompt,
  MCPPromptArgument as _MCPPromptArgument,
  MCPPromptMessage as _MCPPromptMessage,
  MCPPromptResult as _MCPPromptResult,
  MCPPromptHandler as _MCPPromptHandler,
  MCPSamplingMessage as _MCPSamplingMessage,
  MCPSamplingRequest,
  MCPSamplingResponse as _MCPSamplingResponse,
  MCPSamplingHandler as _MCPSamplingHandler,
  MCPModelPreferences as _MCPModelPreferences,
  MCPLogLevel as _MCPLogLevel,
  MCPLogEntry as _MCPLogEntry,
} from '../types.js';

describe('Type definitions', () => {
  describe('MCPTool', () => {
    it('should define valid tool structure', () => {
      const tool: MCPTool = {
        name: 'test-tool',
        description: 'A test tool',
        inputSchema: {
          type: 'object',
          properties: {
            input: { type: 'string' },
          },
          required: ['input'],
        },
      };

      expect(tool.name).toBe('test-tool');
      expect(tool.inputSchema.type).toBe('object');
    });
  });

  describe('MCPServerInfo', () => {
    it('should define server info structure', () => {
      const serverInfo: MCPServerInfo = {
        name: 'test-server',
        version: '1.0.0',
      };

      expect(serverInfo.name).toBe('test-server');
      expect(serverInfo.version).toBe('1.0.0');
    });
  });

  describe('MCPCapabilities', () => {
    it('should define capabilities structure', () => {
      const capabilities: MCPCapabilities = {
        tools: {
          listChanged: true,
        },
        resources: {
          subscribe: true,
          listChanged: false,
        },
        prompts: {
          listChanged: true,
        },
        sampling: {},
        logging: {},
      };

      expect(capabilities.tools?.listChanged).toBe(true);
      expect(capabilities.resources?.subscribe).toBe(true);
    });
  });

  describe('JsonRpcRequest', () => {
    it('should define JSON-RPC request structure', () => {
      const request: JsonRpcRequest = {
        jsonrpc: '2.0',
        id: 1,
        method: 'test/method',
        params: { test: 'value' },
      };

      expect(request.jsonrpc).toBe('2.0');
      expect(request.method).toBe('test/method');
    });
  });

  describe('MCPResource', () => {
    it('should define resource structure', () => {
      const resource: MCPResource = {
        uri: 'test://resource',
        name: 'Test Resource',
        description: 'A test resource',
        mimeType: 'text/plain',
      };

      expect(resource.uri).toBe('test://resource');
      expect(resource.mimeType).toBe('text/plain');
    });
  });

  describe('MCPPrompt', () => {
    it('should define prompt structure', () => {
      const prompt: MCPPrompt = {
        name: 'test-prompt',
        description: 'A test prompt',
        arguments: [
          {
            name: 'input',
            description: 'Input parameter',
            required: true,
          },
        ],
      };

      expect(prompt.name).toBe('test-prompt');
      expect(prompt.arguments?.[0].required).toBe(true);
    });
  });

  describe('MCPSamplingRequest', () => {
    it('should define sampling request structure', () => {
      const request: MCPSamplingRequest = {
        messages: [
          {
            role: 'user',
            content: { type: 'text', text: 'Hello' },
          },
        ],
        temperature: 0.7,
        maxTokens: 1000,
      };

      expect(request.messages).toHaveLength(1);
      expect(request.temperature).toBe(0.7);
    });
  });

  describe('Handler types', () => {
    it('should define MCPToolHandler', () => {
      const handler: MCPToolHandler<{ input: string }, { output: string }> = async args => ({
        output: args.input.toUpperCase(),
      });

      expect(handler).toBeInstanceOf(Function);
    });

    it('should define MCPResourceHandler', () => {
      const handler: MCPResourceHandler = async uri => ({
        uri,
        mimeType: 'text/plain',
        text: 'content',
      });

      expect(handler).toBeInstanceOf(Function);
    });
  });
});
