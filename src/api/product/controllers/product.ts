/**
 * product controller
 *
 * Custom find override: Strapi v5 REST sanitizer rejects relation filters
 * (e.g. filters[categories][slug]) unless the Public role has explicit
 * find permission on the related content type. Using strapi.documents()
 * bypasses that check while keeping the same REST response shape.
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::product.product', ({ strapi }) => ({
  async find(ctx) {
    const query = ctx.query as any;

    // Convert REST page/pageSize to Document API start/limit
    const page = Number(query.pagination?.page) || 1;
    const pageSize = Number(query.pagination?.pageSize) || 25;
    const start = (page - 1) * pageSize;

    // Convert REST populate array (e.g. {0:'image',1:'thumbnail'}) to string array
    let populate: any = query.populate;
    if (populate && typeof populate === 'object' && !Array.isArray(populate)) {
      const values = Object.values(populate);
      // If values are strings it's a flat list like {0:'image',1:'thumbnail'}
      if (values.every((v: any) => typeof v === 'string')) {
        populate = values as string[];
      }
    }

    const results = await strapi.documents('api::product.product').findMany({
      filters: query.filters,
      populate,
      sort: query.sort,
      start,
      limit: pageSize,
      status: 'published',
    });

    // Build pagination meta when requested
    let meta: any = {};
    const wc = query.pagination?.withCount;
    if (wc === 'true' || wc === true) {
      const total = await strapi.documents('api::product.product').count({
        filters: query.filters,
        status: 'published',
      });
      meta.pagination = { page, pageSize, pageCount: Math.ceil(total / pageSize), total };
    }

    return { data: results, meta };
  },
}));
