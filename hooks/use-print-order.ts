"use client"

import { useCallback } from "react"
import type { PrintOrder, PrintItem } from "@/types/print"
import { useSettings } from "@/hooks/use-settings"
import { useLightningAuth } from "@/hooks/use-lightning-auth"
import type { Product } from "@/lib/types"

export function usePrintOrder() {
  const { settings, getCurrencySymbol } = useSettings()
  const { lightningAddress } = useLightningAuth()

  const generatePrintOrder = useCallback(
    (
      orderId: string,
      cart: { id: string; quantity: number }[],
      products: Product[],
      finalAmount: number,
      tipAmount?: number,
    ): PrintOrder => {
      // Convertir items del carrito a items de impresión
      const printItems: PrintItem[] = cart.map((cartItem) => {
        const product = products.find((p) => p.id === cartItem.id)
        if (!product) {
          throw new Error(`Product not found: ${cartItem.id}`)
        }

        return {
          name: product.name,
          quantity: cartItem.quantity,
          price: product.price,
          total: product.price * cartItem.quantity,
        }
      })

      // Calcular subtotal
      const subtotal = printItems.reduce((sum, item) => sum + item.total, 0)

      // Crear orden de impresión
      const printOrder: PrintOrder = {
        orderId,
        timestamp: new Date().toISOString(),
        items: printItems,
        subtotal,
        tip: tipAmount,
        total: finalAmount,
        currency: settings.currency,
        currencySymbol: getCurrencySymbol(),
        paymentMethod: "lightning",
        lightningAddress: lightningAddress || undefined,
        operatorLightningAddress: settings.operatorLightningAddress || undefined,
        status: "paid",
      }

      return printOrder
    },
    [settings.currency, settings.operatorLightningAddress, getCurrencySymbol, lightningAddress],
  )

  return {
    generatePrintOrder,
  }
}
