export default {
  routes: [
    {
      method: 'GET',
      path: '/orders/:id/receipt',
      handler: 'order.receipt',
      config: {
        auth: false,
      },
    },
  ],
};
