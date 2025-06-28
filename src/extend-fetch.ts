/**
 * A simple and powerful high order function to extend fetch.
 *
 * @packageDocumentation
 */

// Use as a replacer of `RequestInit`
export type FetchRequestInit = Omit<RequestInit, 'body'> & {
  body?: object;
  isNotJsonRequest?: boolean;
  isNotJsonResponse?: boolean;
};
/**
 * Arguments of fetch function.
 *
 * @throws {Error} if a first argument of fetch is `Request` object. only string and URL are supported.
 * @see {fetch, RequestInfo, Request}
 *
 * @public
 */
export type FetchArgs = [string | URL, FetchRequestInit | undefined];

/**
 * Type of `returnFetch` function.
 * It is useful for whom want to write customized returnFetch function.
 *
 * @public
 */
export type ReturnFetch = typeof extendFetch;

// Use as a replacer of `Response`
export type ResponseGenericBody<RES> = Omit<
  Awaited<ReturnType<typeof fetch>>,
  keyof Body | 'clone'
> & {
  body: RES;
};

export type JsonResponse<RES> = RES extends object
  ? ResponseGenericBody<RES>
  : ResponseGenericBody<string>;

export class FetchError<RES> extends Error {
  constructor(public response: JsonResponse<RES>) {
    super();
  }
}

export type RequestInterceptor = (requestArgs: FetchArgs) => Promise<FetchArgs>;

export type ResponseInterceptor = (
  response: ResponseGenericBody<unknown>,
  requestArgs: FetchArgs
) => Promise<ResponseGenericBody<unknown>>;

/**
 * Options of `returnFetch` function.
 *
 * @public
 */
export interface ReturnFetchDefaultOptions<ERR> {
  /**
   * `fetch` function to be used in `returnFetch` function.
   * If not provided, `fetch` function in global scope will be used.
   * Any fetch implementation can be used, such as `node-fetch`, `cross-fetch`, `isomorphic-fetch`, etc.
   *
   * a `fetch` function created by `returnFetch` also can be used here.
   *
   * @public
   */
  fetch?: typeof fetch;
  /**
   * Base URL of fetch. It will be used when the first argument of fetch is relative URL.
   *
   * @public
   */
  baseUrl?: string | URL;
  /**
   * Default headers of fetch. It will be used when the second argument of fetch does not have `headers` property.
   * If it is provided and `headers` also provided when calling a `fetch`, headers will be merged.
   * Priority of headers is `requestInit.headers` > `defaultOptions.headers`. Duplicated headers will be overwritten.
   *
   * @public
   */
  headers?: HeadersInit;

  jsonParser?: typeof JSON.parse;

  defaultErrorResponseBody?: ERR;

  interceptors?: {
    /**
     * Request interceptor. It will be called before request.
     *
     * @param requestArgs Arguments of fetch function.
     * @param fetch the `fetch` you provided at {@link ReturnFetchDefaultOptions['fetch']}
     *
     * @public
     */
    request?: RequestInterceptor;
    /**
     * Response interceptor. It will be called after response.
     *
     * @param response Response object received from fetch function.
     * @param requestArgs Arguments of fetch function.
     * @param fetch the `fetch` you provided at {@link ReturnFetchDefaultOptions['fetch']}
     *
     * @public
     */
    response?: ResponseInterceptor;
  };
}

const applyDefaultOptions = <ERR>(
  [input, requestInit]: FetchArgs,
  defaultOptions?: ReturnFetchDefaultOptions<ERR>,
  defaultHeaders?: Headers
): FetchArgs => {
  const headers = new Headers(defaultOptions?.headers);
  new Headers(defaultHeaders).forEach((value, key) => {
    headers.set(key, value);
  });
  new Headers(requestInit?.headers).forEach((value, key) => {
    headers.set(key, value);
  });

  let inputToReturn: FetchArgs[0] = input;
  if (defaultOptions?.baseUrl) {
    inputToReturn = new URL(input, defaultOptions.baseUrl);
  }

  return [
    inputToReturn,
    {
      ...requestInit,
      headers,
    },
  ];
};

// this resembles the default behavior of axios json parser
// https://github.com/axios/axios/blob/21a5ad34c4a5956d81d338059ac0dd34a19ed094/lib/defaults/index.js#L25
const parseJsonSafely = (text: string, jsonParser = JSON.parse): object | string => {
  try {
    return jsonParser(text) as object | string;
  } catch (e) {
    if ((e as Error).name !== 'SyntaxError') {
      throw e;
    }

    return text.trim();
  }
};

const extendFetch =
  <ERR>(defaultOptions?: ReturnFetchDefaultOptions<ERR>) =>
  async <RES>(...args: FetchArgs): Promise<JsonResponse<RES>> => {
    const isJsonRequest = !args[1]?.isNotJsonRequest;
    const isJsonResponse = !args[1]?.isNotJsonResponse;

    const defaultHeaders = new Headers(defaultOptions?.headers);
    if (isJsonRequest && !defaultHeaders.get('Content-Type')) {
      defaultHeaders.set('Content-Type', 'application/json');
    }
    if (isJsonResponse && !defaultHeaders.get('Accept')) {
      defaultHeaders.set('Accept', 'application/json');
    }

    const defaultOptionAppliedArgs = applyDefaultOptions(args, defaultOptions, defaultHeaders);

    // apply request interceptor
    const fetchProvided = defaultOptions?.fetch || fetch;
    let requestInterceptorAppliedArgs: FetchArgs;
    if (defaultOptions?.interceptors?.request) {
      requestInterceptorAppliedArgs =
        await defaultOptions.interceptors.request(defaultOptionAppliedArgs);
    } else {
      requestInterceptorAppliedArgs = defaultOptionAppliedArgs;
    }
    const [fetchUrl, fetchRequestInit] = requestInterceptorAppliedArgs;

    let jsonResponse: ResponseGenericBody<unknown>;
    try {
      const response = await fetchProvided(fetchUrl, {
        ...fetchRequestInit,
        body:
          fetchRequestInit?.body &&
          (isJsonRequest
            ? JSON.stringify(fetchRequestInit.body)
            : (fetchRequestInit.body as BodyInit)),
      });

      const body = parseJsonSafely(await response.text(), defaultOptions?.jsonParser);

      jsonResponse = {
        headers: response.headers,
        ok: response.ok,
        redirected: response.redirected,
        status: response.status,
        statusText: response.statusText,
        type: response.type,
        url: response.url,
        body,
      };
    } catch (e) {
      if (defaultOptions?.defaultErrorResponseBody) {
        jsonResponse = {
          headers: new Headers(),
          ok: false,
          redirected: false,
          status: -1,
          statusText: 'Network Error',
          type: 'error',
          url: new URL(fetchUrl).href,
          body: defaultOptions.defaultErrorResponseBody,
        };
      } else {
        throw e;
      }
    }

    if (!jsonResponse.ok) {
      let responseBody = jsonResponse.body;
      if (defaultOptions?.defaultErrorResponseBody && typeof responseBody === 'object') {
        responseBody = {
          ...defaultOptions.defaultErrorResponseBody,
          ...responseBody,
        };
      }
      jsonResponse.body = responseBody;
    }

    // apply response interceptor
    const interceptedResponse =
      (await defaultOptions?.interceptors?.response?.(
        jsonResponse,
        requestInterceptorAppliedArgs
      )) || jsonResponse;

    if (!interceptedResponse.ok) {
      throw new FetchError<ERR>(interceptedResponse as JsonResponse<ERR>);
    }

    return interceptedResponse as JsonResponse<RES>;
  };

export default extendFetch;
