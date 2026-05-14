import type { Core } from '@strapi/strapi';

export default ({ env }: { env: any }) => [
  'strapi::logger',
  'strapi::errors',
  'strapi::security',
  {
    name: 'strapi::cors',
    config: {
      origin: [
        env('FRONTEND_URL', 'https://krafttreasure.com'), 
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
