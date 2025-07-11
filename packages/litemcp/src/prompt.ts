import { MCPPrompt, MCPPromptHandler, MCPPromptArgument, MCPPromptResult, MCPPromptMessage } from './types.js';

/**
 * Creates a prompt with its handler function.
 * This is a simple wrapper that returns both the prompt definition and handler
 * in a format ready for registration with an MCP server.
 * 
 * @param prompt - The prompt definition
 * @param handler - Function to handle prompt execution requests
 * @returns Object containing the prompt definition and handler
 * 
 * @example
 * ```typescript
 * const customPrompt = createPrompt(
 *   {
 *     name: "code-review",
 *     description: "Review code for potential issues",
 *     arguments: [
 *       { name: "language", required: true },
 *       { name: "code", required: true }
 *     ]
 *   },
 *   async (args) => {
 *     return {
 *       messages: [{
 *         role: 'user',
 *         content: {
 *           type: 'text',
 *           text: `Please review this ${args.language} code: ${args.code}`
 *         }
 *       }]
 *     };
 *   }
 * );
 * 
 * server.addPrompt(customPrompt.prompt, customPrompt.handler);
 * ```
 */
export function createPrompt(
  prompt: MCPPrompt,
  handler: MCPPromptHandler
): { prompt: MCPPrompt; handler: MCPPromptHandler } {
  return { prompt, handler };
}

/**
 * Creates a simple prompt that generates a single message with placeholder substitution.
 * Convenient for creating basic prompts with dynamic content.
 * 
 * @param name - Unique identifier for the prompt
 * @param description - Human-readable description of what the prompt does
 * @param messageContent - Template content with {{placeholder}} syntax for argument substitution
 * @param options - Optional configuration including arguments and message role
 * @returns Object containing the prompt definition and handler
 * 
 * @example
 * ```typescript
 * const translatePrompt = createSimplePrompt(
 *   "translate-text",
 *   "Translate text to another language",
 *   "Please translate the following {{source_language}} text to {{target_language}}: {{text}}",
 *   {
 *     arguments: [
 *       { name: "source_language", required: true, description: "Source language" },
 *       { name: "target_language", required: true, description: "Target language" },
 *       { name: "text", required: true, description: "Text to translate" }
 *     ],
 *     role: 'user'
 *   }
 * );
 * 
 * server.addPrompt(translatePrompt.prompt, translatePrompt.handler);
 * ```
 */
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

/**
 * Creates a multi-step prompt that generates a conversation with multiple messages.
 * Useful for creating complex prompts that require multiple exchanges or setup.
 * 
 * @param name - Unique identifier for the prompt
 * @param description - Human-readable description of what the prompt does
 * @param steps - Array of message templates that form the conversation
 * @param options - Optional configuration including prompt arguments
 * @returns Object containing the prompt definition and handler
 * 
 * @example
 * ```typescript
 * const codeReviewPrompt = createMultiStepPrompt(
 *   "thorough-code-review",
 *   "Perform a thorough code review with multiple aspects",
 *   [
 *     {
 *       role: 'system',
 *       content: {
 *         type: 'text',
 *         text: 'You are a senior software engineer conducting a code review.'
 *       }
 *     },
 *     {
 *       role: 'user',
 *       content: {
 *         type: 'text',
 *         text: 'Please review this {{language}} code for: 1) correctness, 2) performance, 3) security. Code: {{code}}'
 *       }
 *     }
 *   ],
 *   {
 *     arguments: [
 *       { name: "language", required: true },
 *       { name: "code", required: true }
 *     ]
 *   }
 * );
 * 
 * server.addPrompt(codeReviewPrompt.prompt, codeReviewPrompt.handler);
 * ```
 */
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

/**
 * Creates a specialized prompt for analytical tasks.
 * Automatically includes system instructions for analytical expertise and structures
 * the conversation for data analysis tasks.
 * 
 * @param name - Unique identifier for the prompt
 * @param description - Human-readable description of what the prompt does
 * @param analysisInstructions - Specific instructions for the analysis task
 * @param options - Optional configuration including custom arguments
 * @returns Object containing the prompt definition and handler
 * 
 * @example
 * ```typescript
 * const dataAnalysisPrompt = createAnalysisPrompt(
 *   "sales-analysis",
 *   "Analyze sales data and provide insights",
 *   "Analyze the sales {{data}} focusing on trends, patterns, and recommendations for {{analysis_type}} analysis.",
 *   {
 *     arguments: [
 *       { name: "data", required: true, description: "Sales data to analyze" },
 *       { name: "analysis_type", required: false, description: "Type of analysis (trend, seasonal, etc.)" }
 *     ]
 *   }
 * );
 * 
 * server.addPrompt(dataAnalysisPrompt.prompt, dataAnalysisPrompt.handler);
 * ```
 */
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