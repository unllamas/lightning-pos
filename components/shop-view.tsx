"use client"

import { useState } from "react"
import { ShopHeader } from "@/components/shop-header"
import { ProductList } from "@/components/product-list"
import { CartView } from "@/components/cart-view"
import { PaymentView } from "@/components/payment-view"
import { PaymentSuccess } from "@/components/payment-success"
import { ShopEdit } from "@/components/shop-edit"
import type { Product, Category } from "@/lib/types"
import { initialCategories, initialProducts } from "@/lib/data"

export function ShopView() {
  const [view, setView] = useState<"shop" | "cart" | "payment" | "success" | "edit">("shop")
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [cart, setCart] = useState<{ id: string; quantity: number }[]>([])
  const [totalAmount, setTotalAmount] = useState(0)

  const addToCart = (productId: string) => {
    const existingItem = cart.find((item) => item.id === productId)

    if (existingItem) {
      setCart(cart.map((item) => (item.id === productId ? { ...item, quantity: item.quantity + 1 } : item)))
    } else {
      setCart([...cart, { id: productId, quantity: 1 }])
    }

    updateTotal()
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(cart.filter((item) => item.id !== productId))
    } else {
      setCart(cart.map((item) => (item.id === productId ? { ...item, quantity } : item)))
    }

    updateTotal()
  }

  const updateTotal = () => {
    const total = cart.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.id)
      return sum + (product?.price || 0) * item.quantity
    }, 0)

    setTotalAmount(total)
  }

  const clearCart = () => {
    setCart([])
    setTotalAmount(0)
  }

  const addCategory = (category: Category) => {
    setCategories([...categories, category])
  }

  const addProduct = (product: Product) => {
    setProducts([...products, product])
  }

  const updateCategory = (id: string, data: Partial<Category>) => {
    setCategories(categories.map((cat) => (cat.id === id ? { ...cat, ...data } : cat)))
  }

  const updateProduct = (id: string, data: Partial<Product>) => {
    setProducts(products.map((prod) => (prod.id === id ? { ...prod, ...data } : prod)))
  }

  const deleteCategory = (id: string) => {
    setCategories(categories.filter((cat) => cat.id !== id))
    // Also delete products in this category
    setProducts(products.filter((prod) => prod.categoryId !== id))
  }

  const deleteProduct = (id: string) => {
    setProducts(products.filter((prod) => prod.id !== id))
  }

  // Nueva función para reordenar categorías
  const reorderCategories = (draggedId: string, targetId: string) => {
    const draggedCategory = categories.find((cat) => cat.id === draggedId)
    const targetCategory = categories.find((cat) => cat.id === targetId)

    if (!draggedCategory || !targetCategory) return

    // Crear una copia de las categorías ordenadas por posición actual
    const sortedCats = [...categories].sort((a, b) => a.order - b.order)

    // Encontrar los índices en el array ordenado
    const draggedIndex = sortedCats.findIndex((cat) => cat.id === draggedId)
    const targetIndex = sortedCats.findIndex((cat) => cat.id === targetId)

    // Remover la categoría arrastrada del array
    const [draggedCat] = sortedCats.splice(draggedIndex, 1)

    // Insertar la categoría arrastrada en la nueva posición
    sortedCats.splice(targetIndex, 0, draggedCat)

    // Crear el nuevo array con órdenes actualizados
    const updatedCategories = sortedCats.map((cat, index) => ({
      ...cat,
      order: index + 1,
    }))

    // Actualizar todo el estado de una vez
    setCategories(updatedCategories)
  }

  // Agregar esta función después de la función reorderCategories
  const reorderProducts = (draggedId: string, targetId: string) => {
    const draggedProduct = products.find((prod) => prod.id === draggedId)
    const targetProduct = products.find((prod) => prod.id === targetId)

    if (!draggedProduct || !targetProduct || draggedProduct.categoryId !== targetProduct.categoryId) return

    // Obtener productos de la misma categoría ordenados por posición actual
    const categoryProducts = products
      .filter((prod) => prod.categoryId === draggedProduct.categoryId)
      .sort((a, b) => a.order - b.order)

    // Encontrar los índices en el array ordenado
    const draggedIndex = categoryProducts.findIndex((prod) => prod.id === draggedId)
    const targetIndex = categoryProducts.findIndex((prod) => prod.id === targetId)

    // Remover el producto arrastrado del array
    const [draggedProd] = categoryProducts.splice(draggedIndex, 1)

    // Insertar el producto arrastrado en la nueva posición
    categoryProducts.splice(targetIndex, 0, draggedProd)

    // Crear el nuevo array con órdenes actualizados
    const updatedCategoryProducts = categoryProducts.map((prod, index) => ({
      ...prod,
      order: index + 1,
    }))

    // Actualizar todos los productos
    const updatedProducts = products.map((prod) => {
      const updatedProd = updatedCategoryProducts.find((updated) => updated.id === prod.id)
      return updatedProd || prod
    })

    setProducts(updatedProducts)
  }

  const simulatePayment = () => {
    // Simulate payment process
    setView("payment")

    // Simulate successful payment after 5 seconds
    setTimeout(() => {
      setView("success")
    }, 5000)
  }

  const resetShop = () => {
    clearCart()
    setView("shop")
  }

  return (
    <div className="w-full max-w-md mx-auto bg-gray-100 min-h-screen flex flex-col">
      {view === "shop" && (
        <>
          <ShopHeader
            title="Punto de venta"
            onEditClick={() => setView("edit")}
            cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
            onCartClick={() => setView("cart")}
          />
          <ProductList
            categories={categories}
            products={products}
            onAddToCart={addToCart}
            cart={cart}
            updateQuantity={updateQuantity}
            onCartClick={() => setView("cart")}
            onClearCart={clearCart}
          />
        </>
      )}

      {view === "cart" && (
        <CartView
          cart={cart}
          products={products}
          totalAmount={totalAmount}
          onBackClick={() => setView("shop")}
          onUpdateQuantity={updateQuantity}
          onCheckout={simulatePayment}
        />
      )}

      {view === "payment" && <PaymentView amount={totalAmount} onCancel={() => setView("cart")} />}

      {view === "success" && <PaymentSuccess amount={totalAmount} onBackToShop={resetShop} />}

      {view === "edit" && (
        <ShopEdit
          categories={categories}
          products={products}
          onAddCategory={addCategory}
          onAddProduct={addProduct}
          onUpdateCategory={updateCategory}
          onUpdateProduct={updateProduct}
          onDeleteCategory={deleteCategory}
          onDeleteProduct={deleteProduct}
          onReorderCategories={reorderCategories}
          onReorderProducts={reorderProducts}
          onCancel={() => setView("shop")}
          onConfirm={() => setView("shop")}
        />
      )}
    </div>
  )
}
