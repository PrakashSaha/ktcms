/**
 * otp-store controller
 */

import { factories } from '@strapi/strapi';
import crypto from 'crypto';
import notificationService from '../services/notificationService';

export default factories.createCoreController('api::otp-store.otp-store', ({ strapi }) => ({
  /**
   * 1. Forgot Password - Generate and send OTP
   */
  async forgotPassword(ctx) {
    const { email } = ctx.request.body;

    if (!email) {
      return ctx.badRequest('Email is required');
    }

    // 1. Verify user exists
    const user = await strapi.query('plugin::users-permissions.user').findOne({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      return ctx.notFound('User not found');
    }

    // 2. Generate 6-digit OTP and Reset Token
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    try {
      // 3. Clear any existing OTP records for this email
      const existing = await strapi.documents('api::otp-store.otp-store').findMany({
        filters: { email: email.toLowerCase() }
      });

      for (const record of existing) {
        await strapi.documents('api::otp-store.otp-store').delete({
          documentId: record.documentId
        });
      }

      // 4. Save new OTP record
      await strapi.documents('api::otp-store.otp-store').create({
        data: {
          email: email.toLowerCase(),
          otp,
          reset_token: resetToken,
          expires_at: expiresAt,
          verified: false,
          attempts: 0
        }
      });

      // 5. Send OTP via notification service
      await notificationService.sendOTP(email, otp);

      return ctx.send({ message: 'OTP sent' });
    } catch (err) {
      strapi.log.error('ForgotPassword Error:', err);
      return ctx.internalServerError('Could not process forgot password request');
    }
  },

  /**
   * 2. Verify OTP - Validate OTP and return reset token
   */
  async verifyOtp(ctx) {
    const { email, otp } = ctx.request.body;

    if (!email || !otp) {
      return ctx.badRequest('Email and OTP are required');
    }

    try {
      // 1. Find record
      const records = await strapi.documents('api::otp-store.otp-store').findMany({
        filters: { email: email.toLowerCase() },
        sort: 'createdAt:desc',
        limit: 1
      });

      const record = records[0];

      if (!record) {
        return ctx.badRequest('No OTP requested for this email');
      }

      // 2. Check attempts
      if (record.attempts >= 3) {
        return ctx.badRequest('Too many failed attempts. Please request a new OTP.');
      }

      // 3. Check expiration
      if (new Date(record.expires_at) < new Date()) {
        return ctx.badRequest('OTP has expired');
      }

      // 4. Verify OTP
      if (record.otp !== otp) {
        await strapi.documents('api::otp-store.otp-store').update({
          documentId: record.documentId,
          data: { attempts: record.attempts + 1 }
        });
        return ctx.badRequest('Invalid OTP');
      }

      // 5. Mark as verified
      await strapi.documents('api::otp-store.otp-store').update({
        documentId: record.documentId,
        data: { verified: true }
      });

      return ctx.send({
        message: 'OTP verified',
        resetToken: record.reset_token
      });
    } catch (err) {
      strapi.log.error('VerifyOtp Error:', err);
      return ctx.internalServerError('Verification failed');
    }
  },

  /**
   * 3. Reset Password - Set new password using token
   */
  async resetPassword(ctx) {
    const { resetToken, newPassword } = ctx.request.body;

    if (!resetToken || !newPassword) {
      return ctx.badRequest('Reset token and new password are required');
    }

    try {
      // 1. Find verified record by token
      const records = await strapi.documents('api::otp-store.otp-store').findMany({
        filters: { 
            reset_token: resetToken,
            verified: true
        },
        limit: 1
      });

      const record = records[0];

      if (!record) {
        return ctx.badRequest('Invalid or unverified reset token');
      }

      // 2. Check expiration
      if (new Date(record.expires_at) < new Date()) {
        return ctx.badRequest('Reset session has expired');
      }

      // 3. Find user
      const user = await strapi.query('plugin::users-permissions.user').findOne({
        where: { email: record.email }
      });

      if (!user) {
        return ctx.notFound('User no longer exists');
      }

      // 4. Update password
      await strapi.plugins['users-permissions'].services.user.edit(user.id, {
        password: newPassword
      });

      // 5. Cleanup OTP record
      await strapi.documents('api::otp-store.otp-store').delete({
        documentId: record.documentId
      });

      return ctx.send({ message: 'Password reset successful' });
    } catch (err) {
      strapi.log.error('ResetPassword Error:', err);
      return ctx.internalServerError('Could not reset password');
    }
  }
}));
