"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { OnboardingCarousel } from "@/components/onboarding-carousel"

export function WaitlistPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: "",
  })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    console.log("Waitlist submission:", formData)
    setIsSubmitted(true)
    setIsSubmitting(false)
  }

  const handleCancel = () => {
    router.push("/app")
  }

  const isFormValid = formData.email.trim() && formData.email.includes("@")

  if (isSubmitted) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-green-400 to-teal-500 flex flex-col relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-1/3 left-1/3 w-48 h-48 bg-white/10 rounded-full blur-lg"></div>

        <div className="flex-1 flex flex-col items-center justify-center py-8 px-4 text-white relative z-10">
          <div className="bg-white p-6 rounded-full mb-6">
            <Check className="h-16 w-16 text-green-500" />
          </div>

          <h1 className="text-3xl font-bold mb-4 text-center">Thanks!</h1>
          <p className="text-white/90 text-center mb-8 max-w-sm">
            We'll notify you when Lightning PoS Cloud is available.
          </p>

          <Button
            variant="secondary"
            onClick={() => router.push("/app")}
          >
            Go to Home
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen flex flex-col bg-gray-100">
      {/* Carousel Section - 2/3 of screen 
      <div className="flex-1 h-full relative">
      </div>*/}
        <OnboardingCarousel />

      {/* Form Section - 1/3 of screen */}
      <div className="h-auto bg-black flex flex-col">
        <div className="flex-1 flex flex-col justify-center p-6 max-w-md mx-auto w-full">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@email.com"
              value={formData.email}
              onChange={handleInputChange}
              required
            />

            <div className="flex gap-4 w-full">
              <Button
                className="w-full"
                type="button"
                variant="default"
                onClick={handleCancel}
              >
                Cancel
              </Button>

              <Button
                className="w-full"
                variant="secondary"
                type="submit"
                disabled={!isFormValid || isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Sign me up"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
