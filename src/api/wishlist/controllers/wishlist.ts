/**
 * wishlist controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::wishlist.wishlist', ({ strapi }) => ({
  async create(ctx) {
    return await super.create(ctx);
  }
}));
