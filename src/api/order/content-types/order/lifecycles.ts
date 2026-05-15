
export default {
  async afterCreate(event) {
    // We handle initial stock reduction if the order is created as 'Confirmed' or 'Processing'
    const { result } = event;
    
    // In many cases, order_items are not populated yet in afterCreate
    // but if they are, we can process them. Otherwise, we rely on afterUpdate.
  },

  async afterUpdate(event) {
    const { result, params } = event;
    const { data, previousData } = params;

    // Check if status changed to 'Confirmed' or 'Processing' (Stock Reduction)
    const isNowConfirmed = (data.orderStatus === 'Confirmed' || data.orderStatus === 'Processing') && 
                           (previousData.orderStatus !== 'Confirmed' && previousData.orderStatus !== 'Processing');

    // Check if status changed to 'Cancelled' or 'Returned' (Stock Restoration)
    const isNowCancelled = (data.orderStatus === 'Cancelled' || data.orderStatus === 'Returned') && 
                           (previousData.orderStatus !== 'Cancelled' && previousData.orderStatus !== 'Returned');

    if (isNowConfirmed || isNowCancelled) {
      // Fetch order with items and products
      const order = await strapi.documents('api::order.order').findOne({
        documentId: result.documentId,
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
            const newQuantity = isNowConfirmed 
              ? Math.max(0, currentQuantity - item.quantity) 
              : currentQuantity + item.quantity;

            // Update product quantity
            await strapi.documents('api::product.product').update({
              documentId: item.product.documentId,
              data: {
                quantity: newQuantity
              }
            });
            
            console.log(`[INVENTORY] Product ${item.product.name} quantity updated: ${currentQuantity} -> ${newQuantity}`);
          }
        }
      }
    }
  },
};
