"use client"

import { useState, useCallback } from "react"
import { useSettings } from "@/hooks/use-settings"
import { useLightningAuth } from "@/hooks/use-lightning-auth"
import { convertToSatoshis, generateLightningInvoice, extractPaymentHash } from "@/lib/lightning-utils"
import QRCode from "qrcode"

export type Product = {
  id: string
  name: string
  price: number
}

export function usePaymentGeneration() {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null)
  const [lightningInvoice, setLightningInvoice] = useState<string | null>(null)
  const [verifyUrl, setVerifyUrl] = useState<string | null>(null)
  const [paymentHash, setPaymentHash] = useState<string | null>(null)
  const [amountInSats, setAmountInSats] = useState<number | null>(null)
  const [isGenerating, setIsGenerating] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { settings, getCurrencySymbol } = useSettings()
  const { lightningAddress, isAuthenticated } = useLightningAuth()

  const generateQRCode = async (invoice: string) => {
    try {
      const qrDataUrl = await QRCode.toDataURL(invoice, {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
        errorCorrectionLevel: "M",
      })

      setQrCodeDataUrl(qrDataUrl)
    } catch (err) {
      console.error("Error generating QR code:", err)
      throw new Error("Failed to generate QR code")
    }
  }

  const generatePayment = useCallback(
    async (amount: number, cart: { id: string; quantity: number }[] = [], products: Product[] = []) => {
      if (!isAuthenticated || !lightningAddress) {
        setError("Lightning Address not configured")
        setIsGenerating(false)
        return
      }

      try {
        setIsGenerating(true)
        setError(null)
        setQrCodeDataUrl(null)
        setVerifyUrl(null)
        setPaymentHash(null)

        // 1. Convertir monto fiat a satoshis usando Yadio
        console.log(`Converting ${amount} ${settings.currency} to satoshis...`)
        const satsAmount = await convertToSatoshis(amount, settings.currency)
        setAmountInSats(satsAmount)
        console.log(`Converted to ${satsAmount} satoshis`)

        // 2. Generar el comentario con los detalles de los productos
        let comment = `Payment for ${getCurrencySymbol()}${amount.toLocaleString()} ${settings.currency}`

        // Añadir detalles de productos si hay elementos en el carrito
        if (cart.length > 0 && products.length > 0) {
          // Formato estructurado para análisis de datos: POS|[orderId]|[item1:qty]|[item2:qty]|...
          const orderId = `order-${Date.now()}`
          const itemsList = cart
            .map((item) => {
              const product = products.find((p) => p.id === item.id)
              if (product) {
                return `${product.name.replace(/[|:,]/g, "")}:${item.quantity}`
              }
              return null
            })
            .filter(Boolean)

          comment = `POS|${orderId}|${itemsList.join("|")}|TOTAL:${getCurrencySymbol()}${amount.toLocaleString()}${settings.currency}`
        }

        // 3. Generar factura Lightning usando LUD-16/LUD-21
        console.log(`Generating Lightning invoice for ${satsAmount} sats...`)
        const invoiceData = await generateLightningInvoice(lightningAddress, satsAmount, comment)

        setLightningInvoice(invoiceData.pr)

        // 4. Configurar verificación de pago si está disponible (LUD-21)
        if (invoiceData.verify) {
          setVerifyUrl(invoiceData.verify)
          const hash = extractPaymentHash(invoiceData.pr)
          setPaymentHash(hash)
          console.log("Payment verification enabled (LUD-21)")
        } else {
          console.log("Payment verification not available - manual confirmation required")
        }

        // 5. Generar QR code con la factura Lightning
        await generateQRCode(invoiceData.pr)

        console.log("Lightning invoice and QR code generated successfully")
      } catch (err) {
        console.error("Error generating payment:", err)
        setError(err instanceof Error ? err.message : "Failed to generate payment")
      } finally {
        setIsGenerating(false)
      }
    },
    [isAuthenticated, lightningAddress, settings.currency, getCurrencySymbol],
  )

  const resetPayment = useCallback(() => {
    setQrCodeDataUrl(null)
    setLightningInvoice(null)
    setVerifyUrl(null)
    setPaymentHash(null)
    setAmountInSats(null)
    setIsGenerating(true)
    setError(null)
  }, [])

  return {
    qrCodeDataUrl,
    lightningInvoice,
    verifyUrl,
    paymentHash,
    amountInSats,
    isGenerating,
    error,
    generatePayment,
    resetPayment,
  }
}
