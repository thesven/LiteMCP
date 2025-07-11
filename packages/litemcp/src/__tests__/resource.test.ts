import { describe, it, expect, vi } from 'vitest';
import {
  createResource,
  createResourceTemplate,
  createTextResource,
  createBinaryResource,
  createFileResource,
} from '../resource.js';

describe('Resource utilities', () => {
  describe('createResource', () => {
    it('should create a basic resource', () => {
      const config = {
        uri: 'test://resource',
        name: 'Test Resource',
        description: 'A test resource',
        mimeType: 'text/plain',
      };

      const handler = vi.fn().mockResolvedValue({
        uri: 'test://resource',
        mimeType: 'text/plain',
        text: 'content',
      });

      const { resource, handler: returnedHandler } = createResource(config, handler);

      expect(resource).toEqual(config);
      expect(returnedHandler).toBe(handler);
    });

    it('should create a resource with optional fields', () => {
      const config = {
        uri: 'test://optional',
        name: 'Optional Resource',
      };

      const handler = vi.fn().mockResolvedValue({
        uri: 'test://optional',
        mimeType: 'application/octet-stream',
        blob: new Uint8Array([1, 2, 3]),
      });

      const { resource } = createResource(config, handler);

      expect(resource.uri).toBe('test://optional');
      expect(resource.name).toBe('Optional Resource');
      expect(resource.description).toBeUndefined();
      expect(resource.mimeType).toBeUndefined();
    });
  });

  describe('createResourceTemplate', () => {
    it('should create a resource template', () => {
      const config = {
        uriTemplate: 'test://{id}',
        name: 'Test Template',
        description: 'A test template',
        mimeType: 'application/json',
      };

      const handler = vi.fn().mockResolvedValue({
        uri: 'test://123',
        mimeType: 'application/json',
        text: '{"id": "123"}',
      });

      const { resourceTemplate, handler: returnedHandler } = createResourceTemplate(
        config,
        handler
      );

      expect(resourceTemplate).toEqual(config);
      expect(returnedHandler).toBe(handler);
    });
  });

  describe('createTextResource', () => {
    it('should create a text resource with minimal config', () => {
      const { resource, handler } = createTextResource(
        'text://simple',
        'Simple Text',
        'Hello World'
      );

      expect(resource).toEqual({
        uri: 'text://simple',
        name: 'Simple Text',
        mimeType: 'text/plain',
      });

      expect(handler).toBeInstanceOf(Function);
    });

    it('should create a text resource with custom options', async () => {
      const { resource, handler } = createTextResource(
        'text://custom',
        'Custom Text',
        'Custom content',
        {
          description: 'Custom description',
          mimeType: 'text/markdown',
        }
      );

      expect(resource).toEqual({
        uri: 'text://custom',
        name: 'Custom Text',
        description: 'Custom description',
        mimeType: 'text/markdown',
      });

      const result = await handler('text://custom');
      expect(result).toEqual({
        uri: 'text://custom',
        mimeType: 'text/markdown',
        text: 'Custom content',
      });
    });
  });

  describe('createBinaryResource', () => {
    it('should create a binary resource with Uint8Array', async () => {
      const binaryData = new Uint8Array([1, 2, 3, 4, 5]);

      const { resource, handler } = createBinaryResource(
        'binary://data',
        'Binary Data',
        binaryData
      );

      expect(resource).toEqual({
        uri: 'binary://data',
        name: 'Binary Data',
        mimeType: 'application/octet-stream',
      });

      const result = await handler('binary://data');
      expect(result).toEqual({
        uri: 'binary://data',
        mimeType: 'application/octet-stream',
        blob: binaryData,
      });
    });
  });

  describe('createFileResource', () => {
    it('should create a file resource', () => {
      const { resource, handler } = createFileResource(
        'file:///test.txt',
        'Test File',
        '/path/to/test.txt'
      );

      expect(resource).toEqual({
        uri: 'file:///test.txt',
        name: 'Test File',
        mimeType: 'text/plain',
      });

      expect(handler).toBeInstanceOf(Function);
    });

    it('should auto-detect MIME type from file extension', () => {
      const testCases = [
        { path: '/test.html', expected: 'text/html' },
        { path: '/test.css', expected: 'text/css' },
        { path: '/test.js', expected: 'application/javascript' },
        { path: '/test.json', expected: 'application/json' },
        { path: '/test.xml', expected: 'application/xml' },
        { path: '/test.png', expected: 'image/png' },
        { path: '/test.jpg', expected: 'image/jpeg' },
        { path: '/test.pdf', expected: 'application/pdf' },
        { path: '/test.unknown', expected: 'application/octet-stream' },
      ];

      testCases.forEach(({ path, expected }) => {
        const { resource } = createFileResource(`file://${path}`, 'Test File', path);
        expect(resource.mimeType).toBe(expected);
      });
    });
  });
});
