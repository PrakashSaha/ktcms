export default (config, { strapi }) => {
  return async (ctx, next) => {
    const user = ctx.state.user;
    const { id } = ctx.params;
    const uid = ctx.state.route.info.apiName;
    const apiUid = `api::${uid}.${uid}`;
    const handler = ctx.state.route.handler;

    const ownerField = config.userField || 'owner';
    const altOwnerField = 'owner'; 

    const contentType = strapi.contentType(apiUid as any);
    const attributes = contentType?.attributes || {};

    if (!user) {
      return ctx.unauthorized();
    }

    strapi.log.info(`[is-owner] Processing request for ${apiUid} - Handler: ${handler} - User: ${user.id}`);

    // For 'find' requests: Securely scope to owner and bypass REST query validator
    if (handler && (handler.endsWith('.find') || handler === 'find')) {
      const targetField = attributes[ownerField] ? ownerField : (attributes[altOwnerField] ? altOwnerField : null);
      
      if (targetField) {
        strapi.log.info(`[is-owner] Securely scoping find request for ${apiUid} to user ${user.id} via ${targetField}`);
        
        const clientFilters = { ...ctx.query.filters };
        delete clientFilters[ownerField];
        delete clientFilters[altOwnerField];

        const pagination = ctx.query.pagination as any;
        const page = parseInt(pagination?.page) || 1;
        const pageSize = parseInt(pagination?.pageSize) || 25;
        
        const entries = await strapi.documents(apiUid as any).findMany({
          filters: {
            ...clientFilters,
            [targetField]: {
              documentId: user.documentId
            }
          },
          populate: ctx.query.populate as any,
          sort: ctx.query.sort as any,
        });

        ctx.body = {
          data: entries,
          meta: {
            pagination: {
              page,
              pageSize,
              pageCount: Math.ceil(entries.length / pageSize),
              total: entries.length
            }
          }
        };
        return; // Skip standard controller to bypass validation
      }
    }

    // For 'create' requests: Automatically set owner and bypass REST creation validator
    if (handler && (handler.endsWith('.create') || handler === 'create')) {
      if (ctx.request.body && ctx.request.body.data) {
        const targetField = attributes[ownerField] ? ownerField : (attributes[altOwnerField] ? altOwnerField : null);
        
        if (targetField) {
          strapi.log.info(`[is-owner] Securely creating resource for ${apiUid} owned by user ${user.id} via ${targetField}`);
          
          const bodyData = { ...ctx.request.body.data };
          delete bodyData[ownerField];
          delete bodyData[altOwnerField];

          try {
            let userDocId = user.documentId;
            if (!userDocId) {
              strapi.log.info(`[is-owner] user.documentId missing on state.user. Resolving dynamically for user ID ${user.id}...`);
              const userRecord = await strapi.documents('plugin::users-permissions.user').findOne({
                filters: { id: user.id } as any
              });
              userDocId = userRecord?.documentId;
            }

            if (!userDocId) {
              strapi.log.error(`[is-owner] Failed to resolve documentId for user ID ${user.id}`);
              return ctx.badRequest('Could not resolve authenticated user reference.');
            }

            const entry = await strapi.documents(apiUid as any).create({
              data: {
                ...bodyData,
                [targetField]: userDocId
              },
              populate: ctx.query.populate as any
            });

            ctx.body = { data: entry };
            return; // Skip standard controller to bypass validation
          } catch (createErr: any) {
            strapi.log.error(`[is-owner] Error creating resource for ${apiUid}:`, createErr.message || createErr);
            if (createErr.details) {
              strapi.log.error(`[is-owner] Error details:`, JSON.stringify(createErr.details, null, 2));
            }
            return ctx.badRequest(createErr.message || 'Failed to create resource.');
          }
        }
      }
    }

    // For findOne, update, delete: verify ownership using Documents API
    if (id) {
      try {
        const entry = await strapi.documents(apiUid as any).findOne({
          documentId: id,
          populate: [ownerField, altOwnerField]
        });

        if (!entry) {
          // If not found by documentId, try numeric id
          const entries = await strapi.documents(apiUid as any).findMany({
            filters: { id } as any,
            populate: [ownerField, altOwnerField]
          });
          if (entries.length > 0) {
            const owner = entries[0][ownerField] || entries[0][altOwnerField];
            const ownerId = owner?.id || owner;
            if (ownerId && String(ownerId) !== String(user.id)) {
              return ctx.forbidden('You are not the owner of this resource.');
            }
            return next();
          }
          return ctx.notFound();
        }

        const owner = entry[ownerField] || entry[altOwnerField];
        const ownerId = owner?.id || owner;

        if (ownerId && String(ownerId) !== String(user.id)) {
          return ctx.forbidden('You are not the owner of this resource.');
        }
      } catch (err) {
        strapi.log.error(`[is-owner] Error in ownership check for ${apiUid}/${id}:`, err);
      }
    }

    return next();
  };
};
