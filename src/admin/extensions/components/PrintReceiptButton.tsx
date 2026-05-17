import React from 'react';
import { Button } from '@strapi/design-system';
import { FilePdf } from '@strapi/icons';
import { useLocation } from 'react-router-dom';

const PrintReceiptButton = () => {
  const location = useLocation();
  const isOrder = location.pathname.includes('api::order.order');
  
  if (!isOrder) return null;

  const handlePrint = () => {
    const parts = location.pathname.split('/');
    const docId = parts[parts.length - 1];
    if (docId && docId !== 'create') {
      window.open(`/api/orders/${docId}/receipt`, '_blank');
    } else {
      alert('Please save the order first.');
    }
  };

  return (
    <Button onClick={handlePrint} variant="secondary" startIcon={<FilePdf />}>
      Print Receipt
    </Button>
  );
};

export default PrintReceiptButton;
