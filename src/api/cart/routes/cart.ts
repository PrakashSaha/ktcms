/**
 * cart router
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::cart.cart', {
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
        update: {
            middlewares: [{ name: 'global::is-owner', config: { userField: 'owner' } }],
        },
        delete: {
            middlewares: [{ name: 'global::is-owner', config: { userField: 'owner' } }],
        },
    }
});
