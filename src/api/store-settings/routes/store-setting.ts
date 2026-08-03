/**
 * store-settings router
 */

import { factories } from '@strapi/strapi';

// @ts-ignore
export default factories.createCoreRouter('api::store-settings.store-setting', {
  config: { find: { auth: false }, findOne: { auth: false } },
});
