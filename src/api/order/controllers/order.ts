import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::order.order', ({ strapi }) => ({
  async receipt(ctx) {
    const { id } = ctx.params;
    
    const order = await strapi.documents('api::order.order').findOne({
      documentId: id,
      populate: ['order_items', 'owner']
    });

    if (!order) {
      return ctx.notFound('Order not found');
    }

    const numberToWords = (num: number) => {
      const a = ['','One ','Two ','Three ','Four ', 'Five ','Six ','Seven ','Eight ','Nine ','Ten ','Eleven ','Twelve ','Thirteen ','Fourteen ','Fifteen ','Sixteen ','Seventeen ','Eighteen ','Nineteen '];
      const b = ['', '', 'Twenty','Thirty','Forty','Fifty', 'Sixty','Seventy','Eighty','Ninety'];
      if ((num = num.toString() as any).length > 9) return 'overflow';
      const n: any = ('000000000' + num).substr(-9).match(/^(\\d{2})(\\d{2})(\\d{2})(\\d{1})(\\d{2})$/);
      if (!n) return; var str = '';
      str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
      str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
      str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
      str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
      str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
      return str.trim() + ' Rupees Only';
    };

    const shippingName = (order.shippingAddress as any)?.name || (order.shippingAddress as any)?.fullName || (order.owner as any)?.username || 'Customer';
    const shippingLine = (order.shippingAddress as any)?.line || (order.shippingAddress as any)?.addressLine1 || '';
    const shippingLine2 = (order.shippingAddress as any)?.addressLine2 || '';
    const shippingCity = (order.shippingAddress as any)?.city || '';
    const shippingState = (order.shippingAddress as any)?.state || '';
    const shippingPin = (order.shippingAddress as any)?.pin || (order.shippingAddress as any)?.pincode || '';
    const orderDate = new Date(order.createdAt).toLocaleDateString('en-US');
    const orderItems = order.order_items || [];
    const totalAmount = Number(order.totalAmount || 0);

    const html =`
      <html>
        <head>
          <title>Invoice - ${order.orderId || order.documentId}</title>
          <style>
            body { font-family: Arial, sans-serif; font-size: 12px; color: #333; margin: 0; padding: 20px; }
            .invoice-box { max-width: 900px; margin: auto; padding: 30px; border: 1px solid #ddd; background: #fff; }
            .header-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
            .logo { font-size: 32px; font-weight: 900; letter-spacing: -1px; margin: 0; }
            .invoice-title { text-align: right; font-weight: bold; font-size: 14px; }
            .invoice-title-sub { font-size: 11px; font-weight: normal; }
            .digital-sign { font-size: 13px; color: #666; margin-bottom: 30px; line-height: 1.6; }
            .columns { display: flex; justify-content: space-between; margin-bottom: 30px; gap: 40px; }
            .col { flex: 1; }
            .col h3 { font-size: 14px; margin: 0 0 5px 0; border-bottom: 1px solid #ddd; padding-bottom: 3px; }
            .info-text { line-height: 1.5; margin-bottom: 15px; }
            .bold { font-weight: bold; }
            .text-right { text-align: right; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
            th, td { border: 1px solid #eee; padding: 8px; }
            th { background-color: #666; color: #fff; font-weight: normal; text-align: right; }
            th.text-left { text-align: left; }
            td { text-align: right; }
            td.text-left { text-align: left; }
            .table-footer { background-color: #666; color: #fff; font-weight: bold; }
            .table-footer td { border-color: #666; }
            .amount-words { margin-top: 20px; font-size: 12px; }
            .sign-box { margin-top: 50px; text-align: right; }
            .print-btn { display: block; margin: 20px auto; padding: 10px 20px; background: #232f3e; color: #fff; text-decoration: none; text-align: center; width: 150px; cursor: pointer; border: none; font-size: 14px; border-radius: 4px; }
            @media print { .print-btn { display: none; } .invoice-box { border: none; padding: 0; } body { padding: 0; } }
          </style>
        </head>
        <body>
          <div class="invoice-box">
            
            <div class="header-top">
              <div>
                <h1 class="logo">krafttreasure.in</h1>
              </div>
              <div class="invoice-title">
                Tax Invoice/Bill of Supply/Cash Memo<br>
                <span class="invoice-title-sub">(Original for Recipient)</span>
              </div>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px;">
              <div class="digital-sign">
                Digitally Signed by Kraft Treasure<br>
                Date: ${orderDate}<br>
                Reason: Invoice<br><br>
                <span class="bold">Order Number:</span> ${order.orderId || order.documentId}<br>
                <span class="bold">Order Date:</span> ${orderDate}
              </div>
              <div class="text-right" style="line-height: 1.5;">
                <h3 style="font-size: 14px; margin: 0 0 5px 0; border-bottom: 1px solid #ddd; padding-bottom: 3px;">Sold By:</h3>
                <div class="info-text">
                  Kraft Treasure Inc.<br>
                  Sector-A, Itanagar<br>
                  Arunachal Pradesh, 791111, India<br><br>
                  <span class="bold">PAN No:</span> ABCDE1234F<br>
                  <span class="bold">GST Registration No:</span> 12ABCDE1234F1Z5
                </div>
              </div>
            </div>

            <div class="columns">
              <div class="col">
                <h3>Billing Address:</h3>
                <div class="info-text">
                  ${shippingName}<br>
                  ${shippingLine} ${shippingLine2}<br>
                  ${shippingCity}, ${shippingState} ${shippingPin}, IN
                </div>
              </div>
              
              <div class="col text-right">
                <h3>Shipping Address:</h3>
                <div class="info-text">
                  ${shippingName}<br>
                  ${shippingLine} ${shippingLine2}<br>
                  ${shippingCity}, ${shippingState} ${shippingPin}, IN
                </div>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th class="text-left" style="width: 5%">Sl</th>
                  <th class="text-left" style="width: 35%">Description</th>
                  <th style="width: 10%">U Price</th>
                  <th style="width: 5%">Qty</th>
                  <th style="width: 10%">Net Amt</th>
                  <th style="width: 10%">Total</th>
                </tr>
              </thead>
              <tbody>
                ${orderItems.map((item: any, i: number) => {
                  const uPrice = Number(item.unitPrice || 0);
                  const qty = Number(item.quantity || 1);
                  const netAmt = uPrice * qty;
                  // Placeholder 0% tax since exact tax isn't in schema
                  const taxAmt = 0; 
                  const total = netAmt + taxAmt;
                  return `
                  <tr>
                    <td class="text-left">${i + 1}</td>
                    <td class="text-left">${item.productName || 'Product'}</td>
                    <td>₹${uPrice.toFixed(2)}</td>
                    <td>${qty}</td>
                    <td>₹${netAmt.toFixed(2)}</td>
                    <td>₹${total.toFixed(2)}</td>
                  </tr>
                  `;
                }).join('')}
                ${orderItems.length === 0 ? '<tr><td colspan="6" class="text-left">No items found</td></tr>' : ''}
                <tr class="table-footer">
                  <td colspan="5" class="text-right">Total</td>
                  <td>₹${totalAmount.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </body>
      </html>
    `;

    ctx.type = 'text/html';
    ctx.send(html);
  }
}));
