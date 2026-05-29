declare module 'midtrans-client' {
  interface SnapConfig {
    isProduction: boolean;
    serverKey: string;
    clientKey: string;
  }

  interface TransactionParams {
    transaction_details: { order_id: string; gross_amount: number };
    customer_details?: { first_name?: string; last_name?: string; email?: string };
    item_details?: Array<{ id: string; name: string; price: number; quantity: number }>;
  }

  interface TransactionResult {
    token: string;
    redirect_url: string;
  }

  export class Snap {
    constructor(config: SnapConfig);
    createTransaction(params: TransactionParams): Promise<TransactionResult>;
  }

  export class CoreApi {
    constructor(config: SnapConfig);
  }

  const midtransClient: { Snap: typeof Snap; CoreApi: typeof CoreApi };
  export default midtransClient;
}
