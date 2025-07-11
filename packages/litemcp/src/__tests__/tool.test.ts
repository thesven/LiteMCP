import { describe, it, expect, vi } from 'vitest';
import { createTool, ToolConfig } from '../tool.js';

describe('createTool', () => {
  it('should create a tool with basic configuration', () => {
    const config: ToolConfig = {
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

    const handler = vi.fn().mockResolvedValue({ result: 'success' });
    const { tool, handler: returnedHandler } = createTool(config, handler);

    expect(tool).toEqual({
      name: 'test-tool',
      description: 'A test tool',
      inputSchema: {
        type: 'object',
        properties: {
          input: { type: 'string' },
        },
        required: ['input'],
      },
    });

    expect(returnedHandler).toBe(handler);
  });

  it('should create a tool with complex input schema', () => {
    const config: ToolConfig = {
      name: 'complex-tool',
      description: 'A complex tool',
      inputSchema: {
        type: 'object',
        properties: {
          stringField: {
            type: 'string',
            description: 'A string field',
            default: 'default-value',
          },
          numberField: {
            type: 'number',
            minimum: 0,
            maximum: 100,
          },
          booleanField: {
            type: 'boolean',
          },
          arrayField: {
            type: 'array',
            items: { type: 'string' },
            minItems: 1,
            maxItems: 10,
          },
          objectField: {
            type: 'object',
            properties: {
              nestedString: { type: 'string' },
              nestedNumber: { type: 'number' },
            },
            required: ['nestedString'],
          },
        },
        required: ['stringField', 'numberField'],
      },
    };

    const handler = vi.fn().mockResolvedValue({ result: 'complex success' });
    const { tool, handler: returnedHandler } = createTool(config, handler);

    expect(tool.name).toBe('complex-tool');
    expect(tool.description).toBe('A complex tool');
    expect(tool.inputSchema.properties.stringField).toEqual({
      type: 'string',
      description: 'A string field',
      default: 'default-value',
    });
    expect(tool.inputSchema.properties.arrayField).toEqual({
      type: 'array',
      items: { type: 'string' },
      minItems: 1,
      maxItems: 10,
    });
    expect(tool.inputSchema.required).toEqual(['stringField', 'numberField']);
    expect(returnedHandler).toBe(handler);
  });

  it('should create a tool with no required fields', () => {
    const config: ToolConfig = {
      name: 'optional-tool',
      description: 'A tool with all optional fields',
      inputSchema: {
        type: 'object',
        properties: {
          optionalField: { type: 'string' },
        },
      },
    };

    const handler = vi.fn().mockResolvedValue({ result: 'optional success' });
    const { tool, handler: returnedHandler } = createTool(config, handler);

    expect(tool.inputSchema.required).toBeUndefined();
    expect(returnedHandler).toBe(handler);
  });

  it('should preserve handler function identity', () => {
    const config: ToolConfig = {
      name: 'identity-tool',
      description: 'Test handler identity',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    };

    const originalHandler = async (_args: any) => ({ result: 'identity test' });
    const { handler: returnedHandler } = createTool(config, originalHandler);

    expect(returnedHandler).toBe(originalHandler);
  });

  it('should work with typed handlers', () => {
    interface TestInput {
      name: string;
      count: number;
    }

    interface TestOutput {
      message: string;
      processed: number;
    }

    const config: ToolConfig = {
      name: 'typed-tool',
      description: 'A typed tool',
      inputSchema: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          count: { type: 'number' },
        },
        required: ['name', 'count'],
      },
    };

    const handler = vi.fn().mockImplementation(
      async (args: TestInput): Promise<TestOutput> => ({
        message: `Hello ${args.name}`,
        processed: args.count * 2,
      })
    );

    const { tool, handler: typedHandler } = createTool<TestInput, TestOutput>(config, handler);

    expect(tool.name).toBe('typed-tool');
    expect(typedHandler).toBe(handler);
  });

  it('should handle empty properties object', () => {
    const config: ToolConfig = {
      name: 'empty-tool',
      description: 'Tool with empty properties',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    };

    const handler = vi.fn().mockResolvedValue({ result: 'empty success' });
    const { tool } = createTool(config, handler);

    expect(tool.inputSchema.properties).toEqual({});
  });

  it('should maintain exact config structure', () => {
    const config: ToolConfig = {
      name: 'exact-tool',
      description: 'Test exact structure preservation',
      inputSchema: {
        type: 'object',
        properties: {
          field1: { type: 'string', pattern: '^[a-z]+$' },
          field2: { type: 'integer', multipleOf: 5 },
        },
        required: ['field1'],
        additionalProperties: false,
      },
    };

    const handler = vi.fn();
    const { tool } = createTool(config, handler);

    expect(tool.inputSchema).toEqual(config.inputSchema);
    expect(tool.inputSchema.properties.field1.pattern).toBe('^[a-z]+$');
    expect(tool.inputSchema.properties.field2.multipleOf).toBe(5);
    expect(tool.inputSchema.additionalProperties).toBe(false);
  });
});
