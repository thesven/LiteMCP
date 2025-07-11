import { 
  MCPSamplingRequest, 
  MCPSamplingResponse, 
  MCPSamplingHandler, 
  MCPSamplingMessage,
  MCPModelPreferences 
} from './types.js';

export function createSamplingHandler(
  handler: MCPSamplingHandler
): MCPSamplingHandler {
  return handler;
}

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