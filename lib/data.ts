import type { Category, Product } from "./types"

export const initialCategories: Category[] = [
  { id: "cat1", name: "Bebidas", order: 1 },
  { id: "cat2", name: "Comidas", order: 2 },
  { id: "cat3", name: "Postres", order: 3 },
]

export const initialProducts: Product[] = [
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
