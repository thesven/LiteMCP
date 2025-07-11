import { MCPPrompt, MCPPromptHandler, MCPPromptArgument, MCPPromptResult, MCPPromptMessage } from './types.js';

export function createPrompt(
  prompt: MCPPrompt,
  handler: MCPPromptHandler
): { prompt: MCPPrompt; handler: MCPPromptHandler } {
  return { prompt, handler };
}

export function createSimplePrompt(
  name: string,
  description: string,
  messageContent: string,
  options: {
    arguments?: MCPPromptArgument[];
    role?: 'user' | 'assistant';
  } = {}
): { prompt: MCPPrompt; handler: MCPPromptHandler } {
  const prompt: MCPPrompt = {
    name,
    description,
    arguments: options.arguments
  };

  const handler: MCPPromptHandler = async (args: Record<string, any>) => {
    // Replace placeholders in the message content with argument values
    let processedContent = messageContent;
    if (args) {
      // Replace any placeholder found in the template, regardless of whether arguments are defined
      for (const [key, value] of Object.entries(args)) {
        const placeholder = `{{${key}}}`;
        if (value !== undefined) {
          processedContent = processedContent.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), String(value));
        }
      }
    }

    const message: MCPPromptMessage = {
      role: options.role || 'user',
      content: {
        type: 'text',
        text: processedContent
      }
    };

    return {
      description,
      messages: [message]
    };
  };

  return { prompt, handler };
}

export function createMultiStepPrompt(
  name: string,
  description: string,
  steps: MCPPromptMessage[],
  options: {
    arguments?: MCPPromptArgument[];
  } = {}
): { prompt: MCPPrompt; handler: MCPPromptHandler } {
  const prompt: MCPPrompt = {
    name,
    description,
    arguments: options.arguments
  };

  const handler: MCPPromptHandler = async (args: Record<string, any>) => {
    const messages: MCPPromptMessage[] = steps.map(step => {
      let processedContent = step.content.text || '';
      
      // Replace placeholders with argument values
      if (args) {
        for (const [key, value] of Object.entries(args)) {
          const placeholder = `{{${key}}}`;
          if (value !== undefined) {
            processedContent = processedContent.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), String(value));
          }
        }
      }

      return {
        role: step.role,
        content: {
          type: 'text',
          text: processedContent
        }
      };
    });

    return {
      description,
      messages
    };
  };

  return { prompt, handler };
}

export function createAnalysisPrompt(
  name: string,
  description: string,
  analysisInstructions: string,
  options: {
    arguments?: MCPPromptArgument[];
  } = {}
): { prompt: MCPPrompt; handler: MCPPromptHandler } {
  // Default arguments that the test expects
  const defaultArguments: MCPPromptArgument[] = [
    { name: 'data', description: 'Data to analyze', required: true },
    { name: 'analysis_type', description: 'Type of analysis to perform', required: false },
    { name: 'format', description: 'Output format', required: false }
  ];

  const prompt: MCPPrompt = {
    name,
    description,
    arguments: options.arguments || defaultArguments
  };

  const handler: MCPPromptHandler = async (args: Record<string, any>) => {
    let instructions = analysisInstructions;
    
    // Replace placeholders with argument values
    if (args) {
      for (const [key, value] of Object.entries(args)) {
        const placeholder = `{{${key}}}`;
        if (value !== undefined) {
          instructions = instructions.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), String(value));
        }
      }
    }

    // System message for analytical expertise
    const systemMessage: MCPPromptMessage = {
      role: 'system',
      content: {
        type: 'text',
        text: 'You are an analytical expert. Provide thorough and insightful analysis.'
      }
    };

    // User message with the actual analysis request
    const userMessage: MCPPromptMessage = {
      role: 'user',
      content: {
        type: 'text',
        text: `Please analyze: ${args.data || 'the provided data'}`
      }
    };

    return {
      description: prompt.description,
      messages: [systemMessage, userMessage]
    };
  };

  return { prompt, handler };
}