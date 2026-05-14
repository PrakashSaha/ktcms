/**
 * wishlist router
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::wishlist.wishlist', {
    config: {
        find: {
            middlewares: ['global::is-owner'],
        },
        findOne: {
            middlewares: ['global::is-owner'],
        },
        delete: {
            middlewares: ['global::is-owner'],
        },
    }
});
