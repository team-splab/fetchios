import type { FetchRequestInit, ReturnFetchDefaultOptions } from './extend-fetch';
import extendFetch from './extend-fetch';

interface FetchiosConfig<ERR> {
  baseUrl?: string | URL;
  withCredentials?: boolean;
  interceptors?: ReturnFetchDefaultOptions<ERR>['interceptors'];
  useDefaultOptions?: boolean;
  defaultErrorResponseBody?: ERR;
}

interface FetchiosDefaults extends Omit<FetchRequestInit, 'headers'> {
  headers: Record<string, string>;
}

class Fetchios<ERR> {
  #defaults: FetchiosDefaults = {
    headers: {},
  };
  set defaults(value: FetchiosDefaults) {
    if (!this.config.useDefaultOptions) {
      throw new Error('Cannot set defaults when useDefaultOptions is false');
    }
    this.#defaults = value;
  }
  get defaults() {
    if (!this.config.useDefaultOptions) {
      throw new Error('Cannot get defaults when useDefaultOptions is false');
    }
    return this.#defaults;
  }

  private readonly fetch = this.getFetch();

  private constructor(private config: FetchiosConfig<ERR>) {}

  static create<E>(config?: FetchiosConfig<E>) {
    return new Fetchios<E>(config ?? {});
  }

  request<R>(url: string | URL, init?: FetchRequestInit | undefined) {
    const headers = new Headers(this.#defaults.headers);
    new Headers(init?.headers).forEach((value, key) => {
      headers.set(key, value);
    });

    return this.fetch<R>(url, {
      ...this.#defaults,
      ...init,
      headers,
    });
  }

  get<R>(url: string | URL, init?: FetchRequestInit | undefined) {
    return this.request<R>(url, {
      ...init,
      method: 'GET',
    });
  }

  delete<R>(url: string | URL, init?: FetchRequestInit | undefined) {
    return this.request<R>(url, {
      ...init,
      method: 'DELETE',
    });
  }

  head<R>(url: string | URL, init?: FetchRequestInit | undefined) {
    return this.request<R>(url, {
      ...init,
      method: 'HEAD',
    });
  }

  options<R>(url: string | URL, init?: FetchRequestInit | undefined) {
    return this.request<R>(url, {
      ...init,
      method: 'OPTIONS',
    });
  }

  post<R>(url: string | URL, data?: object, init?: FetchRequestInit | undefined) {
    return this.request<R>(url, {
      ...init,
      body: data,
      method: 'POST',
    });
  }

  put<R>(url: string | URL, data?: object, init?: FetchRequestInit | undefined) {
    return this.request<R>(url, {
      ...init,
      body: data,
      method: 'PUT',
    });
  }

  patch<R>(url: string | URL, data?: object, init?: FetchRequestInit | undefined) {
    return this.request<R>(url, {
      ...init,
      body: data,
      method: 'PATCH',
    });
  }

  private getFetch() {
    return extendFetch<ERR>({
      baseUrl: this.config.baseUrl,
      fetch: (input, init) =>
        fetch(input, {
          credentials: this.config.withCredentials ? 'include' : undefined,
          ...init,
        }),
      interceptors: this.config.interceptors,
      defaultErrorResponseBody: this.config.defaultErrorResponseBody,
    });
  }
}

export default Fetchios;
