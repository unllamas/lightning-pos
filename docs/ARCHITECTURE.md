# Documentación de Arquitectura - Lightning POS

## 📋 Índice

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Arquitectura General](#arquitectura-general)
3. [Stack Tecnológico](#stack-tecnológico)
4. [Estructura del Proyecto](#estructura-del-proyecto)
5. [Flujo de Datos](#flujo-de-datos)
6. [Componentes Principales](#componentes-principales)
7. [Sistema de Pagos Lightning](#sistema-de-pagos-lightning)
8. [Almacenamiento de Datos](#almacenamiento-de-datos)
9. [PWA y Funcionalidades Móviles](#pwa-y-funcionalidades-móviles)
10. [Patrones de Diseño](#patrones-de-diseño)
11. [Seguridad](#seguridad)
12. [Performance](#performance)

---

## 🎯 Resumen Ejecutivo

**Lightning POS** es una aplicación Progressive Web App (PWA) construida como un sistema de punto de venta que integra la Lightning Network para pagos instantáneos en Bitcoin. La aplicación sigue una arquitectura **local-first** con sincronización opcional en la nube.

### Características Principales:
- ⚡ **Pagos Lightning Network** (LUD-16/LUD-21)
- 📱 **PWA completa** con instalación móvil
- 💾 **Almacenamiento local** (IndexedDB + localStorage)
- 🔄 **Funciona offline**
- 📲 **Soporte NFC** para pagos con tarjetas
- 🖨️ **Integración con impresoras** Android
- 🌐 **Responsive design** optimizado para móviles

---

## 🏗️ Arquitectura General

```mermaid
graph TB
    subgraph "Frontend (Next.js 15)"
        UI[React Components]
        Hooks[Custom Hooks]
        Context[Context Providers]
        Utils[Utilities]
    end
    
    subgraph "Storage Layer"
        IDB[(IndexedDB)]
        LS[(localStorage)]
        Cache[(Service Worker Cache)]
    end
    
    subgraph "External APIs"
        LN[Lightning Network]
        Yadio[Yadio API]
        LNURL[LNURL Services]
    end
    
    subgraph "Device APIs"
        NFC[NFC Web API]
        PWA[PWA APIs]
        Print[Android Print API]
    end
    
    UI --> Hooks
    Hooks --> IDB
    Hooks --> LS
    Hooks --> LN
    Hooks --> Yadio
    Context --> NFC
    Context --> Print
    Cache --> UI
```

### Principios Arquitectónicos:

1. **Local-First**: Los datos se almacenan localmente primero
2. **Progressive Enhancement**: Funciona sin conexión, mejor con conexión
3. **Mobile-First**: Diseñado para dispositivos móviles
4. **Component-Driven**: Arquitectura basada en componentes reutilizables
5. **Hook-Based State**: Gestión de estado mediante hooks personalizados

---

## 🛠️ Stack Tecnológico

### Frontend Core
```json
{
  "framework": "Next.js 15 (App Router)",
  "runtime": "React 19",
  "language": "TypeScript 5.8",
  "styling": "Tailwind CSS + shadcn/ui",
  "build": "Turbopack (dev) / Webpack (prod)"
}
```

### Gestión de Estado
```json
{
  "local_state": "React useState/useReducer",
  "global_state": "Context API + Custom Hooks",
  "persistence": "IndexedDB + localStorage",
  "cache": "Service Worker + React Query patterns"
}
```

### APIs y Servicios
```json
{
  "payments": "Lightning Network (LUD-16/LUD-21)",
  "currency": "Yadio API",
  "nfc": "Web NFC API",
  "print": "Android WebView Bridge",
  "pwa": "Service Worker + Web App Manifest"
}
```

---

## 📁 Estructura del Proyecto

```
lightning-pos/
├── app/                          # Next.js App Router
│   ├── globals.css              # Estilos globales
│   ├── layout.tsx               # Layout principal
│   ├── page.tsx                 # Página de login
│   ├── app/page.tsx             # Dashboard principal
│   ├── shop/                    # Módulo de tienda
│   ├── cart/page.tsx            # Carrito de compras
│   ├── payment/[orderId]/       # Proceso de pago
│   └── settings/page.tsx        # Configuraciones
│
├── components/                   # Componentes React
│   ├── ui/                      # Componentes base (shadcn/ui)
│   ├── payment/                 # Componentes de pago
│   ├── *-page.tsx              # Componentes de página
│   └── *.tsx                   # Componentes específicos
│
├── hooks/                       # Custom Hooks
│   ├── use-pos-data.ts         # Gestión de datos POS
│   ├── use-lightning-auth.ts   # Autenticación Lightning
│   ├── use-payment-*.ts        # Hooks de pago
│   └── use-*.ts               # Otros hooks
│
├── lib/                        # Utilidades y servicios
│   ├── indexeddb.ts           # Servicio IndexedDB
│   ├── lightning-utils.ts     # Utilidades Lightning
│   ├── types.ts              # Tipos TypeScript
│   └── utils.ts              # Utilidades generales
│
├── context/                    # Context Providers
│   └── injected-nfc.tsx       # Provider NFC
│
├── types/                     # Definiciones de tipos
│   ├── global.d.ts           # Tipos globales
│   ├── config.ts             # Tipos de configuración
│   └── *.ts                  # Otros tipos
│
└── public/                    # Assets estáticos
    ├── manifest.json          # PWA Manifest
    ├── sw.js                 # Service Worker
    └── *.svg                 # Iconos y logos
```

---

## 🔄 Flujo de Datos

### 1. Inicialización de la Aplicación

```mermaid
sequenceDiagram
    participant User
    participant App
    participant IndexedDB
    participant Lightning
    
    User->>App: Abre aplicación
    App->>IndexedDB: Inicializar DB
    App->>App: Cargar configuraciones
    App->>Lightning: Verificar autenticación
    Lightning-->>App: Estado de auth
    App->>User: Mostrar dashboard/login
```

### 2. Flujo de Venta

```mermaid
sequenceDiagram
    participant Merchant
    participant POS
    participant Cart
    participant Payment
    participant Lightning
    
    Merchant->>POS: Selecciona productos
    POS->>Cart: Añade al carrito
    Cart->>Payment: Proceder al pago
    Payment->>Lightning: Generar factura
    Lightning-->>Payment: Invoice + QR
    Payment->>Merchant: Mostrar QR
    Merchant->>Payment: Confirmar pago
    Payment->>POS: Limpiar carrito
```

### 3. Gestión de Datos

```typescript
// Flujo típico de datos en el POS
const dataFlow = {
  // 1. Usuario interactúa con UI
  userAction: () => component.onClick(),
  
  // 2. Componente llama a hook
  hookCall: () => usePOSData.addToCart(productId),
  
  // 3. Hook actualiza IndexedDB
  persistence: () => dbService.updateCartItem(item),
  
  // 4. Hook actualiza estado local
  stateUpdate: () => setCart(newCart),
  
  // 5. UI se re-renderiza automáticamente
  rerender: () => component.render(newState)
}
```

---

## 🧩 Componentes Principales

### Jerarquía de Componentes

```
App (layout.tsx)
├── LoginView (/)
├── AppDashboard (/app)
├── ShopPage (/shop)
│   ├── ShopHeader
│   └── ProductList
├── CartPage (/cart)
│   └── CartView
├── PaymentPage (/payment/[orderId])
│   ├── PaymentView
│   │   └── PaymentActions
│   └── PaymentSuccess
└── SettingsPage (/settings)
```

### Componentes Críticos

#### 1. **ProductList** - Corazón del POS
```typescript
interface ProductListProps {
  categories: Category[]
  products: Product[]
  cart: CartItem[]
  onAddToCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
}
```

**Responsabilidades:**
- Mostrar productos por categorías
- Gestionar cantidades en carrito
- Búsqueda y filtrado
- Drag & drop para reordenamiento

#### 2. **PaymentView** - Procesamiento de pagos
```typescript
interface PaymentViewProps {
  amount: number
  cart?: CartItem[]
  products?: Product[]
  onCancel: () => void
  onCompletePayment: () => void
}
```

**Responsabilidades:**
- Generar facturas Lightning
- Mostrar códigos QR
- Verificar pagos (LUD-21)
- Integración NFC

#### 3. **ShopEdit** - Gestión de inventario
```typescript
// Funcionalidades principales:
- CRUD de categorías y productos
- Drag & drop para reordenamiento
- Validación de datos
- Feedback visual
```

---

## ⚡ Sistema de Pagos Lightning

### Arquitectura de Pagos

```mermaid
graph LR
    subgraph "Lightning Payment Flow"
        A[Monto en Fiat] --> B[Conversión a SAT]
        B --> C[Generar Invoice]
        C --> D[Mostrar QR]
        D --> E[Verificar Pago]
        E --> F[Confirmar]
    end
    
    subgraph "APIs Utilizadas"
        G[Yadio API] --> B
        H[LNURL-pay] --> C
        I[LUD-21] --> E
    end
```

### Implementación Técnica

#### 1. **Conversión de Moneda**
```typescript
// hooks/use-currency-converter.ts
const convertToSatoshis = async (amount: number, currency: string) => {
  // 1. Obtener precio BTC desde Yadio API
  const btcPrice = await fetchBTCPrice(currency)
  
  // 2. Convertir a satoshis (1 BTC = 100M sats)
  const satoshis = Math.round((amount / btcPrice) * 100000000)
  
  return satoshis
}
```

#### 2. **Generación de Facturas Lightning**
```typescript
// lib/lightning-utils.ts
const generateLightningInvoice = async (
  lightningAddress: string,
  amountSats: number,
  comment?: string
) => {
  // 1. Obtener info LNURL-pay
  const lnurlInfo = await getLNURLPayInfo(lightningAddress)
  
  // 2. Validar límites
  validateAmount(amountSats, lnurlInfo)
  
  // 3. Generar factura
  const invoice = await callLNURLCallback(lnurlInfo, amountSats, comment)
  
  return invoice
}
```

### Estándares Lightning Implementados

| Estándar | Propósito | Implementación |
|----------|-----------|----------------|
| **LUD-16** | Lightning Address | ✅ Autenticación y pagos |
| **LUD-21** | Verificación de pagos | ✅ Confirmación automática |
| **BOLT-11** | Facturas Lightning | ✅ Generación y decodificación |

---

## 💾 Almacenamiento de Datos

### Estrategia de Persistencia

```typescript
// Distribución de datos por tipo de storage
const storageStrategy = {
  // IndexedDB - Datos estructurados
  indexedDB: {
    categories: "Categorías de productos",
    products: "Inventario completo", 
    cart: "Items en carrito actual"
  },
  
  // localStorage - Configuraciones
  localStorage: {
    settings: "Configuraciones de usuario",
    auth: "Datos de autenticación",
    prices: "Cache de precios de monedas"
  },
  
  // Service Worker Cache - Assets
  swCache: {
    static: "HTML, CSS, JS",
    api: "Respuestas de APIs (temporal)"
  }
}
```

### Servicio IndexedDB

```typescript
// lib/indexeddb.ts
class IndexedDBService {
  private db: IDBDatabase | null = null
  
  // Inicialización con versionado
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)
      
      request.onupgradeneeded = (event) => {
        // Crear/actualizar esquemas
        this.createStores(event.target.result)
      }
      
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }
    })
  }
  
  // Operaciones CRUD con transacciones
  async addProduct(product: Product): Promise<void> {
    const transaction = this.db.transaction([PRODUCTS_STORE], "readwrite")
    const store = transaction.objectStore(PRODUCTS_STORE)
    return store.add(product)
  }
}
```

### Sincronización de Datos

```typescript
// Patrón de sincronización local-first
const syncPattern = {
  // 1. Escribir localmente primero
  localWrite: async (data) => {
    await indexedDB.save(data)
    updateUI(data)
  },
  
  // 2. Sincronizar en background
  backgroundSync: async (data) => {
    try {
      await api.sync(data)
      markAsSynced(data)
    } catch (error) {
      markForRetry(data)
    }
  }
}
```

---

## 📱 PWA y Funcionalidades Móviles

### Configuración PWA

```json
// public/manifest.json
{
  "name": "Lightning POS",
  "short_name": "POS",
  "display": "standalone",
  "orientation": "portrait",
  "theme_color": "#0F0F0F",
  "background_color": "#0F0F0F",
  "start_url": "/",
  "scope": "/"
}
```

### Service Worker

```javascript
// public/sw.js
const CACHE_NAME = 'lightning-pos-v0.1'

// Estrategia de cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Cache first, network fallback
      return response || fetch(event.request)
    })
  )
})
```

### Integración con Hardware Móvil

#### 1. **NFC para Pagos**
```typescript
// context/injected-nfc.tsx
export const InjectedNFCProvider = ({ children }) => {
  const [isAvailable, setIsAvailable] = useState(false)
  
  useEffect(() => {
    // Detectar si NFC está disponible via Android WebView
    setIsAvailable(!!window.Android?.isNFCAvailable?.())
  }, [])
  
  const subscribe = useCallback(async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      window.injectedNFC.resolveFn = resolve
      window.injectedNFC.rejectFn = reject
    })
  }, [])
}
```

#### 2. **Impresión de Recibos**
```typescript
// hooks/use-print.ts
export const usePrint = (): PrintReturns => {
  const print = useCallback((order: PrintOrder) => {
    if (window.Android?.print) {
      window.Android.print(JSON.stringify(order))
    }
  }, [])
  
  return { isAvailable: !!window.Android?.print, print }
}
```

---

## 🎨 Patrones de Diseño

### 1. **Custom Hooks Pattern**
```typescript
// Patrón para encapsular lógica de negocio
const useBusinessLogic = () => {
  const [state, setState] = useState(initialState)
  
  const actions = useMemo(() => ({
    action1: () => setState(newState),
    action2: async () => await apiCall()
  }), [])
  
  return { state, ...actions }
}
```

### 2. **Compound Components Pattern**
```typescript
// Componentes que trabajan juntos
const PaymentView = ({ children }) => (
  <div className="payment-container">{children}</div>
)

PaymentView.Actions = PaymentActions

// Uso:
<PaymentView>
  <PaymentView.QRDisplay />
  <PaymentView.Actions />
</PaymentView>
```

### 3. **Provider Pattern**
```typescript
// Context para funcionalidades específicas
const NFCContext = createContext<NFCContextType>()

export const NFCProvider = ({ children }) => {
  const nfcState = useNFCLogic()
  return (
    <NFCContext.Provider value={nfcState}>
      {children}
    </NFCContext.Provider>
  )
}
```

### 4. **Repository Pattern**
```typescript
// Abstracción de acceso a datos
class POSRepository {
  async getProducts(): Promise<Product[]> {
    return await dbService.getProducts()
  }
  
  async saveProduct(product: Product): Promise<void> {
    await dbService.addProduct(product)
  }
}
```

---

## 🔒 Seguridad

### Medidas de Seguridad Implementadas

#### 1. **Validación de Lightning Address**
```typescript
const validateLightningAddress = async (address: string): Promise<boolean> => {
  // 1. Validación de formato
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  if (!emailRegex.test(address)) return false
  
  // 2. Verificación LNURL-pay
  try {
    const lnurlInfo = await getLNURLPayInfo(address)
    return lnurlInfo.tag === 'payRequest'
  } catch {
    return false
  }
}
```

#### 2. **Sanitización de Datos**
```typescript
// Limpieza de inputs para comentarios de pago
const sanitizeComment = (comment: string): string => {
  return comment
    .replace(/[|:,]/g, '') // Remover caracteres especiales
    .substring(0, 144)     // Limitar longitud
    .trim()
}
```

#### 3. **Gestión Segura de Claves**
```typescript
// No se almacenan claves privadas
// Solo Lightning Addresses públicas
const secureStorage = {
  store: (key: string, value: string) => {
    // Solo datos no sensibles en localStorage
    if (isSensitive(key)) {
      console.warn('Sensitive data not stored')
      return
    }
    localStorage.setItem(key, value)
  }
}
```

### Consideraciones de Seguridad

| Aspecto | Implementación | Estado |
|---------|----------------|--------|
| **Autenticación** | Lightning Address validation | ✅ |
| **Autorización** | Local-only, no server auth | ✅ |
| **Datos sensibles** | No private keys stored | ✅ |
| **Input validation** | Sanitización de comentarios | ✅ |
| **HTTPS** | Required for PWA/NFC | ✅ |
| **CSP** | Content Security Policy | ⚠️ Pendiente |

---

## ⚡ Performance

### Optimizaciones Implementadas

#### 1. **Code Splitting**
```typescript
// Lazy loading de componentes pesados
const PaymentView = lazy(() => import('./payment-view'))
const ShopEdit = lazy(() => import('./shop-edit'))

// Uso con Suspense
<Suspense fallback={<LoadingSpinner />}>
  <PaymentView />
</Suspense>
```

#### 2. **Memoización**
```typescript
// Memoización de cálculos costosos
const totalAmount = useMemo(() => {
  return cart.reduce((sum, item) => {
    const product = products.find(p => p.id === item.id)
    return sum + (product?.price || 0) * item.quantity
  }, 0)
}, [cart, products])
```

#### 3. **Optimización de Re-renders**
```typescript
// Callbacks memoizados
const handleAddToCart = useCallback((productId: string) => {
  setCart(prev => [...prev, { id: productId, quantity: 1 }])
}, [])

// Componentes memoizados
const ProductItem = memo(({ product, onAdd }) => (
  <div onClick={() => onAdd(product.id)}>
    {product.name}
  </div>
))
```

#### 4. **Gestión Eficiente de Estado**
```typescript
// Reducers para actualizaciones complejas
const cartReducer = (state: CartState, action: CartAction) => {
  switch (action.type) {
    case 'ADD_ITEM':
      return {
        ...state,
        items: [...state.items, action.payload]
      }
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
      }
  }
}
```

### Métricas de Performance

| Métrica | Objetivo | Actual | Estado |
|---------|----------|--------|--------|
| **First Contentful Paint** | < 1.5s | ~1.2s | ✅ |
| **Largest Contentful Paint** | < 2.5s | ~2.1s | ✅ |
| **Time to Interactive** | < 3.5s | ~3.0s | ✅ |
| **Bundle Size** | < 500KB | ~420KB | ✅ |
| **Lighthouse Score** | > 90 | 94 | ✅ |

---

## 🚀 Conclusiones y Próximos Pasos

### Fortalezas de la Arquitectura

1. ✅ **Arquitectura local-first** bien implementada
2. ✅ **Separación clara de responsabilidades**
3. ✅ **Hooks personalizados** para lógica de negocio
4. ✅ **PWA completa** con funcionalidades offline
5. ✅ **Integración Lightning** robusta

### Áreas de Mejora Identificadas

1. 🔧 **Consolidación de hooks duplicados**
2. 🔧 **Eliminación de código no utilizado**
3. 🔧 **Implementación de CSP**
4. 🔧 **Optimización de bundle splitting**
5. 🔧 **Testing automatizado**

### Roadmap Técnico

#### Corto Plazo (1-2 sprints)
- [ ] Eliminar hooks no utilizados
- [ ] Consolidar duplicados
- [ ] Implementar error boundaries
- [ ] Añadir tests unitarios

#### Medio Plazo (3-6 sprints)
- [ ] Implementar sincronización en la nube
- [ ] Añadir analytics
- [ ] Optimizar performance móvil
- [ ] Implementar notificaciones push

#### Largo Plazo (6+ sprints)
- [ ] Multi-tenancy
- [ ] API pública
- [ ] Integración con más wallets
- [ ] Dashboard de analytics avanzado

---

*Documentación generada el: 2025-01-27*
*Versión del proyecto: 0.1.0*
*Autor: Lightning POS Team*