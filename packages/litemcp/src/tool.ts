import { MCPTool, MCPToolHandler } from './types.js';

export interface ToolConfig {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, any>;
    required?: string[];
  };
}

export function createTool<T = any, R = any>(
  config: ToolConfig, 
  handler: MCPToolHandler<T, R>
): { tool: MCPTool; handler: MCPToolHandler<T, R> } {
  return {
    tool: {
      name: config.name,
      description: config.description,
      inputSchema: config.inputSchema
    },
    handler
  };
}