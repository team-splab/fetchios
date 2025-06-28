# 📚 API 레퍼런스

## Fetchios 클래스

### `Fetchios.create<ErrorType>(config?)`

선택적 설정과 함께 새로운 Fetchios 인스턴스를 생성합니다.

**매개변수:**

- `config` (선택사항): 설정 객체

**반환값:** `Fetchios<ErrorType>` 인스턴스

**예제:**

```typescript
import Fetchios from '@team-splab/fetchios';

const api = Fetchios.create({
  baseUrl: 'https://api.example.com',
  withCredentials: true,
});
```

### 설정 옵션

```typescript
interface FetchiosConfig<ERR> {
  baseUrl?: string | URL;
  withCredentials?: boolean;
  interceptors?: {
    request?: RequestInterceptor;
    response?: ResponseInterceptor;
  };
  useDefaultOptions?: boolean;
  defaultErrorResponseBody?: ERR;
}
```

#### `baseUrl`

- **타입:** `string | URL`
- **기본값:** `undefined`
- **설명:** 모든 요청의 기본 URL

#### `withCredentials`

- **타입:** `boolean`
- **기본값:** `false`
- **설명:** 요청에 인증 정보 포함

#### `interceptors`

- **타입:** `{ request?: RequestInterceptor; response?: ResponseInterceptor; }`
- **기본값:** `undefined`
- **설명:** 요청 및 응답 인터셉터

#### `useDefaultOptions`

- **타입:** `boolean`
- **기본값:** `false`
- **설명:** 기본 옵션 활성화 (`defaults` 속성 사용에 필요)

#### `defaultErrorResponseBody`

- **타입:** `ERR`
- **기본값:** `undefined`
- **설명:** 실패한 요청의 기본 오류 응답 본문

## 인스턴스 메소드

### `get<T>(url, config?)`

GET 요청을 수행합니다.

**매개변수:**

- `url`: 요청 URL
- `config` (선택사항): 요청 설정

**반환값:** `Promise<JsonResponse<T>>`

### `post<T>(url, data?, config?)`

POST 요청을 수행합니다.

**매개변수:**

- `url`: 요청 URL
- `data` (선택사항): 요청 본문 데이터
- `config` (선택사항): 요청 설정

**반환값:** `Promise<JsonResponse<T>>`

### `put<T>(url, data?, config?)`

PUT 요청을 수행합니다.

### `patch<T>(url, data?, config?)`

PATCH 요청을 수행합니다.

### `delete<T>(url, config?)`

DELETE 요청을 수행합니다.

### `head<T>(url, config?)`

HEAD 요청을 수행합니다.

### `options<T>(url, config?)`

OPTIONS 요청을 수행합니다.

### `request<T>(url, config?)`

일반 요청 메소드입니다.

## extendFetch 함수

### `extendFetch<ErrorType>(options?)`

추가 기능이 있는 사용자 정의 fetch 함수를 생성합니다.

**매개변수:**

- `options` (선택사항): 설정 옵션

**반환값:** 사용자 정의 fetch 함수

**예제:**

```typescript
import { extendFetch } from '@team-splab/fetchios';

const customFetch = extendFetch({
  baseUrl: 'https://api.example.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

const response = await customFetch('/users');
```

## 유틸리티 함수

### `logRequestInterceptor`

로깅을 위한 내장 요청 인터셉터입니다.

**타입:** `RequestInterceptor`

**예제:**

```typescript
import { logRequestInterceptor } from '@team-splab/fetchios';

const api = Fetchios.create({
  interceptors: {
    request: logRequestInterceptor,
  },
});
```

### `logResponseInterceptor`

로깅을 위한 내장 응답 인터셉터입니다.

**타입:** `ResponseInterceptor`

## 타입 정의

### `RequestInterceptor`

```typescript
type RequestInterceptor = (requestArgs: FetchArgs) => Promise<FetchArgs>;
```

### `ResponseInterceptor`

```typescript
type ResponseInterceptor = (
  response: ResponseGenericBody<unknown>,
  requestArgs: FetchArgs
) => Promise<ResponseGenericBody<unknown>>;
```

### `JsonResponse<T>`

```typescript
type JsonResponse<T> = T extends object ? ResponseGenericBody<T> : ResponseGenericBody<string>;
```

### `FetchError<T>`

```typescript
class FetchError<T> extends Error {
  constructor(public response: JsonResponse<T>);
}
```
