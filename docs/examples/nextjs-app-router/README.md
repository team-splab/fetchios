# Next.js App Router with Fetchios

This guide demonstrates how to integrate Fetchios with Next.js 13+ App Router for both client-side and server-side usage.

## 📋 Overview

This example shows simple patterns for using Fetchios in Next.js applications:

- **Client-side API calls** with interceptors and state management
- **Server-side API calls** for Server Components and API routes
- **Universal usage** with automatic environment detection
- **Simple error handling** patterns

## 🚀 Quick Start

### 1. Install Fetchios

```bash
npm install @team-splab/fetchios
```

### 2. API Setup

Create your API instances:

#### Client API (`lib/api/client.ts`)

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
    message: 'An unexpected error occurred',
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

#### Server API (`lib/api/server.ts`)

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
    message: 'An unexpected error occurred',
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

#### Universal API Selector (`lib/api/index.ts`)

```typescript
import { clientApi } from './client';
import { serverApi } from './server';

const isClient = () => typeof window !== 'undefined';

export const api = isClient() ? clientApi : serverApi;
export { clientApi, serverApi };
```

## 📖 Usage Examples

### 1. Server Components

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
    console.error('Failed to fetch users:', error);
    return [];
  }
}

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <div>
      <h1>Users</h1>
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

### 2. Client Components

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
          setError('An unexpected error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

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

### 3. API Routes

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
    console.error('API Route error:', error);

    if (error instanceof FetchError) {
      return NextResponse.json(
        { error: error.response.body.message },
        { status: error.response.status }
      );
    }

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userData = await request.json();
    const response = await api.post<User>('/users', userData);
    return NextResponse.json(response.body, { status: 201 });
  } catch (error) {
    console.error('Create user error:', error);

    if (error instanceof FetchError) {
      return NextResponse.json(
        { error: error.response.body.message },
        { status: error.response.status }
      );
    }

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
```

### 4. Server Actions

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
    console.error('Create user action error:', error);

    if (error instanceof FetchError) {
      return {
        success: false,
        error: error.response.body.message,
      };
    }

    return {
      success: false,
      error: 'Failed to create user',
    };
  }
}
```

## 🚨 Error Handling

### Basic Error Handling

```typescript
import { FetchError } from '@team-splab/fetchios';

try {
  const response = await api.get('/users/1');
  console.log(response.body);
} catch (error) {
  if (error instanceof FetchError) {
    // Handle API errors
    console.error('API Error:', {
      status: error.response.status,
      message: error.response.body.message,
    });
  } else {
    // Handle network errors
    console.error('Network error:', error);
  }
}
```

## ⚡ Advanced Features

### Custom Interceptors

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
      console.log(`API Response: ${response.status} ${response.url}`);
      return response;
    },
  },
});
```

### Request Caching (Server)

```typescript
import { api } from '@/lib/api';
import { revalidateTag } from 'next/cache';

// Next.js caching with tags
export async function getUser(userId: string) {
  const response = await api.get<User>(`/users/${userId}`, {
    next: {
      tags: [`user-${userId}`],
      revalidate: 3600 // 1 hour cache
    }
  });
  return response.body;
}

export async function getUsers() {
  const response = await api.get<User[]>('/users', {
    next: {
      tags: ['users'],
      revalidate: 300 // 5 minutes cache
    }
  });
  return response.body;
}

// Cache invalidation
export async function invalidateUserCache(userId: string) {
  revalidateTag(`user-${userId}`);
}

export async function invalidateUsersCache() {
  revalidateTag('users');
}

// Usage example
export default async function UserPage({ params }: { params: { id: string } }) {
  const user = await getUser(params.id); // Cached

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}
```

## 🎯 Best Practices

1. **Use appropriate contexts**: Different patterns for Server Components vs Client Components
2. **Handle errors gracefully**: Always check for FetchError instances
3. **Use TypeScript**: Define proper types for requests and responses
4. **Cache server requests**: Use Next.js `next.tags` and `revalidateTag` for caching
5. **Avoid unnecessary environment checks**: Use the universal api selector instead

## 🔄 Migration from Axios

```typescript
// Axios
const { data } = await axios.get('/users/1');

// Fetchios
const { body } = await api.get('/users/1');
```
