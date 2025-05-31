export interface Category {
  id: string
  name: string
  order: number
}

export interface Product {
  id: string
  name: string
  price: number
  categoryId: string
  stock: number
  availability: number
  order: number
}
