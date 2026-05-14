export default {
  routes: [
    {
      method: 'POST',
      path: '/otp-store/forgot-password',
      handler: 'api::otp-store.otp-store.forgotPassword',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/otp-store/verify-otp',
      handler: 'api::otp-store.otp-store.verifyOtp',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/otp-store/reset-password',
      handler: 'api::otp-store.otp-store.resetPassword',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};
