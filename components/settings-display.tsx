"use client"

import { useSettings } from "@/hooks/use-settings"
import { useLightningAuth } from "@/hooks/use-lightning-auth"

interface SettingsDisplayProps {
  showCurrency?: boolean
  showLanguage?: boolean
  showLightningAddress?: boolean
  showOperatorAddress?: boolean
  className?: string
}

export function SettingsDisplay({
  showCurrency = true,
  showLanguage = true,
  showLightningAddress = true,
  showOperatorAddress = true,
  className = "",
}: SettingsDisplayProps) {
  const { settings, getCurrencySymbol, getCurrencyName, getLanguageName } = useSettings()
  const { lightningAddress, isAuthenticated } = useLightningAuth()

  return (
    <div className={`text-sm text-gray-600 space-y-1 ${className}`}>
      {showLightningAddress && (
        <div className="flex items-center justify-between">
          <span>System:</span>
          <span className="font-medium">{isAuthenticated ? lightningAddress : "Not configured"}</span>
        </div>
      )}

      {showOperatorAddress && (
        <div className="flex items-center justify-between">
          <span>Operator:</span>
          <span className="font-medium">{settings.operatorLightningAddress || "Not configured"}</span>
        </div>
      )}

      {showCurrency && (
        <div className="flex items-center justify-between">
          <span>Currency:</span>
          <span className="font-medium">
            {getCurrencySymbol()} {settings.currency}
          </span>
        </div>
      )}

      {showLanguage && (
        <div className="flex items-center justify-between">
          <span>Language:</span>
          <span className="font-medium">{getLanguageName()}</span>
        </div>
      )}
    </div>
  )
}
