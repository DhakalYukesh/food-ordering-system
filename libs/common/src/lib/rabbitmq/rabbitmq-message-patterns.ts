export enum WalletMessagePatterns {
  GET_WALLET_BY_USER_ID = 'get_wallet_by_user_id',
  CREATE_WALLET = 'create_wallet',
}

export enum UserMessagePatterns {
  GET_USER = 'get_user',
  CREATE_USER = 'create_user',
  UPDATE_USER = 'update_user',
  DELETE_USER = 'delete_user',
}

export enum RestaurantMessagePatterns {
  GET_RESTAURANT = 'get_restaurant',
  CREATE_RESTAURANT = 'create_restaurant',
  UPDATE_RESTAURANT = 'update_restaurant',
  DELETE_RESTAURANT = 'delete_restaurant',
  GET_FOOD_ITEM = 'get_food_item',
}

export enum OrderMessagePatterns {
  CREATE_ORDER = 'create_order',
  GET_ORDER = 'get_order',
  UPDATE_ORDER = 'update_order',
  DELETE_ORDER = 'delete_order',
  GET_ALL_ORDERS = 'get_all_orders',
}

export enum PaymentMessagePatterns {
  PAYMENT_COMPLETED = 'payment_completed',
  PAYMENT_FAILED = 'payment_failed',
  PAYMENT_PENDING = 'payment_pending',
  PROCESS_ORDER_PAYMENT = 'process_order_payment',
}

