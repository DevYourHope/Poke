import auth from '../netlify-auth';

const API_BASE = '/api';

async function getAuthHeaders() {
  const user = auth.currentUser();
  if (!user) throw new Error('Not authenticated');
  
  try {
    const token = await user.jwt();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  } catch (error) {
    console.error('Error getting JWT:', error);
    throw error;
  }
}

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const headers = await getAuthHeaders();
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP error ${response.status}`);
  }

  return response.json();
}
