import { init, tx, id } from '@instantdb/react';

// Configuración de InstantDB
const APP_ID = process.env.NEXT_PUBLIC_INSTANTDB_APP_ID || 'your-app-id';

// Schema para los diferentes tipos de eventos
export const schema = {
  // Eventos de categorías
  category_events: {
    id: 'string',
    event_type: 'string', // 'created', 'updated', 'deleted', 'reordered'
    category_id: 'string',
    category_name: 'string',
    old_values: 'object?', // Para updates
    new_values: 'object?', // Para updates
    timestamp: 'number',
    session_id: 'string',
    user_agent: 'string?',
  },

  // Eventos de productos
  product_events: {
    id: 'string',
    event_type: 'string', // 'created', 'updated', 'deleted', 'reordered'
    product_id: 'string',
    product_name: 'string',
    category_id: 'string',
    price: 'number?',
    old_values: 'object?',
    new_values: 'object?',
    timestamp: 'number',
    session_id: 'string',
    user_agent: 'string?',
  },

  // Eventos de carrito
  cart_events: {
    id: 'string',
    event_type: 'string', // 'item_added', 'item_removed', 'quantity_updated', 'cleared'
    product_id: 'string',
    product_name: 'string',
    quantity: 'number?',
    price: 'number?',
    timestamp: 'number',
    session_id: 'string',
    user_agent: 'string?',
  },

  // Eventos de ventas (Shop)
  shop_sales: {
    id: 'string',
    sale_id: 'string',
    items: 'object', // Array de items vendidos
    subtotal: 'number',
    total: 'number',
    currency: 'string',
    payment_method: 'string', // 'lightning', 'nfc'
    lightning_address: 'string?',
    operator_lightning_address: 'string?',
    timestamp: 'number',
    session_id: 'string',
    user_agent: 'string?',
  },

  // Eventos de ventas (Paydesk)
  paydesk_sales: {
    id: 'string',
    sale_id: 'string',
    amount: 'number',
    currency: 'string',
    amount_sats: 'number?',
    payment_method: 'string', // 'lightning', 'nfc'
    lightning_address: 'string?',
    operator_lightning_address: 'string?',
    timestamp: 'number',
    session_id: 'string',
    user_agent: 'string?',
  },

  // Eventos de configuración
  settings_events: {
    id: 'string',
    event_type: 'string', // 'currency_changed', 'operator_address_updated', 'language_changed'
    setting_key: 'string',
    old_value: 'string?',
    new_value: 'string',
    timestamp: 'number',
    session_id: 'string',
    user_agent: 'string?',
  },

  // Eventos de autenticación
  auth_events: {
    id: 'string',
    event_type: 'string', // 'login', 'logout', 'validation_failed'
    lightning_address: 'string?',
    success: 'boolean',
    error_message: 'string?',
    timestamp: 'number',
    session_id: 'string',
    user_agent: 'string?',
  },

  // Eventos de navegación/UI
  navigation_events: {
    id: 'string',
    event_type: 'string', // 'page_view', 'button_click', 'modal_open', 'modal_close'
    page: 'string',
    component: 'string?',
    action: 'string?',
    timestamp: 'number',
    session_id: 'string',
    user_agent: 'string?',
  },

  // Eventos de errores
  error_events: {
    id: 'string',
    error_type: 'string',
    error_message: 'string',
    stack_trace: 'string?',
    component: 'string?',
    user_action: 'string?',
    timestamp: 'number',
    session_id: 'string',
    user_agent: 'string?',
  },

  // Métricas de performance
  performance_events: {
    id: 'string',
    metric_type: 'string', // 'page_load', 'api_call', 'db_operation'
    duration: 'number',
    page: 'string?',
    operation: 'string?',
    success: 'boolean',
    timestamp: 'number',
    session_id: 'string',
    user_agent: 'string?',
  },

  // Sesiones de usuario
  user_sessions: {
    id: 'string',
    session_id: 'string',
    lightning_address: 'string?',
    start_time: 'number',
    end_time: 'number?',
    page_views: 'number',
    actions_count: 'number',
    device_type: 'string?', // 'mobile', 'desktop', 'tablet'
    browser: 'string?',
    is_pwa: 'boolean',
    user_agent: 'string?',
  },
};

// Inicializar InstantDB
export const db = init({
  appId: APP_ID,
  // schema
});

// Tipos TypeScript para los eventos
export type CategoryEvent = {
  id: string;
  event_type: 'created' | 'updated' | 'deleted' | 'reordered';
  category_id: string;
  category_name: string;
  old_values?: any;
  new_values?: any;
  timestamp: number;
  session_id: string;
  user_agent?: string;
};

export type ProductEvent = {
  id: string;
  event_type: 'created' | 'updated' | 'deleted' | 'reordered';
  product_id: string;
  product_name: string;
  category_id: string;
  price?: number;
  old_values?: any;
  new_values?: any;
  timestamp: number;
  session_id: string;
  user_agent?: string;
};

export type CartEvent = {
  id: string;
  event_type: 'item_added' | 'item_removed' | 'quantity_updated' | 'cleared';
  product_id: string;
  product_name: string;
  quantity?: number;
  price?: number;
  timestamp: number;
  session_id: string;
  user_agent?: string;
};

export type ShopSale = {
  id: string;
  sale_id: string;
  items: any[];
  subtotal: number;
  total: number;
  currency: string;
  payment_method: string;
  lightning_address?: string;
  operator_lightning_address?: string;
  timestamp: number;
  session_id: string;
  user_agent?: string;
};

export type PaydeskSale = {
  id: string;
  sale_id: string;
  amount: number;
  currency: string;
  amount_sats?: number;
  payment_method: string;
  lightning_address?: string;
  operator_lightning_address?: string;
  timestamp: number;
  session_id: string;
  user_agent?: string;
};

export type SettingsEvent = {
  id: string;
  event_type: 'currency_changed' | 'operator_address_updated' | 'language_changed';
  setting_key: string;
  old_value?: string;
  new_value: string;
  timestamp: number;
  session_id: string;
  user_agent?: string;
};

export type AuthEvent = {
  id: string;
  event_type: 'login' | 'logout' | 'validation_failed';
  lightning_address?: string;
  success: boolean;
  error_message?: string;
  timestamp: number;
  session_id: string;
  user_agent?: string;
};

export type NavigationEvent = {
  id: string;
  event_type: 'page_view' | 'button_click' | 'modal_open' | 'modal_close';
  page: string;
  component?: string;
  action?: string;
  timestamp: number;
  session_id: string;
  user_agent?: string;
};

export type ErrorEvent = {
  id: string;
  error_type: string;
  error_message: string;
  stack_trace?: string;
  component?: string;
  user_action?: string;
  timestamp: number;
  session_id: string;
  user_agent?: string;
};

export type PerformanceEvent = {
  id: string;
  metric_type: 'page_load' | 'api_call' | 'db_operation';
  duration: number;
  page?: string;
  operation?: string;
  success: boolean;
  timestamp: number;
  session_id: string;
  user_agent?: string;
};

export type UserSession = {
  id: string;
  session_id: string;
  lightning_address?: string;
  start_time: number;
  end_time?: number;
  page_views: number;
  actions_count: number;
  device_type?: 'mobile' | 'desktop' | 'tablet';
  browser?: string;
  is_pwa: boolean;
  user_agent?: string;
};
