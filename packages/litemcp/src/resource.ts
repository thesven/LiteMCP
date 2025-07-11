import { MCPResource, MCPResourceTemplate, MCPResourceHandler, MCPResourceContent } from './types.js';

/**
 * Creates a resource with its handler function.
 * This is a simple wrapper that returns both the resource definition and handler
 * in a format ready for registration with an MCP server.
 * 
 * @param resource - The resource definition
 * @param handler - Function to handle resource read requests
 * @returns Object containing the resource definition and handler
 * 
 * @example
 * ```typescript
 * const configResource = createResource(
 *   {
 *     uri: "config://app",
 *     name: "App Configuration",
 *     mimeType: "application/json"
 *   },
 *   async (uri) => {
 *     const config = await loadConfiguration();
 *     return {
 *       uri,
 *       text: JSON.stringify(config),
 *       mimeType: "application/json"
 *     };
 *   }
 * );
 * 
 * server.addResource(configResource.resource, configResource.handler);
 * ```
 */
export function createResource(
  resource: MCPResource,
  handler: MCPResourceHandler
): { resource: MCPResource; handler: MCPResourceHandler } {
  return { resource, handler };
}

/**
 * Creates a resource template with its handler function.
 * Resource templates allow dynamic resource generation based on URI patterns.
 * 
 * @param template - The resource template definition with URI pattern
 * @param handler - Function to handle resource read requests for this template
 * @returns Object containing the resource template and handler
 * 
 * @example
 * ```typescript
 * const logTemplate = createResourceTemplate(
 *   {
 *     uriTemplate: "logs://{date}/{level}",
 *     name: "Log Files",
 *     description: "Daily log files by severity level",
 *     mimeType: "text/plain"
 *   },
 *   async (uri) => {
 *     const { date, level } = parseLogUri(uri);
 *     const content = await readLogFile(date, level);
 *     return { uri, text: content, mimeType: "text/plain" };
 *   }
 * );
 * 
 * server.addResourceTemplate(logTemplate.resourceTemplate, logTemplate.handler);
 * ```
 */
export function createResourceTemplate(
  template: MCPResourceTemplate,
  handler: MCPResourceHandler
): { resourceTemplate: MCPResourceTemplate; handler: MCPResourceHandler } {
  return { resourceTemplate: template, handler };
}

/**
 * Creates a text-based resource with static content.
 * Convenience function for creating resources that serve fixed text content.
 * 
 * @param uri - Unique URI for this resource
 * @param name - Human-readable name for the resource
 * @param text - The text content to serve
 * @param options - Optional description and MIME type
 * @returns Object containing the resource definition and handler
 * 
 * @example
 * ```typescript
 * const helpResource = createTextResource(
 *   "help://commands",
 *   "Available Commands",
 *   "Available commands:\n1. get_weather - Get weather data\n2. translate - Translate text",
 *   {
 *     description: "List of all available commands",
 *     mimeType: "text/plain"
 *   }
 * );
 * 
 * server.addResource(helpResource.resource, helpResource.handler);
 * ```
 */
export function createTextResource(
  uri: string,
  name: string,
  text: string,
  options: {
    description?: string;
    mimeType?: string;
  } = {}
): { resource: MCPResource; handler: MCPResourceHandler } {
  const resource: MCPResource = {
    uri,
    name,
    description: options.description,
    mimeType: options.mimeType || 'text/plain'
  };

  const handler: MCPResourceHandler = async () => {
    return {
      uri,
      mimeType: resource.mimeType,
      text
    };
  };

  return { resource, handler };
}

/**
 * Creates a binary resource with static base64-encoded content.
 * Convenience function for creating resources that serve binary data like images, PDFs, etc.
 * 
 * @param uri - Unique URI for this resource
 * @param name - Human-readable name for the resource
 * @param data - Base64-encoded binary data
 * @param options - Optional description and MIME type
 * @returns Object containing the resource definition and handler
 * 
 * @example
 * ```typescript
 * const logoResource = createBinaryResource(
 *   "assets://logo.png",
 *   "Company Logo",
 *   "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
 *   {
 *     description: "Company logo image",
 *     mimeType: "image/png"
 *   }
 * );
 * 
 * server.addResource(logoResource.resource, logoResource.handler);
 * ```
 */
export function createBinaryResource(
  uri: string,
  name: string,
  data: string, // base64 encoded
  options: {
    description?: string;
    mimeType?: string;
  } = {}
): { resource: MCPResource; handler: MCPResourceHandler } {
  const resource: MCPResource = {
    uri,
    name,
    description: options.description,
    mimeType: options.mimeType || 'application/octet-stream'
  };

  const handler: MCPResourceHandler = async () => {
    return {
      uri,
      mimeType: resource.mimeType,
      blob: data
    };
  };

  return { resource, handler };
}

/**
 * Detects MIME type based on file extension.
 * Used internally by createFileResource to automatically determine content type.
 * 
 * @param filePath - Path to the file
 * @returns MIME type string
 * @internal
 */
function detectMimeType(filePath: string): string {
  const extension = filePath.split('.').pop()?.toLowerCase();
  const mimeTypes: Record<string, string> = {
    'html': 'text/html',
    'css': 'text/css',
    'js': 'application/javascript',
    'json': 'application/json',
    'xml': 'application/xml',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'pdf': 'application/pdf',
    'txt': 'text/plain'
  };
  return mimeTypes[extension || ''] || 'application/octet-stream';
}

/**
 * Creates a file-based resource that reads content from a file path.
 * 
 * **Note**: This function provides a template for file-based resources but requires
 * implementation of actual file reading logic for your specific runtime environment.
 * In Cloudflare Workers, you would typically read from KV storage, R2, or external APIs.
 * 
 * @param uri - Unique URI for this resource
 * @param name - Human-readable name for the resource
 * @param filePath - Path to the file to serve
 * @param options - Optional description and MIME type (auto-detected if not provided)
 * @returns Object containing the resource definition and handler
 * 
 * @example
 * ```typescript
 * // You would need to implement the actual file reading logic
 * const configFileResource = createFileResource(
 *   "file:///config/app.json",
 *   "Application Configuration",
 *   "/path/to/config/app.json",
 *   {
 *     description: "Main application configuration file",
 *     mimeType: "application/json"
 *   }
 * );
 * 
 * // For Cloudflare Workers, you might modify the handler like this:
 * configFileResource.handler = async (uri) => {
 *   const content = await env.CONFIG_BUCKET.get('app.json');
 *   return {
 *     uri,
 *     text: await content.text(),
 *     mimeType: "application/json"
 *   };
 * };
 * ```
 */
export function createFileResource(
  uri: string,
  name: string,
  filePath: string,
  options: {
    description?: string;
    mimeType?: string;
  } = {}
): { resource: MCPResource; handler: MCPResourceHandler } {
  const resource: MCPResource = {
    uri,
    name,
    description: options.description,
    mimeType: options.mimeType || detectMimeType(filePath)
  };

  const handler: MCPResourceHandler = async () => {
    try {
      // In Cloudflare Workers, you'd need to read from storage or external source
      // This is a placeholder for file reading logic
      throw new Error('File reading not implemented in this environment');
    } catch (error) {
      throw new Error(`Failed to read file: ${filePath}`);
    }
  };

  return { resource, handler };
}