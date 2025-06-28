// Main exports
export { default as Fetchios } from './fetchios';
export { default as extendFetch } from './extend-fetch';

// Types
export type {
  FetchRequestInit,
  FetchArgs,
  ReturnFetch,
  ResponseGenericBody,
  JsonResponse,
  RequestInterceptor,
  ResponseInterceptor,
  ReturnFetchDefaultOptions,
} from './extend-fetch';

// Error class
export { FetchError } from './extend-fetch';

// Utility interceptors
export { logRequestInterceptor, logResponseInterceptor } from './fetch-logger';

// Default export - most commonly used
export { default } from './fetchios';
