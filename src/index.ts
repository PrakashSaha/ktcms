export default {
  register() {},

  async bootstrap({ strapi }) {
    try {
      strapi.log.info('--- Production Permissions Audit Starting ---');

      const authRole = await strapi.db.query('plugin::users-permissions.role').findOne({
        where: { type: 'authenticated' },
      });

      const publicRole = await strapi.db.query('plugin::users-permissions.role').findOne({
        where: { $or: [{ type: 'public' }, { name: 'Public' }] },
      });

      if (authRole) {
        const authActions = [
          'plugin::users-permissions.user.update',
          'api::address.address.create',
          'api::address.address.find',
          'api::address.address.findOne',
          'api::address.address.update',
          'api::address.address.delete',
          'api::order.order.create',
          'api::order.order.find',
          'api::order.order.findOne',
          'api::order-item.order-item.create',
          'api::order-item.order-item.find',
          'api::order-item.order-item.findOne',
          'api::order-item.order-item.update',
          'api::order-item.order-item.delete',
          'api::wishlist.wishlist.create',
          'api::wishlist.wishlist.find',
          'api::wishlist.wishlist.findOne',
          'api::wishlist.wishlist.delete',
          'api::cart.cart.create',
          'api::cart.cart.find',
          'api::cart.cart.findOne',
          'api::cart.cart.update',
          'api::cart.cart.delete',
          'api::otp-store.otp-store.forgotPassword',
          'api::otp-store.otp-store.resetPassword'
        ];

        for (const action of authActions) {
          const exists = await strapi.db.query('plugin::users-permissions.permission').findOne({
            where: { role: authRole.id, action }
          });
          
          if (!exists) {
            await strapi.db.query('plugin::users-permissions.permission').create({
              data: { action, role: authRole.id }
            });
          }
        }
      }

      if (publicRole) {
        const publicActions = [
          'api::product.product.find',
          'api::product.product.findOne',
          'api::category.category.find',
          'api::category.category.findOne',
          'api::hero-slider.hero-slider.find',
          'api::hero-slider.hero-slider.findOne',
          'api::testimonial.testimonial.find',
          'api::testimonial.testimonial.findOne',
          'api::instagram-feed.instagram-feed.find',
          'api::instagram-feed.instagram-feed.findOne',
          'api::story-step.story-step.find',
          'api::story-step.story-step.findOne',
          'api::global-configuration.global-configuration.find',
          'api::adornment.adornment.find',
          'api::adornment.adornment.findOne'
        ];

        for (const action of publicActions) {
          const exists = await strapi.db.query('plugin::users-permissions.permission').findOne({
            where: { role: publicRole.id, action }
          });
          
          if (!exists) {
            await strapi.db.query('plugin::users-permissions.permission').create({
              data: { role: publicRole.id, action }
            });
          }
        }
      }

      strapi.log.info('✅ Strapi Production Permissions Audit Complete!');
    } catch (e) {
      strapi.log.error('❌ Failed to auto-grant permissions:', e);
    }
  },
};
