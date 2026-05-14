module.exports = (plugin) => {
  const sanitizeOutput = (user) => {
    const {
      password, resetPasswordToken, confirmationToken, ...sanitizedUser
    } = user;
    return sanitizedUser;
  };

  // Override /api/users/me to populate wishlist
  plugin.controllers.user.me = async (ctx) => {
    if (!ctx.state.user) {
      return ctx.unauthorized();
    }
    const user = await strapi.entityService.findOne(
      'plugin::users-permissions.user',
      ctx.state.user.id,
      { populate: '*' }
    );

    ctx.body = sanitizeOutput(user);
  };

  // Keep original update controller
  const originalUpdate = plugin.controllers.user.update;

  // Override /api/users/:id to allow updating wishlist
  plugin.controllers.user.update = async (ctx) => {
    const { id } = ctx.params;
    const { wishlist } = ctx.request.body;

    // Security check: ensure users can only update their own profile
    if (ctx.state.user && ctx.state.user.id.toString() !== id.toString()) {
        return ctx.forbidden("You can only update your own profile.");
    }

    // Call the original update controller first
    await originalUpdate(ctx);

    // If wishlist was sent in the body, manually update the relation
    if (wishlist !== undefined) {
      const updatedUser = await strapi.entityService.update(
        'plugin::users-permissions.user',
        id,
        {
          data: {
            wishlist: wishlist
          },
          populate: ['wishlist']
        }
      );
      ctx.body = sanitizeOutput(updatedUser);
    }
  };

  return plugin;
};
