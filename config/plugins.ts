import dns from 'dns';
import path from 'path';
import type { Core } from '@strapi/strapi';

if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

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
      provider: env('EMAIL_PROVIDER', 'nodemailer'),
      providerOptions: {
        host: env('SMTP_HOST', 'smtp.resend.com'),
        port: env.int('SMTP_PORT', 465),
        secure: env.bool('SMTP_SECURE', true),
        auth: {
          user: env('SMTP_USERNAME', 'resend'),
          pass: env('SMTP_PASSWORD'),
        },
      },
      settings: {
        defaultFrom: env('SMTP_DEFAULT_FROM', 'onboarding@resend.dev'),
        defaultReplyTo: env('SMTP_DEFAULT_REPLY_TO', 'onboarding@resend.dev'),
      },
    },
  },
});

export default config;
