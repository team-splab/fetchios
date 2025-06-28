import { describe, it, expect, vi, beforeEach } from 'vitest';
import Fetchios, { extendFetch, FetchError } from './index';

// 테스트용 fetch 모킹
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Fetchios', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('Fetchios.create', () => {
    it('기본 설정으로 Fetchios 인스턴스를 생성해야 한다', () => {
      const api = Fetchios.create();
      expect(api).toBeInstanceOf(Fetchios);
    });

    it('사용자 정의 설정으로 Fetchios 인스턴스를 생성해야 한다', () => {
      const api = Fetchios.create({
        baseUrl: 'https://api.example.com',
        withCredentials: true,
      });
      expect(api).toBeInstanceOf(Fetchios);
    });
  });

  describe('HTTP 메서드', () => {
    let api: Fetchios<any>;

    beforeEach(() => {
      api = Fetchios.create({
        baseUrl: 'https://api.example.com',
      });

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        text: () => Promise.resolve('{"id":1,"name":"Test"}'),
        redirected: false,
        type: 'basic',
        url: 'https://api.example.com/test',
      });
    });

    it('GET 요청을 보내야 한다', async () => {
      await api.get('/test');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(URL),
        expect.objectContaining({
          method: 'GET',
        })
      );
    });

    it('데이터와 함께 POST 요청을 보내야 한다', async () => {
      const data = { name: 'test' };
      await api.post('/test', data);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(URL),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(data),
        })
      );
    });

    it('데이터와 함께 PUT 요청을 보내야 한다', async () => {
      const data = { name: 'test' };
      await api.put('/test', data);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(URL),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(data),
        })
      );
    });

    it('데이터와 함께 PATCH 요청을 보내야 한다', async () => {
      const data = { name: 'test' };
      await api.patch('/test', data);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(URL),
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(data),
        })
      );
    });

    it('DELETE 요청을 보내야 한다', async () => {
      await api.delete('/test');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(URL),
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });

  describe('응답 바디 처리', () => {
    let api: Fetchios<any>;

    beforeEach(() => {
      api = Fetchios.create({
        baseUrl: 'https://api.example.com',
      });
    });

    it('파싱된 JSON 데이터와 함께 response.body를 반환해야 한다', async () => {
      const responseData = { id: 1, name: '테스트 사용자', email: 'test@example.com' };

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        text: () => Promise.resolve(JSON.stringify(responseData)),
        redirected: false,
        type: 'basic',
        url: 'https://api.example.com/test',
      });

      const response = await api.get<typeof responseData>('/test');

      expect(response.body).toEqual(responseData);
      expect(response.status).toBe(200);
      expect(response.ok).toBe(true);
    });

    it('배열 응답을 올바르게 처리해야 한다', async () => {
      const responseData = [
        { id: 1, name: '사용자 1' },
        { id: 2, name: '사용자 2' },
      ];

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        text: () => Promise.resolve(JSON.stringify(responseData)),
        redirected: false,
        type: 'basic',
        url: 'https://api.example.com/users',
      });

      const response = await api.get<typeof responseData>('/users');

      expect(response.body).toEqual(responseData);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(2);
    });

    it('JSON이 아닌 응답을 문자열로 처리해야 한다', async () => {
      const responseText = '일반 텍스트 응답';

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        text: () => Promise.resolve(responseText),
        redirected: false,
        type: 'basic',
        url: 'https://api.example.com/text',
      });

      const response = await api.get<string>('/text');

      expect(response.body).toBe(responseText);
    });

    it('빈 응답을 처리해야 한다', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 204,
        statusText: 'No Content',
        headers: new Headers(),
        text: () => Promise.resolve(''),
        redirected: false,
        type: 'basic',
        url: 'https://api.example.com/empty',
      });

      const response = await api.delete('/empty');

      expect(response.body).toBe('');
      expect(response.status).toBe(204);
    });
  });

  describe('헤더', () => {
    it('기본 헤더를 설정해야 한다', () => {
      const api = Fetchios.create({
        useDefaultOptions: true,
      });

      api.defaults.headers.Authorization = 'Bearer token';
      api.defaults.headers['Accept-Language'] = 'ko-KR';

      expect(api.defaults.headers.Authorization).toBe('Bearer token');
      expect(api.defaults.headers['Accept-Language']).toBe('ko-KR');
    });

    it('헤더를 올바르게 병합해야 한다', async () => {
      const api = Fetchios.create({
        baseUrl: 'https://api.example.com',
        useDefaultOptions: true,
      });

      api.defaults.headers.Authorization = 'Bearer token';

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        text: () => Promise.resolve('{"success":true}'),
        redirected: false,
        type: 'basic',
        url: 'https://api.example.com/test',
      });

      await api.get('/test', {
        headers: {
          'Accept-Language': 'ko-KR',
          'Custom-Header': 'custom-value',
        },
      });

      // fetch가 URL과 적절한 구조로 호출되었는지 확인
      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [url, options] = mockFetch.mock.calls[0];

      expect(url).toEqual(expect.any(URL));
      expect(options).toEqual(
        expect.objectContaining({
          method: 'GET',
          headers: expect.any(Headers),
        })
      );

      // Headers 객체를 검사하여 특정 헤더 확인
      const headers = options.headers as Headers;
      expect(headers.get('Authorization')).toBe('Bearer token');
      expect(headers.get('Accept-Language')).toBe('ko-KR');
      expect(headers.get('Custom-Header')).toBe('custom-value');
    });

    it('useDefaultOptions가 false일 때 defaults 접근 시 오류를 발생시켜야 한다', () => {
      const api = Fetchios.create({
        useDefaultOptions: false,
      });

      expect(() => api.defaults).toThrow();
      expect(() => {
        api.defaults = { headers: {} };
      }).toThrow();
    });
  });

  describe('오류 처리', () => {
    let api: Fetchios<{ message: string }>;

    beforeEach(() => {
      api = Fetchios.create({
        baseUrl: 'https://api.example.com',
        defaultErrorResponseBody: { message: '기본 오류' },
      });
    });

    it('HTTP 오류 시 FetchError를 발생시켜야 한다', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        headers: new Headers(),
        text: () => Promise.resolve('{"message":"찾을 수 없음"}'),
        redirected: false,
        type: 'basic',
        url: 'https://api.example.com/test',
      });

      await expect(api.get('/test')).rejects.toThrow(FetchError);
    });

    it('FetchError에 오류 응답 바디를 포함해야 한다', async () => {
      const errorResponse = { message: '리소스를 찾을 수 없습니다', code: 'NOT_FOUND' };

      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        headers: new Headers(),
        text: () => Promise.resolve(JSON.stringify(errorResponse)),
        redirected: false,
        type: 'basic',
        url: 'https://api.example.com/test',
      });

      try {
        await api.get('/test');
      } catch (error) {
        expect(error).toBeInstanceOf(FetchError);
        expect((error as FetchError<any>).response.body.message).toBe('리소스를 찾을 수 없습니다');
        expect((error as FetchError<any>).response.status).toBe(404);
      }
    });

    it('기본 오류 바디와 함께 네트워크 오류를 처리해야 한다', async () => {
      mockFetch.mockRejectedValue(new Error('네트워크 오류'));

      try {
        await api.get('/test');
      } catch (error) {
        expect(error).toBeInstanceOf(FetchError);
        expect((error as FetchError<{ message: string }>).response.body.message).toBe('기본 오류');
        expect((error as FetchError<{ message: string }>).response.status).toBe(-1);
      }
    });

    it('기본 오류 바디와 API 오류 응답을 병합해야 한다', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        headers: new Headers(),
        text: () => Promise.resolve('{"code":"INVALID_INPUT"}'),
        redirected: false,
        type: 'basic',
        url: 'https://api.example.com/test',
      });

      try {
        await api.get('/test');
      } catch (error) {
        expect(error).toBeInstanceOf(FetchError);
        const errorBody = (error as FetchError<any>).response.body;
        expect(errorBody.message).toBe('기본 오류'); // 기본값에서
        expect(errorBody.code).toBe('INVALID_INPUT'); // API 응답에서
      }
    });
  });

  describe('인터셉터', () => {
    it('요청 인터셉터를 적용해야 한다', async () => {
      const requestInterceptor = vi.fn().mockImplementation(args => args);

      const api = Fetchios.create({
        baseUrl: 'https://api.example.com',
        interceptors: {
          request: requestInterceptor,
        },
      });

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        text: () => Promise.resolve('{"success":true}'),
        redirected: false,
        type: 'basic',
        url: 'https://api.example.com/test',
      });

      await api.get('/test');

      expect(requestInterceptor).toHaveBeenCalled();
    });

    it('응답 인터셉터를 적용해야 한다', async () => {
      const responseInterceptor = vi.fn().mockImplementation(response => response);

      const api = Fetchios.create({
        baseUrl: 'https://api.example.com',
        interceptors: {
          response: responseInterceptor,
        },
      });

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        text: () => Promise.resolve('{"success":true}'),
        redirected: false,
        type: 'basic',
        url: 'https://api.example.com/test',
      });

      await api.get('/test');

      expect(responseInterceptor).toHaveBeenCalled();
    });

    it('인터셉터에서 요청을 수정해야 한다', async () => {
      const requestInterceptor = vi.fn().mockImplementation(([url, options]) => {
        return [
          url,
          {
            ...options,
            headers: {
              ...options?.headers,
              'X-Custom-Header': 'intercepted-value',
            },
          },
        ];
      });

      const api = Fetchios.create({
        baseUrl: 'https://api.example.com',
        interceptors: {
          request: requestInterceptor,
        },
      });

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        text: () => Promise.resolve('{"success":true}'),
        redirected: false,
        type: 'basic',
        url: 'https://api.example.com/test',
      });

      await api.get('/test');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(URL),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Custom-Header': 'intercepted-value',
          }),
        })
      );
    });
  });
});

describe('extendFetch', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('사용자 정의 fetch 함수를 생성해야 한다', () => {
    const customFetch = extendFetch({
      baseUrl: 'https://api.example.com',
    });

    expect(typeof customFetch).toBe('function');
  });

  it('기본 URL을 사용해야 한다', async () => {
    const customFetch = extendFetch({
      baseUrl: 'https://api.example.com',
    });

    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Headers(),
      text: () => Promise.resolve('{"success":true}'),
      redirected: false,
      type: 'basic',
      url: 'https://api.example.com/test',
    });

    await customFetch('/test', undefined);

    expect(mockFetch).toHaveBeenCalledWith(expect.any(URL), expect.any(Object));
  });

  it('JSON 응답을 올바르게 처리해야 한다', async () => {
    const customFetch = extendFetch();
    const responseData = { data: '테스트', id: 123 };

    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Headers(),
      text: () => Promise.resolve(JSON.stringify(responseData)),
      redirected: false,
      type: 'basic',
      url: 'https://api.example.com/test',
    });

    const response = await customFetch('https://api.example.com/test', undefined);

    expect(response.body).toEqual(responseData);
    expect(response.status).toBe(200);
    expect(response.ok).toBe(true);
  });

  it('JSON이 아닌 요청 바디를 처리해야 한다', async () => {
    const customFetch = extendFetch();

    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Headers(),
      text: () => Promise.resolve('{"success":true}'),
      redirected: false,
      type: 'basic',
      url: 'https://api.example.com/test',
    });

    await customFetch('https://api.example.com/test', {
      method: 'POST',
      body: { data: '테스트' },
      isNotJsonRequest: true,
    });

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.example.com/test',
      expect.objectContaining({
        body: { data: '테스트' }, // JSON.stringify 되지 않아야 함
      })
    );
  });

  it('사용자 정의 JSON 파서를 처리해야 한다', async () => {
    const customParser = vi.fn().mockImplementation(JSON.parse);
    const customFetch = extendFetch({
      jsonParser: customParser,
    });

    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Headers(),
      text: () => Promise.resolve('{"test": "value"}'),
      redirected: false,
      type: 'basic',
      url: 'https://api.example.com/test',
    });

    await customFetch('https://api.example.com/test', undefined);

    expect(customParser).toHaveBeenCalledWith('{"test": "value"}');
  });
});

describe('FetchError', () => {
  it('응답과 함께 FetchError를 생성해야 한다', () => {
    const mockResponse = {
      status: 404,
      statusText: 'Not Found',
      headers: new Headers(),
      ok: false,
      redirected: false,
      type: 'basic' as const,
      url: 'https://api.example.com/test',
      body: { message: '찾을 수 없음' },
    };

    const error = new FetchError(mockResponse);

    expect(error).toBeInstanceOf(Error);
    expect(error.response).toBe(mockResponse);
  });

  it('발생시키고 잡을 수 있어야 한다', () => {
    const mockResponse = {
      status: 500,
      statusText: 'Internal Server Error',
      headers: new Headers(),
      ok: false,
      redirected: false,
      type: 'basic' as const,
      url: 'https://api.example.com/test',
      body: { message: '서버 오류' },
    };

    const error = new FetchError(mockResponse);

    expect(() => {
      throw error;
    }).toThrow(FetchError);

    try {
      throw error;
    } catch (e) {
      expect(e).toBeInstanceOf(FetchError);
      expect((e as FetchError<any>).response.status).toBe(500);
    }
  });
});
