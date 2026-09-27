export interface CreateProduct {
    name: string,
    price: number | null,
    categoryId: string
}

export interface Product extends CreateProduct {
    id: string
}