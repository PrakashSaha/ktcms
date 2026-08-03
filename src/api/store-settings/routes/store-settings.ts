/**
 * store-settings router
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::store-settings.store-settings', {
  config: { find: { auth: false }, findOne: { auth: false } },
});
