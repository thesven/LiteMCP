/**
 * Represents a Model Context Protocol (MCP) tool that can be called by clients.
 * Tools provide a way for the AI to execute actions, retrieve data, or perform computations.
 * 
 * @example
 * ```typescript
 * const weatherTool: MCPTool = {
 *   name: "get_weather",
 *   description: "Get current weather for a location",
 *   inputSchema: {
 *     type: "object",
 *     properties: {
 *       location: { type: "string", description: "City name" },
 *       units: { type: "string", enum: ["celsius", "fahrenheit"] }
 *     },
 *     required: ["location"]
 *   }
 * };
 * ```
 */
export interface MCPTool {
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
 * Function signature for handling MCP tool calls.
 * 
 * @template T - Type of the input arguments
 * @template R - Type of the return value
 * @param args - The arguments passed to the tool, validated against the tool's inputSchema
 * @returns Promise that resolves to the tool's result
 * 
 * @example
 * ```typescript
 * const weatherHandler: MCPToolHandler<{location: string}, {temperature: number}> = async (args) => {
 *   const weather = await fetchWeather(args.location);
 *   return { temperature: weather.temp };
 * };
 * ```
 */
export interface MCPToolHandler<T = any, R = any> {
  (args: T): Promise<R>;
}

/**
 * JSON-RPC 2.0 request structure as defined by the specification.
 * Used for all communication in the Model Context Protocol.
 * 
 * @see {@link https://www.jsonrpc.org/specification JSON-RPC 2.0 Specification}
 */
export interface JsonRpcRequest {
  /** JSON-RPC version, always "2.0" */
  jsonrpc: "2.0";
  /** Unique identifier for the request, can be string, number, or null */
  id?: string | number | null;
  /** Name of the method to be invoked */
  method: string;
  /** Parameters to be passed to the method */
  params?: any;
}

/**
 * JSON-RPC 2.0 response structure as defined by the specification.
 * Contains either a result or an error, never both.
 * 
 * @see {@link https://www.jsonrpc.org/specification JSON-RPC 2.0 Specification}
 */
export interface JsonRpcResponse {
  /** JSON-RPC version, always "2.0" */
  jsonrpc: "2.0";
  /** Same ID as the corresponding request */
  id: string | number | null;
  /** Result of the method call, present when successful */
  result?: any;
  /** Error information, present when the call failed */
  error?: {
    /** Numeric error code indicating the type of error */
    code: number;
    /** Human-readable error message */
    message: string;
  };
}

/**
 * Basic information about an MCP server instance.
 * Provided during the initialization handshake.
 */
export interface MCPServerInfo {
  /** Name of the MCP server */
  name: string;
  /** Version of the MCP server */
  version: string;
}

/**
 * Capabilities supported by an MCP server, declared during initialization.
 * Capabilities determine which features the client can use with this server.
 */
export interface MCPCapabilities {
  /** Tool-related capabilities */
  tools?: {
    /** Whether the server will notify clients when the tool list changes */
    listChanged?: boolean;
  };
  /** Resource-related capabilities */
  resources?: {
    /** Whether the server supports resource subscriptions for real-time updates */
    subscribe?: boolean;
    /** Whether the server will notify clients when the resource list changes */
    listChanged?: boolean;
  };
  /** Prompt-related capabilities */
  prompts?: {
    /** Whether the server will notify clients when the prompt list changes */
    listChanged?: boolean;
  };
  /** Sampling capabilities - server can handle LLM completion requests */
  sampling?: {};
  /** Logging capabilities - server can receive and process log messages */
  logging?: {};
}

/**
 * Result returned by the server during MCP initialization handshake.
 * Establishes the protocol version, server capabilities, and basic server information.
 */
export interface MCPInitializeResult {
  /** Version of the MCP protocol supported by this server */
  protocolVersion: string;
  /** Capabilities advertised by this server */
  capabilities: MCPCapabilities;
  /** Basic information about this server */
  serverInfo: MCPServerInfo;
}

// Resource types

/**
 * Represents a resource that can be read by MCP clients.
 * Resources provide access to data, files, or other content via URI-based addressing.
 * 
 * @example
 * ```typescript
 * const configResource: MCPResource = {
 *   uri: "file:///config.json",
 *   name: "Application Configuration",
 *   description: "Main application configuration file",
 *   mimeType: "application/json"
 * };
 * ```
 */
export interface MCPResource {
  /** Unique URI identifying this resource */
  uri: string;
  /** Human-readable name for the resource */
  name: string;
  /** Optional description of what this resource contains */
  description?: string;
  /** MIME type of the resource content */
  mimeType?: string;
}

/**
 * Template for dynamically generating resources based on URI patterns.
 * Allows servers to expose collections of resources without listing each one individually.
 * 
 * @example
 * ```typescript
 * const logTemplate: MCPResourceTemplate = {
 *   uriTemplate: "logs://{date}/{level}",
 *   name: "Log Files",
 *   description: "Daily log files by level",
 *   mimeType: "text/plain"
 * };
 * ```
 */
export interface MCPResourceTemplate {
  /** URI template with placeholders (e.g., "logs://{date}/{level}") */
  uriTemplate: string;
  /** Human-readable name for resources matching this template */
  name: string;
  /** Optional description of resources matching this template */
  description?: string;
  /** MIME type of resources matching this template */
  mimeType?: string;
}

/**
 * Content of a resource when read by an MCP client.
 * Contains either text content or binary data encoded as base64.
 */
export interface MCPResourceContent {
  /** URI of the resource being returned */
  uri: string;
  /** MIME type of the content */
  mimeType?: string;
  /** Text content for text-based resources */
  text?: string;
  /** Binary data encoded as base64 for binary resources */
  blob?: string;
}

/**
 * Function signature for handling resource read requests.
 * 
 * @param uri - The URI of the resource to read
 * @returns Promise that resolves to the resource content
 * 
 * @example
 * ```typescript
 * const fileHandler: MCPResourceHandler = async (uri) => {
 *   const content = await readFile(uri);
 *   return {
 *     uri,
 *     mimeType: "text/plain",
 *     text: content
 *   };
 * };
 * ```
 */
export interface MCPResourceHandler {
  (uri: string): Promise<MCPResourceContent>;
}

// Prompt types

/**
 * Defines an argument that can be passed to an MCP prompt.
 * Arguments allow prompts to be dynamic and reusable.
 */
export interface MCPPromptArgument {
  /** Name of the argument */
  name: string;
  /** Optional description of what this argument is for */
  description?: string;
  /** Whether this argument is required when calling the prompt */
  required?: boolean;
}

/**
 * Represents a reusable prompt template that can be executed by MCP clients.
 * Prompts provide a way to encapsulate common AI interaction patterns.
 * 
 * @example
 * ```typescript
 * const codeReviewPrompt: MCPPrompt = {
 *   name: "code-review",
 *   description: "Review code for potential issues",
 *   arguments: [
 *     { name: "language", required: true, description: "Programming language" },
 *     { name: "code", required: true, description: "Code to review" }
 *   ]
 * };
 * ```
 */
export interface MCPPrompt {
  /** Unique identifier for the prompt */
  name: string;
  /** Optional description of what this prompt does */
  description?: string;
  /** List of arguments that can be passed to this prompt */
  arguments?: MCPPromptArgument[];
}

/**
 * Represents a message in a prompt conversation.
 * Messages form the basis of AI interactions in the MCP protocol.
 */
export interface MCPPromptMessage {
  /** Role of the message sender */
  role: 'user' | 'assistant' | 'system';
  /** Content of the message */
  content: {
    /** Type of content - text or image */
    type: 'text' | 'image';
    /** Text content for text messages */
    text?: string;
    /** Base64-encoded data for images */
    data?: string;
    /** MIME type for image content */
    mimeType?: string;
  };
}

/**
 * Result returned when executing an MCP prompt.
 * Contains the generated conversation messages.
 */
export interface MCPPromptResult {
  /** Optional description of the prompt result */
  description?: string;
  /** Array of messages forming the prompt conversation */
  messages: MCPPromptMessage[];
}

/**
 * Function signature for handling prompt execution requests.
 * 
 * @param args - Arguments passed to the prompt, matching the prompt's argument definitions
 * @returns Promise that resolves to the prompt result
 * 
 * @example
 * ```typescript
 * const codeReviewHandler: MCPPromptHandler = async (args) => {
 *   return {
 *     description: `Code review for ${args.language}`,
 *     messages: [{
 *       role: 'user',
 *       content: {
 *         type: 'text',
 *         text: `Please review this ${args.language} code: ${args.code}`
 *       }
 *     }]
 *   };
 * };
 * ```
 */
export interface MCPPromptHandler {
  (args: Record<string, any>): Promise<MCPPromptResult>;
}

// Sampling types

/**
 * Message structure for LLM sampling requests.
 * Similar to prompt messages but used specifically for requesting AI completions.
 */
export interface MCPSamplingMessage {
  /** Role of the message sender */
  role: 'user' | 'assistant' | 'system';
  /** Content of the message */
  content: {
    /** Type of content - text or image */
    type: 'text' | 'image';
    /** Text content for text messages */
    text?: string;
    /** Base64-encoded data for images */
    data?: string;
    /** MIME type for image content */
    mimeType?: string;
  };
}

/**
 * Preferences for model selection during sampling requests.
 * Allows clients to specify trade-offs between cost, speed, and intelligence.
 */
export interface MCPModelPreferences {
  /** Hints about preferred model characteristics */
  hints?: {
    /** Preferred model name or family */
    name?: string;
  };
  /** Priority weight for cost considerations (0-1) */
  costPriority?: number;
  /** Priority weight for response speed (0-1) */
  speedPriority?: number;
  /** Priority weight for model intelligence/capability (0-1) */
  intelligencePriority?: number;
}

/**
 * Request for LLM sampling/completion sent to MCP servers.
 * Allows servers to request AI assistance for complex tasks.
 * 
 * @example
 * ```typescript
 * const samplingRequest: MCPSamplingRequest = {
 *   messages: [
 *     {
 *       role: 'user',
 *       content: { type: 'text', text: 'Analyze this data and provide insights' }
 *     }
 *   ],
 *   temperature: 0.7,
 *   maxTokens: 500
 * };
 * ```
 */
export interface MCPSamplingRequest {
  /** Conversation messages for the sampling request */
  messages: MCPSamplingMessage[];
  /** Preferences for model selection */
  modelPreferences?: MCPModelPreferences;
  /** System prompt to set context for the AI */
  systemPrompt?: string;
  /** How much context to include from other servers/sessions */
  includeContext?: 'none' | 'thisServer' | 'allServers' | 'thisSession';
  /** Sampling temperature (0-2), higher values increase randomness */
  temperature?: number;
  /** Maximum number of tokens to generate */
  maxTokens?: number;
  /** Sequences that will stop generation when encountered */
  stopSequences?: string[];
  /** Additional metadata for the request */
  metadata?: Record<string, any>;
}

/**
 * Response from an LLM sampling request.
 * Contains the AI-generated content and metadata about the generation.
 */
export interface MCPSamplingResponse {
  /** Role is always 'assistant' for AI responses */
  role: 'assistant';
  /** Generated content from the AI */
  content: {
    /** Content type, currently only text is supported */
    type: 'text';
    /** The generated text response */
    text: string;
  };
  /** Name or identifier of the model that generated this response */
  model?: string;
  /** Reason why generation stopped */
  stopReason?: 'endTurn' | 'stopSequence' | 'maxTokens';
}

/**
 * Function signature for handling LLM sampling requests.
 * Allows servers to delegate complex reasoning tasks to AI models.
 * 
 * @param request - The sampling request containing messages and parameters
 * @returns Promise that resolves to the AI-generated response
 * 
 * @example
 * ```typescript
 * const samplingHandler: MCPSamplingHandler = async (request) => {
 *   const response = await llmProvider.complete(request);
 *   return {
 *     role: 'assistant',
 *     content: { type: 'text', text: response.text },
 *     model: response.model,
 *     stopReason: 'endTurn'
 *   };
 * };
 * ```
 */
export interface MCPSamplingHandler {
  (request: MCPSamplingRequest): Promise<MCPSamplingResponse>;
}

// Logging types

/**
 * Log levels supported by the MCP protocol, following syslog severity levels.
 * Used for structured logging and debugging across MCP servers and clients.
 */
export type MCPLogLevel = 'debug' | 'info' | 'notice' | 'warning' | 'error' | 'critical' | 'alert' | 'emergency';

/**
 * Represents a single log entry in the MCP logging system.
 * Used for structured logging and debugging information.
 * 
 * @example
 * ```typescript
 * const logEntry: MCPLogEntry = {
 *   level: 'info',
 *   data: { action: 'tool_called', toolName: 'get_weather' },
 *   logger: 'weather-server'
 * };
 * ```
 */
export interface MCPLogEntry {
  /** Severity level of this log entry */
  level: MCPLogLevel;
  /** Structured data associated with this log entry */
  data?: any;
  /** Optional identifier for the component that generated this log */
  logger?: string;
}