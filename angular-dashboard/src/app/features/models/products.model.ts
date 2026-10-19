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

export interface PagedRequest {
    page: number, 
    pageSize: number, 
    all?: boolean, 
    sortBy: string, 
    sortDirection: string
}