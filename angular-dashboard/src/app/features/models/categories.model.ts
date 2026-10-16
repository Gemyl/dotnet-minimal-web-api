import { Product } from "./products.model";

export interface CreateCategory {
    name: string
}

export interface UpdateCategory extends CreateCategory {}

export interface Category extends UpdateCategory {
    id: string,
    products: Product[]
}

export interface CategoriesPagedResponse {
    items: Category[],
    page: number,
    pageSize: number,
    totalItems: number,
    totalPages: number
}