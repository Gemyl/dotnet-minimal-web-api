export interface CreateProduct {
    name: string,
    price: number | null
}

export interface Product extends CreateProduct {
    id: string
}