"use client"

import { useState, useEffect, useCallback } from "react"

interface LightningAuthState {
  lightningAddress: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

interface LNURLPayResponse {
  callback: string
  maxSendable: number
  minSendable: number
  metadata: string
  tag: string
}

export function useLightningAuth() {
  const [authState, setAuthState] = useState<LightningAuthState>({
    lightningAddress: null,
    isAuthenticated: false,
    isLoading: true,
  })

  // Cargar Lightning Address guardada al inicializar
  useEffect(() => {
    const loadSavedAuth = () => {
      try {
        const savedAddress = localStorage.getItem("lightning-pos-auth")
        if (savedAddress) {
          const parsedAuth = JSON.parse(savedAddress)
          setAuthState({
            lightningAddress: parsedAuth.lightningAddress,
            isAuthenticated: true,
            isLoading: false,
          })
        } else {
          setAuthState((prev) => ({ ...prev, isLoading: false }))
        }
      } catch (error) {
        console.error("Error loading saved auth:", error)
        setAuthState((prev) => ({ ...prev, isLoading: false }))
      }
    }

    loadSavedAuth()
  }, [])

  // Función para validar Lightning Address via LNURL-pay
  const validateLightningAddress = useCallback(async (address: string): Promise<boolean> => {
    try {
      // Validar formato básico
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
      if (!emailRegex.test(address)) {
        return false
      }

      // Extraer usuario y dominio
      const [username, domain] = address.split("@")
      if (!username || !domain) {
        return false
      }

      // Construir URL LNURL-pay
      const lnurlpUrl = `https://${domain}/.well-known/lnurlp/${username}`

      // Hacer request a la URL
      const response = await fetch(lnurlpUrl, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      })

      if (!response.ok) {
        return false
      }

      const data: LNURLPayResponse = await response.json()

      // Validar que sea una respuesta LNURL-pay válida
      if (
        data.tag === "payRequest" &&
        data.callback &&
        data.metadata &&
        typeof data.minSendable === "number" &&
        typeof data.maxSendable === "number"
      ) {
        return true
      }

      return false
    } catch (error) {
      console.error("Error validating Lightning Address:", error)
      return false
    }
  }, [])

  // Función para hacer login
  const login = useCallback(
    async (lightningAddress: string): Promise<{ success: boolean; error?: string }> => {
      try {
        setAuthState((prev) => ({ ...prev, isLoading: true }))

        // Validar Lightning Address
        const isValid = await validateLightningAddress(lightningAddress)

        if (!isValid) {
          setAuthState((prev) => ({ ...prev, isLoading: false }))
          return {
            success: false,
            error: "Invalid Lightning Address. Please check that the address exists.",
          }
        }

        // Guardar en localStorage
        const authData = {
          lightningAddress,
          timestamp: Date.now(),
        }

        localStorage.setItem("lightning-pos-auth", JSON.stringify(authData))

        // Actualizar estado
        setAuthState({
          lightningAddress,
          isAuthenticated: true,
          isLoading: false,
        })

        return { success: true }
      } catch (error) {
        setAuthState((prev) => ({ ...prev, isLoading: false }))
        return {
          success: false,
          error: "Error connecting to Lightning Address. Please try again.",
        }
      }
    },
    [validateLightningAddress],
  )

  // Función para hacer logout
  const logout = useCallback(() => {
    localStorage.removeItem("lightning-pos-auth")
    setAuthState({
      lightningAddress: null,
      isAuthenticated: false,
      isLoading: false,
    })
  }, [])

  // Función para verificar si hay sesión activa
  const checkSession = useCallback(() => {
    try {
      const savedAuth = localStorage.getItem("lightning-pos-auth")
      if (savedAuth) {
        const parsedAuth = JSON.parse(savedAuth)
        return {
          isValid: true,
          lightningAddress: parsedAuth.lightningAddress,
        }
      }
      return { isValid: false }
    } catch (error) {
      return { isValid: false }
    }
  }, [])

  return {
    ...authState,
    login,
    logout,
    checkSession,
    validateLightningAddress,
  }
}
