export default {
  async afterUpdate(event) {
    const { result, params } = event;
    const { data, previousData } = params;

    if (!data || !previousData || !data.orderStatus || !previousData.orderStatus) return;

    const activeStatuses = ['Processing', 'Confirmed', 'Shipped', 'Delivered'];
    const inactiveStatuses = ['Cancelled', 'Returned'];

    const wasActive = activeStatuses.includes(previousData.orderStatus);
    const isActiveNow = activeStatuses.includes(data.orderStatus);

    const wasInactive = inactiveStatuses.includes(previousData.orderStatus);
    const isInactiveNow = inactiveStatuses.includes(data.orderStatus);

    let stockAction: 'reduce' | 'restore' | null = null;

    if (wasActive && isInactiveNow) {
      stockAction = 'restore';
    } else if (wasInactive && isActiveNow) {
      stockAction = 'reduce';
    }

    if (stockAction) {
      // Fetch order with items and products using db query
      const order = await strapi.db.query('api::order.order').findOne({
        where: { id: result.id },
        populate: {
          order_items: {
            populate: ['product']
          }
        }
      });

      if (order && order.order_items) {
        for (const item of order.order_items) {
          if (item.product && item.quantity) {
            const currentQuantity = item.product.quantity || 0;
            const newQuantity = stockAction === 'reduce' 
              ? Math.max(0, currentQuantity - item.quantity) 
              : currentQuantity + item.quantity;

            // Update both draft and published product rows simultaneously using db query
            await strapi.db.query('api::product.product').updateMany({
              where: { documentId: item.product.documentId },
              data: {
                quantity: newQuantity
              }
            });
            
            console.log(`[INVENTORY] Order transition (${previousData.orderStatus} -> ${data.orderStatus}): Stock ${stockAction === 'reduce' ? 'REDUCED' : 'RESTORED'} for product "${item.product.name}": ${currentQuantity} -> ${newQuantity}`);
          }
        }
      }
    }
  },
};