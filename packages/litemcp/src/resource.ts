import { MCPResource, MCPResourceTemplate, MCPResourceHandler, MCPResourceContent } from './types.js';

export function createResource(
  resource: MCPResource,
  handler: MCPResourceHandler
): { resource: MCPResource; handler: MCPResourceHandler } {
  return { resource, handler };
}

export function createResourceTemplate(
  template: MCPResourceTemplate,
  handler: MCPResourceHandler
): { resourceTemplate: MCPResourceTemplate; handler: MCPResourceHandler } {
  return { resourceTemplate: template, handler };
}

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
      // In Cloudflare Workers, we'd need to read from storage or external source
      // This is a placeholder for file reading logic
      throw new Error('File reading not implemented in this environment');
    } catch (error) {
      throw new Error(`Failed to read file: ${filePath}`);
    }
  };

  return { resource, handler };
}