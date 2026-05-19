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
      provider: path.resolve(__dirname, '../src/providers/email-gmail-api'),
      providerOptions: {
        clientId: env('GMAIL_CLIENT_ID'),
        clientSecret: env('GMAIL_CLIENT_SECRET'),
        refreshToken: env('GMAIL_REFRESH_TOKEN'),
        senderEmail: env('SMTP_USERNAME', 'prakashsaha1999@gmail.com'),
      },
      settings: {
        defaultFrom: env('SMTP_DEFAULT_FROM', 'prakashsaha1999@gmail.com'),
        defaultReplyTo: env('SMTP_DEFAULT_REPLY_TO', 'prakashsaha1999@gmail.com'),
      },
    },
  },
});

export default config;
