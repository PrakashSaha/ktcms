/**
 * Notification Service
 */

class NotificationService {
  private provider: string;

  constructor() {
    this.provider = process.env.NOTIFICATION_PROVIDER || 'console';
  }

  async sendOTP(recipient: string, otp: string) {
    switch (this.provider) {
      case 'console':
        return this._sendViaConsole(recipient, otp);
      case 'email':
        return this._sendViaEmail(recipient, otp);
      case 'sms':
        return this._sendViaSMS(recipient, otp);
      default:
        throw new Error(`Notification provider ${this.provider} not supported.`);
    }
  }

  private _sendViaConsole(recipient: string, otp: string) {
    const message = `
========================================
       OTP DELIVERY (DEBUG MODE)
========================================
To:      ${recipient}
OTP:     ${otp}
Expires: In 10 minutes
========================================
`;
    // Log via Strapi only in development
    if (process.env.NODE_ENV === 'development') {
      // @ts-ignore
      strapi.log.info(message);
    }
    
    return true;
  }

  private async _sendViaEmail(recipient: string, otp: string) {
    try {
      // @ts-ignore
      await strapi.plugin('email').service('email').send({
        to: recipient,
        subject: 'Kraft Treasure - Your Verification Code',
        text: `Your One-Time Password (OTP) is: ${otp}. It will expire in 10 minutes.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #E4E4E7; border-radius: 8px;">
            <h2 style="color: #3A3530; margin-bottom: 24px;">Kraft Treasure Validation</h2>
            <p style="color: #595148;">Your verification code is:</p>
            <h1 style="color: #D33740; font-size: 32px; letter-spacing: 4px; margin: 16px 0;">${otp}</h1>
            <p style="color: #8C6E3F; font-size: 14px;">This code will expire in 10 minutes. Please do not share it with anyone.</p>
          </div>
        `,
      });
      return true;
    } catch (error) {
      // @ts-ignore
      strapi.log.error('Failed to send OTP email:', error);
      throw new Error('Failed to send email OTP');
    }
  }

  private _sendViaSMS(recipient: string, otp: string) {
    throw new Error('SMS provider not configured yet.');
  }
}

export default new NotificationService();
