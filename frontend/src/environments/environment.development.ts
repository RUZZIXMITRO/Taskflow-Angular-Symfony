// Environnement de développement : /api est redirigé vers Symfony par proxy.conf.json (pas de CORS).
export const environment = {
  production: false,
  apiUrl: '/api',
};
