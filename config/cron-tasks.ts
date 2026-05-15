export default {
  /**
   * Cron job to prevent server and database idling.
   * Runs every 10 minutes.
   */
  '*/10 * * * *': async ({ strapi }: { strapi: any }) => {
    try {
      // 1. Keep Database Alive
      const fileCount = await strapi.db.query('plugin::upload.file').count();
      strapi.log.info(`[Cron] Database Heartbeat: ${fileCount} files registered.`);

      // 2. Keep Server Alive (Self-Ping)
      const publicUrl = strapi.config.get('server.url');
      if (publicUrl && !publicUrl.includes('localhost')) {
        strapi.log.info(`[Cron] Pinging self: ${publicUrl}`);
        await fetch(`${publicUrl}/admin`);
        strapi.log.info('[Cron] Server Heartbeat: Success');
      }
    } catch (error: any) {
      strapi.log.error(`[Cron] Heartbeat failed: ${error.message}`);
    }
  },
};
