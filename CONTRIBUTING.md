# Contributing to LiteMCP

Thank you for your interest in contributing to LiteMCP! We welcome contributions from the community and are pleased to have you join us.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please be respectful and constructive in all interactions.

## Getting Started

### Prerequisites

- Node.js 20+ 
- pnpm (recommended package manager)
- TypeScript knowledge
- Familiarity with the Model Context Protocol (MCP)

### Development Setup

1. **Fork and clone the repository:**
   ```bash
   git clone https://github.com/litemcp/litemcp.git
   cd litemcp
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Build the project:**
   ```bash
   pnpm build
   ```

4. **Run tests:**
   ```bash
   pnpm test
   ```

5. **Start development:**
   ```bash
   pnpm dev
   ```

## Development Workflow

### Project Structure

```
packages/
├── litemcp/                # Core MCP library
│   ├── src/
│   │   ├── server.ts       # Main MCP server implementation
│   │   ├── types.ts        # TypeScript type definitions
│   │   ├── tool.ts         # Tool utilities
│   │   ├── resource.ts     # Resource utilities
│   │   ├── prompt.ts       # Prompt utilities
│   │   ├── sampling.ts     # Sampling utilities
│   │   └── __tests__/      # Test suite
│   └── package.json
└── example-server/         # Example Cloudflare Worker
    ├── src/index.ts
    └── package.json
```

### Available Scripts

- `pnpm build` - Build all packages
- `pnpm test` - Run test suite
- `pnpm lint` - Run ESLint
- `pnpm format` - Format code with Prettier
- `pnpm type-check` - TypeScript type checking
- `pnpm docs` - Generate documentation

### Making Changes

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes following our coding standards:**
   - Write TypeScript with full type safety
   - Add comprehensive TSDoc comments for public APIs
   - Follow existing code patterns and conventions
   - Maintain test coverage

3. **Test your changes:**
   ```bash
   pnpm test
   pnpm lint
   pnpm type-check
   ```

4. **Commit your changes:**
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

## Contribution Guidelines

### Code Style

- Use TypeScript with strict type checking
- Follow the existing ESLint and Prettier configuration
- Write clear, self-documenting code
- Add TSDoc comments for all public APIs

### Commit Messages

We use conventional commit messages:

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `test:` - Test additions or modifications
- `refactor:` - Code refactoring
- `chore:` - Maintenance tasks

Example: `feat: add support for binary resources`

### Pull Request Process

1. **Ensure all tests pass and code is properly formatted**
2. **Update documentation if needed**
3. **Add tests for new functionality**
4. **Create a pull request with:**
   - Clear title and description
   - Reference to any related issues
   - Screenshots or examples if applicable

5. **Address review feedback promptly**

### Adding New Features

#### Tools
```typescript
import { createTool } from 'litemcp';

const newTool = createTool({
  name: "tool-name",
  description: "What the tool does",
  inputSchema: {
    type: "object",
    properties: {
      param: { type: "string", description: "Parameter description" }
    },
    required: ["param"]
  }
}, async (args) => {
  // Implementation
  return { content: [{ type: 'text', text: 'Result' }] };
});
```

#### Resources
```typescript
import { createTextResource } from 'litemcp';

const newResource = createTextResource(
  'resource://uri',
  'Resource Name',
  'Resource content',
  { description: 'What this resource provides' }
);
```

#### Prompts
```typescript
import { createSimplePrompt } from 'litemcp';

const newPrompt = createSimplePrompt(
  'prompt-name',
  'Prompt description',
  'Prompt template with {{variables}}',
  { arguments: [{ name: 'variables', required: true }] }
);
```

### Testing

- Write unit tests for all new functionality
- Maintain high test coverage (aim for 80%+)
- Test edge cases and error conditions
- Use descriptive test names and organize tests logically

Example test structure:
```typescript
describe('Feature Name', () => {
  describe('specific function', () => {
    it('should do expected behavior when condition', () => {
      // Test implementation
    });
  });
});
```

### Documentation

- Update README.md if adding new features
- Add TSDoc comments for all public APIs
- Include usage examples in documentation
- Keep documentation up to date with code changes

## Release Process

1. Update version numbers using semantic versioning
2. Update CHANGELOG.md with release notes
3. Create a release tag
4. Publish to npm registry (maintainers only)

## Getting Help

- **Documentation:** Check the README and inline code documentation
- **Issues:** Search existing issues or create a new one
- **Discussions:** Use GitHub Discussions for questions and ideas

## Security

If you discover a security vulnerability, please send an email to security@litemcp.org instead of creating a public issue.

## Recognition

Contributors will be recognized in our README and release notes. Thank you for helping make LiteMCP better!

---

By contributing to LiteMCP, you agree that your contributions will be licensed under the same MIT license that covers the project.