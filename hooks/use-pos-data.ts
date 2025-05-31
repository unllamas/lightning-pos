"use client"

import { useState, useEffect, useCallback } from "react"
import type { Category, Product } from "@/lib/types"
import { dbService } from "@/lib/indexeddb"

interface CartItem {
  id: string
  quantity: number
}

export function usePOSData() {
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Initialize database and load data
  const initializeData = useCallback(async () => {
    try {
      setIsLoading(true)
      await dbService.init()
      // await dbService.initializeDefaultData()

      const [categoriesData, productsData, cartData] = await Promise.all([
        dbService.getCategories(),
        dbService.getProducts(),
        dbService.getCart(),
      ])

      setCategories(categoriesData)
      setProducts(productsData)
      setCart(cartData)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading data")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    initializeData()
  }, [initializeData])

  // Category operations
  const addCategory = useCallback(async (category: Category) => {
    try {
      await dbService.addCategory(category)
      setCategories((prev) => [...prev, category].sort((a, b) => a.order - b.order))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error adding category")
    }
  }, [])

  const updateCategory = useCallback(async (id: string, data: Partial<Category>) => {
    try {
      await dbService.updateCategory(id, data)
      setCategories((prev) => prev.map((cat) => (cat.id === id ? { ...cat, ...data } : cat)))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error updating category")
    }
  }, [])

  const deleteCategory = useCallback(async (id: string) => {
    try {
      await dbService.deleteCategory(id)
      await dbService.deleteProductsByCategory(id)
      setCategories((prev) => prev.filter((cat) => cat.id !== id))
      setProducts((prev) => prev.filter((prod) => prod.categoryId !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error deleting category")
    }
  }, [])

  const reorderCategories = useCallback(
    async (draggedId: string, targetId: string) => {
      try {
        const draggedCategory = categories.find((cat) => cat.id === draggedId)
        const targetCategory = categories.find((cat) => cat.id === targetId)

        if (!draggedCategory || !targetCategory) return

        const sortedCats = [...categories].sort((a, b) => a.order - b.order)
        const draggedIndex = sortedCats.findIndex((cat) => cat.id === draggedId)
        const targetIndex = sortedCats.findIndex((cat) => cat.id === targetId)

        const [draggedCat] = sortedCats.splice(draggedIndex, 1)
        sortedCats.splice(targetIndex, 0, draggedCat)

        const updatedCategories = sortedCats.map((cat, index) => ({
          ...cat,
          order: index + 1,
        }))

        await dbService.updateCategoriesOrder(updatedCategories)
        setCategories(updatedCategories)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error reordering categories")
      }
    },
    [categories],
  )

  // Product operations
  const addProduct = useCallback(async (product: Product) => {
    try {
      await dbService.addProduct(product)
      setProducts((prev) => [...prev, product].sort((a, b) => a.order - b.order))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error adding product")
    }
  }, [])

  const updateProduct = useCallback(async (id: string, data: Partial<Product>) => {
    try {
      await dbService.updateProduct(id, data)
      setProducts((prev) => prev.map((prod) => (prod.id === id ? { ...prod, ...data } : prod)))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error updating product")
    }
  }, [])

  const deleteProduct = useCallback(async (id: string) => {
    try {
      await dbService.deleteProduct(id)
      setProducts((prev) => prev.filter((prod) => prod.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error deleting product")
    }
  }, [])

  const reorderProducts = useCallback(
    async (draggedId: string, targetId: string) => {
      try {
        const draggedProduct = products.find((prod) => prod.id === draggedId)
        const targetProduct = products.find((prod) => prod.id === targetId)

        if (!draggedProduct || !targetProduct || draggedProduct.categoryId !== targetProduct.categoryId) return

        const categoryProducts = products
          .filter((prod) => prod.categoryId === draggedProduct.categoryId)
          .sort((a, b) => a.order - b.order)

        const draggedIndex = categoryProducts.findIndex((prod) => prod.id === draggedId)
        const targetIndex = categoryProducts.findIndex((prod) => prod.id === targetId)

        const [draggedProd] = categoryProducts.splice(draggedIndex, 1)
        categoryProducts.splice(targetIndex, 0, draggedProd)

        const updatedCategoryProducts = categoryProducts.map((prod, index) => ({
          ...prod,
          order: index + 1,
        }))

        const updatedProducts = products.map((prod) => {
          const updatedProd = updatedCategoryProducts.find((updated) => updated.id === prod.id)
          return updatedProd || prod
        })

        await dbService.updateProductsOrder(updatedCategoryProducts)
        setProducts(updatedProducts)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error reordering products")
      }
    },
    [products],
  )

  // Cart operations
  const addToCart = useCallback(
    async (productId: string) => {
      try {
        const existingItem = cart.find((item) => item.id === productId)

        if (existingItem) {
          const updatedItem = { ...existingItem, quantity: existingItem.quantity + 1 }
          await dbService.updateCartItem(updatedItem)
          setCart((prev) => prev.map((item) => (item.id === productId ? updatedItem : item)))
        } else {
          const newItem = { id: productId, quantity: 1 }
          await dbService.updateCartItem(newItem)
          setCart((prev) => [...prev, newItem])
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error adding to cart")
      }
    },
    [cart],
  )

  const updateCartQuantity = useCallback(async (productId: string, quantity: number) => {
    try {
      if (quantity <= 0) {
        await dbService.removeCartItem(productId)
        setCart((prev) => prev.filter((item) => item.id !== productId))
      } else {
        const updatedItem = { id: productId, quantity }
        await dbService.updateCartItem(updatedItem)
        setCart((prev) => prev.map((item) => (item.id === productId ? updatedItem : item)))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error updating cart")
    }
  }, [])

  const clearCart = useCallback(async () => {
    try {
      await dbService.clearCart()
      setCart([])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error clearing cart")
    }
  }, [])

  // Refresh data from database
  const refreshData = useCallback(async () => {
    try {
      const [categoriesData, productsData, cartData] = await Promise.all([
        dbService.getCategories(),
        dbService.getProducts(),
        dbService.getCart(),
      ])

      setCategories(categoriesData)
      setProducts(productsData)
      setCart(cartData)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error refreshing data")
    }
  }, [])

  return {
    // Data
    categories,
    products,
    cart,
    isLoading,
    error,

    // Category operations
    addCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,

    // Product operations
    addProduct,
    updateProduct,
    deleteProduct,
    reorderProducts,

    // Cart operations
    addToCart,
    updateCartQuantity,
    clearCart,

    // Utility
    refreshData,
  }
}
