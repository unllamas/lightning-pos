"use client"

import { useState, useCallback } from "react"

// Añadir un nuevo estado para la preparación del escaneo
export enum ScanCardStatus {
  IDLE = "IDLE",
  PREPARING = "PREPARING", // Nuevo estado para cuando se inicia el escaneo
  SCANNING = "SCANNING",
  REQUESTING = "REQUESTING",
  DONE = "DONE",
  ERROR = "ERROR",
}

export enum ScanAction {
  PAY_REQUEST = "PAY_REQUEST",
}

export interface LNURLResponse {
  status: string
  callback: string
  k1: string
  reason?: string
  accountPubKey?: string
}

export interface NFCCardReturns {
  isAvailable: boolean
  permission: "prompt" | "granted" | "denied"
  status: ScanCardStatus
  requestPermission: () => Promise<boolean>
  scan: (type?: ScanAction) => Promise<{ cardUrl: string; lnurlResponse: LNURLResponse }>
  stop: () => void
}

// Función para normalizar LNURL
const normalizeLNURL = (url: string): string => {
  return url.replace("lnurlw://", "https://")
}

// Función para hacer request a LNURL
const requestLNURL = async (url: string, type?: ScanAction): Promise<LNURLResponse> => {
  const normalizedUrl = normalizeLNURL(url)
  const headers = { "Content-Type": "application/json" }

  try {
    const response = await fetch(normalizedUrl, {
      method: "GET",
      headers: headers,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error requesting LNURL:", error)
    throw new Error(`Failed to request LNURL: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export const useNFC = (): NFCCardReturns => {
  const [status, setStatus] = useState<ScanCardStatus>(ScanCardStatus.IDLE)
  const [permission, setPermission] = useState<"prompt" | "granted" | "denied">("prompt")
  const [abortController, setAbortController] = useState<AbortController | null>(null)

  // Verificar si NFC está disponible
  const isNFCAvailable = typeof window !== "undefined" && "NDEFReader" in window
  const isAndroid = typeof window !== "undefined" && /Android/i.test(navigator.userAgent)

  // Solo disponible en Android con NFC
  const isAvailable = isNFCAvailable && isAndroid

  // Función para solicitar permisos NFC
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isAvailable) {
      setPermission("denied")
      return false
    }

    try {
      // Intentar crear un NDEFReader para verificar permisos
      const ndef = new (window as any).NDEFReader()

      // Hacer una prueba de escaneo para solicitar permisos
      const controller = new AbortController()

      await ndef.scan({ signal: controller.signal })
      controller.abort()

      setPermission("granted")
      return true
    } catch (error: any) {
      console.error("NFC permission error:", error)

      if (error.name === "NotAllowedError") {
        setPermission("denied")
      } else {
        setPermission("denied")
      }

      return false
    }
  }, [isAvailable])

  // Función para leer NFC usando la API nativa
  const readNFC = useCallback(async (): Promise<string> => {
    if (!isAvailable) {
      throw new Error("NFC not available on this device")
    }

    if (permission !== "granted") {
      throw new Error("NFC permission not granted")
    }

    return new Promise((resolve, reject) => {
      const controller = new AbortController()
      setAbortController(controller)

      try {
        // Usar la API nativa NDEFReader
        const ndef = new (window as any).NDEFReader()

        ndef
          .scan({ signal: controller.signal })
          .then(() => {
            console.log("NFC scan started")
          })
          .catch((error: Error) => {
            console.error("NFC scan failed:", error)
            reject(error)
          })

        ndef.addEventListener(
          "reading",
          (event: any) => {
            console.log("NFC tag detected:", event)
            try {
              const record = event.message.records[0]
              const decoder = new TextDecoder("utf-8")
              const url = decoder.decode(record.data)
              resolve(url)
            } catch (decodeError) {
              console.error("Error decoding NFC data:", decodeError)
              reject(new Error("Failed to decode NFC data"))
            }
          },
          { signal: controller.signal },
        )

        ndef.addEventListener(
          "readingerror",
          (error: any) => {
            console.error("NFC reading error:", error)
            reject(new Error("Failed to read NFC tag"))
          },
          { signal: controller.signal },
        )
      } catch (error) {
        console.error("NFC initialization error:", error)
        reject(new Error("NFC not supported or permission denied"))
      }
    })
  }, [isAvailable, permission])

  // Modificar la función scan para incluir el estado PREPARING
  const scan = useCallback(
    async (type?: ScanAction): Promise<{ cardUrl: string; lnurlResponse: LNURLResponse }> => {
      // Verificar permisos antes de escanear
      if (permission !== "granted") {
        throw new Error("NFC permission not granted")
      }

      // Primero establecer el estado a PREPARING
      setStatus(ScanCardStatus.PREPARING)

      try {
        // Pequeña pausa para asegurar que la UI se actualice
        await new Promise((resolve) => setTimeout(resolve, 100))

        // Luego cambiar a SCANNING cuando realmente comienza el escaneo
        setStatus(ScanCardStatus.SCANNING)

        // 1. Leer URL del tag NFC
        const url = await readNFC()
        console.log("NFC URL read:", url)

        // 2. Hacer request a LNURL
        setStatus(ScanCardStatus.REQUESTING)
        const response = await requestLNURL(url, type)

        if (response?.status === "ERROR") {
          throw new Error(response.reason || "LNURL request failed")
        }

        setStatus(ScanCardStatus.DONE)
        return { cardUrl: url, lnurlResponse: response }
      } catch (error) {
        console.error("NFC scan error:", error)
        setStatus(ScanCardStatus.ERROR)
        throw error
      }
    },
    [readNFC, permission],
  )

  // Función para detener el escaneo
  const stop = useCallback(() => {
    if (abortController) {
      abortController.abort()
      setAbortController(null)
    }
    setStatus(ScanCardStatus.IDLE)
  }, [abortController])

  return {
    isAvailable,
    permission,
    status,
    requestPermission,
    scan,
    stop,
  }
}
