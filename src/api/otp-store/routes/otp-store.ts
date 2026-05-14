/**
 * otp-store router
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::otp-store.otp-store', {
  config: {
    // Custom configurations can go here
  }
});

// We keep custom routes in custom-auth.ts as it's the Strapi v5 standard for non-core routes.
// However, I'll ensure the controller has all the methods.
