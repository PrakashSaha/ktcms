import { errors } from '@strapi/utils';

const { ValidationError } = errors;

export default {
  async beforeCreate(event) {
    const { action, params } = event;
    const isNewDocument = !params.data?.documentId && !params?.documentId;

    // 1. Enforce max 3 items limit (User's preference)
    if (isNewDocument) {
      const count = await strapi.documents('api::adornment.adornment').count({});
      if (count >= 3) {
        throw new ValidationError(`The Adornments section can only have a maximum of 3 items. Please delete an existing item before adding a new one.`);
      }
    }

    // 2. Enforce only one large item
    if (params.data?.large === true) {
      const largeCount = await strapi.documents('api::adornment.adornment').count({
        filters: { large: true }
      });
      
      if (largeCount > 0) {
        throw new ValidationError('Only one adornment can be marked as "Large" at a time. Please uncheck "Large" on the existing item first.');
      }
    }
  },

  async beforeUpdate(event) {
    const { params } = event;
    
    // Check if large is being set to true
    if (params.data?.large === true) {
      const documentId = params.documentId || params.where?.documentId;
      
      const otherLargeCount = await strapi.documents('api::adornment.adornment').count({
        filters: { 
          large: true,
          documentId: { $ne: documentId }
        }
      });
      
      if (otherLargeCount > 0) {
        throw new ValidationError('Only one adornment can be marked as "Large" at a time. Please uncheck "Large" on the existing item first.');
      }
    }
  }
};

