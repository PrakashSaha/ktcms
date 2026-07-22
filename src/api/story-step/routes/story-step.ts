/**
 * story-step router
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::story-step.story-step', {
  config: { find: { auth: false }, findOne: { auth: false } },
});
