export default {
  register() {},

  async bootstrap({ strapi }) {
    try {
      strapi.log.info('--- Production Permissions Audit Starting ---');

      const authRole = await strapi.db.query('plugin::users-permissions.role').findOne({
        where: { type: 'authenticated' },
      });

      const publicRole = await strapi.db.query('plugin::users-permissions.role').findOne({
        where: { type: 'public' },
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
          'api::wishlist.wishlist.create',
          'api::wishlist.wishlist.find',
          'api::wishlist.wishlist.findOne',
          'api::wishlist.wishlist.delete',
          'api::cart.cart.create',
          'api::cart.cart.find',
          'api::cart.cart.findOne',
          'api::cart.cart.update',
          'api::cart.cart.delete'
        ];

        for (const action of authActions) {
          // Clean up any existing permissions for this action to avoid duplicates or orphans
          await strapi.db.query('plugin::users-permissions.permission').deleteMany({
            where: { action }
          });
          
          await strapi.db.query('plugin::users-permissions.permission').create({
            data: { 
              action, 
              role: authRole.id
            }
          });
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
          'api::global-configuration.global-configuration.find'
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
