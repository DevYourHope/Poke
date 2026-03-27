import GoTrue from 'gotrue-js';

// Initialize GoTrue for Netlify Identity
// The site URL will be automatically detected in production (/.netlify/identity), 
// but for local dev it might need a fallback.
const auth = new GoTrue({
  APIUrl: '/.netlify/identity',
  audience: '',
  setCookie: true,
});

export default auth;
