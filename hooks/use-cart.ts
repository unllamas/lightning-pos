"use client"

import { useState, useEffect } from "react"

interface CartItem {
  id: string
  quantity: number
}

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([])

  // Cargar carrito desde localStorage al inicializar
  useEffect(() => {
    const savedCart = localStorage.getItem("lightning-pos-cart")
    if (savedCart) {
      setCart(JSON.parse(savedCart))
    }
  }, [])

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem("lightning-pos-cart", JSON.stringify(cart))
  }, [cart])

  const addToCart = (productId: string) => {
    const existingItem = cart.find((item) => item.id === productId)

    if (existingItem) {
      setCart(cart.map((item) => (item.id === productId ? { ...item, quantity: item.quantity + 1 } : item)))
    } else {
      setCart([...cart, { id: productId, quantity: 1 }])
    }
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(cart.filter((item) => item.id !== productId))
    } else {
      setCart(cart.map((item) => (item.id === productId ? { ...item, quantity } : item)))
    }
  }

  const clearCart = () => {
    setCart([])
  }

  return {
    cart,
    addToCart,
    updateQuantity,
    clearCart,
  }
}
