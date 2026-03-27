import auth from '../netlify-auth';

const API_BASE = '/api';

async function getAuthHeaders() {
  const user = auth.currentUser();
  
  // Check if we are in AI Studio preview (run.app)
  const isDemo = window.location.hostname.includes('run.app');
  const demoUser = localStorage.getItem('demo_user');

  if (!user) {
    if (isDemo && demoUser) {
      // In demo mode, we don't need a real JWT as the backend handles it
      return {
        'Content-Type': 'application/json',
        'X-Demo-User': 'true'
      };
    }
    throw new Error('Not authenticated');
  }
  
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
