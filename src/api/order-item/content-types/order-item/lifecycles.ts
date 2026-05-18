export default {
  async afterCreate(event) {
    const { result } = event;

    // Fetch the order-item with product and order populated
    const orderItem = await strapi.documents('api::order-item.order-item').findOne({
      documentId: result.documentId,
      populate: ['product', 'order']
    });

    if (orderItem && orderItem.product && orderItem.quantity) {
      const orderStatus = orderItem.order?.orderStatus || 'Processing';
      const isActive = ['Processing', 'Confirmed', 'Shipped', 'Delivered'].includes(orderStatus);

      if (isActive) {
        const currentQty = orderItem.product.quantity || 0;
        const newQty = Math.max(0, currentQty - orderItem.quantity);

        await strapi.documents('api::product.product').update({
          documentId: orderItem.product.documentId,
          data: {
            quantity: newQty
          }
        });

        console.log(`[INVENTORY] Stock REDUCED for product "${orderItem.product.name}" on item creation: ${currentQty} -> ${newQty}`);
      }
    }
  },

  async beforeDelete(event) {
    const { params } = event;
    const { where } = params;

    // Fetch the order-item before deletion to get product and order details
    const orderItem = await strapi.documents('api::order-item.order-item').findOne({
      documentId: where.documentId || where.id,
      populate: ['product', 'order']
    });

    if (orderItem && orderItem.product && orderItem.quantity) {
      const orderStatus = orderItem.order?.orderStatus || 'Processing';
      const isActive = ['Processing', 'Confirmed', 'Shipped', 'Delivered'].includes(orderStatus);

      if (isActive) {
        const currentQty = orderItem.product.quantity || 0;
        const newQty = currentQty + orderItem.quantity;

        await strapi.documents('api::product.product').update({
          documentId: orderItem.product.documentId,
          data: {
            quantity: newQty
          }
        });

        console.log(`[INVENTORY] Stock RESTORED for product "${orderItem.product.name}" on item deletion: ${currentQty} -> ${newQty}`);
      }
    }
  }
};
