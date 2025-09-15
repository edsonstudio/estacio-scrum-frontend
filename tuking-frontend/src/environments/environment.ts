// Detectar automaticamente se está rodando no localhost ou IP da rede
const hostname = window.location.hostname;
const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
const apiUrl = isLocalhost ? 'http://localhost:5002' : 'http://192.168.0.136:5002';

// Debug log
console.log('Environment Debug:', {
  hostname,
  isLocalhost,
  apiUrl,
  currentUrl: window.location.href
});

export const environment = {
  production: false,
  apiUrl
};
