import axios from 'axios';
// @ts-ignore
import MailComposer from 'nodemailer/lib/mail-composer';

interface ProviderOptions {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  senderEmail: string;
}

interface SendOptions {
  to: string;
  from?: string;
  replyTo?: string;
  subject: string;
  text?: string;
  html?: string;
}

export default {
  init(providerOptions: ProviderOptions, settings: any) {
    const { clientId, clientSecret, refreshToken, senderEmail } = providerOptions;

    return {
      async send(options: SendOptions) {
        // 1. Get fresh Access Token from Google OAuth2
        const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
        });
        
        const accessToken = tokenResponse.data.access_token;

        // 2. Compile email message using Nodemailer's MailComposer
        const mailOptions = {
          to: options.to,
          from: options.from || settings.defaultFrom || senderEmail,
          replyTo: options.replyTo || settings.defaultReplyTo,
          subject: options.subject,
          text: options.text,
          html: options.html,
        };

        const mail = new MailComposer(mailOptions);
        const rawBuffer = await mail.compile().build();
        const base64Safe = rawBuffer.toString('base64')
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=+$/, '');

        // 3. Send raw message via Gmail REST API (over HTTPS Port 443)
        await axios.post(
          'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
          {
            raw: base64Safe,
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          }
        );
      },
    };
  },
};
