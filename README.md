# 🚀 Fetchios

A modern, type-safe fetch library with Axios-like API for JavaScript/TypeScript applications.

**Read this in other languages:** **English** | [한국어](README-ko.md)

[![npm version](https://badge.fury.io/js/@team-splab%2Ffetchios.svg)](https://badge.fury.io/js/@team-splab/fetchios)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![codecov](https://codecov.io/gh/team-splab/fetchios/branch/main/graph/badge.svg)](https://codecov.io/gh/team-splab/fetchios)

Fetchios is a modern, high-performance fetch library designed for JavaScript/TypeScript applications with a focus on type safety and developer experience.

- **Fetchios offers familiar Axios-like API** with modern implementations, such as request/response interceptors, automatic JSON parsing, and error handling.
- **Designed with performance in mind**, Fetchios achieves better performance in modern JavaScript environments while maintaining compatibility.
- **Fetchios supports tree shaking out of the box**, ensuring minimal bundle size impact on your applications.
- **Fetchios includes built-in TypeScript support**, with straightforward yet robust types and excellent IDE integration.
- **Fetchios is Next.js optimized** with support for SSR, caching, and server/client universal usage patterns.
- **Fetchios is battle-tested** with 100% test coverage, ensuring reliability and robustness.

## 📦 Installation

```bash
# npm
npm install @team-splab/fetchios

# yarn
yarn add @team-splab/fetchios

# pnpm
pnpm add @team-splab/fetchios
```

## 🚀 Examples

```typescript
import Fetchios from '@team-splab/fetchios';

// Create an instance
const api = Fetchios.create({
  baseUrl: 'https://api.example.com',
  withCredentials: true,
});

// Make requests - response.body contains parsed data
const userResponse = await api.get<User>('/users/1');
const user = userResponse.body;

const newUserResponse = await api.post<User>('/users', {
  name: 'John Doe',
  email: 'john@example.com',
});
const newUser = newUserResponse.body;

// With interceptors for logging
import { logRequestInterceptor, logResponseInterceptor } from '@team-splab/fetchios';

const apiWithLogging = Fetchios.create({
  baseUrl: 'https://api.example.com',
  interceptors: {
    request: logRequestInterceptor,
    response: logResponseInterceptor,
  },
});
```

## 📚 Documentation

- **[API Reference](./docs/api-reference/README.md)** - Complete API documentation
- **[Usage Examples](./docs/examples/)** - Detailed usage examples including Next.js integration

## 🤝 Contributing

We welcome contribution from everyone in the community. Read our [Contributing Guide](CONTRIBUTING.md) for detailed information.

## 📄 License

MIT © Team Splab. See [LICENSE](LICENSE) for details.
