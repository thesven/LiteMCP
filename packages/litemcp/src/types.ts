export interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface MCPToolHandler<T = any, R = any> {
  (args: T): Promise<R>;
}

export interface JsonRpcRequest {
  jsonrpc: "2.0";
  id?: string | number | null;
  method: string;
  params?: any;
}

export interface JsonRpcResponse {
  jsonrpc: "2.0";
  id: string | number | null;
  result?: any;
  error?: {
    code: number;
    message: string;
  };
}

export interface MCPServerInfo {
  name: string;
  version: string;
}

export interface MCPCapabilities {
  tools?: {
    listChanged?: boolean;
  };
  resources?: {
    subscribe?: boolean;
    listChanged?: boolean;
  };
  prompts?: {
    listChanged?: boolean;
  };
  sampling?: {};
  logging?: {};
}

export interface MCPInitializeResult {
  protocolVersion: string;
  capabilities: MCPCapabilities;
  serverInfo: MCPServerInfo;
}

// Resource types
export interface MCPResource {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
}

export interface MCPResourceTemplate {
  uriTemplate: string;
  name: string;
  description?: string;
  mimeType?: string;
}

export interface MCPResourceContent {
  uri: string;
  mimeType?: string;
  text?: string;
  blob?: string; // base64 encoded for binary data
}

export interface MCPResourceHandler {
  (uri: string): Promise<MCPResourceContent>;
}

// Prompt types
export interface MCPPromptArgument {
  name: string;
  description?: string;
  required?: boolean;
}

export interface MCPPrompt {
  name: string;
  description?: string;
  arguments?: MCPPromptArgument[];
}

export interface MCPPromptMessage {
  role: 'user' | 'assistant' | 'system';
  content: {
    type: 'text' | 'image';
    text?: string;
    data?: string; // base64 for images
    mimeType?: string;
  };
}

export interface MCPPromptResult {
  description?: string;
  messages: MCPPromptMessage[];
}

export interface MCPPromptHandler {
  (args: Record<string, any>): Promise<MCPPromptResult>;
}

// Sampling types
export interface MCPSamplingMessage {
  role: 'user' | 'assistant' | 'system';
  content: {
    type: 'text' | 'image';
    text?: string;
    data?: string;
    mimeType?: string;
  };
}

export interface MCPModelPreferences {
  hints?: {
    name?: string;
  };
  costPriority?: number;
  speedPriority?: number;
  intelligencePriority?: number;
}

export interface MCPSamplingRequest {
  messages: MCPSamplingMessage[];
  modelPreferences?: MCPModelPreferences;
  systemPrompt?: string;
  includeContext?: 'none' | 'thisServer' | 'allServers' | 'thisSession';
  temperature?: number;
  maxTokens?: number;
  stopSequences?: string[];
  metadata?: Record<string, any>;
}

export interface MCPSamplingResponse {
  role: 'assistant';
  content: {
    type: 'text';
    text: string;
  };
  model?: string;
  stopReason?: 'endTurn' | 'stopSequence' | 'maxTokens';
}

export interface MCPSamplingHandler {
  (request: MCPSamplingRequest): Promise<MCPSamplingResponse>;
}

// Logging types
export type MCPLogLevel = 'debug' | 'info' | 'notice' | 'warning' | 'error' | 'critical' | 'alert' | 'emergency';

export interface MCPLogEntry {
  level: MCPLogLevel;
  data?: any;
  logger?: string;
}