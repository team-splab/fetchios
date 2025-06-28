# Next.js App Router와 Fetchios 연동

이 가이드는 Next.js 13+ App Router에서 클라이언트와 서버 사이드 모두에서 Fetchios를 사용하는 방법을 보여줍니다.

## 📋 개요

이 예제는 Next.js 애플리케이션에서 Fetchios를 사용하는 간단한 패턴을 보여줍니다:

- **클라이언트 사이드 API 호출** - 인터셉터와 상태 관리
- **서버 사이드 API 호출** - 서버 컴포넌트와 API 라우트
- **유니버설 사용법** - 자동 환경 감지
- **간단한 에러 처리** 패턴

## 🚀 빠른 시작

### 1. Fetchios 설치

```bash
npm install @team-splab/fetchios
```

### 2. API 설정

API 인스턴스 생성:

#### 클라이언트 API (`lib/api/client.ts`)

```typescript
import Fetchios, { logRequestInterceptor, logResponseInterceptor } from '@team-splab/fetchios';

interface ApiError {
  message: string;
  code: string;
  statusCode: number;
}

export const clientApi = Fetchios.create<ApiError>({
  baseUrl: 'https://api.example.com',
  withCredentials: true,
  defaultErrorResponseBody: {
    message: '예상치 못한 오류가 발생했습니다',
    code: 'UNKNOWN_ERROR',
    statusCode: 500,
  },
  interceptors: {
    request: logRequestInterceptor,
    response: logResponseInterceptor,
  },
});

export default clientApi;
```

#### 서버 API (`lib/api/server.ts`)

```typescript
import Fetchios, { logRequestInterceptor, logResponseInterceptor } from '@team-splab/fetchios';

interface ApiError {
  message: string;
  code: string;
  statusCode: number;
}

export const serverApi = Fetchios.create<ApiError>({
  baseUrl: 'https://api.example.com',
  defaultErrorResponseBody: {
    message: '예상치 못한 오류가 발생했습니다',
    code: 'UNKNOWN_ERROR',
    statusCode: 500,
  },
  interceptors: {
    request: logRequestInterceptor,
    response: logResponseInterceptor,
  },
});

export default serverApi;
```

#### 유니버설 API 선택기 (`lib/api/index.ts`)

```typescript
import { clientApi } from './client';
import { serverApi } from './server';

const isClient = () => typeof window !== 'undefined';

export const api = isClient() ? clientApi : serverApi;
export { clientApi, serverApi };
```

## 📖 사용 예제

### 1. 서버 컴포넌트

```typescript
// app/users/page.tsx
import { api } from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
}

async function getUsers() {
  try {
    const response = await api.get<User[]>('/users');
    return response.body;
  } catch (error) {
    console.error('사용자 목록 조회 실패:', error);
    return [];
  }
}

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <div>
      <h1>사용자 목록</h1>
      <ul>
        {users.map(user => (
          <li key={user.id}>
            {user.name} - {user.email}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### 2. 클라이언트 컴포넌트

```typescript
'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { FetchError } from '@team-splab/fetchios';

interface User {
  id: string;
  name: string;
  email: string;
}

export default function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get<User[]>('/users');
        setUsers(response.body);
      } catch (err) {
        if (err instanceof FetchError) {
          setError(err.response.body.message);
        } else {
          setError('예상치 못한 오류가 발생했습니다');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>오류: {error}</div>;

  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>
          {user.name} - {user.email}
        </li>
      ))}
    </ul>
  );
}
```

### 3. API 라우트

```typescript
// app/api/users/route.ts
import { api } from '@/lib/api';
import { NextResponse } from 'next/server';
import { FetchError } from '@team-splab/fetchios';

export async function GET() {
  try {
    const response = await api.get<User[]>('/users');
    return NextResponse.json(response.body);
  } catch (error) {
    console.error('API 라우트 오류:', error);

    if (error instanceof FetchError) {
      return NextResponse.json(
        { error: error.response.body.message },
        { status: error.response.status }
      );
    }

    return NextResponse.json({ error: '내부 서버 오류' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userData = await request.json();
    const response = await api.post<User>('/users', userData);
    return NextResponse.json(response.body, { status: 201 });
  } catch (error) {
    console.error('사용자 생성 오류:', error);

    if (error instanceof FetchError) {
      return NextResponse.json(
        { error: error.response.body.message },
        { status: error.response.status }
      );
    }

    return NextResponse.json({ error: '내부 서버 오류' }, { status: 500 });
  }
}
```

### 4. 서버 액션

```typescript
// app/actions/user-actions.ts
'use server';

import { api } from '@/lib/api';
import { revalidatePath } from 'next/cache';
import { FetchError } from '@team-splab/fetchios';

export async function createUser(formData: FormData) {
  const userData = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
  };

  try {
    const response = await api.post<User>('/users', userData);
    revalidatePath('/users');
    return { success: true, user: response.body };
  } catch (error) {
    console.error('사용자 생성 액션 오류:', error);

    if (error instanceof FetchError) {
      return {
        success: false,
        error: error.response.body.message,
      };
    }

    return {
      success: false,
      error: '사용자 생성에 실패했습니다',
    };
  }
}
```

## 🚨 오류 처리

### 기본 오류 처리

```typescript
import { FetchError } from '@team-splab/fetchios';

try {
  const response = await api.get('/users/1');
  console.log(response.body);
} catch (error) {
  if (error instanceof FetchError) {
    // API 오류 처리
    console.error('API 오류:', {
      status: error.response.status,
      message: error.response.body.message,
    });
  } else {
    // 네트워크 오류 처리
    console.error('네트워크 오류:', error);
  }
}
```

## ⚡ 고급 기능

### 사용자 정의 인터셉터

```typescript
import Fetchios from '@team-splab/fetchios';

export const apiWithAuth = Fetchios.create({
  baseUrl: 'https://api.example.com',
  useDefaultOptions: true,
  interceptors: {
    request: async requestArgs => {
      const [url, options] = requestArgs;
      const token = localStorage.getItem('accessToken');

      return [
        url,
        {
          ...options,
          headers: {
            ...options?.headers,
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        },
      ];
    },
    response: async (response, requestArgs) => {
      console.log(`API 응답: ${response.status} ${response.url}`);
      return response;
    },
  },
});
```

### 요청 캐싱 (서버)

```typescript
import { api } from '@/lib/api';
import { revalidateTag } from 'next/cache';

// Next.js 캐싱과 함께 사용
export async function getUser(userId: string) {
  const response = await api.get<User>(`/users/${userId}`, {
    next: {
      tags: [`user-${userId}`],
      revalidate: 3600 // 1시간 캐시
    }
  });
  return response.body;
}

export async function getUsers() {
  const response = await api.get<User[]>('/users', {
    next: {
      tags: ['users'],
      revalidate: 300 // 5분 캐시
    }
  });
  return response.body;
}

// 캐시 무효화
export async function invalidateUserCache(userId: string) {
  revalidateTag(`user-${userId}`);
}

export async function invalidateUsersCache() {
  revalidateTag('users');
}

// 사용 예제
export default async function UserPage({ params }: { params: { id: string } }) {
  const user = await getUser(params.id); // 캐시됨

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}
```

## 🎯 모범 사례

1. **적절한 컨텍스트 사용**: 서버 컴포넌트와 클라이언트 컴포넌트에 다른 패턴 적용
2. **우아한 오류 처리**: 항상 FetchError 인스턴스 확인
3. **TypeScript 사용**: 요청과 응답에 적절한 타입 정의
4. **서버 요청 캐싱**: Next.js의 `next.tags`와 `revalidateTag`를 활용한 캐싱
5. **불필요한 환경 체크 피하기**: 유니버설 api 선택기 사용

## 🔄 Axios에서 마이그레이션

```typescript
// Axios
const { data } = await axios.get('/users/1');

// Fetchios
const { body } = await api.get('/users/1');
```
