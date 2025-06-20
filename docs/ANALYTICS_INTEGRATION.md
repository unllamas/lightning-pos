# Integración de Analytics con InstantDB

## 📊 Resumen

Esta documentación describe la integración completa de analytics con InstantDB para trackear todos los eventos y métricas importantes de la aplicación Lightning POS.

## 🏗️ Arquitectura

### Schema de Datos

La integración utiliza las siguientes tablas en InstantDB:

#### 1. **category_events** - Eventos de Categorías
```typescript
{
  id: string
  event_type: 'created' | 'updated' | 'deleted' | 'reordered'
  category_id: string
  category_name: string
  old_values?: object
  new_values?: object
  timestamp: number
  session_id: string
  user_agent?: string
}
```

#### 2. **product_events** - Eventos de Productos
```typescript
{
  id: string
  event_type: 'created' | 'updated' | 'deleted' | 'reordered'
  product_id: string
  product_name: string
  category_id: string
  price?: number
  old_values?: object
  new_values?: object
  timestamp: number
  session_id: string
  user_agent?: string
}
```

#### 3. **cart_events** - Eventos de Carrito
```typescript
{
  id: string
  event_type: 'item_added' | 'item_removed' | 'quantity_updated' | 'cleared'
  product_id: string
  product_name: string
  quantity?: number
  price?: number
  timestamp: number
  session_id: string
  user_agent?: string
}
```

#### 4. **shop_sales** - Ventas de la Tienda
```typescript
{
  id: string
  sale_id: string
  items: object[] // Array de productos vendidos
  subtotal: number
  total: number
  currency: string
  payment_method: string
  lightning_address?: string
  operator_lightning_address?: string
  timestamp: number
  session_id: string
  user_agent?: string
}
```

#### 5. **paydesk_sales** - Ventas del Paydesk
```typescript
{
  id: string
  sale_id: string
  amount: number
  currency: string
  amount_sats?: number
  payment_method: string
  lightning_address?: string
  operator_lightning_address?: string
  timestamp: number
  session_id: string
  user_agent?: string
}
```

#### 6. **settings_events** - Eventos de Configuración
```typescript
{
  id: string
  event_type: 'currency_changed' | 'operator_address_updated' | 'language_changed'
  setting_key: string
  old_value?: string
  new_value: string
  timestamp: number
  session_id: string
  user_agent?: string
}
```

#### 7. **auth_events** - Eventos de Autenticación
```typescript
{
  id: string
  event_type: 'login' | 'logout' | 'validation_failed'
  lightning_address?: string
  success: boolean
  error_message?: string
  timestamp: number
  session_id: string
  user_agent?: string
}
```

#### 8. **navigation_events** - Eventos de Navegación
```typescript
{
  id: string
  event_type: 'page_view' | 'button_click' | 'modal_open' | 'modal_close'
  page: string
  component?: string
  action?: string
  timestamp: number
  session_id: string
  user_agent?: string
}
```

#### 9. **error_events** - Eventos de Errores
```typescript
{
  id: string
  error_type: string
  error_message: string
  stack_trace?: string
  component?: string
  user_action?: string
  timestamp: number
  session_id: string
  user_agent?: string
}
```

#### 10. **performance_events** - Métricas de Performance
```typescript
{
  id: string
  metric_type: 'page_load' | 'api_call' | 'db_operation'
  duration: number
  page?: string
  operation?: string
  success: boolean
  timestamp: number
  session_id: string
  user_agent?: string
}
```

#### 11. **user_sessions** - Sesiones de Usuario
```typescript
{
  id: string
  session_id: string
  lightning_address?: string
  start_time: number
  end_time?: number
  page_views: number
  actions_count: number
  device_type?: 'mobile' | 'desktop' | 'tablet'
  browser?: string
  is_pwa: boolean
  user_agent?: string
}
```

## 🚀 Configuración

### 1. Instalar InstantDB

```bash
npm install @instantdb/react
```

### 2. Configurar Variables de Entorno

```env
NEXT_PUBLIC_INSTANTDB_APP_ID=your-instantdb-app-id
```

### 3. Inicializar en el Layout Principal

```typescript
// app/layout.tsx
import { useAnalytics, usePageTracking, useErrorTracking } from '@/hooks/use-analytics'

export default function RootLayout({ children }) {
  // Inicializar tracking automático de errores
  useErrorTracking()
  
  return (
    <html>
      <body>
        {children}
      </body>
    </html>
  )
}
```

## 📈 Uso del Hook

### Importar el Hook

```typescript
import { useAnalytics, usePageTracking } from '@/hooks/use-analytics'
```

### Trackear Page Views

```typescript
function MyPage() {
  usePageTracking('shop') // Automáticamente trackea la vista de página
  
  return <div>Mi página</div>
}
```

### Trackear Eventos de Categorías

```typescript
function CategoryManager() {
  const { trackCategoryEvent } = useAnalytics()
  
  const handleCreateCategory = async (category) => {
    // Crear categoría
    await createCategory(category)
    
    // Trackear evento
    await trackCategoryEvent(
      'created',
      category.id,
      category.name,
      undefined,
      category
    )
  }
  
  const handleUpdateCategory = async (id, oldData, newData) => {
    // Actualizar categoría
    await updateCategory(id, newData)
    
    // Trackear evento
    await trackCategoryEvent(
      'updated',
      id,
      newData.name,
      oldData,
      newData
    )
  }
}
```

### Trackear Eventos de Productos

```typescript
function ProductManager() {
  const { trackProductEvent } = useAnalytics()
  
  const handleCreateProduct = async (product) => {
    await createProduct(product)
    
    await trackProductEvent(
      'created',
      product.id,
      product.name,
      product.categoryId,
      product.price,
      undefined,
      product
    )
  }
}
```

### Trackear Eventos de Carrito

```typescript
function CartManager() {
  const { trackCartEvent } = useAnalytics()
  
  const handleAddToCart = async (product) => {
    await addToCart(product.id)
    
    await trackCartEvent(
      'item_added',
      product.id,
      product.name,
      1,
      product.price
    )
  }
  
  const handleUpdateQuantity = async (productId, productName, newQuantity) => {
    await updateQuantity(productId, newQuantity)
    
    await trackCartEvent(
      'quantity_updated',
      productId,
      productName,
      newQuantity
    )
  }
}
```

### Trackear Ventas

```typescript
function SalesManager() {
  const { trackShopSale, trackPaydeskSale } = useAnalytics()
  
  // Venta desde la tienda
  const handleShopSale = async (saleData) => {
    await trackShopSale(
      saleData.saleId,
      saleData.items,
      saleData.subtotal,
      saleData.total,
      saleData.currency,
      'lightning',
      saleData.lightningAddress,
      saleData.operatorAddress
    )
  }
  
  // Venta desde paydesk
  const handlePaydeskSale = async (saleData) => {
    await trackPaydeskSale(
      saleData.saleId,
      saleData.amount,
      saleData.currency,
      'lightning',
      saleData.amountSats,
      saleData.lightningAddress,
      saleData.operatorAddress
    )
  }
}
```

### Trackear Configuraciones

```typescript
function SettingsManager() {
  const { trackSettingsEvent } = useAnalytics()
  
  const handleCurrencyChange = async (oldCurrency, newCurrency) => {
    await updateCurrency(newCurrency)
    
    await trackSettingsEvent(
      'currency_changed',
      'currency',
      newCurrency,
      oldCurrency
    )
  }
}
```

### Trackear Autenticación

```typescript
function AuthManager() {
  const { trackAuthEvent } = useAnalytics()
  
  const handleLogin = async (lightningAddress) => {
    try {
      await login(lightningAddress)
      
      await trackAuthEvent(
        'login',
        true,
        lightningAddress
      )
    } catch (error) {
      await trackAuthEvent(
        'login',
        false,
        lightningAddress,
        error.message
      )
    }
  }
}
```

### Trackear Navegación y Acciones

```typescript
function MyComponent() {
  const { trackNavigationEvent } = useAnalytics()
  
  const handleButtonClick = async () => {
    await trackNavigationEvent(
      'button_click',
      'shop',
      'ProductCard',
      'add_to_cart'
    )
  }
  
  const handleModalOpen = async () => {
    await trackNavigationEvent(
      'modal_open',
      'shop',
      'ProductModal'
    )
  }
}
```

### Trackear Performance

```typescript
function DataManager() {
  const { trackOperation } = useAnalytics()
  
  const loadProducts = async () => {
    // Automáticamente trackea el tiempo de la operación
    return await trackOperation(
      () => fetchProducts(),
      'db_operation',
      'load_products',
      'shop'
    )
  }
}
```

## 📊 Consultas de Analytics

### Obtener Datos de Ventas

```typescript
import { db } from '@/lib/instantdb'

// Ventas de la tienda por período
const { data: shopSales } = db.useQuery({
  shop_sales: {
    $: {
      where: {
        timestamp: { $gte: startDate, $lte: endDate }
      }
    }
  }
})

// Ventas del paydesk por período
const { data: paydeskSales } = db.useQuery({
  paydesk_sales: {
    $: {
      where: {
        timestamp: { $gte: startDate, $lte: endDate }
      }
    }
  }
})
```

### Obtener Productos Más Vendidos

```typescript
// Eventos de carrito para análisis de productos
const { data: cartEvents } = db.useQuery({
  cart_events: {
    $: {
      where: {
        event_type: 'item_added',
        timestamp: { $gte: startDate, $lte: endDate }
      }
    }
  }
})

// Procesar para obtener productos más vendidos
const topProducts = cartEvents?.cart_events
  ?.reduce((acc, event) => {
    acc[event.product_id] = (acc[event.product_id] || 0) + (event.quantity || 1)
    return acc
  }, {})
```

### Obtener Métricas de Sesión

```typescript
const { data: sessions } = db.useQuery({
  user_sessions: {
    $: {
      where: {
        start_time: { $gte: startDate, $lte: endDate }
      }
    }
  }
})
```

## 🔧 Integración en Componentes Existentes

### 1. Actualizar usePOSData

```typescript
// hooks/use-pos-data.ts
import { useAnalytics } from '@/hooks/use-analytics'

export function usePOSData() {
  const { trackCategoryEvent, trackProductEvent, trackCartEvent } = useAnalytics()
  
  const addCategory = useCallback(async (category: Category) => {
    try {
      await dbService.addCategory(category)
      setCategories((prev) => [...prev, category].sort((a, b) => a.order - b.order))
      
      // Trackear evento
      await trackCategoryEvent('created', category.id, category.name, undefined, category)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error adding category")
    }
  }, [trackCategoryEvent])
  
  // ... resto de métodos con tracking
}
```

### 2. Actualizar useSettings

```typescript
// hooks/use-settings.ts
import { useAnalytics } from '@/hooks/use-analytics'

export function useSettings() {
  const { trackSettingsEvent } = useAnalytics()
  
  const updateCurrency = useCallback((currency: AvailableCurrencies) => {
    const oldCurrency = settings.currency
    const result = updateSettings({ currency })
    
    // Trackear evento
    trackSettingsEvent('currency_changed', 'currency', currency, oldCurrency)
    
    return result
  }, [updateSettings, settings.currency, trackSettingsEvent])
}
```

### 3. Actualizar useLightningAuth

```typescript
// hooks/use-lightning-auth.ts
import { useAnalytics } from '@/hooks/use-analytics'

export function useLightningAuth() {
  const { trackAuthEvent } = useAnalytics()
  
  const login = useCallback(async (lightningAddress: string) => {
    try {
      // ... lógica de login
      
      await trackAuthEvent('login', true, lightningAddress)
      return { success: true }
    } catch (error) {
      await trackAuthEvent('login', false, lightningAddress, error.message)
      return { success: false, error: error.message }
    }
  }, [trackAuthEvent])
}
```

## 🎯 Beneficios

### 1. **Análisis de Negocio**
- Productos más vendidos
- Ingresos por período
- Patrones de compra
- Eficiencia del paydesk vs tienda

### 2. **Análisis de UX**
- Páginas más visitadas
- Flujos de navegación
- Puntos de abandono
- Errores frecuentes

### 3. **Análisis Técnico**
- Performance de operaciones
- Errores de JavaScript
- Métricas de carga
- Uso de dispositivos

### 4. **Análisis de Sesiones**
- Duración promedio de sesión
- Acciones por sesión
- Dispositivos más utilizados
- Adopción de PWA

## 🔒 Privacidad y Seguridad

- **No se almacenan datos sensibles**: Solo Lightning Addresses públicas
- **Datos anonimizados**: Session IDs únicos sin información personal
- **Cumplimiento GDPR**: Datos mínimos necesarios para analytics
- **Retención de datos**: Configurar políticas de retención en InstantDB

## 📈 Próximos Pasos

1. **Dashboard de Analytics**: Crear componentes para visualizar métricas
2. **Alertas**: Configurar alertas para errores críticos
3. **Reportes**: Generar reportes automáticos de ventas
4. **A/B Testing**: Implementar testing de funcionalidades
5. **Predicciones**: Análisis predictivo de ventas

---

*Esta integración proporciona una base sólida para entender el comportamiento de los usuarios y optimizar la aplicación basándose en datos reales.*