# 📚 API Reference

## Fetchios Class

### `Fetchios.create<ErrorType>(config?)`

Creates a new Fetchios instance with optional configuration.

**Parameters:**

- `config` (optional): Configuration object

**Returns:** `Fetchios<ErrorType>` instance

**Example:**

```typescript
import Fetchios from '@team-splab/fetchios';

const api = Fetchios.create({
  baseUrl: 'https://api.example.com',
  withCredentials: true,
});
```

### Configuration Options

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

- **Type:** `string | URL`
- **Default:** `undefined`
- **Description:** Base URL for all requests

#### `withCredentials`

- **Type:** `boolean`
- **Default:** `false`
- **Description:** Include credentials in requests

#### `interceptors`

- **Type:** `{ request?: RequestInterceptor; response?: ResponseInterceptor; }`
- **Default:** `undefined`
- **Description:** Request and response interceptors

#### `useDefaultOptions`

- **Type:** `boolean`
- **Default:** `false`
- **Description:** Enable default options (required for using `defaults` property)

#### `defaultErrorResponseBody`

- **Type:** `ERR`
- **Default:** `undefined`
- **Description:** Default error response body for failed requests

## Instance Methods

### `get<T>(url, config?)`

Performs a GET request.

**Parameters:**

- `url`: Request URL
- `config` (optional): Request configuration

**Returns:** `Promise<JsonResponse<T>>`

### `post<T>(url, data?, config?)`

Performs a POST request.

**Parameters:**

- `url`: Request URL
- `data` (optional): Request body data
- `config` (optional): Request configuration

**Returns:** `Promise<JsonResponse<T>>`

### `put<T>(url, data?, config?)`

Performs a PUT request.

### `patch<T>(url, data?, config?)`

Performs a PATCH request.

### `delete<T>(url, config?)`

Performs a DELETE request.

### `head<T>(url, config?)`

Performs a HEAD request.

### `options<T>(url, config?)`

Performs an OPTIONS request.

### `request<T>(url, config?)`

Generic request method.

## extendFetch Function

### `extendFetch<ErrorType>(options?)`

Creates a customized fetch function with additional features.

**Parameters:**

- `options` (optional): Configuration options

**Returns:** Custom fetch function

**Example:**

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

## Utility Functions

### `logRequestInterceptor`

Built-in request interceptor for logging.

**Type:** `RequestInterceptor`

**Example:**

```typescript
import { logRequestInterceptor } from '@team-splab/fetchios';

const api = Fetchios.create({
  interceptors: {
    request: logRequestInterceptor,
  },
});
```

### `logResponseInterceptor`

Built-in response interceptor for logging.

**Type:** `ResponseInterceptor`

## Type Definitions

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
