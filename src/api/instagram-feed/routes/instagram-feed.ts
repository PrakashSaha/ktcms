/**
 * instagram-feed router
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::instagram-feed.instagram-feed', {
  config: { find: { auth: false }, findOne: { auth: false } },
});
