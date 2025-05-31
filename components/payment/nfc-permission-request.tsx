"use client"

import { useState } from "react"
import { Nfc, AlertCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface NFCPermissionRequestProps {
  onPermissionGranted: () => void
  onPermissionDenied: () => void
}

export function NFCPermissionRequest({ onPermissionGranted, onPermissionDenied }: NFCPermissionRequestProps) {
  const [isRequesting, setIsRequesting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRequestPermission = async () => {
    setIsRequesting(true)
    setError(null)

    try {
      // Simular solicitud de permisos NFC
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // En una implementación real, aquí se solicitarían los permisos reales
      const granted = true // Simular que se conceden los permisos

      if (granted) {
        onPermissionGranted()
      } else {
        setError("NFC permission was denied")
        onPermissionDenied()
      }
    } catch (err) {
      setError("Failed to request NFC permission")
      onPermissionDenied()
    } finally {
      setIsRequesting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-sm">
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Nfc className="h-8 w-8 text-blue-600" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Enable NFC Payments</h3>
              <p className="text-sm text-gray-600">
                Allow NFC access to enable tap-to-pay functionality for faster payments.
              </p>
            </div>

            {error && (
              <div className="flex items-center text-red-600 text-sm">
                <AlertCircle className="h-4 w-4 mr-2" />
                {error}
              </div>
            )}

            <div className="flex flex-col w-full space-y-2">
              <Button onClick={handleRequestPermission} disabled={isRequesting} className="w-full">
                {isRequesting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Requesting permission...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Allow NFC Access
                  </>
                )}
              </Button>

              <Button variant="outline" onClick={onPermissionDenied} disabled={isRequesting} className="w-full">
                Skip for now
              </Button>
            </div>

            <p className="text-xs text-gray-500">You can still pay using the QR code if you skip NFC access.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
