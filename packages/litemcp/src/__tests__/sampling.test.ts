import { describe, it, expect, vi } from 'vitest';
import { 
  createSamplingHandler,
  createSimpleSamplingRequest,
  createConversationSamplingRequest,
  createAnalysisSamplingRequest,
  createCodeReviewSamplingRequest,
  createSummarizationSamplingRequest
} from '../sampling.js';
import { MCPSamplingMessage, MCPModelPreferences } from '../types.js';

describe('Sampling utilities', () => {
  describe('createSamplingHandler', () => {
    it('should create a basic sampling handler', async () => {
      const mockLLMCall = vi.fn().mockResolvedValue({
        model: 'test-model',
        content: [{ type: 'text', text: 'Response from LLM' }]
      });

      const handler = createSamplingHandler(mockLLMCall);

      const request = {
        messages: [
          {
            role: 'user' as const,
            content: { type: 'text' as const, text: 'Hello' }
          }
        ]
      };

      const result = await handler(request);
      
      expect(mockLLMCall).toHaveBeenCalledWith(request);
      expect(result.model).toBe('test-model');
      expect(result.content[0].text).toBe('Response from LLM');
    });

    it('should handle LLM call errors', async () => {
      const mockLLMCall = vi.fn().mockRejectedValue(new Error('LLM API error'));
      const handler = createSamplingHandler(mockLLMCall);

      const request = {
        messages: [
          {
            role: 'user' as const,
            content: { type: 'text' as const, text: 'Hello' }
          }
        ]
      };

      await expect(handler(request)).rejects.toThrow('LLM API error');
    });
  });

  describe('createSimpleSamplingRequest', () => {
    it('should create a simple user message request', () => {
      const request = createSimpleSamplingRequest('Hello, how are you?');

      expect(request.messages).toHaveLength(1);
      expect(request.messages[0]).toEqual({
        role: 'user',
        content: { type: 'text', text: 'Hello, how are you?' }
      });
    });

    it('should create a request with custom options', () => {
      const request = createSimpleSamplingRequest(
        'Explain quantum physics',
        {
          temperature: 0.3,
          maxTokens: 500,
          systemPrompt: 'Be educational',
          includeContext: 'none'
        }
      );

      expect(request.temperature).toBe(0.3);
      expect(request.maxTokens).toBe(500);
      expect(request.systemPrompt).toBe('Be educational');
      expect(request.includeContext).toBe('none');
    });
  });

  describe('createConversationSamplingRequest', () => {
    it('should create a conversation request', () => {
      const messages: MCPSamplingMessage[] = [
        {
          role: 'user',
          content: { type: 'text', text: 'What is AI?' }
        },
        {
          role: 'assistant',
          content: { type: 'text', text: 'AI stands for Artificial Intelligence...' }
        },
        {
          role: 'user',
          content: { type: 'text', text: 'Tell me more about machine learning' }
        }
      ];

      const request = createConversationSamplingRequest(messages);

      expect(request.messages).toEqual(messages);
      expect(request.includeContext).toBe('thisSession');
    });
  });

  describe('createAnalysisSamplingRequest', () => {
    it('should create an analysis request with default settings', () => {
      const request = createAnalysisSamplingRequest(
        'Analyze this data: [1,2,3,4,5]'
      );

      expect(request.messages).toHaveLength(2);
      expect(request.messages[0].role).toBe('system');
      expect(request.messages[0].content.text).toContain('analytical expert');
      expect(request.messages[1].role).toBe('user');
      expect(request.messages[1].content.text).toBe('Analyze this data: [1,2,3,4,5]');
      expect(request.temperature).toBe(0.3);
      expect(request.maxTokens).toBe(2000);
    });
  });

  describe('createCodeReviewSamplingRequest', () => {
    it('should create a code review request with default settings', () => {
      const code = 'function add(a, b) { return a + b; }';
      const request = createCodeReviewSamplingRequest(code);

      expect(request.messages).toHaveLength(2);
      expect(request.messages[0].role).toBe('system');
      expect(request.messages[0].content.text).toContain('code review expert');
      expect(request.messages[1].content.text).toContain(code);
      expect(request.temperature).toBe(0.2);
    });
  });

  describe('createSummarizationSamplingRequest', () => {
    it('should create a summarization request with default settings', () => {
      const content = 'This is a long document that needs to be summarized...';
      const request = createSummarizationSamplingRequest(content);

      expect(request.messages).toHaveLength(2);
      expect(request.messages[0].role).toBe('system');
      expect(request.messages[0].content.text).toContain('summarization expert');
      expect(request.messages[1].content.text).toContain(content);
      expect(request.temperature).toBe(0.4);
      expect(request.maxTokens).toBe(1000);
    });
  });
});