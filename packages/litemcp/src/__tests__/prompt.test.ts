import { describe, it, expect, vi } from 'vitest';
import {
  createPrompt,
  createSimplePrompt,
  createMultiStepPrompt,
  createAnalysisPrompt,
} from '../prompt.js';
import { MCPPromptArgument, MCPPromptMessage } from '../types.js';

describe('Prompt utilities', () => {
  describe('createPrompt', () => {
    it('should create a basic prompt', () => {
      const config = {
        name: 'test-prompt',
        description: 'A test prompt',
      };

      const handler = vi.fn().mockResolvedValue({
        description: 'Test result',
        messages: [],
      });

      const { prompt, handler: returnedHandler } = createPrompt(config, handler);

      expect(prompt).toEqual(config);
      expect(returnedHandler).toBe(handler);
    });

    it('should create a prompt with arguments', () => {
      const arguments_: MCPPromptArgument[] = [
        {
          name: 'input',
          description: 'Input text',
          required: true,
        },
        {
          name: 'format',
          description: 'Output format',
          required: false,
        },
      ];

      const config = {
        name: 'parameterized-prompt',
        description: 'A prompt with parameters',
        arguments: arguments_,
      };

      const handler = vi.fn().mockResolvedValue({
        description: 'Parameterized result',
        messages: [],
      });

      const { prompt } = createPrompt(config, handler);

      expect(prompt.arguments).toEqual(arguments_);
      expect(prompt.arguments?.[0].required).toBe(true);
      expect(prompt.arguments?.[1].required).toBe(false);
    });
  });

  describe('createSimplePrompt', () => {
    it('should create a simple prompt with no parameters', async () => {
      const { prompt, handler } = createSimplePrompt(
        'simple-test',
        'Simple test prompt',
        'This is a simple prompt template.'
      );

      expect(prompt.name).toBe('simple-test');
      expect(prompt.description).toBe('Simple test prompt');
      expect(prompt.arguments).toBeUndefined();

      const result = await handler({});
      expect(result.description).toBe('Simple test prompt');
      expect(result.messages).toHaveLength(1);
      expect(result.messages[0]).toEqual({
        role: 'user',
        content: {
          type: 'text',
          text: 'This is a simple prompt template.',
        },
      });
    });

    it('should create a simple prompt with template variables', async () => {
      const { prompt, handler } = createSimplePrompt(
        'template-test',
        'Template test prompt',
        'Hello {{name}}, your age is {{age}}.',
        {
          arguments: [
            { name: 'name', description: 'User name', required: true },
            { name: 'age', description: 'User age', required: true },
          ],
        }
      );

      expect(prompt.arguments).toHaveLength(2);
      expect(prompt.arguments?.[0].name).toBe('name');
      expect(prompt.arguments?.[1].name).toBe('age');

      const result = await handler({ name: 'Alice', age: '25' });
      expect(result.messages[0].content.text).toBe('Hello Alice, your age is 25.');
    });

    it('should handle missing template variables gracefully', async () => {
      const { handler } = createSimplePrompt(
        'missing-vars',
        'Missing variables test',
        'Hello {{name}}, your role is {{role}}.'
      );

      const result = await handler({ name: 'Bob' });
      expect(result.messages[0].content.text).toBe('Hello Bob, your role is {{role}}.');
    });
  });

  describe('createMultiStepPrompt', () => {
    it('should create a multi-step prompt', async () => {
      const steps: MCPPromptMessage[] = [
        {
          role: 'system',
          content: {
            type: 'text',
            text: 'You are a helpful assistant.',
          },
        },
        {
          role: 'user',
          content: {
            type: 'text',
            text: 'Please analyze this: {{input}}',
          },
        },
      ];

      const { prompt, handler } = createMultiStepPrompt(
        'multi-step-test',
        'Multi-step analysis prompt',
        steps,
        {
          arguments: [{ name: 'input', description: 'Input to analyze', required: true }],
        }
      );

      expect(prompt.name).toBe('multi-step-test');
      expect(prompt.arguments).toHaveLength(1);

      const result = await handler({ input: 'test data' });
      expect(result.messages).toHaveLength(2);
      expect(result.messages[0].role).toBe('system');
      expect(result.messages[1].content.text).toBe('Please analyze this: test data');
    });
  });

  describe('createAnalysisPrompt', () => {
    it('should create an analysis prompt with default settings', async () => {
      const { prompt, handler } = createAnalysisPrompt(
        'basic-analysis',
        'Basic analysis prompt',
        'data'
      );

      expect(prompt.name).toBe('basic-analysis');
      expect(prompt.arguments).toHaveLength(3);

      const args = prompt.arguments!;
      expect(args.find(arg => arg.name === 'data')?.required).toBe(true);
      expect(args.find(arg => arg.name === 'analysis_type')?.required).toBe(false);
      expect(args.find(arg => arg.name === 'format')?.required).toBe(false);

      const result = await handler({ data: 'test data' });
      expect(result.messages).toHaveLength(2);
      expect(result.messages[0].role).toBe('system');
      expect(result.messages[1].content.text).toContain('test data');
    });
  });
});
