"use client"

import { Nfc } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ScanCardStatus } from "@/hooks/use-nfc"

interface PaymentActionsProps {
  isNFCAvailable: boolean
  isNFCButtonDisabled: boolean
  nfcStatus: ScanCardStatus
  lightningInvoice: string | null
  verifyUrl: string | null
  onNFCScan: () => void
  onCancel: () => void
  onCompletePayment: () => void
}

export function PaymentActions({
  isNFCAvailable,
  isNFCButtonDisabled,
  nfcStatus,
  lightningInvoice,
  verifyUrl,
  onNFCScan,
  onCancel,
  onCompletePayment,
}: PaymentActionsProps) {
  return (
    <div className="w-full py-4 bg-white border-t">
      <div className="flex flex-col gap-2 w-full max-w-md mx-auto px-4">
        {/* NFC Button - Solo en Android */}
        {isNFCAvailable && (
          <Button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={onNFCScan}
            disabled={isNFCButtonDisabled}
          >
            <Nfc className="h-4 w-4" />
            <span>Scan via NFC</span>
          </Button>
        )}

        <Button variant="outline" className="w-full" onClick={onCancel}>
          Cancel
        </Button>

        {/* Botón para simular pago exitoso - solo en desarrollo o si no hay verificación automática
        {(process.env.NODE_ENV === "development" || !verifyUrl) && (
          <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={onCompletePayment}>
            {verifyUrl ? "Simulate Payment" : "Mark as Paid"}
          </Button>
        )} */}
      </div>
    </div>
  )
}
