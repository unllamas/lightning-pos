"use client"

import { AlertCircle, CheckCircle, Nfc, X } from "lucide-react"
import { ScanCardStatus } from "@/hooks/use-nfc"

interface NFCAlertProps {
  status: ScanCardStatus
  nfcError: string | null
  onDismiss: () => void
}

export function NFCAlert({ status, nfcError, onDismiss }: NFCAlertProps) {
  const getAlertContent = () => {
    switch (status) {
      case ScanCardStatus.PREPARING:
        return {
          icon: <Nfc className="h-5 w-5 animate-pulse" />,
          message: "Activating NFC...",
          description: "Preparing to scan NFC card",
          bgColor: "bg-blue-100",
          textColor: "text-blue-800",
          borderColor: "border-blue-200",
          showClose: false,
        }
      case ScanCardStatus.SCANNING:
        return {
          icon: <Nfc className="h-5 w-5 animate-pulse" />,
          message: "NFC Ready - Tap your card",
          description: "Hold your NFC card near the device",
          bgColor: "bg-blue-100",
          textColor: "text-blue-800",
          borderColor: "border-blue-200",
          showClose: false,
        }
      case ScanCardStatus.REQUESTING:
        return {
          icon: <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>,
          message: "Processing NFC payment...",
          description: "Please wait while we process your payment",
          bgColor: "bg-blue-100",
          textColor: "text-blue-800",
          borderColor: "border-blue-200",
          showClose: false,
        }
      case ScanCardStatus.DONE:
        return {
          icon: <CheckCircle className="h-5 w-5 text-green-600" />,
          message: "NFC payment completed",
          description: "Payment processed successfully",
          bgColor: "bg-green-100",
          textColor: "text-green-800",
          borderColor: "border-green-200",
          showClose: false,
        }
      case ScanCardStatus.ERROR:
        return {
          icon: <AlertCircle className="h-5 w-5 text-red-600" />,
          message: "NFC error occurred",
          description: nfcError || "Failed to process NFC payment",
          bgColor: "bg-red-100",
          textColor: "text-red-800",
          borderColor: "border-red-200",
          showClose: true,
        }
      default:
        return null
    }
  }

  const alertContent = getAlertContent()

  if (!alertContent) return null

  return (
    <div className="fixed bottom-24 left-4 right-4 z-40 animate-in slide-in-from-bottom-4 duration-300">
      <div
        className={`${alertContent.bgColor} ${alertContent.borderColor} border rounded-lg p-4 shadow-lg max-w-md mx-auto`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-0.5">{alertContent.icon}</div>
            <div className="flex-1 min-w-0">
              <h4 className={`text-sm font-medium ${alertContent.textColor}`}>{alertContent.message}</h4>
              <p className={`text-xs ${alertContent.textColor} opacity-80 mt-1`}>{alertContent.description}</p>
            </div>
          </div>

          {alertContent.showClose && (
            <button
              onClick={onDismiss}
              className={`flex-shrink-0 ml-2 ${alertContent.textColor} opacity-60 hover:opacity-100 transition-opacity`}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
