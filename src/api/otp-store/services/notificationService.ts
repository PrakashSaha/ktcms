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

  private _sendViaEmail(recipient: string, otp: string) {
    throw new Error('Email provider not configured yet.');
  }

  private _sendViaSMS(recipient: string, otp: string) {
    throw new Error('SMS provider not configured yet.');
  }
}

export default new NotificationService();
