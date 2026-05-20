import type { Core } from '@strapi/strapi';

interface SendOptions {
  to: string;
  from?: string;
  replyTo?: string;
  subject: string;
  text?: string;
  html?: string;
}

const provider = {
  init: (providerOptions: any = {}, settings: any = {}) => {
    return {
      send: async (options: SendOptions) => {
        const fromAddress = options.from || settings.defaultFrom || 'no-reply@krafttreasure.com';
        console.log('==================================================');
        console.log('✉️  [STRAPI EMAIL CONSOLE PROVIDER]');
        console.log('--------------------------------------------------');
        console.log(`FROM: ${fromAddress}`);
        console.log(`TO: ${options.to}`);
        console.log(`SUBJECT: ${options.subject}`);
        if (options.text) {
          console.log(`TEXT CONTENT:\n${options.text}`);
        }
        if (options.html) {
          console.log(`HTML CONTENT:\n${options.html.substring(0, 1000)}${options.html.length > 1000 ? '\n... (truncated)' : ''}`);
        }
        console.log('==================================================');
      }
    };
  }
};

export = provider;
