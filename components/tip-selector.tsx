"use client"

import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useSettings } from "@/hooks/use-settings"

interface TipSelectorProps {
  subtotal: number
  selectedOption: "with-tip" | "without-tip" | null
  finalAmount: number
  onSelectTip: (option: "with-tip" | "without-tip") => void
  onGeneratePayment: () => void
  onCancel: () => void
}

export function TipSelector({
  subtotal,
  selectedOption,
  finalAmount,
  onSelectTip,
  onGeneratePayment,
  onCancel,
}: TipSelectorProps) {
  const { settings, getCurrencySymbol } = useSettings()
  const tipAmount = subtotal * 0.1
  const totalWithTip = subtotal + tipAmount

  // Convertir a Bitcoin (simulado - en una app real esto vendría de una API)
  const btcRate = 100000 // 1 BTC = $100,000 (ejemplo)
  const subtotalBTC = (subtotal / btcRate).toFixed(6)

  const tipOptions = [
    {
      id: "with-tip",
      title: "With tip",
      amount: totalWithTip,
      description: "+10% tip",
      selected: selectedOption === "with-tip",
    },
    {
      id: "without-tip",
      title: "No tip",
      amount: subtotal,
      description: "Base price",
      selected: selectedOption === "without-tip",
    },
  ]

  return (
    <div className="flex flex-col h-screen">
      <header className="py-4 bg-white border-b shadow-sm">
        <div className="flex items-center w-full max-w-md mx-auto px-4">
          <Button variant="secondary" size="icon" onClick={onCancel} className="mr-2">
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
          <h1 className="text-xl font-medium">Payment process</h1>
        </div>
      </header>

      <div className="flex-1 flex flex-col w-full max-w-md mx-auto p-4">
        {/* Subtotal Section */}
        <div className="flex-1 flex flex-col justify-center items-center text-center">
          <h2 className="text-2xl">Subtotal</h2>
          <div className="text-4xl font-bold">
            {getCurrencySymbol()}
            {subtotal.toLocaleString()} {settings.currency}
          </div>
        </div>

        {/* Total Section */}
        <div className="flex flex-col gap-4">
          <h3 className="text-xl font-semibold">Total</h3>

          <div className="grid grid-cols-2 gap-4">
            {tipOptions.map((option) => (
              <Card
                key={option.id}
                className={`cursor-pointer transition-all ${
                  option.selected ? "ring-2 ring-blue-500 bg-blue-50" : "hover:shadow-md"
                }`}
                onClick={() => onSelectTip(option.id as "with-tip" | "without-tip")}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-medium">{option.title}</h4>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        option.selected ? "border-blue-500 bg-blue-500" : "border-gray-300"
                      }`}
                    >
                      {option.selected && <div className="w-2 h-2 bg-white rounded-full"></div>}
                    </div>
                  </div>

                  <div className="text-2xl font-bold mb-1">
                    {getCurrencySymbol()}
                    {option.amount.toLocaleString()} {settings.currency}
                  </div>
                  <div className="text-sm text-gray-500">{option.description}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Generate Payment Button */}
      <div className="w-full py-4 bg-white border-t">
        <div className="flex flex-col gap-2 w-full max-w-md mx-auto px-4">
          <Button className={`w-full`} disabled={!selectedOption} onClick={onGeneratePayment}>
            Process payment
          </Button>
        </div>
      </div>
    </div>
  )
}
