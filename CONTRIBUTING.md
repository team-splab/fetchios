# Contributing to Fetchios

Thank you for your interest in contributing to Fetchios! We welcome contributions from everyone.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Submitting Changes](#submitting-changes)
- [Coding Guidelines](#coding-guidelines)

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally
3. **Set up the development environment**
4. **Create a new branch** for your feature or bugfix
5. **Make your changes**
6. **Test your changes**
7. **Submit a pull request**

## Development Setup

```bash
# Clone your fork
git clone https://github.com/your-username/fetchios.git
cd fetchios

# Install dependencies
npm install

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Build the library
npm run build

# Run type checking
npm run type-check

# Lint and format code
npm run lint
npm run format
```

## Making Changes

### Before You Start

- Check if there's already an issue for what you want to work on
- If not, create an issue to discuss your proposed changes
- Wait for maintainer feedback before starting work on large changes

### Branch Naming

Use descriptive branch names:

- `feat/add-new-interceptor` - for new features
- `fix/handle-network-errors` - for bug fixes
- `docs/update-api-reference` - for documentation updates
- `test/add-error-handling-tests` - for test improvements

### Commit Messages

We use [Conventional Commits](https://conventionalcommits.org/) format:

```
type(scope): description

feat(interceptors): add request retry mechanism
fix(types): correct JsonResponse type definition
docs(readme): update installation instructions
test(fetchios): add tests for error handling
```

Types:

- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation changes
- `test`: Test changes
- `refactor`: Code refactoring
- `style`: Code style changes
- `chore`: Build process or auxiliary tool changes

## Submitting Changes

### Pull Request Process

1. **Update documentation** if you're adding new features
2. **Add or update tests** for your changes
3. **Ensure all tests pass** (`npm test`)
4. **Run linting** (`npm run lint`)
5. **Check TypeScript types** (`npm run type-check`)
6. **Update the README** if needed
7. **Create a pull request** with a clear title and description

### Pull Request Requirements

- [ ] Tests pass (`npm test`)
- [ ] Code is linted (`npm run lint`)
- [ ] TypeScript types are correct (`npm run type-check`)
- [ ] Documentation is updated (if applicable)
- [ ] Changes are covered by tests
- [ ] Commit messages follow conventional format

### Pull Request Template

```markdown
## Description

Brief description of what this PR does.

## Type of Change

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing

- [ ] Tests pass locally
- [ ] New tests added for new functionality
- [ ] Manual testing completed

## Checklist

- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
```

## Coding Guidelines

### TypeScript

- **Use strict TypeScript** - leverage the type system fully
- **Prefer explicit types** over `any`
- **Use type guards** for runtime type checking
- **Document complex types** with JSDoc comments

### Code Style

- **Use Prettier** for code formatting (`npm run format`)
- **Follow ESLint rules** (`npm run lint`)
- **Use meaningful variable names**
- **Write self-documenting code**
- **Add comments for complex logic**

### Testing

- **Write tests for all new features**
- **Test edge cases and error conditions**
- **Use descriptive test names in Korean** (following project convention)
- **Maintain 100% test coverage**

Example test structure:

```typescript
describe('새로운 기능', () => {
  it('정상적인 경우에 올바른 값을 반환해야 한다', () => {
    // Test implementation
  });

  it('에러가 발생한 경우 적절한 에러를 발생시켜야 한다', () => {
    // Test implementation
  });
});
```

### Documentation

- **Update JSDoc comments** for new functions
- **Update README** if adding new features
- **Add examples** for new functionality
- **Write documentation in both English and Korean**

## Getting Help

- **GitHub Issues** - For bugs and feature requests
- **GitHub Discussions** - For questions and general discussion
- **Code Review** - Maintainers will review your PRs

## Recognition

Contributors will be recognized in our README and release notes. Thank you for helping make Fetchios better!

## License

By contributing to Fetchios, you agree that your contributions will be licensed under the MIT License.
