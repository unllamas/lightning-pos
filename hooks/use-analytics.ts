'use client'

import { useCallback, useEffect, useRef } from 'react'
import { db } from '@/lib/instantdb'
import { tx, id } from '@instantdb/react'
import type {
  CategoryEvent,
  ProductEvent,
  CartEvent,
  ShopSale,
  PaydeskSale,
  SettingsEvent,
  AuthEvent,
  NavigationEvent,
  ErrorEvent,
  PerformanceEvent,
  UserSession
} from '@/lib/instantdb'

// Generar ID de sesión único
const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Detectar tipo de dispositivo
const getDeviceType = (): 'mobile' | 'desktop' | 'tablet' => {
  if (typeof window === 'undefined') return 'desktop'
  
  const userAgent = navigator.userAgent.toLowerCase()
  if (/tablet|ipad|playbook|silk/.test(userAgent)) return 'tablet'
  if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/.test(userAgent)) return 'mobile'
  return 'desktop'
}

// Detectar navegador
const getBrowser = (): string => {
  if (typeof window === 'undefined') return 'unknown'
  
  const userAgent = navigator.userAgent
  if (userAgent.includes('Chrome')) return 'Chrome'
  if (userAgent.includes('Firefox')) return 'Firefox'
  if (userAgent.includes('Safari')) return 'Safari'
  if (userAgent.includes('Edge')) return 'Edge'
  return 'Other'
}

// Detectar si es PWA
const isPWA = (): boolean => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(display-mode: standalone)').matches || 
         (window.navigator as any).standalone === true
}

export function useAnalytics() {
  const sessionId = useRef<string>(generateSessionId())
  const sessionStartTime = useRef<number>(Date.now())
  const pageViews = useRef<number>(0)
  const actionsCount = useRef<number>(0)

  // Función base para crear eventos
  const createBaseEvent = useCallback(() => ({
    timestamp: Date.now(),
    session_id: sessionId.current,
    user_agent: typeof window !== 'undefined' ? navigator.userAgent : undefined
  }), [])

  // Inicializar sesión
  useEffect(() => {
    const initSession = async () => {
      try {
        const sessionData: UserSession = {
          id: id(),
          session_id: sessionId.current,
          start_time: sessionStartTime.current,
          page_views: 0,
          actions_count: 0,
          device_type: getDeviceType(),
          browser: getBrowser(),
          is_pwa: isPWA(),
          user_agent: typeof window !== 'undefined' ? navigator.userAgent : undefined
        }

        await db.transact([
          tx.user_sessions[sessionData.id].update(sessionData)
        ])
      } catch (error) {
        console.error('Error initializing analytics session:', error)
      }
    }

    initSession()

    // Cleanup al cerrar la sesión
    const handleBeforeUnload = async () => {
      try {
        await db.transact([
          tx.user_sessions[sessionId.current].update({
            end_time: Date.now(),
            page_views: pageViews.current,
            actions_count: actionsCount.current
          })
        ])
      } catch (error) {
        console.error('Error ending analytics session:', error)
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  // Eventos de categorías
  const trackCategoryEvent = useCallback(async (
    eventType: CategoryEvent['event_type'],
    categoryId: string,
    categoryName: string,
    oldValues?: any,
    newValues?: any
  ) => {
    try {
      actionsCount.current++
      
      const event: CategoryEvent = {
        id: id(),
        event_type: eventType,
        category_id: categoryId,
        category_name: categoryName,
        old_values: oldValues,
        new_values: newValues,
        ...createBaseEvent()
      }

      await db.transact([
        tx.category_events[event.id].update(event)
      ])
    } catch (error) {
      console.error('Error tracking category event:', error)
    }
  }, [createBaseEvent])

  // Eventos de productos
  const trackProductEvent = useCallback(async (
    eventType: ProductEvent['event_type'],
    productId: string,
    productName: string,
    categoryId: string,
    price?: number,
    oldValues?: any,
    newValues?: any
  ) => {
    try {
      actionsCount.current++
      
      const event: ProductEvent = {
        id: id(),
        event_type: eventType,
        product_id: productId,
        product_name: productName,
        category_id: categoryId,
        price,
        old_values: oldValues,
        new_values: newValues,
        ...createBaseEvent()
      }

      await db.transact([
        tx.product_events[event.id].update(event)
      ])
    } catch (error) {
      console.error('Error tracking product event:', error)
    }
  }, [createBaseEvent])

  // Eventos de carrito
  const trackCartEvent = useCallback(async (
    eventType: CartEvent['event_type'],
    productId: string,
    productName: string,
    quantity?: number,
    price?: number
  ) => {
    try {
      actionsCount.current++
      
      const event: CartEvent = {
        id: id(),
        event_type: eventType,
        product_id: productId,
        product_name: productName,
        quantity,
        price,
        ...createBaseEvent()
      }

      await db.transact([
        tx.cart_events[event.id].update(event)
      ])
    } catch (error) {
      console.error('Error tracking cart event:', error)
    }
  }, [createBaseEvent])

  // Ventas de la tienda
  const trackShopSale = useCallback(async (
    saleId: string,
    items: any[],
    subtotal: number,
    total: number,
    currency: string,
    paymentMethod: string,
    lightningAddress?: string,
    operatorLightningAddress?: string
  ) => {
    try {
      actionsCount.current++
      
      const sale: ShopSale = {
        id: id(),
        sale_id: saleId,
        items,
        subtotal,
        total,
        currency,
        payment_method: paymentMethod,
        lightning_address: lightningAddress,
        operator_lightning_address: operatorLightningAddress,
        ...createBaseEvent()
      }

      await db.transact([
        tx.shop_sales[sale.id].update(sale)
      ])
    } catch (error) {
      console.error('Error tracking shop sale:', error)
    }
  }, [createBaseEvent])

  // Ventas del paydesk
  const trackPaydeskSale = useCallback(async (
    saleId: string,
    amount: number,
    currency: string,
    paymentMethod: string,
    amountSats?: number,
    lightningAddress?: string,
    operatorLightningAddress?: string
  ) => {
    try {
      actionsCount.current++
      
      const sale: PaydeskSale = {
        id: id(),
        sale_id: saleId,
        amount,
        currency,
        amount_sats: amountSats,
        payment_method: paymentMethod,
        lightning_address: lightningAddress,
        operator_lightning_address: operatorLightningAddress,
        ...createBaseEvent()
      }

      await db.transact([
        tx.paydesk_sales[sale.id].update(sale)
      ])
    } catch (error) {
      console.error('Error tracking paydesk sale:', error)
    }
  }, [createBaseEvent])

  // Eventos de configuración
  const trackSettingsEvent = useCallback(async (
    eventType: SettingsEvent['event_type'],
    settingKey: string,
    newValue: string,
    oldValue?: string
  ) => {
    try {
      actionsCount.current++
      
      const event: SettingsEvent = {
        id: id(),
        event_type: eventType,
        setting_key: settingKey,
        old_value: oldValue,
        new_value: newValue,
        ...createBaseEvent()
      }

      await db.transact([
        tx.settings_events[event.id].update(event)
      ])
    } catch (error) {
      console.error('Error tracking settings event:', error)
    }
  }, [createBaseEvent])

  // Eventos de autenticación
  const trackAuthEvent = useCallback(async (
    eventType: AuthEvent['event_type'],
    success: boolean,
    lightningAddress?: string,
    errorMessage?: string
  ) => {
    try {
      actionsCount.current++
      
      const event: AuthEvent = {
        id: id(),
        event_type: eventType,
        lightning_address: lightningAddress,
        success,
        error_message: errorMessage,
        ...createBaseEvent()
      }

      await db.transact([
        tx.auth_events[event.id].update(event)
      ])
    } catch (error) {
      console.error('Error tracking auth event:', error)
    }
  }, [createBaseEvent])

  // Eventos de navegación
  const trackNavigationEvent = useCallback(async (
    eventType: NavigationEvent['event_type'],
    page: string,
    component?: string,
    action?: string
  ) => {
    try {
      if (eventType === 'page_view') {
        pageViews.current++
      } else {
        actionsCount.current++
      }
      
      const event: NavigationEvent = {
        id: id(),
        event_type: eventType,
        page,
        component,
        action,
        ...createBaseEvent()
      }

      await db.transact([
        tx.navigation_events[event.id].update(event)
      ])
    } catch (error) {
      console.error('Error tracking navigation event:', error)
    }
  }, [createBaseEvent])

  // Eventos de errores
  const trackErrorEvent = useCallback(async (
    errorType: string,
    errorMessage: string,
    stackTrace?: string,
    component?: string,
    userAction?: string
  ) => {
    try {
      const event: ErrorEvent = {
        id: id(),
        error_type: errorType,
        error_message: errorMessage,
        stack_trace: stackTrace,
        component,
        user_action: userAction,
        ...createBaseEvent()
      }

      await db.transact([
        tx.error_events[event.id].update(event)
      ])
    } catch (error) {
      console.error('Error tracking error event:', error)
    }
  }, [createBaseEvent])

  // Eventos de performance
  const trackPerformanceEvent = useCallback(async (
    metricType: PerformanceEvent['metric_type'],
    duration: number,
    success: boolean,
    page?: string,
    operation?: string
  ) => {
    try {
      const event: PerformanceEvent = {
        id: id(),
        metric_type: metricType,
        duration,
        page,
        operation,
        success,
        ...createBaseEvent()
      }

      await db.transact([
        tx.performance_events[event.id].update(event)
      ])
    } catch (error) {
      console.error('Error tracking performance event:', error)
    }
  }, [createBaseEvent])

  // Helper para trackear tiempo de operaciones
  const trackOperation = useCallback(<T>(
    operation: () => Promise<T>,
    metricType: PerformanceEvent['metric_type'],
    operationName?: string,
    page?: string
  ): Promise<T> => {
    const startTime = performance.now()
    
    return operation()
      .then((result) => {
        const duration = performance.now() - startTime
        trackPerformanceEvent(metricType, duration, true, page, operationName)
        return result
      })
      .catch((error) => {
        const duration = performance.now() - startTime
        trackPerformanceEvent(metricType, duration, false, page, operationName)
        throw error
      })
  }, [trackPerformanceEvent])

  return {
    // Eventos específicos
    trackCategoryEvent,
    trackProductEvent,
    trackCartEvent,
    trackShopSale,
    trackPaydeskSale,
    trackSettingsEvent,
    trackAuthEvent,
    trackNavigationEvent,
    trackErrorEvent,
    trackPerformanceEvent,
    
    // Helpers
    trackOperation,
    
    // Información de sesión
    sessionId: sessionId.current,
    getSessionStats: () => ({
      pageViews: pageViews.current,
      actionsCount: actionsCount.current,
      sessionDuration: Date.now() - sessionStartTime.current
    })
  }
}

// Hook para trackear automáticamente page views
export function usePageTracking(pageName: string) {
  const { trackNavigationEvent } = useAnalytics()
  
  useEffect(() => {
    trackNavigationEvent('page_view', pageName)
  }, [pageName, trackNavigationEvent])
}

// Hook para trackear errores automáticamente
export function useErrorTracking() {
  const { trackErrorEvent } = useAnalytics()
  
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      trackErrorEvent(
        'javascript_error',
        event.error?.message || 'Unknown error',
        event.error?.stack,
        undefined,
        'automatic'
      )
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      trackErrorEvent(
        'unhandled_promise_rejection',
        event.reason?.message || String(event.reason),
        event.reason?.stack,
        undefined,
        'automatic'
      )
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [trackErrorEvent])
}