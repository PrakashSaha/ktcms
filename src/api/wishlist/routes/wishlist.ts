/**
 * wishlist router
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::wishlist.wishlist', {
    config: {
        find: {
            middlewares: [{ name: 'global::is-owner', config: { userField: 'owner' } }],
        },
        findOne: {
            middlewares: [{ name: 'global::is-owner', config: { userField: 'owner' } }],
        },
        create: {
            middlewares: [{ name: 'global::is-owner', config: { userField: 'owner' } }],
        },
        delete: {
            middlewares: [{ name: 'global::is-owner', config: { userField: 'owner' } }],
        },
    }
});
