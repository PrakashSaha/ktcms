import { Core } from '@strapi/strapi';

export default (plugin: any) => {
  const sanitizeOutput = (user: any) => {
    const {
      password, resetPasswordToken, confirmationToken, ...sanitizedUser
    } = user;
    return sanitizedUser;
  };

  // Override /api/users/me to populate wishlist
  plugin.controllers.user.me = async (ctx: any) => {
    if (!ctx.state.user) {
      return ctx.unauthorized();
    }

    // Use Document Service for Strapi 5
    const user = await (strapi as any).documents('plugin::users-permissions.user').findOne({
      documentId: ctx.state.user.documentId || ctx.state.user.id,
      populate: ['wishlist'] as any
    });

    if (!user) {
      return ctx.notFound();
    }

    ctx.body = sanitizeOutput(user);
  };

  // Keep original update controller
  const originalUpdate = plugin.controllers.user.update;

  // Override /api/users/:id to allow updating wishlist
  plugin.controllers.user.update = async (ctx: any) => {
    const { id } = ctx.params; // This is the ID or documentId depending on how it's called
    const { wishlist } = ctx.request.body;

    // Security check: ensure users can only update their own profile
    const currentUser = ctx.state.user;
    if (currentUser && currentUser.id.toString() !== id.toString() && currentUser.documentId !== id) {
        return ctx.forbidden("You can only update your own profile.");
    }

    // Call the original update controller first
    await originalUpdate(ctx);

    // If wishlist was sent in the body, manually update the relation using Document Service
    if (wishlist !== undefined) {
      const updatedUser = await (strapi as any).documents('plugin::users-permissions.user').update({
        documentId: currentUser.documentId || id,
        data: {
          wishlist: wishlist
        } as any,
        populate: ['wishlist'] as any
      });
      ctx.body = sanitizeOutput(updatedUser);
    }
  };

  return plugin;
};
