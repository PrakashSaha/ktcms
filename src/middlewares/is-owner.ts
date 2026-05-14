
import fs from 'fs';
import path from 'path';

export default (config, { strapi }) => {
  return async (ctx, next) => {
    const user = ctx.state.user;
    const { id } = ctx.params;
    const uid = ctx.state.route.info.apiName;
    const apiUid = `api::${uid}.${uid}`;
    
    const userField = config.userField || 'user';

    if (ctx.method === 'DELETE') {
      strapi.log.info(`DELETE Request: ${ctx.url} - Params: ${JSON.stringify(ctx.params)} - User: ${user?.id}`);
    }

    if (!user) {
      return ctx.unauthorized();
    }

    // If it's a 'find' request, inject a filter to only show owner's data
    if (ctx.state.route.handler.endsWith('.find')) {
      ctx.query.filters = {
        ...ctx.query.filters,
        [userField]: { id: user.id }
      };
      return next();
    }

    // For findOne, update, delete, check if the user is the owner
    if (id) {
      strapi.log.info(`Looking up entry ${id} for ${apiUid}...`);
      
      let entry = await strapi.documents(apiUid as any).findOne({
        documentId: id,
        populate: [userField]
      });

      // Fallback for numeric IDs if documentId find fails
      if (!entry && !isNaN(Number(id))) {
        strapi.log.info(`Entry ${id} not found by documentId, attempting find by numeric ID...`);
        const entries = await strapi.documents(apiUid as any).findMany({
          filters: { id: id },
          populate: [userField]
        });
        entry = entries[0];
      }

      if (!entry) {
        strapi.log.info(`Entry ${id} NOT FOUND in ${apiUid}`);
        return ctx.notFound();
      }

      const owner = entry[userField];
      const ownerId = owner?.id || owner?.documentId;
      strapi.log.info(`Found entry. Owner: ${JSON.stringify(owner)}. Current User ID: ${user.id}. Current User DocID: ${user.documentId}`);

      if (ownerId && (String(ownerId) !== String(user.id) && String(ownerId) !== String(user.documentId))) {
        strapi.log.info(`FORBIDDEN: Owner ${ownerId} mismatch with User ${user.id}/${user.documentId}`);
        return ctx.forbidden("You are not the owner of this resource.");
      }
      strapi.log.info(`Ownership verified for ${id}`);
    }

    return next();
  };
};
