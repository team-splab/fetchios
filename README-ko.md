# 🚀 Fetchios

JavaScript/TypeScript 애플리케이션을 위한 현대적이고 타입 안전한 Axios 스타일 fetch 라이브러리입니다.

**다른 언어로 읽기:** [English](README.md) | **한국어**

[![npm version](https://badge.fury.io/js/@team-splab%2Ffetchios.svg)](https://badge.fury.io/js/@team-splab/fetchios)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![codecov](https://codecov.io/gh/team-splab/fetchios/branch/main/graph/badge.svg)](https://codecov.io/gh/team-splab/fetchios)

Fetchios는 타입 안전성과 개발자 경험에 중점을 둔 JavaScript/TypeScript 애플리케이션을 위한 현대적이고 고성능 fetch 라이브러리입니다.

- **Fetchios는 친숙한 Axios 스타일 API를 제공합니다** - 요청/응답 인터셉터, 자동 JSON 파싱, 에러 처리 등의 현대적인 구현과 함께.
- **성능을 염두에 두고 설계되었으며**, Fetchios는 호환성을 유지하면서 현대적인 JavaScript 환경에서 더 나은 성능을 달성합니다.
- **Fetchios는 트리 쉐이킹을 기본 지원하여**, 애플리케이션에 최소한의 번들 크기 영향을 보장합니다.
- **Fetchios는 내장된 TypeScript 지원을 포함하며**, 직관적이면서도 강력한 타입과 뛰어난 IDE 통합을 제공합니다.
- **Fetchios는 Next.js에 최적화되어** SSR, 캐싱, 서버/클라이언트 유니버설 사용 패턴을 지원합니다.
- **Fetchios는 실전 검증을 거쳤으며** 100% 테스트 커버리지로 안정성과 견고함을 보장합니다.

## 📦 설치

```bash
# npm
npm install @team-splab/fetchios

# yarn
yarn add @team-splab/fetchios

# pnpm
pnpm add @team-splab/fetchios
```

## 🚀 예제

```typescript
import Fetchios from '@team-splab/fetchios';

// 인스턴스 생성
const api = Fetchios.create({
  baseUrl: 'https://api.example.com',
  withCredentials: true,
});

// 요청 수행 - response.body에 파싱된 데이터가 포함됨
const userResponse = await api.get<User>('/users/1');
const user = userResponse.body;

const newUserResponse = await api.post<User>('/users', {
  name: 'John Doe',
  email: 'john@example.com',
});
const newUser = newUserResponse.body;

// 로깅을 위한 인터셉터 사용
import { logRequestInterceptor, logResponseInterceptor } from '@team-splab/fetchios';

const apiWithLogging = Fetchios.create({
  baseUrl: 'https://api.example.com',
  interceptors: {
    request: logRequestInterceptor,
    response: logResponseInterceptor,
  },
});
```

## 📚 문서

- **[API 레퍼런스](./docs/api-reference/README-ko.md)** - 완전한 API 문서
- **[사용 예제](./docs/examples/)** - Next.js 통합을 포함한 자세한 사용 예제

## 🤝 기여하기

커뮤니티의 모든 사람들의 기여를 환영합니다. 자세한 정보는 [기여 가이드](CONTRIBUTING.md)를 읽어보세요.

## 📄 라이센스

MIT © Team Splab. 자세한 내용은 [LICENSE](LICENSE)를 참조하세요.
