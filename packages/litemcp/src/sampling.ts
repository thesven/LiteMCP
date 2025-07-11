import { 
  MCPSamplingRequest, 
  MCPSamplingResponse, 
  MCPSamplingHandler, 
  MCPSamplingMessage,
  MCPModelPreferences 
} from './types.js';

/**
 * Creates a sampling handler for processing LLM completion requests.
 * This is a simple wrapper for type safety and consistency.
 * 
 * @param handler - The sampling handler function
 * @returns The same handler function with proper typing
 * 
 * @example
 * ```typescript
 * const openaiHandler = createSamplingHandler(async (request) => {
 *   const response = await openai.chat.completions.create({
 *     model: "gpt-4",
 *     messages: request.messages,
 *     temperature: request.temperature,
 *     max_tokens: request.maxTokens
 *   });
 *   
 *   return {
 *     role: 'assistant',
 *     content: {
 *       type: 'text',
 *       text: response.choices[0].message.content
 *     },
 *     model: response.model
 *   };
 * });
 * 
 * server.setSamplingHandler(openaiHandler);
 * ```
 */
export function createSamplingHandler(
  handler: MCPSamplingHandler
): MCPSamplingHandler {
  return handler;
}

/**
 * Creates a simple sampling request with a single user message.
 * Convenient for straightforward AI completion requests.
 * 
 * @param userMessage - The message from the user to the AI
 * @param options - Optional configuration for the sampling request
 * @returns A complete MCPSamplingRequest ready to be sent
 * 
 * @example
 * ```typescript
 * const request = createSimpleSamplingRequest(
 *   "Explain the benefits of renewable energy",
 *   {
 *     temperature: 0.7,
 *     maxTokens: 500,
 *     modelPreferences: {
 *       costPriority: 0.8,
 *       speedPriority: 0.6
 *     }
 *   }
 * );
 * 
 * const response = await samplingHandler(request);
 * ```
 */
export function createSimpleSamplingRequest(
  userMessage: string,
  options: {
    systemPrompt?: string;
    temperature?: number;
    maxTokens?: number;
    modelPreferences?: MCPModelPreferences;
    includeContext?: 'none' | 'thisServer' | 'allServers';
  } = {}
): MCPSamplingRequest {
  const messages: MCPSamplingMessage[] = [
    {
      role: 'user',
      content: {
        type: 'text',
        text: userMessage
      }
    }
  ];

  return {
    messages,
    systemPrompt: options.systemPrompt,
    temperature: options.temperature,
    maxTokens: options.maxTokens,
    modelPreferences: options.modelPreferences,
    includeContext: options.includeContext || 'none'
  };
}

/**
 * Creates a sampling request from an existing conversation.
 * Useful for continuing multi-turn conversations or providing context.
 * 
 * @param conversation - Array of messages forming the conversation history
 * @param options - Optional configuration for the sampling request
 * @returns A complete MCPSamplingRequest with the conversation context
 * 
 * @example
 * ```typescript
 * const conversation = [
 *   {
 *     role: 'user',
 *     content: { type: 'text', text: 'What is machine learning?' }
 *   },
 *   {
 *     role: 'assistant', 
 *     content: { type: 'text', text: 'Machine learning is...' }
 *   },
 *   {
 *     role: 'user',
 *     content: { type: 'text', text: 'Can you give me an example?' }
 *   }
 * ];
 * 
 * const request = createConversationSamplingRequest(conversation, {
 *   temperature: 0.5,
 *   includeContext: 'thisSession'
 * });
 * ```
 */
export function createConversationSamplingRequest(
  conversation: MCPSamplingMessage[],
  options: {
    systemPrompt?: string;
    temperature?: number;
    maxTokens?: number;
    modelPreferences?: MCPModelPreferences;
    includeContext?: 'none' | 'thisServer' | 'allServers';
  } = {}
): MCPSamplingRequest {
  return {
    messages: conversation,
    systemPrompt: options.systemPrompt,
    temperature: options.temperature,
    maxTokens: options.maxTokens,
    modelPreferences: options.modelPreferences,
    includeContext: options.includeContext || 'thisSession'
  };
}

/**
 * Creates a sampling request optimized for analytical tasks.
 * Includes specialized system instructions and structured prompting for analysis.
 * 
 * @param analysisPrompt - The specific analysis request or question
 * @param contextData - Optional context data to include in the analysis
 * @param options - Optional configuration for the sampling request
 * @returns A sampling request configured for analytical tasks
 * 
 * @example
 * ```typescript
 * const salesData = `
 *   Q1: $50K, Q2: $75K, Q3: $60K, Q4: $90K
 * `;
 * 
 * const request = createAnalysisSamplingRequest(
 *   "Analyze the sales trends and provide insights for next year's planning",
 *   salesData,
 *   {
 *     temperature: 0.3, // Lower temperature for more focused analysis
 *     maxTokens: 1500
 *   }
 * );
 * 
 * const analysis = await samplingHandler(request);
 * ```
 */
export function createAnalysisSamplingRequest(
  analysisPrompt: string,
  contextData?: string,
  options: {
    systemPrompt?: string;
    temperature?: number;
    maxTokens?: number;
    modelPreferences?: MCPModelPreferences;
    includeContext?: 'none' | 'thisServer' | 'allServers';
  } = {}
): MCPSamplingRequest {
  const systemMessage: MCPSamplingMessage = {
    role: 'system',
    content: {
      type: 'text',
      text: 'You are an analytical expert. Provide thorough and insightful analysis.'
    }
  };

  const userMessage: MCPSamplingMessage = {
    role: 'user',
    content: {
      type: 'text',
      text: contextData ? `${analysisPrompt}\n\nContext data:\n${contextData}` : analysisPrompt
    }
  };

  return {
    messages: [systemMessage, userMessage],
    systemPrompt: options.systemPrompt,
    temperature: options.temperature || 0.3,
    maxTokens: options.maxTokens || 2000,
    modelPreferences: options.modelPreferences,
    includeContext: options.includeContext || 'none'
  };
}

/**
 * Creates a sampling request specifically designed for code review tasks.
 * Includes expert system instructions and structured code review prompting.
 * 
 * @param code - The code to be reviewed
 * @param language - Programming language of the code (optional but recommended)
 * @param options - Configuration including focus areas and other parameters
 * @returns A sampling request optimized for code review
 * 
 * @example
 * ```typescript
 * const typeScriptCode = `
 *   function calculateTotal(items: any[]): number {
 *     let total = 0;
 *     for (let i = 0; i < items.length; i++) {
 *       total += items[i].price;
 *     }
 *     return total;
 *   }
 * `;
 * 
 * const request = createCodeReviewSamplingRequest(
 *   typeScriptCode,
 *   "typescript",
 *   {
 *     focusAreas: ["type safety", "performance", "error handling"],
 *     temperature: 0.2 // Low temperature for consistent, focused reviews
 *   }
 * );
 * 
 * const review = await samplingHandler(request);
 * ```
 */
export function createCodeReviewSamplingRequest(
  code: string,
  language?: string,
  options: {
    focusAreas?: string[];
    systemPrompt?: string;
    temperature?: number;
    maxTokens?: number;
    modelPreferences?: MCPModelPreferences;
    includeContext?: 'none' | 'thisServer' | 'allServers';
  } = {}
): MCPSamplingRequest {
  const systemMessage: MCPSamplingMessage = {
    role: 'system',
    content: {
      type: 'text',
      text: 'You are a code review expert. Provide constructive feedback on code quality, security, performance, and maintainability.'
    }
  };

  let reviewPrompt = `Please review this ${language || 'code'} for best practices, potential bugs, and improvements:`;
  
  if (options.focusAreas && options.focusAreas.length > 0) {
    reviewPrompt += `\n\nFocus areas: ${options.focusAreas.join(', ')}`;
  }
  
  reviewPrompt += `\n\n\`\`\`${language || ''}\n${code}\n\`\`\``;

  const userMessage: MCPSamplingMessage = {
    role: 'user',
    content: {
      type: 'text',
      text: reviewPrompt
    }
  };

  return {
    messages: [systemMessage, userMessage],
    systemPrompt: options.systemPrompt,
    temperature: options.temperature || 0.2,
    maxTokens: options.maxTokens,
    modelPreferences: options.modelPreferences,
    includeContext: options.includeContext || 'none'
  };
}

/**
 * Creates a sampling request for text summarization tasks.
 * Provides specialized prompting for different summarization styles and lengths.
 * 
 * @param content - The content to be summarized
 * @param maxLength - Optional maximum length for the summary in words
 * @param options - Configuration including summary style and other parameters
 * @returns A sampling request optimized for summarization
 * 
 * @example
 * ```typescript
 * const longArticle = `
 *   The field of artificial intelligence has seen remarkable progress...
 *   [long content]
 * `;
 * 
 * const request = createSummarizationSamplingRequest(
 *   longArticle,
 *   150, // words
 *   {
 *     style: 'executive-summary',
 *     temperature: 0.4 // Moderate creativity for engaging summaries
 *   }
 * );
 * 
 * const summary = await samplingHandler(request);
 * ```
 */
export function createSummarizationSamplingRequest(
  content: string,
  maxLength?: number,
  options: {
    style?: 'bullet-points' | 'paragraph' | 'executive-summary';
    systemPrompt?: string;
    temperature?: number;
    maxTokens?: number;
    modelPreferences?: MCPModelPreferences;
    includeContext?: 'none' | 'thisServer' | 'allServers';
  } = {}
): MCPSamplingRequest {
  const systemMessage: MCPSamplingMessage = {
    role: 'system',
    content: {
      type: 'text',
      text: 'You are a summarization expert. Create concise, accurate summaries that capture the key points.'
    }
  };

  const style = options.style || 'paragraph';
  let prompt = `Please summarize the following content`;
  
  if (maxLength) {
    prompt += ` in ${maxLength} words or less`;
  }
  
  switch (style) {
    case 'bullet-points':
      prompt += ' using bullet points';
      break;
    case 'executive-summary':
      prompt += ' as an executive summary';
      break;
    default:
      prompt += ' in paragraph form';
  }
  
  prompt += `:\n\n${content}`;

  const userMessage: MCPSamplingMessage = {
    role: 'user',
    content: {
      type: 'text',
      text: prompt
    }
  };

  return {
    messages: [systemMessage, userMessage],
    systemPrompt: options.systemPrompt,
    temperature: options.temperature || 0.4,
    maxTokens: options.maxTokens || 1000,
    modelPreferences: options.modelPreferences,
    includeContext: options.includeContext || 'none'
  };
}