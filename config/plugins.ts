import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Plugin => ({
  upload: {
    config: {
      provider: 'aws-s3',
      providerOptions: {
        s3Options: {
          credentials: {
            accessKeyId: env('S3_ACCESS_KEY_ID'),
            secretAccessKey: env('S3_ACCESS_SECRET'),
          },
          endpoint: env('S3_ENDPOINT'),
          region: env('S3_REGION'),
          forcePathStyle: true,
          params: {
            Bucket: env('S3_BUCKET'),
          },
        },
        baseUrl: `https://dlvanktuohroejmhytng.storage.supabase.co/storage/v1/object/public/${env('S3_BUCKET')}`,
      },
    },
  },
  email: {
    config: {
      provider: 'nodemailer',
      providerOptions: {
        host: env('SMTP_HOST'),
        port: env.int('SMTP_PORT', 587),
        secure: false,       // false for port 587 (STARTTLS), true for port 465 (SSL)
        requireTLS: true,    // Zoho requires explicit TLS upgrade
        auth: {
          user: env('SMTP_USERNAME'),
          pass: env('SMTP_PASSWORD'),
        },
        tls: {
          rejectUnauthorized: true,
        },
      },
      settings: {
        defaultFrom: env('SMTP_DEFAULT_FROM', 'no-reply@krafttreasure.com'),
        defaultReplyTo: env('SMTP_DEFAULT_REPLY_TO', 'contact@krafttreasure.com'),
      },
    },
  },
});

export default config;
