import { getStorageItem } from './localStorageService';

interface FetchOptions extends RequestInit {
  data?: any;
}

export const fetchWithAuth = async <T>(url: string, options: FetchOptions = {}): Promise<T> => {
  const token = getStorageItem<string>('auth_token');
  
  const headers = new Headers(options.headers || {});
  headers.append('Content-Type', 'application/json');
  if (token) {
    headers.append('Authorization', `Bearer ${token}`);
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  if (options.data) {
    config.body = JSON.stringify(options.data);
  }

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Network response was not ok');
    }
    
    // For 204 No Content
    if (response.status === 204) return {} as T;

    return await response.json() as T;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};

export const networkService = {
  get: <T>(url: string, options?: FetchOptions) => fetchWithAuth<T>(url, { ...options, method: 'GET' }),
  post: <T>(url: string, data: any, options?: FetchOptions) => fetchWithAuth<T>(url, { ...options, method: 'POST', data }),
  put: <T>(url: string, data: any, options?: FetchOptions) => fetchWithAuth<T>(url, { ...options, method: 'PUT', data }),
  delete: <T>(url: string, options?: FetchOptions) => fetchWithAuth<T>(url, { ...options, method: 'DELETE' }),
};
