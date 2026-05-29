import midtransClient from 'midtrans-client';
import { createHash } from 'crypto';
import { config } from '../../config';

const snap = new midtransClient.Snap({
  isProduction: config.midtrans.isProduction,
  serverKey: config.midtrans.serverKey,
  clientKey: config.midtrans.clientKey,
});

export interface CreateTransactionParams {
  orderId: string;
  grossAmount: number;
  customerName: string;
  customerEmail: string;
  itemName: string;
}

export const midtransService = {
  async createTransaction(params: CreateTransactionParams): Promise<string> {
    const result = (await snap.createTransaction({
      transaction_details: {
        order_id: params.orderId,
        gross_amount: params.grossAmount,
      },
      customer_details: {
        first_name: params.customerName,
        email: params.customerEmail,
      },
      item_details: [
        {
          id: params.orderId,
          name: params.itemName,
          price: params.grossAmount,
          quantity: 1,
        },
      ],
    })) as { token: string };
    return result.token;
  },

  // Verify webhook signature: sha512(order_id + status_code + gross_amount + serverKey)
  verifySignature(
    orderId: string,
    statusCode: string,
    grossAmount: string,
    signatureKey: string,
  ): boolean {
    const expected = createHash('sha512')
      .update(orderId + statusCode + grossAmount + config.midtrans.serverKey)
      .digest('hex');
    return expected === signatureKey;
  },
};
