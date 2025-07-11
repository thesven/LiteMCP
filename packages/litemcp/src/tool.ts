import { MCPTool, MCPToolHandler } from './types.js';

/**
 * Configuration for creating an MCP tool.
 * Simplified interface for tool creation with validation.
 */
export interface ToolConfig {
  /** Unique identifier for the tool */
  name: string;
  /** Human-readable description of what the tool does */
  description: string;
  /** JSON Schema definition for the tool's input parameters */
  inputSchema: {
    type: "object";
    properties: Record<string, any>;
    required?: string[];
  };
}

/**
 * Creates an MCP tool with its handler function.
 * This is a convenience function that returns both the tool definition and handler
 * in a format ready for registration with an MCP server.
 * 
 * @template T - Type of the tool's input arguments
 * @template R - Type of the tool's return value
 * @param config - Tool configuration including name, description, and input schema
 * @param handler - Function to handle tool execution
 * @returns Object containing the tool definition and handler
 * 
 * @example
 * ```typescript
 * import { createTool } from 'litemcp';
 * 
 * const weatherTool = createTool({
 *   name: "get_weather",
 *   description: "Get current weather for a location",
 *   inputSchema: {
 *     type: "object",
 *     properties: {
 *       location: { type: "string", description: "City name" },
 *       units: { type: "string", enum: ["celsius", "fahrenheit"], default: "celsius" }
 *     },
 *     required: ["location"]
 *   }
 * }, async (args: { location: string; units?: string }) => {
 *   const weather = await fetchWeatherData(args.location, args.units);
 *   return {
 *     content: [{
 *       type: 'text',
 *       text: `Weather in ${args.location}: ${weather.temperature}°${weather.units}`
 *     }]
 *   };
 * });
 * 
 * // Register with server
 * server.addTool(weatherTool.tool, weatherTool.handler);
 * ```
 */
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