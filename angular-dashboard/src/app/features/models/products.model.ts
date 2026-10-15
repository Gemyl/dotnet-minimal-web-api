export interface CreateProduct {
    name: string,
    price: number | null,
    categoryId: string
}

export interface Product extends CreateProduct {
    id: string
}

export interface ProductsPagedResponse {
    items: Product[],
    page: number,
    pageSize: number,
    totalItems: number,
    totalPages: number
}