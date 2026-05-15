import type { Core } from '@strapi/strapi';

export default ({ env }: { env: any }) => [
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:', 'http:', 'https://dlvanktuohroejmhytng.storage.supabase.co'],
          'img-src': [
            "'self'", 
            'data:', 
            'blob:', 
            'https:',
            'http:',
            'https://ktcms-1.onrender.com', 
            'https://krafttrassures-virid.vercel.app',
            'https://krafttreasure.com',
            'https://dlvanktuohroejmhytng.storage.supabase.co',
          ],
          'media-src': [
            "'self'", 
            'data:', 
            'blob:', 
            'https:',
            'http:',
            'https://ktcms-1.onrender.com', 
          ],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  {
    name: 'strapi::cors',
    config: {
      origin: [
        env('FRONTEND_URL', 'https://krafttrassures-virid.vercel.app'), 
        'https://krafttrassures-virid.vercel.app',
        'https://krafttreasure.com', 
        'https://www.krafttreasure.com',
        'http://localhost:3000', 
        'http://127.0.0.1:3000'
      ],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
      headers: ['Content-Type', 'Authorization', 'Origin', 'Accept', 'X-Requested-With'],
      keepHeaderOnError: true,
    },
  },
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
