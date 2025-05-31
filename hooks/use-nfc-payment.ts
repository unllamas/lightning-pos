"use client"

import { useState, useEffect, useCallback } from "react"
import { useNFC, ScanCardStatus, ScanAction } from "@/hooks/use-nfc"

export function useNFCPayment() {
  const [nfcError, setNfcError] = useState<string | null>(null)
  const [showNFCAlert, setShowNFCAlert] = useState(false)
  const [showPermissionRequest, setShowPermissionRequest] = useState(false)
  const [nfcEnabled, setNfcEnabled] = useState(false)

  const {
    isAvailable: isNFCAvailable,
    permission: nfcPermission,
    status: nfcStatus,
    requestPermission,
    scan: scanNFC,
    stop: stopNFC,
  } = useNFC()

  // Mostrar/ocultar alerta NFC basado en el estado
  useEffect(() => {
    if (nfcStatus === ScanCardStatus.SCANNING || nfcStatus === ScanCardStatus.REQUESTING) {
      setShowNFCAlert(true)
    } else if (nfcStatus === ScanCardStatus.DONE) {
      setTimeout(() => {
        setShowNFCAlert(false)
      }, 1500)
    } else if (nfcStatus === ScanCardStatus.ERROR) {
      setShowNFCAlert(true)
    } else {
      setShowNFCAlert(false)
    }
  }, [nfcStatus])

  // Solicitar permisos NFC cuando se genere el pago
  const requestNFCPermission = useCallback(async () => {
    if (!isNFCAvailable) {
      return false
    }

    if (nfcPermission === "granted") {
      setNfcEnabled(true)
      return true
    }

    setShowPermissionRequest(true)
    return false
  }, [isNFCAvailable, nfcPermission])

  const handlePermissionGranted = useCallback(async () => {
    setShowPermissionRequest(false)

    try {
      const granted = await requestPermission()
      if (granted) {
        setNfcEnabled(true)
        setNfcError(null)

        // Mostrar alerta de NFC habilitado
        setShowNFCAlert(true)
        setTimeout(() => setShowNFCAlert(false), 3000)
      } else {
        setNfcError("NFC permission was denied")
      }
    } catch (error) {
      setNfcError("Failed to enable NFC")
    }
  }, [requestPermission])

  const handlePermissionDenied = useCallback(() => {
    setShowPermissionRequest(false)
    setNfcEnabled(false)
  }, [])

  const handleNFCScan = useCallback(
    async (lightningInvoice: string, onSuccess: () => void) => {
      if (!lightningInvoice) {
        setNfcError("No Lightning invoice available")
        return
      }

      if (!nfcEnabled) {
        setNfcError("NFC not enabled")
        return
      }

      try {
        setNfcError(null)
        console.log("Preparing NFC scan...")
        setShowNFCAlert(true)

        const { cardUrl, lnurlResponse } = await scanNFC(ScanAction.PAY_REQUEST)
        console.log("NFC scan successful:", { cardUrl, lnurlResponse })

        const callbackUrl = new URL(lnurlResponse.callback)
        callbackUrl.searchParams.set("k1", lnurlResponse.k1)
        callbackUrl.searchParams.set("pr", lightningInvoice)

        const response = await fetch(callbackUrl.toString(), {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        })

        if (!response.ok) {
          throw new Error(`Payment failed: ${response.status}`)
        }

        const paymentResult = await response.json()

        if (paymentResult.status !== "OK") {
          throw new Error(`Payment failed: ${paymentResult.reason || "Unknown error"}`)
        }

        console.log("NFC payment successful!")
        onSuccess()
      } catch (err) {
        console.error("NFC payment error:", err)
        setNfcError(err instanceof Error ? err.message : "NFC payment failed")
      }
    },
    [scanNFC, nfcEnabled],
  )

  const dismissNFCAlert = useCallback(() => {
    setShowNFCAlert(false)
  }, [])

  const isNFCButtonDisabled =
    !nfcEnabled ||
    nfcStatus === ScanCardStatus.PREPARING ||
    nfcStatus === ScanCardStatus.SCANNING ||
    nfcStatus === ScanCardStatus.REQUESTING

  // Cleanup NFC al desmontar
  useEffect(() => {
    return () => {
      stopNFC()
    }
  }, [stopNFC])

  return {
    isNFCAvailable,
    nfcEnabled,
    nfcStatus,
    nfcError,
    showNFCAlert,
    showPermissionRequest,
    isNFCButtonDisabled,
    requestNFCPermission,
    handlePermissionGranted,
    handlePermissionDenied,
    handleNFCScan,
    dismissNFCAlert,
    stopNFC,
  }
}
