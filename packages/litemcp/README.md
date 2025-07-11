# MCP Cloudflare Workers Library

A clean and simple library for building Model Context Protocol (MCP) servers on Cloudflare Workers.

## Features

- ✅ **Full MCP Protocol Support**: Complete implementation of MCP specification
  - Tools (tools/list, tools/call)
  - Resources (resources/list, resources/read, resources/templates/list)
  - Prompts (prompts/list, prompts/get)
  - Sampling (sampling/createMessage)
  - Logging (logging/setLevel)
- ✅ **JSON-RPC 2.0 compliant**
- ✅ **Server-Sent Events (SSE)** support for streaming
- ✅ **CORS handling**
- ✅ **TypeScript support** with comprehensive type definitions
- ✅ **Easy registration** for tools, resources, and prompts
- ✅ **Helper functions** for common use cases
- ✅ **Clean error handling**

## Quick Start

### 1. Create an MCP Server

```typescript
import { MCPServer } from './lib/mcp-cloudflare/index.js';

const server = new MCPServer({
  name: 'my-mcp-server',
  version: '1.0.0'
});
```

### 2. Create Tools

```typescript
import { createTool } from './lib/mcp-cloudflare/index.js';

const myTool = createTool({
  name: "echo",
  description: "Echo back the input message",
  inputSchema: {
    type: "object",
    properties: {
      message: { type: "string" }
    },
    required: ["message"]
  }
}, async (input: { message: string }) => {
  return {
    content: [{
      type: 'text',
      text: `Echo: ${input.message}`
    }]
  };
});
```

### 3. Register Tools and Handle Requests

```typescript
// Register the tool
server.addTool(myTool.tool, myTool.handler);

// Export the worker
export default {
  async fetch(request: Request): Promise<Response> {
    return server.handleRequest(request);
  },
};
```

## API Reference

### MCPServer

The main server class that handles MCP protocol requests.

```typescript
class MCPServer {
  constructor(serverInfo: MCPServerInfo, capabilities?: MCPCapabilities)
  
  // Tools
  addTool<T, R>(tool: MCPTool, handler: MCPToolHandler<T, R>): void
  
  // Resources
  addResource(resource: MCPResource, handler: MCPResourceHandler): void
  addResourceTemplate(template: MCPResourceTemplate, handler: MCPResourceHandler): void
  
  // Prompts
  addPrompt(prompt: MCPPrompt, handler: MCPPromptHandler): void
  
  // Sampling
  setSamplingHandler(handler: MCPSamplingHandler): void
  
  // Configuration
  setLogLevel(level: MCPLogLevel): void
  
  // Request handling
  handleRequest(request: Request): Promise<Response>
}
```

### Helper Functions

#### createTool

Helper function for creating tools with proper typing.

```typescript
function createTool<T, R>(
  config: ToolConfig, 
  handler: MCPToolHandler<T, R>
): { tool: MCPTool; handler: MCPToolHandler<T, R> }
```

#### createResource

Create resources for exposing data.

```typescript
// Simple text resource
function createTextResource(
  uri: string,
  name: string,
  text: string,
  options?: { description?: string; mimeType?: string }
): { resource: MCPResource; handler: MCPResourceHandler }

// Binary resource (base64 encoded)
function createBinaryResource(
  uri: string,
  name: string,
  data: string,
  options?: { description?: string; mimeType?: string }
): { resource: MCPResource; handler: MCPResourceHandler }

// Resource template for dynamic URIs
function createResourceTemplate(
  template: MCPResourceTemplate,
  handler: MCPResourceHandler
): { template: MCPResourceTemplate; handler: MCPResourceHandler }
```

#### createPrompt

Create reusable prompt templates.

```typescript
// Simple prompt with argument substitution
function createSimplePrompt(
  name: string,
  description: string,
  messageContent: string,
  options?: { arguments?: MCPPromptArgument[]; role?: 'user' | 'assistant' }
): { prompt: MCPPrompt; handler: MCPPromptHandler }

// Multi-step conversation prompt
function createMultiStepPrompt(
  name: string,
  description: string,
  steps: Array<{ role: 'user' | 'assistant'; content: string }>,
  options?: { arguments?: MCPPromptArgument[] }
): { prompt: MCPPrompt; handler: MCPPromptHandler }

// Analysis prompt for resources
function createAnalysisPrompt(
  name: string,
  resourceUri: string,
  analysisInstructions: string,
  options?: { description?: string; arguments?: MCPPromptArgument[] }
): { prompt: MCPPrompt; handler: MCPPromptHandler }
```

#### createSampling

Create sampling handlers for LLM completion requests.

```typescript
// Basic sampling handler
function createSamplingHandler(
  handler: MCPSamplingHandler
): MCPSamplingHandler

// Simple sampling request
function createSimpleSamplingRequest(
  userMessage: string,
  options?: {
    systemPrompt?: string;
    temperature?: number;
    maxTokens?: number;
    modelPreferences?: MCPModelPreferences;
    includeContext?: 'none' | 'thisServer' | 'allServers';
  }
): MCPSamplingRequest

// Conversation sampling request
function createConversationSamplingRequest(
  conversation: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  options?: { /* same as above */ }
): MCPSamplingRequest

// Specialized sampling requests
function createAnalysisSamplingRequest(
  analysisPrompt: string,
  contextData: string,
  options?: { /* same as above */ }
): MCPSamplingRequest

function createCodeReviewSamplingRequest(
  code: string,
  language: string,
  options?: { focusAreas?: string[]; /* plus same as above */ }
): MCPSamplingRequest
```

### Types

```typescript
interface MCPServerInfo {
  name: string;
  version: string;
}

interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, any>;
    required?: string[];
  };
}

interface MCPToolHandler<T = any, R = any> {
  (args: T): Promise<R>;
}
```

## Example: Complete Worker

```typescript
import { MCPServer, createTool } from './lib/mcp-cloudflare/index.js';

// Create server
const server = new MCPServer({
  name: 'example-server',
  version: '1.0.0'
});

// Create a calculator tool
const calculatorTool = createTool({
  name: "calculate",
  description: "Perform basic arithmetic",
  inputSchema: {
    type: "object",
    properties: {
      operation: { 
        type: "string", 
        enum: ["add", "subtract", "multiply", "divide"] 
      },
      a: { type: "number" },
      b: { type: "number" }
    },
    required: ["operation", "a", "b"]
  }
}, async (input: { operation: string; a: number; b: number }) => {
  let result: number;
  
  switch (input.operation) {
    case 'add': result = input.a + input.b; break;
    case 'subtract': result = input.a - input.b; break;
    case 'multiply': result = input.a * input.b; break;
    case 'divide': result = input.a / input.b; break;
    default: throw new Error('Invalid operation');
  }
  
  return {
    content: [{
      type: 'text',
      text: `${input.a} ${input.operation} ${input.b} = ${result}`
    }]
  };
});

// Register tool
server.addTool(calculatorTool.tool, calculatorTool.handler);

// Export worker
export default {
  async fetch(request: Request): Promise<Response> {
    return server.handleRequest(request);
  },
};
```

## Working with Resources

Resources allow you to expose data and content to MCP clients.

```typescript
import { MCPServer, createTextResource, createResourceTemplate } from './lib/mcp-cloudflare/index.js';

const server = new MCPServer({
  name: 'resource-server',
  version: '1.0.0'
}, {
  resources: {}
});

// Static text resource
const { resource: configResource, handler: configHandler } = createTextResource(
  'file:///config.json',
  'Application Configuration',
  JSON.stringify({ apiUrl: 'https://api.example.com', version: '1.0' }),
  { description: 'Main application configuration', mimeType: 'application/json' }
);

server.addResource(configResource, configHandler);

// Dynamic resource template
const { template: logTemplate, handler: logHandler } = createResourceTemplate({
  uriTemplate: 'logs://{date}/{level}',
  name: 'Application Logs',
  description: 'Daily application logs by level',
  mimeType: 'text/plain'
}, async (uri: string) => {
  // Extract parameters from URI
  const match = uri.match(/logs:\/\/([^\/]+)\/([^\/]+)/);
  if (!match) throw new Error('Invalid log URI format');
  
  const [, date, level] = match;
  const logContent = `[${date}] ${level.toUpperCase()}: Sample log entry`;
  
  return {
    uri,
    mimeType: 'text/plain',
    text: logContent
  };
});

server.addResourceTemplate(logTemplate, logHandler);
```

## Working with Prompts

Prompts provide reusable templates for LLM interactions.

```typescript
import { MCPServer, createSimplePrompt, createMultiStepPrompt } from './lib/mcp-cloudflare/index.js';

const server = new MCPServer({
  name: 'prompt-server',
  version: '1.0.0'
}, {
  prompts: {}
});

// Simple prompt with arguments
const { prompt: codeReviewPrompt, handler: codeReviewHandler } = createSimplePrompt(
  'code-review',
  'Review code for best practices and potential issues',
  'Please review this {{language}} code and provide feedback on best practices, potential bugs, and improvements:\n\n{{code}}',
  {
    arguments: [
      { name: 'language', description: 'Programming language', required: true },
      { name: 'code', description: 'Code to review', required: true }
    ]
  }
);

server.addPrompt(codeReviewPrompt, codeReviewHandler);

// Multi-step conversation prompt
const { prompt: tutorialPrompt, handler: tutorialHandler } = createMultiStepPrompt(
  'learning-session',
  'Interactive learning session on a programming topic',
  [
    {
      role: 'user',
      content: 'I want to learn about {{topic}}. Can you explain it step by step?'
    },
    {
      role: 'assistant',
      content: 'I\'d be happy to explain {{topic}}! Let me break it down into manageable steps.'
    },
    {
      role: 'user',
      content: 'Please start with the basics and use {{difficulty}} level explanations.'
    }
  ],
  {
    arguments: [
      { name: 'topic', description: 'Topic to learn about', required: true },
      { name: 'difficulty', description: 'Difficulty level (beginner/intermediate/advanced)', required: false }
    ]
  }
);

server.addPrompt(tutorialPrompt, tutorialHandler);
```

## Working with Sampling

Sampling allows your server to request LLM completions from clients.

```typescript
import { 
  MCPServer, 
  createSamplingHandler,
  createSimpleSamplingRequest,
  createCodeReviewSamplingRequest
} from './lib/mcp-cloudflare/index.js';

const server = new MCPServer({
  name: 'sampling-server',
  version: '1.0.0'
}, {
  sampling: {}
});

// Set up a sampling handler that the client will call
const samplingHandler = createSamplingHandler(async (request) => {
  // This would typically make an API call to an LLM service
  // For example, OpenAI, Anthropic, etc.
  
  const userMessage = request.messages[request.messages.length - 1];
  
  // Mock response - in practice, you'd call your LLM API
  const mockResponse = `I received your message: "${userMessage.content.text}". This is a mock response.`;
  
  return {
    role: 'assistant',
    content: {
      type: 'text',
      text: mockResponse
    },
    model: 'gpt-4',
    stopReason: 'endTurn'
  };
});

server.setSamplingHandler(samplingHandler);

// Create a tool that uses sampling
const { tool: analysisTool, handler: analysisHandler } = createTool({
  name: 'analyze-text',
  description: 'Analyze text using LLM sampling',
  inputSchema: {
    type: 'object',
    properties: {
      text: { type: 'string' },
      analysisType: { 
        type: 'string',
        enum: ['sentiment', 'summary', 'keywords']
      }
    },
    required: ['text', 'analysisType']
  }
}, async (input: { text: string; analysisType: string }) => {
  // Create a sampling request based on the analysis type
  let prompt: string;
  switch (input.analysisType) {
    case 'sentiment':
      prompt = `Analyze the sentiment of this text: "${input.text}"`;
      break;
    case 'summary':
      prompt = `Summarize this text in 2-3 sentences: "${input.text}"`;
      break;
    case 'keywords':
      prompt = `Extract the main keywords from this text: "${input.text}"`;
      break;
    default:
      throw new Error('Invalid analysis type');
  }
  
  const samplingRequest = createSimpleSamplingRequest(prompt, {
    temperature: 0.3,
    maxTokens: 200
  });
  
  // Make the sampling request to the client
  const response = await samplingHandler(samplingRequest);
  
  return {
    content: [{
      type: 'text',
      text: response.content.text
    }]
  };
});

server.addTool(analysisTool, analysisHandler);

// Example: Code review with sampling
const { tool: codeReviewTool, handler: codeReviewHandler } = createTool({
  name: 'review-code',
  description: 'Review code using LLM sampling',
  inputSchema: {
    type: 'object',
    properties: {
      code: { type: 'string' },
      language: { type: 'string' }
    },
    required: ['code', 'language']
  }
}, async (input: { code: string; language: string }) => {
  const samplingRequest = createCodeReviewSamplingRequest(
    input.code,
    input.language,
    {
      focusAreas: ['security', 'performance', 'maintainability'],
      temperature: 0.1,
      maxTokens: 500
    }
  );
  
  const response = await samplingHandler(samplingRequest);
  
  return {
    content: [{
      type: 'text',
      text: `Code Review Results:\n\n${response.content.text}`
    }]
  };
});

server.addTool(codeReviewTool, codeReviewHandler);
```

## Usage with Claude Desktop

Add to your Claude Desktop config:

```json
{
  "mcpServers": {
    "my-server": {
      "url": "https://your-worker.your-subdomain.workers.dev/"
    }
  }
}
```

## Development

The library automatically handles:
- MCP protocol initialization
- JSON-RPC request/response formatting
- Error handling and proper HTTP status codes
- CORS headers for web clients
- Server-Sent Events for streaming connections

No additional setup required!