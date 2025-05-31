import type { Category, Product } from "./types"

const DB_NAME = "lightning-pos-db"
const DB_VERSION = 1
const CATEGORIES_STORE = "categories"
const PRODUCTS_STORE = "products"
const CART_STORE = "cart"

interface CartItem {
  id: string
  quantity: number
}

export class IndexedDBService {
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Create categories store
        if (!db.objectStoreNames.contains(CATEGORIES_STORE)) {
          const categoriesStore = db.createObjectStore(CATEGORIES_STORE, { keyPath: "id" })
          categoriesStore.createIndex("order", "order", { unique: false })
        }

        // Create products store
        if (!db.objectStoreNames.contains(PRODUCTS_STORE)) {
          const productsStore = db.createObjectStore(PRODUCTS_STORE, { keyPath: "id" })
          productsStore.createIndex("categoryId", "categoryId", { unique: false })
          productsStore.createIndex("order", "order", { unique: false })
        }

        // Create cart store
        if (!db.objectStoreNames.contains(CART_STORE)) {
          db.createObjectStore(CART_STORE, { keyPath: "id" })
        }
      }
    })
  }

  // Categories methods
  async getCategories(): Promise<Category[]> {
    if (!this.db) throw new Error("Database not initialized")

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([CATEGORIES_STORE], "readonly")
      const store = transaction.objectStore(CATEGORIES_STORE)
      const request = store.getAll()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        const categories = request.result.sort((a: Category, b: Category) => a.order - b.order)
        resolve(categories)
      }
    })
  }

  async addCategory(category: Category): Promise<void> {
    if (!this.db) throw new Error("Database not initialized")

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([CATEGORIES_STORE], "readwrite")
      const store = transaction.objectStore(CATEGORIES_STORE)
      const request = store.add(category)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async updateCategory(id: string, data: Partial<Category>): Promise<void> {
    if (!this.db) throw new Error("Database not initialized")

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([CATEGORIES_STORE], "readwrite")
      const store = transaction.objectStore(CATEGORIES_STORE)
      const getRequest = store.get(id)

      getRequest.onerror = () => reject(getRequest.error)
      getRequest.onsuccess = () => {
        const category = getRequest.result
        if (category) {
          const updatedCategory = { ...category, ...data }
          const putRequest = store.put(updatedCategory)
          putRequest.onerror = () => reject(putRequest.error)
          putRequest.onsuccess = () => resolve()
        } else {
          reject(new Error("Category not found"))
        }
      }
    })
  }

  async deleteCategory(id: string): Promise<void> {
    if (!this.db) throw new Error("Database not initialized")

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([CATEGORIES_STORE], "readwrite")
      const store = transaction.objectStore(CATEGORIES_STORE)
      const request = store.delete(id)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async updateCategoriesOrder(categories: Category[]): Promise<void> {
    if (!this.db) throw new Error("Database not initialized")

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([CATEGORIES_STORE], "readwrite")
      const store = transaction.objectStore(CATEGORIES_STORE)
      let completed = 0

      categories.forEach((category) => {
        const request = store.put(category)
        request.onerror = () => reject(request.error)
        request.onsuccess = () => {
          completed++
          if (completed === categories.length) {
            resolve()
          }
        }
      })
    })
  }

  // Products methods
  async getProducts(): Promise<Product[]> {
    if (!this.db) throw new Error("Database not initialized")

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([PRODUCTS_STORE], "readonly")
      const store = transaction.objectStore(PRODUCTS_STORE)
      const request = store.getAll()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        const products = request.result.sort((a: Product, b: Product) => a.order - b.order)
        resolve(products)
      }
    })
  }

  async addProduct(product: Product): Promise<void> {
    if (!this.db) throw new Error("Database not initialized")

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([PRODUCTS_STORE], "readwrite")
      const store = transaction.objectStore(PRODUCTS_STORE)
      const request = store.add(product)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async updateProduct(id: string, data: Partial<Product>): Promise<void> {
    if (!this.db) throw new Error("Database not initialized")

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([PRODUCTS_STORE], "readwrite")
      const store = transaction.objectStore(PRODUCTS_STORE)
      const getRequest = store.get(id)

      getRequest.onerror = () => reject(getRequest.error)
      getRequest.onsuccess = () => {
        const product = getRequest.result
        if (product) {
          const updatedProduct = { ...product, ...data }
          const putRequest = store.put(updatedProduct)
          putRequest.onerror = () => reject(putRequest.error)
          putRequest.onsuccess = () => resolve()
        } else {
          reject(new Error("Product not found"))
        }
      }
    })
  }

  async deleteProduct(id: string): Promise<void> {
    if (!this.db) throw new Error("Database not initialized")

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([PRODUCTS_STORE], "readwrite")
      const store = transaction.objectStore(PRODUCTS_STORE)
      const request = store.delete(id)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async deleteProductsByCategory(categoryId: string): Promise<void> {
    if (!this.db) throw new Error("Database not initialized")

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([PRODUCTS_STORE], "readwrite")
      const store = transaction.objectStore(PRODUCTS_STORE)
      const index = store.index("categoryId")
      const request = index.openCursor(IDBKeyRange.only(categoryId))

      request.onerror = () => reject(request.error)
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result
        if (cursor) {
          cursor.delete()
          cursor.continue()
        } else {
          resolve()
        }
      }
    })
  }

  async updateProductsOrder(products: Product[]): Promise<void> {
    if (!this.db) throw new Error("Database not initialized")

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([PRODUCTS_STORE], "readwrite")
      const store = transaction.objectStore(PRODUCTS_STORE)
      let completed = 0

      products.forEach((product) => {
        const request = store.put(product)
        request.onerror = () => reject(request.error)
        request.onsuccess = () => {
          completed++
          if (completed === products.length) {
            resolve()
          }
        }
      })
    })
  }

  // Cart methods
  async getCart(): Promise<CartItem[]> {
    if (!this.db) throw new Error("Database not initialized")

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([CART_STORE], "readonly")
      const store = transaction.objectStore(CART_STORE)
      const request = store.getAll()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  }

  async updateCartItem(item: CartItem): Promise<void> {
    if (!this.db) throw new Error("Database not initialized")

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([CART_STORE], "readwrite")
      const store = transaction.objectStore(CART_STORE)
      const request = store.put(item)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async removeCartItem(id: string): Promise<void> {
    if (!this.db) throw new Error("Database not initialized")

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([CART_STORE], "readwrite")
      const store = transaction.objectStore(CART_STORE)
      const request = store.delete(id)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async clearCart(): Promise<void> {
    if (!this.db) throw new Error("Database not initialized")

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([CART_STORE], "readwrite")
      const store = transaction.objectStore(CART_STORE)
      const request = store.clear()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  // Initialize with default data
  async initializeDefaultData(): Promise<void> {
    const categories = await this.getCategories()
    const products = await this.getProducts()

    // Only initialize if database is empty
    if (categories.length === 0 && products.length === 0) {
      // Add default categories
      const defaultCategories: Category[] = [
        { id: "cat1", name: "Bebidas", order: 1 },
        { id: "cat2", name: "Comidas", order: 2 },
        { id: "cat3", name: "Postres", order: 3 },
      ]

      for (const category of defaultCategories) {
        await this.addCategory(category)
      }

      // Add default products
      const defaultProducts: Product[] = [
        {
          id: "prod1",
          name: "Café",
          price: 12599,
          categoryId: "cat1",
          stock: 0,
          availability: 0,
          order: 1,
        },
        {
          id: "prod2",
          name: "Hamburguesa",
          price: 4000,
          categoryId: "cat2",
          stock: 10,
          availability: 2,
          order: 1,
        },
        {
          id: "prod3",
          name: "Pizza",
          price: 2500,
          categoryId: "cat2",
          stock: 5,
          availability: 2,
          order: 2,
        },
        {
          id: "prod4",
          name: "Agua",
          price: 1999,
          categoryId: "cat1",
          stock: 20,
          availability: 2,
          order: 2,
        },
      ]

      for (const product of defaultProducts) {
        await this.addProduct(product)
      }
    }
  }
}

export const dbService = new IndexedDBService()
