"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Globe, DollarSign, CheckCircle, Zap, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSettings } from "@/hooks/use-settings"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export function SettingsPage() {
  const router = useRouter()
  const {
    settings,
    isLoading: settingsLoading,
    updateCurrency,
    updateLanguage,
    updateOperatorLightningAddress,
    validateLightningAddress,
  } = useSettings()

  const [showSaveSuccess, setShowSaveSuccess] = useState(false)
  const [operatorAddressInput, setOperatorAddressInput] = useState("")

  // Actualizar el input cuando se cargan las configuraciones
  useEffect(() => {
    if (!settingsLoading && settings.operatorLightningAddress) {
      setOperatorAddressInput(settings.operatorLightningAddress)
    }
  }, [settingsLoading, settings.operatorLightningAddress])

  const [operatorAddressError, setOperatorAddressError] = useState("")

  const currencies = [
    { value: "ARS", label: "ARS (Argentine Peso)", symbol: "$" },
    { value: "USD", label: "USD (US Dollar)", symbol: "$" },
    { value: "EUR", label: "EUR (Euro)", symbol: "€" },
  ]

  const languages = [
    { value: "ES", label: "Español" },
    { value: "EN", label: "English" },
    { value: "PT", label: "Português" },
  ]

  const showFeedback = (message?: string) => {
    setShowSaveSuccess(true)
    setTimeout(() => setShowSaveSuccess(false), 2000)
  }

  const handleCurrencyChange = (newCurrency: string) => {
    updateCurrency(newCurrency)
    showFeedback()
  }

  const handleLanguageChange = (newLanguage: string) => {
    updateLanguage(newLanguage)
    showFeedback()
  }

  const handleOperatorAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const address = e.target.value
    setOperatorAddressInput(address)
    setOperatorAddressError("")

    // Validar en tiempo real
    if (address.trim() && !validateLightningAddress(address)) {
      setOperatorAddressError("Invalid Lightning Address format")
    }
  }

  const handleOperatorAddressSave = () => {
    const address = operatorAddressInput.trim()

    // Validar antes de guardar
    if (address && !validateLightningAddress(address)) {
      setOperatorAddressError("Invalid Lightning Address format")
      return
    }

    updateOperatorLightningAddress(address)
    setOperatorAddressError("")
    showFeedback()
  }

  const handleOperatorAddressKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleOperatorAddressSave()
    }
  }

  // Verificar si hay cambios pendientes en la Lightning Address del operador
  const hasOperatorAddressChanges = operatorAddressInput !== settings.operatorLightningAddress

  // Mostrar loading mientras cargan las configuraciones
  if (settingsLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="w-full min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="py-4 bg-white border-b shadow-sm">
        <div className="flex items-center w-full max-w-md mx-auto px-4">
          <Button variant="outline" size="icon" onClick={() => router.push("/app")} className="mr-2">
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
          <h1 className="text-xl font-medium">Settings</h1>
          {showSaveSuccess && (
            <div className="ml-auto flex items-center text-green-600 animate-in fade-in slide-in-from-top-4 duration-300">
              <CheckCircle className="h-4 w-4 mr-1" />
              <span className="text-sm">Saved</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 w-full max-w-md mx-auto p-4 space-y-4">
        {/* Operator Lightning Address
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between gap-2 text-lg">
              Operator Tips
              <Zap className="h-4 w-4 text-gray-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <Label htmlFor="operator-address" className="text-sm font-medium text-gray-700">
                  Lightning Address
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="operator-address"
                    type="text"
                    placeholder="operator@wallet.com"
                    value={operatorAddressInput}
                    onChange={handleOperatorAddressChange}
                    onKeyPress={handleOperatorAddressKeyPress}
                    className={operatorAddressError ? "border-red-500 flex-1" : "flex-1"}
                  />
                  {settings.operatorLightningAddress && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setOperatorAddressInput("")
                        updateOperatorLightningAddress("")
                        setOperatorAddressError("")
                        showFeedback("Lightning Address cleared")
                      }}
                      className="px-3"
                    >
                      Clear
                    </Button>
                  )}
                </div>
                {operatorAddressError && (
                  <div className="flex items-center text-red-600 text-xs mt-1">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {operatorAddressError}
                  </div>
                )}
              </div>

              {hasOperatorAddressChanges && (
                <Button
                  size="sm"
                  onClick={handleOperatorAddressSave}
                  disabled={!!operatorAddressError}
                  className="w-full"
                >
                  Save Lightning Address
                </Button>
              )}

              <div className="text-xs text-gray-500">
                <p className="mb-1">Configure your Lightning Address to receive tips directly from customers.</p>
                <p>
                  {settings.operatorLightningAddress
                    ? "✅ Tips enabled - customers can add tips to their payments"
                    : "⚠️ Tips disabled - payments will be processed without tip option"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card> */}

        {/* Currency Settings */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between gap-2 text-lg">
              Currency
              <DollarSign className="h-4 w-4 text-gray-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Select value={settings.currency} onValueChange={handleCurrencyChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((curr) => (
                    <SelectItem key={curr.value} value={curr.value}>
                      <div className="flex items-center">
                        <span className="mr-2">{curr.symbol}</span>
                        {curr.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>This will be the default currency displayed in the system</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Language Settings
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between gap-2 text-lg">
              Language
              <Globe className="h-4 w-4 text-gray-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Select value={settings.language} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Change the language of the entire application</span>
              </div>
            </div>
          </CardContent>
        </Card> */}

        {/* Additional Settings Placeholder */}
        <Card className="opacity-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-gray-500">More settings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-400">
              Coming soon: Lightning Network settings, themes, notifications and more.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Back Button */}
      <div className="py-4 bg-white border-t">
        <div className="w-full max-w-md mx-auto px-4">
          <Button variant="secondary" className="w-full" onClick={() => router.push("/app")}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}
