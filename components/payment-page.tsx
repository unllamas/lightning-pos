"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { PaymentView } from "@/components/payment-view"
import { PaymentSuccess } from "@/components/payment-success"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { usePOSData } from "@/hooks/use-pos-data"
import { TipSelector } from "@/components/tip-selector"
import { useSettings } from "@/hooks/use-settings"
import { usePrintOrder } from "@/hooks/use-print-order"
import type { PrintOrder } from "@/types/print"

interface PaymentPageProps {
  orderId: string
}

export function PaymentPage({ orderId }: PaymentPageProps) {
  const router = useRouter()
  const [paymentStatus, setPaymentStatus] = useState<"selecting" | "pending" | "success">("selecting")
  const [tipOption, setTipOption] = useState<"with-tip" | "without-tip" | null>(null)
  const [finalAmount, setFinalAmount] = useState(0)
  const [printOrder, setPrintOrder] = useState<PrintOrder | null>(null)
  const { products, cart, isLoading, error, clearCart } = usePOSData()
  const { settings } = useSettings()
  const { generatePrintOrder } = usePrintOrder()

  const subtotal = cart.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.id)
    return sum + (product?.price || 0) * item.quantity
  }, 0)

  const operatorHasLightningAddress = settings.operatorLightningAddress?.trim() !== ""

  // Auto-redirect si no hay Lightning Address del operador
  useEffect(() => {
    if (!isLoading && !operatorHasLightningAddress && subtotal > 0) {
      setFinalAmount(subtotal)
      setPaymentStatus("pending")
    }
  }, [isLoading, operatorHasLightningAddress])

  const handleSelectTip = (option: "with-tip" | "without-tip") => {
    setTipOption(option)
    const amount = option === "with-tip" ? subtotal * 1.1 : subtotal
    setFinalAmount(amount)
  }

  const handleGeneratePayment = () => {
    if (tipOption && finalAmount > 0) {
      setPaymentStatus("pending")
    }
  }

  const handleCompletePayment = () => {
    if (finalAmount > 0) {
      try {
        // Calcular tip amount si aplica
        const tipAmount = tipOption === "with-tip" ? subtotal * 0.1 : undefined

        // Generar orden de impresión
        const order = generatePrintOrder(orderId, cart, products, finalAmount, tipAmount)
        setPrintOrder(order)

        // Limpiar carrito y cambiar estado
        clearCart()
        setPaymentStatus("success")
      } catch (error) {
        console.error("Error generating print order:", error)
        // Aún así completar el pago, solo sin orden de impresión
        clearCart()
        setPaymentStatus("success")
      }
    }
  }

  const handleBackToShop = () => {
    router.push("/shop")
  }

  const handleCancel = () => {
    if (paymentStatus === "selecting") {
      router.push("/cart")
    } else {
      if (operatorHasLightningAddress) {
        setPaymentStatus("selecting")
        setTipOption(null)
        setFinalAmount(0)
      } else {
        router.push("/cart")
      }
    }
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <div className="w-full max-w-md mx-auto bg-gray-100 min-h-screen flex flex-col items-center justify-center p-8">
        <p className="text-red-500 text-center">Error: {error}</p>
        <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="w-full bg-gray-100 min-h-screen">
      {paymentStatus === "selecting" && operatorHasLightningAddress && (
        <TipSelector
          subtotal={subtotal}
          selectedOption={tipOption}
          finalAmount={finalAmount}
          onSelectTip={handleSelectTip}
          onGeneratePayment={handleGeneratePayment}
          onCancel={handleCancel}
        />
      )}

      {paymentStatus === "pending" && (
        <PaymentView
          amount={finalAmount}
          paymentMethod="qr"
          cart={cart}
          products={products}
          onCancel={handleCancel}
          onCompletePayment={handleCompletePayment}
        />
      )}

      {paymentStatus === "success" && (
        <PaymentSuccess amount={finalAmount} printOrder={printOrder} onBackToShop={handleBackToShop} />
      )}
    </div>
  )
}
